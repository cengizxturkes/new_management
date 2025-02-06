import { Request, Response } from 'express';
import Storage from '../models/Storage';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseBuilder } from '../interfaces/ApiResponse';

export const getAllStorages = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const storages = await Storage.find();
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Depolar başarıyla getirildi')
      .withData(storages)
      .build()
  );
});

export const getStorage = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const storage = await Storage.findById(req.params.id);
  if (!storage) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Depo bulunamadı')
        .build()
    );
    return;
  }
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Depo başarıyla getirildi')
      .withData(storage)
      .build()
  );
});

export const createStorage = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const storage = await Storage.create(req.body);
  res.status(201).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Depo başarıyla oluşturuldu')
      .withData(storage)
      .build()
  );
});

export const updateStorage = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const storage = await Storage.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!storage) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Depo bulunamadı')
        .build()
    );
    return;
  }
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Depo başarıyla güncellendi')
      .withData(storage)
      .build()
  );
});

export const deleteStorage = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const storage = await Storage.findByIdAndDelete(req.params.id);
  if (!storage) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Depo bulunamadı')
        .build()
    );
    return;
  }
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Depo başarıyla silindi')
      .build()
  );
}); 