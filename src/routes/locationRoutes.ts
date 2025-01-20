import express from 'express';
import { getAllCities, getDistrictsByCity } from '../controllers/locationController';

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Lokasyon yönetimi işlemleri
 */
const router = express.Router();

router.get('/cities', getAllCities);
router.get('/cities/:cityId/districts', getDistrictsByCity);

export default router; 