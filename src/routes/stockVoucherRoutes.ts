import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllStockVouchers,
  getStockVoucher,
  createStockVoucher,
  updateStockVoucher,
  approveStockVoucher,
  cancelStockVoucher
} from '../controllers/stockVoucherController';

const router = express.Router();

router.use(protect);

// Public routes (authenticated)
router.get('/', getAllStockVouchers);
router.get('/:id', getStockVoucher);

// Admin ve depo sorumlusu routes
router.use(restrictTo('admin', 'storage_manager'));
router.post('/', createStockVoucher);
router.patch('/:id', updateStockVoucher);
router.post('/:id/approve', approveStockVoucher);
router.post('/:id/cancel', cancelStockVoucher);

/**
 * @swagger
 * components:
 *   schemas:
 *     StockVoucherItem:
 *       type: object
 *       required:
 *         - treatmentId
 *         - quantity
 *         - unitPrice
 *         - totalPrice
 *       properties:
 *         treatmentId:
 *           type: string
 *           description: Ürün ID
 *         quantity:
 *           type: number
 *           description: Miktar
 *         unitPrice:
 *           type: number
 *           description: Birim fiyat
 *         totalPrice:
 *           type: number
 *           description: Toplam fiyat
 *         description:
 *           type: string
 *           description: Açıklama
 *     StockVoucher:
 *       type: object
 *       required:
 *         - voucherType
 *         - storageId
 *         - items
 *       properties:
 *         voucherNo:
 *           type: string
 *           description: Fiş numarası (otomatik oluşturulur)
 *         voucherType:
 *           type: string
 *           enum: [IN, OUT]
 *           description: Fiş tipi (Giriş/Çıkış)
 *         voucherDate:
 *           type: string
 *           format: date-time
 *           description: Fiş tarihi
 *         storageId:
 *           type: string
 *           description: Depo ID
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StockVoucherItem'
 *           description: Fiş kalemleri
 *         totalAmount:
 *           type: number
 *           description: Toplam tutar (otomatik hesaplanır)
 *         status:
 *           type: string
 *           enum: [DRAFT, PENDING, APPROVED, CANCELLED]
 *           description: Fiş durumu
 *         description:
 *           type: string
 *           description: Açıklama
 * 
 * tags:
 *   name: Stock Vouchers
 *   description: Stok fişi yönetimi işlemleri
 *
 * /api/stock-vouchers:
 *   get:
 *     summary: Tüm stok fişlerini listeler
 *     tags: [Stock Vouchers]
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
 *         name: voucherType
 *         schema:
 *           type: string
 *           enum: [IN, OUT]
 *         description: Fiş tipine göre filtreleme
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, APPROVED, CANCELLED]
 *         description: Duruma göre filtreleme
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Başlangıç tarihi
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Bitiş tarihi
 *     responses:
 *       200:
 *         description: Stok fişleri başarıyla getirildi
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
 *                     $ref: '#/components/schemas/StockVoucher'
 *   post:
 *     summary: Yeni stok fişi oluşturur
 *     tags: [Stock Vouchers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voucherType
 *               - storageId
 *               - items
 *             properties:
 *               voucherType:
 *                 type: string
 *                 enum: [IN, OUT]
 *               storageId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/StockVoucherItem'
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stok fişi başarıyla oluşturuldu
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
 *                   $ref: '#/components/schemas/StockVoucher'
 *
 * /api/stock-vouchers/{id}:
 *   get:
 *     summary: Stok fişi detaylarını getirir
 *     tags: [Stock Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stok fişi başarıyla getirildi
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
 *                   $ref: '#/components/schemas/StockVoucher'
 *   patch:
 *     summary: Stok fişini günceller (sadece taslak durumunda)
 *     tags: [Stock Vouchers]
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
 *             $ref: '#/components/schemas/StockVoucher'
 *     responses:
 *       200:
 *         description: Stok fişi başarıyla güncellendi
 *
 * /api/stock-vouchers/{id}/approve:
 *   post:
 *     summary: Stok fişini onaylar
 *     tags: [Stock Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stok fişi başarıyla onaylandı
 *
 * /api/stock-vouchers/{id}/cancel:
 *   post:
 *     summary: Stok fişini iptal eder
 *     tags: [Stock Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stok fişi başarıyla iptal edildi
 */

export default router; 