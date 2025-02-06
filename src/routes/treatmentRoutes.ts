import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllTreatments,
  getTreatment,
  createTreatment,
  updateTreatment,
  deleteTreatment
} from '../controllers/treatmentController';

const router = express.Router();

router.use(protect);

// Public routes (authenticated)
router.get('/', getAllTreatments);
router.get('/:id', getTreatment);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createTreatment);
router.patch('/:id', updateTreatment);
router.delete('/:id', deleteTreatment);

/**
 * @swagger
 * tags:
 *   name: Treatments
 *   description: Tedavi yönetimi işlemleri
 *
 * /api/treatments:
 *   get:
 *     summary: Tüm tedavileri listeler
 *     tags: [Treatments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Sayfa numarası (varsayılan 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Sayfa başına kayıt sayısı (varsayılan 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tedavi adı veya kodu ile arama yapar
 *     responses:
 *       200:
 *         description: Tedaviler başarıyla getirildi
 *   post:
 *     summary: Yeni tedavi oluşturur
 *     tags: [Treatments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Treatment'
 *     responses:
 *       201:
 *         description: Tedavi başarıyla oluşturuldu
 *
 * /api/treatments/{id}:
 *   get:
 *     summary: Tedavi detaylarını getirir
 *     tags: [Treatments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tedavi başarıyla getirildi
 *   patch:
 *     summary: Tedavi bilgilerini günceller
 *     tags: [Treatments]
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
 *             $ref: '#/components/schemas/Treatment'
 *     responses:
 *       200:
 *         description: Tedavi başarıyla güncellendi
 *   delete:
 *     summary: Tedaviyi siler
 *     tags: [Treatments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tedavi başarıyla silindi
 */

export default router; 