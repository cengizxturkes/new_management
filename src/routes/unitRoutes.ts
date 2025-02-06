import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllUnits,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit
} from '../controllers/unitController';

const router = express.Router();

router.use(protect);

// Public routes (authenticated)
router.get('/', getAllUnits);
router.get('/:id', getUnit);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createUnit);
router.patch('/:id', updateUnit);
router.delete('/:id', deleteUnit);

/**
 * @swagger
 * tags:
 *   name: Units
 *   description: Birim yönetimi işlemleri
 *
 * /api/units:
 *   get:
 *     summary: Tüm birimleri listeler
 *     tags: [Units]
 *     responses:
 *       200:
 *         description: Birimler başarıyla getirildi
 *   post:
 *     summary: Yeni birim oluşturur
 *     tags: [Units]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Unit'
 *     responses:
 *       201:
 *         description: Birim başarıyla oluşturuldu
 *
 * /api/units/{id}:
 *   get:
 *     summary: Birim detaylarını getirir
 *     tags: [Units]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Birim başarıyla getirildi
 *   patch:
 *     summary: Birim bilgilerini günceller
 *     tags: [Units]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Unit'
 *     responses:
 *       200:
 *         description: Birim başarıyla güncellendi
 *   delete:
 *     summary: Birimi siler
 *     tags: [Units]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Birim başarıyla silindi
 */

export default router; 