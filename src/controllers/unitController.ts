import { Request, Response } from 'express';
import Unit from '../models/Unit';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseBuilder } from '../interfaces/ApiResponse';

export const getAllUnits = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const units = await Unit.find();
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Birimler başarıyla getirildi')
      .withData(units)
      .build()
  );
});

export const getUnit = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const unit = await Unit.findById(req.params.id);
  if (!unit) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Birim bulunamadı')
        .build()
    );
    return;
  }
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Birim başarıyla getirildi')
      .withData(unit)
      .build()
  );
});

export const createUnit = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const unit = await Unit.create(req.body);
  res.status(201).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Birim başarıyla oluşturuldu')
      .withData(unit)
      .build()
  );
});

export const updateUnit = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!unit) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Birim bulunamadı')
        .build()
    );
    return;
  }
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Birim başarıyla güncellendi')
      .withData(unit)
      .build()
  );
});

export const deleteUnit = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const unit = await Unit.findByIdAndDelete(req.params.id);
  if (!unit) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Birim bulunamadı')
        .build()
    );
    return;
  }
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Birim başarıyla silindi')
      .build()
  );
}); 