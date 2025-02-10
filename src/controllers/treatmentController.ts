import { Request, Response } from 'express';
import Treatment from '../models/Treatment';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import { redisClient } from '../config/redis';

// Tüm tedavileri getir
export const getAllTreatments = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;

  const cacheKey = `treatments:${page}:${limit}:${search || 'all'}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    res.status(200).json({
      status: 'success',
      message: 'Tedaviler önbellekten getirildi',
      data: JSON.parse(cachedData)
    });
    return;
  }

  let query = Treatment.find();

  if (search) {
    query = query.or([
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ]);
  }

  const treatments = await query
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('categoryId', 'name')
    .populate('mainItemUnitId', 'name')
    .lean();

  await redisClient.setex(cacheKey, 3600, JSON.stringify(treatments));

  res.status(200).json({
    status: 'success',
    message: 'Tedaviler başarıyla getirildi',
    data: treatments
  });
});

// Popüler tedavileri getir
export const getPopularTreatments = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const cacheKey = `popular-treatments:${limit}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    res.status(200).json({
      status: 'success',
      message: 'Popüler tedaviler önbellekten getirildi',
      data: JSON.parse(cachedData)
    });
    return;
  }

  const treatments = await Treatment.find({ isActive: true })
    .sort({ saleCount: -1 })
    .limit(limit)
    .populate('categoryId', 'name')
    .populate('mainItemUnitId', 'name')
    .lean();

  await redisClient.setex(cacheKey, 3600, JSON.stringify(treatments));

  res.status(200).json({
    status: 'success',
    message: 'Popüler tedaviler başarıyla getirildi',
    data: treatments
  });
});

// Tedavi detayı getir
export const getTreatment = catchAsync(async (req: Request, res: Response) => {
  const treatment = await Treatment.findById(req.params.id)
    .populate('categoryId', 'name')
    .populate('mainItemUnitId', 'name')
    .lean();

  if (!treatment) {
    throw new AppError('Tedavi bulunamadı', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Tedavi başarıyla getirildi',
    data: treatment
  });
});

// Yeni tedavi oluştur
export const createTreatment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore - auth middleware'den gelen user bilgisi
  const { id: createdPersonId, branchId: createdBranchId } = req.user;

  const treatment = await Treatment.create({
    ...req.body,
    createdPersonId,
    createdBranchId
  });

  // Önbelleği temizle
  const keys = await redisClient.keys('treatments:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(201).json({
    status: 'success',
    message: 'Tedavi başarıyla oluşturuldu',
    data: treatment
  });
});

// Tedavi güncelle
export const updateTreatment = catchAsync(async (req: Request, res: Response) => {
  const treatment = await Treatment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!treatment) {
    throw new AppError('Tedavi bulunamadı', 404);
  }

  // Önbelleği temizle
  const keys = await redisClient.keys('treatments:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(200).json({
    status: 'success',
    message: 'Tedavi başarıyla güncellendi',
    data: treatment
  });
});

// Tedavi sil
export const deleteTreatment = catchAsync(async (req: Request, res: Response) => {
  const treatment = await Treatment.findByIdAndDelete(req.params.id);

  if (!treatment) {
    throw new AppError('Tedavi bulunamadı', 404);
  }

  // Önbelleği temizle
  const keys = await redisClient.keys('treatments:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(200).json({
    status: 'success',
    message: 'Tedavi başarıyla silindi'
  });
});

// Önbelleği temizle
export const resetCache = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const treatmentKeys = await redisClient.keys('treatments:*');
  const popularKeys = await redisClient.keys('popular-treatments:*');
  const keys = [...treatmentKeys, ...popularKeys];

  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(200).json({
    status: 'success',
    message: 'Tedavi önbelleği başarıyla temizlendi'
  });
});

// Tedavi master bilgilerini getir (minimal veri)
export const getTreatmentMaster = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;

  const cacheKey = `treatments-master:${page}:${limit}:${search || 'all'}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    res.status(200).json({
      status: 'success',
      message: 'Tedavi master bilgileri önbellekten getirildi',
      data: JSON.parse(cachedData)
    });
    return;
  }

  let query = Treatment.find(
    search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ]
    } : {}
  );

  const treatments = await query
    .select('_id name price treatmentPictureb64 duration intervalDays')
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  await redisClient.setex(cacheKey, 3600, JSON.stringify(treatments));

  res.status(200).json({
    status: 'success',
    message: 'Tedavi master bilgileri başarıyla getirildi',
    data: treatments
  });
}); 