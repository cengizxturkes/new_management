import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  createPriceList,
  updatePriceList,
  deletePriceList,
  getPriceList,
  getAllPriceLists
} from '../controllers/priceListController';

/**
 * @swagger
 * tags:
 *   name: PriceLists
 *   description: Fiyat listesi yönetimi işlemleri
 * 
 * /api/price-lists:
 *   get:
 *     summary: Tüm fiyat listelerini getirir
 *     tags: [PriceLists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fiyat listeleri başarıyla getirildi
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
 *                     $ref: '#/components/schemas/PriceList'
 * 
 *   post:
 *     summary: Yeni fiyat listesi oluşturur
 *     tags: [PriceLists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priceListName
 *               - validFrom
 *               - validTo
 *               - currencyId
 *             properties:
 *               priceListName:
 *                 type: string
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validTo:
 *                 type: string
 *                 format: date-time
 *               allBranches:
 *                 type: boolean
 *               currencyId:
 *                 type: string
 *               branchIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Fiyat listesi başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 * 
 * /api/price-lists/{id}:
 *   get:
 *     summary: Belirli bir fiyat listesini getirir
 *     tags: [PriceLists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fiyat listesi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 * 
 *   patch:
 *     summary: Fiyat listesini günceller
 *     tags: [PriceLists]
 *     security:
 *       - bearerAuth: []
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
 *               priceListName:
 *                 type: string
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validTo:
 *                 type: string
 *                 format: date-time
 *               allBranches:
 *                 type: boolean
 *               branchIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Fiyat listesi başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 * 
 *   delete:
 *     summary: Fiyat listesini siler (soft delete)
 *     tags: [PriceLists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fiyat listesi başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.route('/')
  .get(getAllPriceLists)
  .post(createPriceList);

router.route('/:id')
  .get(getPriceList)
  .patch(updatePriceList)
  .delete(deletePriceList);

export default router; 