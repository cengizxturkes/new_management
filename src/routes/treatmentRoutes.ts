import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllTreatments,
  getTreatment,
  createTreatment,
  updateTreatment,
  deleteTreatment,
  getPopularTreatments,
  resetCache
} from '../controllers/treatmentController';

const router = express.Router();

router.use(protect);

// Public routes (authenticated)
router.get('/', getAllTreatments);
router.get('/popular', getPopularTreatments);
router.get('/:id', getTreatment);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createTreatment);
router.patch('/:id', updateTreatment);
router.delete('/:id', deleteTreatment);
router.post('/reset-cache', resetCache);

/**
 * @swagger
 * components:
 *   schemas:
 *     Treatment:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - price
 *         - duration
 *         - categoryId
 *         - processTimeInMinutes
 *         - intervalDays
 *         - taxRate
 *         - mainItemUnitId
 *       properties:
 *         name:
 *           type: string
 *           description: Tedavi adı
 *         code:
 *           type: string
 *           description: Tedavi kodu
 *         description:
 *           type: string
 *           description: Tedavi açıklaması
 *         price:
 *           type: number
 *           description: Tedavi fiyatı
 *         duration:
 *           type: number
 *           description: Tedavi süresi (dakika)
 *         treatmentPictureb64:
 *           type: string
 *           description: Base64 formatında tedavi resmi
 *         isActive:
 *           type: boolean
 *           description: Tedavi aktif mi?
 *         categoryId:
 *           type: string
 *           description: Kategori ID
 *         treatmentType:
 *           type: number
 *           description: Tedavi tipi
 *         processTimeInMinutes:
 *           type: number
 *           description: İşlem süresi (dakika)
 *         intervalDays:
 *           type: number
 *           description: Aralık gün sayısı
 *         allBranches:
 *           type: boolean
 *           description: Tüm şubelerde geçerli mi?
 *         taxRate:
 *           type: number
 *           description: Vergi oranı
 *         itemTransactionActive:
 *           type: boolean
 *           description: Ürün işlemi aktif mi?
 *         mainItemUnitId:
 *           type: string
 *           description: Ana birim ID
 *         branchIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Geçerli şube ID'leri
 *         barcode:
 *           type: string
 *           description: Barkod
 *         expireDateRequired:
 *           type: boolean
 *           description: Son kullanma tarihi gerekli mi?
 *         onlineAppointmentActive:
 *           type: boolean
 *           description: Online randevu aktif mi?
 *       example:
 *         name: "Fizik Tedavi"
 *         code: "FT1234"
 *         categoryId: "60d5ecb8b5c9c62b3c7c1b5f"
 *         treatmentType: 0
 *         processTimeInMinutes: 21
 *         intervalDays: 20
 *         allBranches: true
 *         duration: 20
 *         taxRate: 18
 *         itemTransactionActive: true
 *         mainItemUnitId: "60d5ecb8b5c9c62b3c7c1b5f"
 *         branchIds: ["678dc24d31735be6836089b9"]
 *         price: 133
 *         barcode: "1234567890123"
 *         expireDateRequired: true
 *         onlineAppointmentActive: true
 *         treatmentPictureb64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
 * 
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
 *                     $ref: '#/components/schemas/Treatment'
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
 *                   $ref: '#/components/schemas/Treatment'
 *
 * /api/treatments/popular:
 *   get:
 *     summary: En çok satılan tedavileri listeler
 *     tags: [Treatments]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Listelenecek tedavi sayısı (varsayılan 10)
 *     responses:
 *       200:
 *         description: Popüler tedaviler başarıyla getirildi
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
 *                     $ref: '#/components/schemas/Treatment'
 *
 * /api/treatments/reset-cache:
 *   post:
 *     summary: Tedavi önbelleğini temizler
 *     tags: [Treatments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Önbellek başarıyla temizlendi
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
 *                   example: Tedavi önbelleği başarıyla temizlendi
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
 *                   $ref: '#/components/schemas/Treatment'
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