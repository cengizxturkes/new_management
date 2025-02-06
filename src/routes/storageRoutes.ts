import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllStorages,
  getStorage,
  createStorage,
  updateStorage,
  deleteStorage
} from '../controllers/storageController';

/**
 * @swagger
 * tags:
 *   name: Storages
 *   description: Depo yönetimi işlemleri
 *
 * /api/storages:
 *   get:
 *     summary: Tüm depoları listeler
 *     tags: [Storages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Depolar başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Storage'
 *   post:
 *     summary: Yeni depo oluşturur
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
 *               - branchId
 *               - storageName
 *             properties:
 *               branchId:
 *                 type: string
 *                 description: Şube ID'si
 *               storageName:
 *                 type: string
 *                 description: Depo adı
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
 *                 data:
 *                   $ref: '#/components/schemas/Storage'
 *
 * /api/storages/{id}:
 *   get:
 *     summary: Depo detaylarını getirir
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
 *         description: Depo detayları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
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
 *             type: object
 *             properties:
 *               storageName:
 *                 type: string
 *                 description: Depo adı
 *     responses:
 *       200:
 *         description: Depo başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Storage'
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
 *                   example: Depo başarıyla silindi
 */

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllStorages)
  .post(restrictTo('admin'), createStorage);

router.route('/:id')
  .get(getStorage)
  .patch(restrictTo('admin'), updateStorage)
  .delete(restrictTo('admin'), deleteStorage);

export default router; 