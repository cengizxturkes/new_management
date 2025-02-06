import { Request, Response } from 'express';
import Treatment from '../models/Treatment';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseBuilder } from '../interfaces/ApiResponse';

export const getAllTreatments = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const treatments = await Treatment.find();
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Tedaviler başarıyla getirildi')
      .withData(treatments)
      .build()
  );
});

export const getTreatment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const treatment = await Treatment.findById(req.params.id);
  if (!treatment) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Tedavi bulunamadı')
        .build()
    );
    return;
  }
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Tedavi başarıyla getirildi')
      .withData(treatment)
      .build()
  );
});

export const createTreatment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const treatment = await Treatment.create(req.body);
  res.status(201).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Tedavi başarıyla oluşturuldu')
      .withData(treatment)
      .build()
  );
});

export const updateTreatment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const treatment = await Treatment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!treatment) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Tedavi bulunamadı')
        .build()
    );
    return;
  }
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Tedavi başarıyla güncellendi')
      .withData(treatment)
      .build()
  );
});

export const deleteTreatment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const treatment = await Treatment.findByIdAndDelete(req.params.id);
  if (!treatment) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Tedavi bulunamadı')
        .build()
    );
    return;
  }
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Tedavi başarıyla silindi')
      .build()
  );
}); 