import express from 'express';
import { protect } from '../middleware/auth';
import {
  createAdmission,
  getAdmissions,
  getAdmissionDetails,
  updateAdmission,
  deleteAdmission,
  getAdmissionTreatments,
  createAdmissionTreatment
} from '../controllers/admissionController';

/**
 * @swagger
 * tags:
 *   name: Admissions
 *   description: Başvuru yönetimi işlemleri
 * 
 * /api/admissions:
 *   post:
 *     summary: Yeni başvuru oluşturur
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - personId
 *               - priceListId
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: Randevu ID'si
 *               personId:
 *                 type: string
 *                 description: İşlemi yapan personel ID'si
 *               priceListId:
 *                 type: string
 *                 description: Fiyat listesi ID'si
 *               notes:
 *                 type: string
 *                 description: Notlar
 *               appointmentType:
 *                 type: string
 *                 enum: [initial, followup, consultation, emergency]
 *                 description: Randevu tipi
 *               invoiceNumber:
 *                 type: string
 *                 description: Fatura numarası
 *               patientCondition:
 *                 type: string
 *                 description: Hasta durumu
 *               referringDoctorId:
 *                 type: string
 *                 description: Yönlendiren doktor ID'si
 *               expectedDuration:
 *                 type: number
 *                 description: Beklenen süre (dakika)
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *                 description: Kontrol tarihi
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fileName:
 *                       type: string
 *                     fileType:
 *                       type: string
 *                     fileSize:
 *                       type: number
 *     responses:
 *       201:
 *         description: Başvuru başarıyla oluşturuldu
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
 *                     admission:
 *                       $ref: '#/components/schemas/Admission'
 *   get:
 *     summary: Başvuruları listeler
 *     tags: [Admissions]
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
 *         name: appointmentStatus
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled, noshow]
 *       - in: query
 *         name: personId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başvurular başarıyla listelendi
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
 *                     admissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Admission'
 * 
 * /api/admissions/{id}:
 *   get:
 *     summary: Başvuru detaylarını getirir
 *     tags: [Admissions]
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
 *         description: Başvuru detayları başarıyla getirildi
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
 *                     admission:
 *                       $ref: '#/components/schemas/Admission'
 *   patch:
 *     summary: Başvuru bilgilerini günceller
 *     tags: [Admissions]
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
 *               notes:
 *                 type: string
 *               appointmentType:
 *                 type: string
 *                 enum: [initial, followup, consultation, emergency]
 *               appointmentStatus:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled, noshow]
 *               invoiceNumber:
 *                 type: string
 *               patientCondition:
 *                 type: string
 *               referringDoctorId:
 *                 type: string
 *               expectedDuration:
 *                 type: number
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fileName:
 *                       type: string
 *                     fileType:
 *                       type: string
 *                     fileSize:
 *                       type: number
 *     responses:
 *       200:
 *         description: Başvuru başarıyla güncellendi
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
 *                     admission:
 *                       $ref: '#/components/schemas/Admission'
 *   delete:
 *     summary: Başvuruyu siler (soft delete)
 *     tags: [Admissions]
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
 *         description: Başvuru başarıyla silindi
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
 *                   example: Başvuru başarıyla silindi
 * 
 * /api/admissions/{id}/treatments:
 *   get:
 *     summary: Başvuruya ait işlemleri listeler
 *     tags: [Admissions]
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
 *         description: Başvuru işlemleri başarıyla listelendi
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
 *                     $ref: '#/components/schemas/AdmissionTreatment'
 *   post:
 *     summary: Başvuruya yeni işlem ekler
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - admissionId
 *               - treatmentId
 *               - treatmentDate
 *               - quantity
 *               - storageId
 *               - createdPersonId
 *               - createdBranchId
 *               - personId
 *             properties:
 *               admissionId:
 *                 type: string
 *                 description: Başvuru ID'si
 *               treatmentId:
 *                 type: string
 *                 description: Tedavi ID'si
 *               treatmentDate:
 *                 type: string
 *                 format: date-time
 *                 description: Tedavi tarihi
 *               quantity:
 *                 type: number
 *                 description: Miktar
 *               storageId:
 *                 type: string
 *                 description: Depo ID'si
 *               createdPersonId:
 *                 type: string
 *                 description: Oluşturan personel ID'si
 *               createdBranchId:
 *                 type: string
 *                 description: Oluşturan şube ID'si
 *               personId:
 *                 type: string
 *                 description: İşlemi yapan personel ID'si
 *               customPrice:
 *                 type: number
 *                 description: Özel fiyat
 *               autoApplyCampaign:
 *                 type: boolean
 *                 description: Kampanya otomatik uygulansın mı?
 *               autoApplyCoupon:
 *                 type: boolean
 *                 description: Kupon otomatik uygulansın mı?
 *     responses:
 *       201:
 *         description: Başvuru işlemi başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/AdmissionTreatment'
 */

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createAdmission)
  .get(getAdmissions);

router.route('/:id')
  .get(getAdmissionDetails)
  .patch(updateAdmission)
  .delete(deleteAdmission);

router.route('/:id/treatments')
  .get(getAdmissionTreatments)
  .post(createAdmissionTreatment);

export default router; 