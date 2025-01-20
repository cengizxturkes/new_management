import express from 'express';
import {
  createBranch,
  getBranch,
  updateBranch,
  getBranchEmployees,
  assignEmployeeToBranch,
  getAllBranches
} from '../controllers/branchController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Admin rotaları
router.use(restrictTo('admin'));
router.post('/', createBranch);
router.patch('/:id', updateBranch);
router.post('/:id/employees', assignEmployeeToBranch);

// Admin ve manager rotaları
router.get('/:id', restrictTo('admin', 'manager'), getBranch);
router.get('/:id/employees', restrictTo('admin', 'manager'), getBranchEmployees);

router.get('/', getAllBranches);

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Şube yönetimi işlemleri
 * 
 * /api/branches:
 *   get:
 *     summary: Tüm şubeleri listeler
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Şubeler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *   post:
 *     summary: Yeni şube oluşturur
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Branch'
 *     responses:
 *       201:
 *         description: Şube başarıyla oluşturuldu
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
 *                   $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Validasyon hatası
 *       401:
 *         description: Yetkilendirme hatası
 * 
 * /api/branches/{id}:
 *   get:
 *     summary: Şube bilgilerini getirir
 *     tags: [Branches]
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
 *         description: Şube bilgileri başarıyla getirildi
 * 
 *   patch:
 *     summary: Şube bilgilerini günceller
 *     tags: [Branches]
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
 *               name:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               phoneNumber:
 *                 type: string
 *               managerId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Şube başarıyla güncellendi
 */

export default router; 