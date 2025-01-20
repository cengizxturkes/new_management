import { Request, Response } from 'express';
import Location from '../models/Location';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseBuilder } from '../interfaces/ApiResponse';

/**
 * @swagger
 * /api/locations/cities:
 *   get:
 *     summary: Tüm şehirleri listeler
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: Şehirler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cityId:
 *                         type: string
 *                       cityName:
 *                         type: string
 */
export const getAllCities = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const cities = await Location.find().select('cityId cityName -_id');
  
  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Şehirler başarıyla getirildi')
      .withData(cities)
      .build()
  );
});

/**
 * @swagger
 * /api/locations/cities/{cityId}/districts:
 *   get:
 *     summary: Belirli bir şehrin ilçelerini listeler
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: cityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Şehir ID
 *     responses:
 *       200:
 *         description: İlçeler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       districtId:
 *                         type: string
 *                       districtName:
 *                         type: string
 *       404:
 *         description: Şehir bulunamadı
 */
export const getDistrictsByCity = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { cityId } = req.params;
  
  const city = await Location.findOne({ cityId }).select('districts -_id');
  
  if (!city) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Şehir bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('İlçeler başarıyla getirildi')
      .withData(city.districts)
      .build()
  );
}); 