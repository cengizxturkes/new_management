import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllCurrencies,
  getCurrency,
  createCurrency,
  updateCurrency
} from '../controllers/currencyController';

/**
 * @swagger
 * tags:
 *   name: Currencies
 *   description: Para birimi yönetimi işlemleri
 * 
 * /api/currencies:
 *   get:
 *     summary: Tüm para birimlerini listeler
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Para birimleri başarıyla getirildi
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
 *                     $ref: '#/components/schemas/Currency'
 * 
 *   post:
 *     summary: Yeni para birimi oluşturur
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - symbol
 *             properties:
 *               code:
 *                 type: string
 *                 example: USD
 *               name:
 *                 type: string
 *                 example: Amerikan Doları
 *               symbol:
 *                 type: string
 *                 example: $
 *     responses:
 *       201:
 *         description: Para birimi başarıyla oluşturuldu
 * 
 * /api/currencies/{id}:
 *   get:
 *     summary: Para birimi detaylarını getirir
 *     tags: [Currencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Para birimi başarıyla getirildi
 * 
 *   patch:
 *     summary: Para birimi günceller
 *     tags: [Currencies]
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Para birimi başarıyla güncellendi
 */

const router = express.Router();

router.use(protect);

// Public routes (authenticated)
router.get('/', getAllCurrencies);
router.get('/:id', getCurrency);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createCurrency);
router.patch('/:id', updateCurrency);

export default router; 