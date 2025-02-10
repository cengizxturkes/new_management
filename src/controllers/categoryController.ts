import { Request, Response } from 'express';
import Category from '../models/Category';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import { redisClient } from '../config/redis';

// Tüm kategorileri getir
export const getAllCategories = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;

  const cacheKey = `categories:${page}:${limit}:${search || 'all'}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    res.status(200).json({
      status: 'success',
      message: 'Kategoriler önbellekten getirildi',
      data: JSON.parse(cachedData)
    });
    return;
  }

  let query = Category.find();

  if (search) {
    query = query.or([
      { name: { $regex: search, $options: 'i' } }
    ]);
  }

  const categories = await query
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('parentId', 'name')
    .lean();

  await redisClient.setex(cacheKey, 3600, JSON.stringify(categories));

  res.status(200).json({
    status: 'success',
    message: 'Kategoriler başarıyla getirildi',
    data: categories
  });
});

// Kategori detayı getir
export const getCategory = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findById(req.params.id)
    .populate('parentId', 'name')
    .lean();

  if (!category) {
    throw new AppError('Kategori bulunamadı', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Kategori başarıyla getirildi',
    data: category
  });
});

// Alt kategorileri getir
export const getSubCategories = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const parentId = req.params.parentId;
  
  const categories = await Category.find({ parentId, isActive: true })
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    status: 'success',
    message: 'Alt kategoriler başarıyla getirildi',
    data: categories
  });
});

// Ana kategorileri getir
export const getMainCategories = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({ parentId: null, isActive: true })
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    status: 'success',
    message: 'Ana kategoriler başarıyla getirildi',
    data: categories
  });
});

// Yeni kategori oluştur
export const createCategory = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const category = await Category.create(req.body);

  // Önbelleği temizle
  const keys = await redisClient.keys('categories:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(201).json({
    status: 'success',
    message: 'Kategori başarıyla oluşturuldu',
    data: category
  });
});

// Kategori güncelle
export const updateCategory = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('parentId', 'name');

  if (!category) {
    throw new AppError('Kategori bulunamadı', 404);
  }

  // Önbelleği temizle
  const keys = await redisClient.keys('categories:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(200).json({
    status: 'success',
    message: 'Kategori başarıyla güncellendi',
    data: category
  });
});

// Kategori sil
export const deleteCategory = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Önce alt kategorileri kontrol et
  const hasSubCategories = await Category.exists({ parentId: req.params.id });
  if (hasSubCategories) {
    throw new AppError('Bu kategorinin alt kategorileri var. Önce alt kategorileri silmelisiniz.', 400);
  }

  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    throw new AppError('Kategori bulunamadı', 404);
  }

  // Önbelleği temizle
  const keys = await redisClient.keys('categories:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  res.status(200).json({
    status: 'success',
    message: 'Kategori başarıyla silindi'
  });
}); 