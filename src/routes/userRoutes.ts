import express from 'express';
import {
  register,
  updateUser,
  deleteUser,
  getUserInfo,
  getAllUsers,
  login
} from '../controllers/userController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Kullanıcı yönetimi işlemleri
 * 
 * /api/users/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               phoneNumber:
 *                 type: object
 *                 properties:
 *                   countryCode:
 *                     type: string
 *                     example: "+90"
 *                   number:
 *                     type: string
 *                     example: "5551234567"
 *               role:
 *                 type: string
 *                 enum: [admin, manager, staff, customer]
 *                 example: "staff"
 *               branchId:
 *                 type: string
 *                 description: Manager ve staff rolleri için zorunlu
 *                 example: "678dc24d31735be6836089b9"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     example: "Istanbul"
 *                   state:
 *                     type: string
 *                     example: "Marmara"
 *                   postalCode:
 *                     type: string
 *                     example: "34000"
 *                   country:
 *                     type: string
 *                     example: "Turkey"
 *               isHaveResource:
 *                 type: boolean
 *                 description: True ise ve role manager/staff ise otomatik resource oluşturulur
 *                 example: true
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         phoneNumber:
 *                           type: object
 *                           properties:
 *                             countryCode:
 *                               type: string
 *                               example: "+90"
 *                             number:
 *                               type: string
 *                               example: "5551234567"
 *                         role:
 *                           type: string
 *                           example: "staff"
 *                         branchId:
 *                           type: string
 *                           example: "678dc24d31735be6836089b9"
 *                         address:
 *                           type: object
 *                           properties:
 *                             street:
 *                               type: string
 *                               example: "123 Main St"
 *                             city:
 *                               type: string
 *                               example: "Istanbul"
 *                             state:
 *                               type: string
 *                               example: "Marmara"
 *                             postalCode:
 *                               type: string
 *                               example: "34000"
 *                             country:
 *                               type: string
 *                               example: "Turkey"
 *                         isHaveResource:
 *                           type: boolean
 *                           example: true
 *                         resourceId:
 *                           type: string
 *                           example: "60d5ecb8b5c9c62b3c7c1b5f"
 *       400:
 *         description: Validasyon hatası
 *       409:
 *         description: Email adresi zaten kullanımda
 * 
 * /api/users/{id}:
 *   get:
 *     summary: Kullanıcı bilgilerini getirir
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Kullanıcı ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı bilgileri başarıyla getirildi
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *   patch:
 *     summary: Kullanıcı bilgilerini günceller
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Kullanıcı ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla güncellendi
 *   delete:
 *     summary: Kullanıcıyı siler (soft delete)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Kullanıcı ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla silindi
 * 
 * /api/users:
 *   get:
 *     summary: Kullanıcıları listeler (Sayfalama ile)
 *     tags: [Users]
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
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcılar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 * 
 * /api/users/login:
 *   post:
 *     summary: Kullanıcı girişi yapar
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *           example:
 *             email: admin@sistem.com
 *             password: Admin123!
 *     responses:
 *       200:
 *         description: Giriş başarılı
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: Giriş başarısız
 *       400:
 *         description: Geçersiz istek
 */
router.post('/register', register);
router.post('/login', login);

// Korumalı rotalar
router.use(protect);

router.get('/:id', getUserInfo);
router.patch('/:id', updateUser);
router.delete('/:id', restrictTo('admin'), deleteUser);
router.get('/', getAllUsers);

export default router; 