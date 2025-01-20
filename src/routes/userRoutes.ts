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
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, staff, customer]
 *               branchId:
 *                 type: string
 *                 description: Şube ID (manager ve staff rolleri için zorunlu)
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
 *             examples:
 *               customer:
 *                 value:
 *                   email: musteri@email.com
 *                   password: sifre123
 *                   firstName: Ahmet
 *                   lastName: Yılmaz
 *                   phoneNumber: "5551234567"
 *                   role: customer
 *               staff:
 *                 value:
 *                   email: calisan@email.com
 *                   password: sifre123
 *                   firstName: Mehmet
 *                   lastName: Demir
 *                   phoneNumber: "5551234568"
 *                   role: staff
 *                   branchId: "60d5ecb8b5c9c62b3c7c1b5e"
 *               manager:
 *                 value:
 *                   email: mudur@email.com
 *                   password: sifre123
 *                   firstName: Ali
 *                   lastName: Kaya
 *                   phoneNumber: "5551234569"
 *                   role: manager
 *                   branchId: "60d5ecb8b5c9c62b3c7c1b5e"
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       400:
 *         description: Validasyon hatası
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                   example: 400
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