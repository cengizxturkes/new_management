import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllCategories,
  getCategory,
  getSubCategories,
  getMainCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = express.Router();

router.use(protect);

// Public routes (authenticated)
router.get('/', getAllCategories);
router.get('/main', getMainCategories);
router.get('/:id', getCategory);
router.get('/sub/:parentId', getSubCategories);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - createdPersonId
 *         - createdBranchId
 *       properties:
 *         name:
 *           type: string
 *           description: Kategori adı
 *         description:
 *           type: string
 *           description: Kategori açıklaması
 *         parentId:
 *           type: string
 *           description: Üst kategori ID'si
 *         isActive:
 *           type: boolean
 *           description: Kategori aktif mi?
 *         createdPersonId:
 *           type: string
 *           description: Oluşturan kişi ID
 *         createdBranchId:
 *           type: string
 *           description: Oluşturan şube ID
 *       example:
 *         name: "Cilt Bakımı"
 *         description: "Cilt bakım hizmetleri"
 *         isActive: true
 *         createdPersonId: "60d5ecb8b5c9c62b3c7c1b5f"
 *         createdBranchId: "678dc24d31735be6836089b9"
 * 
 * tags:
 *   name: Categories
 *   description: Kategori yönetimi işlemleri
 *
 * /api/categories:
 *   get:
 *     summary: Tüm kategorileri listeler
 *     tags: [Categories]
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
 *         description: Kategori adı ile arama yapar
 *     responses:
 *       200:
 *         description: Kategoriler başarıyla getirildi
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
 *                     $ref: '#/components/schemas/Category'
 *   post:
 *     summary: Yeni kategori oluşturur
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Kategori başarıyla oluşturuldu
 *
 * /api/categories/main:
 *   get:
 *     summary: Ana kategorileri listeler
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Ana kategoriler başarıyla getirildi
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
 *                     $ref: '#/components/schemas/Category'
 *
 * /api/categories/sub/{parentId}:
 *   get:
 *     summary: Alt kategorileri listeler
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alt kategoriler başarıyla getirildi
 *
 * /api/categories/{id}:
 *   get:
 *     summary: Kategori detaylarını getirir
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kategori başarıyla getirildi
 *   patch:
 *     summary: Kategori bilgilerini günceller
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Kategori başarıyla güncellendi
 *   delete:
 *     summary: Kategoriyi siler
 *     tags: [Categories]
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
 *         description: Kategori başarıyla silindi
 */

export default router; 