import express from 'express';
import { protect } from '../middleware/auth';
import {
  createCarpenterInvoice,
  getAllCarpenterInvoices,
  getCarpenterInvoice,
  updateCarpenterInvoice,
  deleteCarpenterInvoice,
  generatePDF
} from '../controllers/carpenterInvoiceController';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createCarpenterInvoice)
  .get(getAllCarpenterInvoices);

router.route('/:id')
  .get(getCarpenterInvoice)
  .patch(updateCarpenterInvoice)
  .delete(deleteCarpenterInvoice);

router.get('/:id/pdf', generatePDF);

/**
 * @swagger
 * components:
 *   schemas:
 *     InvoiceItem:
 *       type: object
 *       required:
 *         - productName
 *         - color
 *         - width
 *         - height
 *         - unitPrice
 *         - quantity
 *       properties:
 *         productName:
 *           type: string
 *           description: Ürün adı
 *         color:
 *           type: string
 *           description: Renk
 *         width:
 *           type: number
 *           description: En (cm)
 *         height:
 *           type: number
 *           description: Boy (cm)
 *         unitPrice:
 *           type: number
 *           description: Birim fiyat (m² başına)
 *         quantity:
 *           type: number
 *           description: Adet
 *     CarpenterInvoice:
 *       type: object
 *       required:
 *         - deliveryMethod
 *         - packaging
 *         - approvedBy
 *         - items
 *       properties:
 *         deliveryMethod:
 *           type: string
 *           description: Teslim şekli
 *         packaging:
 *           type: string
 *           description: Paketleme
 *         approvedBy:
 *           type: string
 *           description: Onaylayan kişi
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceItem'
 *           description: Fatura kalemleri
 * 
 * tags:
 *   name: Carpenter Invoices
 *   description: Marangoz faturası işlemleri
 *
 * /api/carpenter-invoices:
 *   get:
 *     summary: Tüm marangoz faturalarını listeler
 *     tags: [Carpenter Invoices]
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
 *     responses:
 *       200:
 *         description: Faturalar başarıyla getirildi
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
 *                     $ref: '#/components/schemas/CarpenterInvoice'
 *   post:
 *     summary: Yeni marangoz faturası oluşturur
 *     tags: [Carpenter Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CarpenterInvoice'
 *     responses:
 *       201:
 *         description: Fatura başarıyla oluşturuldu
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
 *                   type: object
 *                   properties:
 *                     invoice:
 *                       $ref: '#/components/schemas/CarpenterInvoice'
 *                     pdf:
 *                       type: string
 *                       description: Base64 formatında PDF
 *
 * /api/carpenter-invoices/{id}:
 *   get:
 *     summary: Marangoz faturası detaylarını getirir
 *     tags: [Carpenter Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fatura başarıyla getirildi
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
 *                   type: object
 *                   properties:
 *                     invoice:
 *                       $ref: '#/components/schemas/CarpenterInvoice'
 *                     pdf:
 *                       type: string
 *                       description: Base64 formatında PDF
 */

export default router; 