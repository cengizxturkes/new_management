import express from 'express';
import { protect } from '../middleware/auth';
import {
  createAdmissionTreatment,
  getAdmissionTreatments,
  getAdmissionTreatmentById,
  getAdmissionTreatmentsByAdmissionId,
  updateAdmissionTreatment,
  deleteAdmissionTreatment,
} from '../controllers/admissionTreatmentController';

/**
 * @swagger
 * tags:
 *   name: AdmissionTreatments
 *   description: Başvurulara ait tedavi işlemleri
 * 
 * /api/admission-treatments:
 *   post:
 *     summary: Yeni başvuru tedavisi oluşturur
 *     tags: [AdmissionTreatments]
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
 *         description: Başvuru tedavisi başarıyla oluşturuldu
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
 *                     admissionTreatment:
 *                       $ref: '#/components/schemas/AdmissionTreatment'
 *   get:
 *     summary: Tüm başvuru tedavilerini listeler
 *     tags: [AdmissionTreatments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başvuru tedavileri başarıyla listelendi
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
 *                     admissionTreatments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdmissionTreatment'
 * 
 * /api/admission-treatments/{id}:
 *   get:
 *     summary: ID'ye göre başvuru tedavisi getirir
 *     tags: [AdmissionTreatments]
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
 *         description: Başvuru tedavisi başarıyla getirildi
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
 *                     admissionTreatment:
 *                       $ref: '#/components/schemas/AdmissionTreatment'
 *   patch:
 *     summary: Başvuru tedavisini günceller
 *     tags: [AdmissionTreatments]
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
 *               treatmentDate:
 *                 type: string
 *                 format: date-time
 *               quantity:
 *                 type: number
 *               customPrice:
 *                 type: number
 *               autoApplyCampaign:
 *                 type: boolean
 *               autoApplyCoupon:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Başvuru tedavisi başarıyla güncellendi
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
 *                     admissionTreatment:
 *                       $ref: '#/components/schemas/AdmissionTreatment'
 *   delete:
 *     summary: Başvuru tedavisini siler (soft delete)
 *     tags: [AdmissionTreatments]
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
 *         description: Başvuru tedavisi başarıyla silindi
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
 *                   example: Tedavi başarıyla silindi
 * 
 * /api/admission-treatments/admission/{admissionId}:
 *   get:
 *     summary: Başvuru ID'sine göre tedavileri getirir
 *     tags: [AdmissionTreatments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: admissionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başvuru tedavileri başarıyla getirildi
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
 *                     admissionTreatments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdmissionTreatment'
 */

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createAdmissionTreatment)
  .get(getAdmissionTreatments);

router.route('/:id')
  .get(getAdmissionTreatmentById)
  .patch(updateAdmissionTreatment)
  .delete(deleteAdmissionTreatment);

router.get('/admission/:admissionId', getAdmissionTreatmentsByAdmissionId);

export default router; 