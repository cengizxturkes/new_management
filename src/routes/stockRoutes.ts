import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllStocks,
  getCriticalStocks,
  createStockTransfer,
  approveTransfer,
  updateCriticalLevel
} from '../controllers/stockController';

const router = express.Router();

router.use(protect);

// Public routes (authenticated)
router.get('/', getAllStocks);
router.get('/critical', getCriticalStocks);

// Admin ve depo sorumlusu routes
router.use(restrictTo('admin', 'storage_manager'));
router.post('/transfer', createStockTransfer);
router.post('/transfer/approve', approveTransfer);
router.patch('/:stockId/critical-level', updateCriticalLevel);

/**
 * @swagger
 * components:
 *   schemas:
 *     Stock:
 *       type: object
 *       required:
 *         - storageId
 *         - itemId
 *         - quantity
 *         - criticalLevel
 *       properties:
 *         storageId:
 *           type: string
 *           description: Depo ID
 *         itemId:
 *           type: string
 *           description: Ürün ID
 *         quantity:
 *           type: number
 *           description: Stok miktarı
 *         criticalLevel:
 *           type: number
 *           description: Kritik stok seviyesi
 *         isActive:
 *           type: boolean
 *           description: Stok aktif mi?
 *         lastUpdatedBy:
 *           type: string
 *           description: Son güncelleyen kişi ID
 *         lastUpdateDate:
 *           type: string
 *           format: date-time
 *           description: Son güncelleme tarihi
 *     StockTransaction:
 *       type: object
 *       required:
 *         - sourceStorageId
 *         - targetStorageId
 *         - itemId
 *         - quantity
 *       properties:
 *         sourceStorageId:
 *           type: string
 *           description: Kaynak depo ID
 *         targetStorageId:
 *           type: string
 *           description: Hedef depo ID
 *         itemId:
 *           type: string
 *           description: Ürün ID
 *         quantity:
 *           type: number
 *           description: Transfer miktarı
 *         transactionType:
 *           type: string
 *           enum: [IN, OUT, TRANSFER]
 *           description: İşlem tipi
 *         qrCode:
 *           type: string
 *           description: QR kod (base64)
 *         description:
 *           type: string
 *           description: Açıklama
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, CANCELLED]
 *           description: İşlem durumu
 * 
 * tags:
 *   name: Stocks
 *   description: Stok yönetimi işlemleri
 *
 * /api/stocks:
 *   get:
 *     summary: Tüm stokları listeler
 *     tags: [Stocks]
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
 *         name: storageId
 *         schema:
 *           type: string
 *         description: Depo ID'ye göre filtreleme
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Ürün adı veya kodu ile arama yapar
 *     responses:
 *       200:
 *         description: Stoklar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stock'
 *
 * /api/stocks/critical:
 *   get:
 *     summary: Kritik seviyedeki stokları listeler
 *     tags: [Stocks]
 *     parameters:
 *       - in: query
 *         name: storageId
 *         schema:
 *           type: string
 *         description: Depo ID'ye göre filtreleme
 *     responses:
 *       200:
 *         description: Kritik stoklar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Stock'
 *
 * /api/stocks/transfer:
 *   post:
 *     summary: Stok transferi oluşturur
 *     tags: [Stocks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceStorageId
 *               - targetStorageId
 *               - itemId
 *               - quantity
 *             properties:
 *               sourceStorageId:
 *                 type: string
 *               targetStorageId:
 *                 type: string
 *               itemId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stok transfer talebi oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StockTransaction'
 *
 * /api/stocks/transfer/approve:
 *   post:
 *     summary: Stok transferini onaylar (QR kod ile)
 *     tags: [Stocks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *               - qrCode
 *             properties:
 *               transactionId:
 *                 type: string
 *               qrCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stok transferi başarıyla tamamlandı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/StockTransaction'
 *                     sourceStock:
 *                       $ref: '#/components/schemas/Stock'
 *                     targetStock:
 *                       $ref: '#/components/schemas/Stock'
 *
 * /api/stocks/{stockId}/critical-level:
 *   patch:
 *     summary: Kritik stok seviyesini günceller
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: stockId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - criticalLevel
 *             properties:
 *               criticalLevel:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Kritik stok seviyesi başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Stock'
 */

export default router; 