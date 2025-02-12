import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import Stock from '../models/Stock';
import StockTransaction from '../models/StockTransaction';
import Treatment from '../models/Treatment';
import { redisClient } from '../config/redis';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Stok listesi
export const getAllStocks = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const storageId = req.query.storageId as string;
  const search = req.query.search as string;

  const cacheKey = `stocks:${storageId}:${page}:${limit}:${search || 'all'}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    res.status(200).json({
      status: 'success',
      message: 'Stoklar önbellekten getirildi',
      data: JSON.parse(cachedData)
    });
    return;
  }

  let query = Stock.find({ isActive: true });

  if (storageId) {
    query = query.where('storageId').equals(storageId);
  }

  if (search) {
    const itemIds = await Treatment.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ]
    }).distinct('_id');

    query = query.where('itemId').in(itemIds);
  }

  const stocks = await query
    .populate('itemId', 'name code price')
    .populate('storageId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  await redisClient.setex(cacheKey, 3600, JSON.stringify(stocks));

  res.status(200).json({
    status: 'success',
    message: 'Stoklar başarıyla getirildi',
    data: stocks
  });
});

// Kritik stok seviyesindeki ürünleri getir
export const getCriticalStocks = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const storageId = req.query.storageId as string;
  
  let query = Stock.find({
    isActive: true,
    $expr: {
      $lte: ['$quantity', '$criticalLevel']
    }
  });

  if (storageId) {
    query = query.where('storageId').equals(storageId);
  }

  const criticalStocks = await query
    .populate('itemId', 'name code price')
    .populate('storageId', 'name')
    .sort({ quantity: 1 })
    .lean();

  res.status(200).json({
    status: 'success',
    message: 'Kritik stoklar başarıyla getirildi',
    data: criticalStocks
  });
});

// Stok transferi oluştur
export const createStockTransfer = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    sourceStorageId,
    targetStorageId,
    itemId,
    quantity,
    description
  } = req.body;

  // @ts-ignore - auth middleware'den gelen user bilgisi
  const { id: createdPersonId, branchId: createdBranchId } = req.user;

  // Kaynak depodaki stok kontrolü
  const sourceStock = await Stock.findOne({
    storageId: sourceStorageId,
    itemId,
    isActive: true
  });

  if (!sourceStock) {
    throw new AppError('Kaynak depoda yeterli stok bulunamadı', 400);
  }

  if (sourceStock.quantity < quantity) {
    throw new AppError('Kaynak depoda yeterli stok yok', 400);
  }

  // QR kod oluştur
  const qrData = {
    transactionId: uuidv4(),
    sourceStorageId,
    targetStorageId,
    itemId,
    quantity,
    timestamp: new Date().toISOString()
  };

  const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

  // Transfer kaydı oluştur
  const stockTransaction = await StockTransaction.create({
    sourceStorageId,
    targetStorageId,
    itemId,
    quantity,
    transactionType: 'TRANSFER',
    qrCode,
    description,
    createdPersonId,
    createdBranchId
  });

  // Önbelleği temizle
  const keys = await redisClient.keys('stocks:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(201).json({
    status: 'success',
    message: 'Stok transfer talebi oluşturuldu',
    data: stockTransaction
  });
});

// Transfer onayla (QR kod ile)
export const approveTransfer = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { transactionId, qrCode } = req.body;
  // @ts-ignore - auth middleware'den gelen user bilgisi
  const { id: approvedBy } = req.user;

  const transaction = await StockTransaction.findOne({
    _id: transactionId,
    qrCode,
    status: 'PENDING'
  });

  if (!transaction) {
    throw new AppError('Geçersiz transfer veya QR kod', 400);
  }

  // Kaynak depodan stok düş
  const sourceStock = await Stock.findOneAndUpdate(
    {
      storageId: transaction.sourceStorageId,
      itemId: transaction.itemId
    },
    {
      $inc: { quantity: -transaction.quantity },
      lastUpdatedBy: approvedBy,
      lastUpdateDate: new Date()
    },
    { new: true }
  );

  if (!sourceStock) {
    throw new AppError('Kaynak depoda stok bulunamadı', 400);
  }

  // Hedef depoya stok ekle
  const targetStock = await Stock.findOneAndUpdate(
    {
      storageId: transaction.targetStorageId,
      itemId: transaction.itemId
    },
    {
      $inc: { quantity: transaction.quantity },
      lastUpdatedBy: approvedBy,
      lastUpdateDate: new Date()
    },
    { new: true, upsert: true }
  );

  // Transfer durumunu güncelle
  transaction.status = 'COMPLETED';
  transaction.approvedBy = approvedBy;
  transaction.approvedAt = new Date();
  await transaction.save();

  // Önbelleği temizle
  const keys = await redisClient.keys('stocks:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(200).json({
    status: 'success',
    message: 'Stok transferi başarıyla tamamlandı',
    data: {
      transaction,
      sourceStock,
      targetStock
    }
  });
});

// Kritik stok seviyesi güncelle
export const updateCriticalLevel = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { stockId } = req.params;
  const { criticalLevel } = req.body;
  // @ts-ignore - auth middleware'den gelen user bilgisi
  const { id: lastUpdatedBy } = req.user;

  const stock = await Stock.findByIdAndUpdate(
    stockId,
    {
      criticalLevel,
      lastUpdatedBy,
      lastUpdateDate: new Date()
    },
    { new: true }
  );

  if (!stock) {
    throw new AppError('Stok bulunamadı', 404);
  }

  // Önbelleği temizle
  const keys = await redisClient.keys('stocks:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(200).json({
    status: 'success',
    message: 'Kritik stok seviyesi başarıyla güncellendi',
    data: stock
  });
}); 