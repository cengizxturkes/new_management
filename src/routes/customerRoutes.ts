import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController';

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Müşteri yönetimi işlemleri
 * 
 * /api/customers:
 *   get:
 *     summary: Tüm müşterileri listeler (Pagination ile)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
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
 *         description: Arama metni (isim, soyisim, TC, email veya telefon)
 *     responses:
 *       200:
 *         description: Müşteriler başarıyla getirildi
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
 *                   type: object
 *                   properties:
 *                     customers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Customer'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Toplam kayıt sayısı
 *                         page:
 *                           type: integer
 *                           description: Mevcut sayfa
 *                         limit:
 *                           type: integer
 *                           description: Sayfa başına kayıt sayısı
 *                         totalPages:
 *                           type: integer
 *                           description: Toplam sayfa sayısı
 *                         hasNextPage:
 *                           type: boolean
 *                           description: Sonraki sayfa var mı?
 *                         hasPrevPage:
 *                           type: boolean
 *                           description: Önceki sayfa var mı?
 * 
 *   post:
 *     summary: Yeni müşteri oluşturur
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Müşteri başarıyla oluşturuldu
 * 
 * /api/customers/{id}:
 *   get:
 *     summary: Müşteri detaylarını getirir
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Müşteri başarıyla getirildi
 * 
 *   patch:
 *     summary: Müşteri bilgilerini günceller
 *     tags: [Customers]
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
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Müşteri başarıyla güncellendi
 * 
 *   delete:
 *     summary: Müşteriyi siler (soft delete)
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Müşteri başarıyla silindi
 */

const router = express.Router();

router.use(protect);

// Public routes (authenticated)
router.get('/', getAllCustomers);
router.get('/:id', getCustomer);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createCustomer);
router.patch('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router; 