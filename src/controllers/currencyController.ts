import { Request, Response } from 'express';
import Currency from '../models/Currency';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseBuilder } from '../interfaces/ApiResponse';

export const getAllCurrencies = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const currencies = await Currency.find({ isActive: true }).sort('code');
  
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Para birimleri başarıyla getirildi')
      .withData(currencies)
      .build()
  );
});

export const getCurrency = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const currency = await Currency.findById(req.params.id);
  
  if (!currency) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Para birimi bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Para birimi başarıyla getirildi')
      .withData(currency)
      .build()
  );
});

export const createCurrency = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { code, name, symbol } = req.body;

  // Kod kontrolü
  const existingCurrency = await Currency.findOne({ code });
  if (existingCurrency) {
    res.status(400).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Bu para birimi kodu zaten kullanımda')
        .withStatusCode(400)
        .build()
    );
    return;
  }

  const currency = await Currency.create({
    code,
    name,
    symbol,
    isActive: true
  });

  res.status(201).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Para birimi başarıyla oluşturuldu')
      .withStatusCode(201)
      .withData(currency)
      .build()
  );
});

export const updateCurrency = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { name, symbol, isActive } = req.body;

  const currency = await Currency.findById(req.params.id);
  if (!currency) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Para birimi bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  const updatedCurrency = await Currency.findByIdAndUpdate(
    req.params.id,
    { name, symbol, isActive },
    { new: true, runValidators: true }
  );

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Para birimi başarıyla güncellendi')
      .withData(updatedCurrency)
      .build()
  );
}); 