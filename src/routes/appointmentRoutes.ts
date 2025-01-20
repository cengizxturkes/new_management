import express from 'express';
import { protect } from '../middleware/auth';
import { 
  createAppointment,
  getAppointments,
  getAppointmentDetails,
  updateAppointment
} from '../controllers/appointmentController';

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Randevu yönetimi işlemleri
 * 
 * /api/appointments:
 *   get:
 *     summary: Randevuları listeler
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Randevular başarıyla listelendi
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
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     appointments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Appointment'
 *   post:
 *     summary: Yeni randevu oluşturur
 *     description: Randevu oluşturmadan önce /api/resources/available-slots endpoint'ini kullanarak uygun bir slot ID almalısınız
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotId
 *               - customerId
 *             properties:
 *               slotId:
 *                 type: string
 *                 description: /api/resources/available-slots endpoint'inden alınan slot ID'si
 *               customerId:
 *                 type: string
 *                 description: Randevu alan müşterinin ID'si
 *               notes:
 *                 type: string
 *                 description: Randevu notları (opsiyonel)
 *     responses:
 *       201:
 *         description: Randevu başarıyla oluşturuldu
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
 *                     appointment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: Randevu ID'si
 *                         resourceId:
 *                           type: string
 *                           description: Kaynak ID'si
 *                         customerId:
 *                           type: string
 *                           description: Müşteri ID'si
 *                         startTime:
 *                           type: string
 *                           format: date-time
 *                           description: Randevu başlangıç zamanı
 *                         endTime:
 *                           type: string
 *                           format: date-time
 *                           description: Randevu bitiş zamanı
 *                         status:
 *                           type: string
 *                           enum: [scheduled, completed, cancelled]
 *                           description: Randevu durumu
 *                         notes:
 *                           type: string
 *                           description: Randevu notları
 *                         createdBy:
 *                           type: string
 *                           description: Randevuyu oluşturan kullanıcı ID'si
 *                         createdBranchId:
 *                           type: string
 *                           description: Randevunun oluşturulduğu şube ID'si
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           description: Oluşturulma zamanı
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           description: Son güncelleme zamanı
 *       400:
 *         description: Geçersiz istek
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: slotId zorunludur. Önce /resources/available-slots endpoint'ini kullanarak uygun bir slot seçin
 *       401:
 *         description: Yetkilendirme hatası
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Lütfen giriş yapın
 * 
 * /api/appointments/{id}:
 *   get:
 *     summary: Randevu detaylarını getirir
 *     tags: [Appointments]
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
 *         description: Randevu detayları başarıyla getirildi
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
 *                     appointment:
 *                       $ref: '#/components/schemas/AppointmentDetails'
 *   patch:
 *     summary: Randevu durumunu günceller
 *     tags: [Appointments]
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
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Randevu başarıyla güncellendi
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
 *                     appointment:
 *                       $ref: '#/components/schemas/Appointment'
 */

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/:id')
  .get(getAppointmentDetails)
  .patch(updateAppointment);

export default router; 