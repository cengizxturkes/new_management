import { Request, Response } from 'express';
import Treatment from '../models/Treatment';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseBuilder } from '../interfaces/ApiResponse';
import Redis from 'ioredis';

const redisClient = new Redis();

export const getAllTreatments = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search as string;
  const filter: any = {};

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { treatmentName: searchRegex },
      { treatmentCode: searchRegex }
    ];
  }

  const cacheKey = `treatments:${page}:${limit}:${search || ''}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    res.status(200).json(
      new ApiResponseBuilder()
        .success(true)
        .withMessage('Tedaviler başarıyla getirildi (cache)')
        .withData(JSON.parse(cachedData))
        .build()
    );
    return;
  }

  const treatments = await Treatment.find(filter).skip(skip).limit(limit);

  const formattedTreatments = treatments.map(treatment => {
    const treatmentObj = treatment.toObject();
    treatmentObj.treatmentPictureb64 = treatmentObj.treatmentPictureb64 || '';
    return treatmentObj;
  });

  await redisClient.set(cacheKey, JSON.stringify(formattedTreatments), 'EX', 3600); // 1 saatlik önbellek

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Tedaviler başarıyla getirildi')
      .withData(formattedTreatments)
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