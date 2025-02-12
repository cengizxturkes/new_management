import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import StockVoucher from '../models/StockVoucher';
import Stock from '../models/Stock';
import { redisClient } from '../config/redis';

// Stok fişi listesi
export const getAllStockVouchers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const storageId = req.query.storageId as string;
  const voucherType = req.query.voucherType as 'IN' | 'OUT';
  const status = req.query.status as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  let query = StockVoucher.find({ isDeleted: false });

  if (storageId) {
    query = query.where('storageId').equals(storageId);
  }

  if (voucherType) {
    query = query.where('voucherType').equals(voucherType);
  }

  if (status) {
    query = query.where('status').equals(status);
  }

  if (startDate && endDate) {
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    query = query.find({
      voucherDate: {
        $gte: startDateTime,
        $lte: endDateTime
      }
    });
  }

  const vouchers = await query
    .populate('storageId', 'name')
    .populate('items.treatmentId', 'name code price')
    .populate('createdPersonId', 'name')
    .populate('approvedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    status: 'success',
    message: 'Stok fişleri başarıyla getirildi',
    data: vouchers
  });
});

// Stok fişi detayı
export const getStockVoucher = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const voucher = await StockVoucher.findOne({
    _id: req.params.id,
    isDeleted: false
  })
    .populate('storageId', 'name')
    .populate('items.treatmentId', 'name code price')
    .populate('createdPersonId', 'name')
    .populate('approvedBy', 'name')
    .lean();

  if (!voucher) {
    throw new AppError('Stok fişi bulunamadı', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Stok fişi başarıyla getirildi',
    data: voucher
  });
});

// Yeni stok fişi oluştur
export const createStockVoucher = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    voucherType,
    storageId,
    items,
    description
  } = req.body;

  // @ts-ignore - auth middleware'den gelen user bilgisi
  const { id: createdPersonId, branchId: createdBranchId } = req.user;

  // Toplam tutarı hesapla
  const totalAmount = items.reduce((total: number, item: any) => total + item.totalPrice, 0);

  // Stok fişi oluştur
  const voucher = await StockVoucher.create({
    voucherType,
    storageId,
    items,
    description,
    createdPersonId,
    createdBranchId,
    totalAmount,
    voucherDate: new Date(),
    status: 'DRAFT'
  });

  // Önbelleği temizle
  const keys = await redisClient.keys('stocks:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(201).json({
    status: 'success',
    message: 'Stok fişi başarıyla oluşturuldu',
    data: voucher
  });
});

// Stok fişi güncelle
export const updateStockVoucher = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const voucher = await StockVoucher.findOne({
    _id: req.params.id,
    isDeleted: false,
    status: 'DRAFT' // Sadece taslak durumundaki fişler güncellenebilir
  });

  if (!voucher) {
    throw new AppError('Stok fişi bulunamadı veya güncellenemez', 404);
  }

  Object.assign(voucher, req.body);
  await voucher.save();

  // Önbelleği temizle
  const keys = await redisClient.keys('stocks:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(200).json({
    status: 'success',
    message: 'Stok fişi başarıyla güncellendi',
    data: voucher
  });
});

// Stok fişi onayla
export const approveStockVoucher = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const voucher = await StockVoucher.findOne({
    _id: req.params.id,
    isDeleted: false,
    status: { $in: ['DRAFT', 'PENDING'] } // DRAFT veya PENDING durumundaki fişleri onaylayabilir
  });

  if (!voucher) {
    throw new AppError('Stok fişi bulunamadı veya onaylanamaz', 404);
  }

  // @ts-ignore - auth middleware'den gelen user bilgisi
  const { id: approvedBy } = req.user;

  // Stokları güncelle
  for (const item of voucher.items) {
    const stockUpdate = {
      $inc: { quantity: voucher.voucherType === 'IN' ? item.quantity : -item.quantity },
      lastUpdatedBy: approvedBy,
      lastUpdateDate: new Date()
    };

    const stock = await Stock.findOneAndUpdate(
      {
        storageId: voucher.storageId,
        itemId: item.treatmentId
      },
      stockUpdate,
      { new: true, upsert: true }
    );

    // Stok miktarı negatif olamaz
    if (stock.quantity < 0) {
      throw new AppError(`${item.treatmentId} için yeterli stok yok`, 400);
    }
  }

  // Fişi onayla
  voucher.status = 'APPROVED';
  voucher.approvedBy = approvedBy;
  voucher.approvedAt = new Date();
  await voucher.save();

  // Önbelleği temizle
  const keys = await redisClient.keys('stocks:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(200).json({
    status: 'success',
    message: 'Stok fişi başarıyla onaylandı',
    data: voucher
  });
});

// Stok fişi iptal et
export const cancelStockVoucher = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const voucher = await StockVoucher.findOne({
    _id: req.params.id,
    isDeleted: false,
    status: { $in: ['DRAFT', 'PENDING'] }
  });

  if (!voucher) {
    throw new AppError('Stok fişi bulunamadı veya iptal edilemez', 404);
  }

  voucher.status = 'CANCELLED';
  await voucher.save();

  res.status(200).json({
    status: 'success',
    message: 'Stok fişi başarıyla iptal edildi',
    data: voucher
  });
}); 