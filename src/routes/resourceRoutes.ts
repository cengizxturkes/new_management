import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  createResource,
  getAllResources,
  getResource,
  updateResource,
  deleteResource,
  restoreResource,
  getAvailableSlots
} from '../controllers/resourceController';

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Kaynak yönetimi işlemleri
 * 
 * /api/resources:
 *   get:
 *     summary: Tüm kaynakları listeler
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kaynaklar başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     resources:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           resourceName:
 *                             type: string
 *                           branchId:
 *                             type: string
 *                           active:
 *                             type: boolean
 *                           appointmentActive:
 *                             type: boolean
 *                           onlineAppointmentActive:
 *                             type: boolean
 *                           userId:
 *                             type: string
 *                             description: Kaynağa atanmış kullanıcının ID'si
 *                             nullable: true
 *   post:
 *     summary: Yeni kaynak oluşturur
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resourceName
 *               - branchId
 *             properties:
 *               resourceName:
 *                 type: string
 *               branchId:
 *                 type: string
 *               active:
 *                 type: boolean
 *               appointmentActive:
 *                 type: boolean
 *               onlineAppointmentActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Kaynak başarıyla oluşturuldu
 * 
 * /api/resources/{id}:
 *   get:
 *     summary: Belirli bir kaynağı getirir
 *     tags: [Resources]
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
 *         description: Kaynak başarıyla getirildi
 *       404:
 *         description: Kaynak bulunamadı
 * 
 *   patch:
 *     summary: Kaynağı günceller
 *     tags: [Resources]
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
 *               resourceName:
 *                 type: string
 *               active:
 *                 type: boolean
 *               appointmentActive:
 *                 type: boolean
 *               onlineAppointmentActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Kaynak başarıyla güncellendi
 *       404:
 *         description: Kaynak bulunamadı
 * 
 *   delete:
 *     summary: Kaynağı siler (soft delete)
 *     tags: [Resources]
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
 *         description: Kaynak başarıyla silindi
 *       404:
 *         description: Kaynak bulunamadı
 * 
 * /api/resources/{id}/restore:
 *   patch:
 *     summary: Silinmiş kaynağı geri yükler
 *     tags: [Resources]
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
 *         description: Kaynak başarıyla geri yüklendi
 *       404:
 *         description: Kaynak bulunamadı
 *
 * @swagger
 * /api/resources/available-slots:
 *   post:
 *     summary: Belirli bir kaynağın boş randevu slotlarını getirir
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resourceId
 *               - durationInMinutes
 *               - queryStartDate
 *               - queryEndDate
 *             properties:
 *               resourceId:
 *                 type: string
 *                 description: Randevu slotları kontrol edilecek kaynağın ID'si
 *               durationInMinutes:
 *                 type: number
 *                 description: Randevu süresi (dakika cinsinden)
 *               queryStartDate:
 *                 type: string
 *                 format: date-time
 *                 description: Sorgu başlangıç tarihi
 *               queryEndDate:
 *                 type: string
 *                 format: date-time
 *                 description: Sorgu bitiş tarihi (başlangıç tarihinden en fazla 1 ay sonrası olabilir)
 *     responses:
 *       200:
 *         description: Boş randevu slotları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     resource:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         resourceName:
 *                           type: string
 *                     queryStartDate:
 *                       type: string
 *                       format: date-time
 *                     queryEndDate:
 *                       type: string
 *                       format: date-time
 *                     durationInMinutes:
 *                       type: number
 *                     availableSlots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           start:
 *                             type: string
 *                             format: date-time
 *                           end:
 *                             type: string
 *                             format: date-time
 *                           isAvailable:
 *                             type: boolean
 *       404:
 *         description: Kaynak bulunamadı veya randevuya uygun değil
 */

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAllResources)
  .post(restrictTo('admin'), createResource);

router.post('/available-slots', getAvailableSlots);

router
  .route('/:id')
  .get(getResource)
  .patch(restrictTo('admin'), updateResource)
  .delete(restrictTo('admin'), deleteResource);

router.patch('/:id/restore', restrictTo('admin'), restoreResource);

export default router; 