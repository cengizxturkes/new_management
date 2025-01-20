import { Request, Response } from 'express';
import PriceList from '../models/PriceList';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseBuilder } from '../interfaces/ApiResponse';

export const getAllPriceLists = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const priceLists = await PriceList.find()
    .populate('currencyId', 'code name symbol')
    .sort('-createdAt');

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Fiyat listeleri başarıyla getirildi')
      .withData(priceLists)
      .build()
  );
});

export const getPriceList = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const priceList = await PriceList.findById(req.params.id)
    .populate('currencyId', 'code name symbol')
    .populate('branchIds', 'branchName');

  if (!priceList) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Fiyat listesi bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Fiyat listesi başarıyla getirildi')
      .withData(priceList)
      .build()
  );
});

export const createPriceList = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    priceListName,
    validFrom,
    validTo,
    allBranches,
    currencyId,
    branchIds
  } = req.body;

  const priceList = await PriceList.create({
    priceListName,
    validFrom,
    validTo,
    allBranches,
    currencyId,
    branchIds,
    createdPersonId: req.user._id,
    createdBranchId: req.user.branchId
  });

  res.status(201).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Fiyat listesi başarıyla oluşturuldu')
      .withStatusCode(201)
      .withData(priceList)
      .build()
  );
});

export const updatePriceList = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    priceListName,
    validFrom,
    validTo,
    allBranches,
    branchIds,
    isActive
  } = req.body;

  const priceList = await PriceList.findById(req.params.id);

  if (!priceList) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Fiyat listesi bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  const updatedPriceList = await PriceList.findByIdAndUpdate(
    req.params.id,
    {
      priceListName,
      validFrom,
      validTo,
      allBranches,
      branchIds,
      isActive
    },
    { new: true, runValidators: true }
  ).populate('currencyId', 'code name symbol');

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Fiyat listesi başarıyla güncellendi')
      .withData(updatedPriceList)
      .build()
  );
});

export const deletePriceList = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const priceList = await PriceList.findById(req.params.id);

  if (!priceList) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Fiyat listesi bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  // Soft delete
  await PriceList.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Fiyat listesi başarıyla silindi')
      .build()
  );
}); 