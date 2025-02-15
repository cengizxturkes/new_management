import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllStorages,
  getStorage,
  createStorage,
  updateStorage,
  deleteStorage
} from '../controllers/storageController';

const router = express.Router();

router.use(protect);

// Public routes (authenticated)
router.get('/', getAllStorages);
router.get('/:id', getStorage);

// Admin ve depo sorumlusu routes
router.use(restrictTo('admin', 'storage_manager'));
router.post('/', createStorage);
router.patch('/:id', updateStorage);
router.delete('/:id', deleteStorage);

/**
 * @swagger
 * components:
 *   schemas:
 *     Storage:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - branchId
 *       properties:
 *         name:
 *           type: string
 *           description: Depo adı
 *         code:
 *           type: string
 *           description: Depo kodu
 *         description:
 *           type: string
 *           description: Depo açıklaması
 *         isActive:
 *           type: boolean
 *           description: Depo aktif mi?
 *         branchId:
 *           type: string
 *           description: Şube ID
 *       example:
 *         name: "Ana Depo"
 *         code: "D001"
 *         description: "Ana depo açıklaması"
 *         isActive: true
 *         branchId: "67a4ca7229e5a492280de806"
 * 
 * tags:
 *   name: Storages
 *   description: Depo yönetimi işlemleri
 *
 * /api/storages:
 *   get:
 *     summary: Tüm depoları listeler
 *     tags: [Storages]
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
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Şube ID'ye göre filtreleme
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Depo adı veya kodu ile arama yapar
 *     responses:
 *       200:
 *         description: Depolar başarıyla getirildi
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
 *                     $ref: '#/components/schemas/Storage'
 *   post:
 *     summary: Yeni depo oluşturur
 *     description: Yeni bir depo oluşturur. createdPersonId ve createdBranchId otomatik olarak eklenecektir.
 *     tags: [Storages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - branchId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Depo adı
 *               code:
 *                 type: string
 *                 description: Depo kodu
 *               description:
 *                 type: string
 *                 description: Depo açıklaması
 *               isActive:
 *                 type: boolean
 *                 description: Depo aktif mi?
 *               branchId:
 *                 type: string
 *                 description: Şube ID
 *     responses:
 *       201:
 *         description: Depo başarıyla oluşturuldu
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
 *                   $ref: '#/components/schemas/Storage'
 *
 * /api/storages/{id}:
 *   get:
 *     summary: Depo detaylarını getirir
 *     tags: [Storages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Depo başarıyla getirildi
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
 *                   $ref: '#/components/schemas/Storage'
 *   patch:
 *     summary: Depo bilgilerini günceller
 *     tags: [Storages]
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
 *             $ref: '#/components/schemas/Storage'
 *     responses:
 *       200:
 *         description: Depo başarıyla güncellendi
 *   delete:
 *     summary: Depoyu siler
 *     tags: [Storages]
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
 *         description: Depo başarıyla silindi
 */

export default router; 