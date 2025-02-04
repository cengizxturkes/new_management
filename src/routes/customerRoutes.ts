import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController';

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Müşteri yönetimi işlemleri
 * 
 * @swagger
 * components:
 *   schemas:
 *     CustomerAddress:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - email
 *         - addressText
 *         - addressCountryId
 *         - addressCityId
 *         - addressDistrictId
 *         - postalZone
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: Telefon numarası (10 haneli)
 *         secondaryPhoneNumber:
 *           type: string
 *           description: İkincil telefon numarası
 *         faxNumber:
 *           type: string
 *           description: Faks numarası
 *         email:
 *           type: string
 *           description: E-posta adresi
 *         addressText:
 *           type: string
 *           description: Açık adres
 *         addressCountryId:
 *           type: string
 *           description: Ülke ID
 *         addressCityId:
 *           type: string
 *           description: Şehir ID
 *         addressDistrictId:
 *           type: string
 *           description: İlçe ID
 *         buildingName:
 *           type: string
 *           description: Bina adı
 *         buildingNumber:
 *           type: string
 *           description: Bina numarası
 *         postalZone:
 *           type: string
 *           description: Posta kodu
 *         latitude:
 *           type: number
 *           description: Enlem
 *         longitude:
 *           type: number
 *           description: Boylam
 *     Customer:
 *       type: object
 *       required:
 *         - citizenType
 *         - identityNumber
 *         - citizenCountryId
 *         - name
 *         - surname
 *         - gender
 *         - birthDate
 *         - customerType
 *         - customerAddresses
 *       properties:
 *         citizenType:
 *           type: number
 *           enum: [1, 2]
 *           description: 1 - Yerli, 2 - Yabancı
 *         identityNumber:
 *           type: string
 *           description: TC Kimlik No veya Yabancı Kimlik No
 *         citizenCountryId:
 *           type: string
 *           description: Vatandaşlık ülkesi ID'si
 *         name:
 *           type: string
 *           description: Müşteri adı
 *         surname:
 *           type: string
 *           description: Müşteri soyadı
 *         gender:
 *           type: number
 *           enum: [1, 2]
 *           description: 1 - Erkek, 2 - Kadın
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Doğum tarihi
 *         pictureB64:
 *           type: string
 *           description: Base64 formatında profil fotoğrafı (data:image ile başlamalı)
 *         notes:
 *           type: string
 *           description: Notlar
 *         eInvoiceType:
 *           type: number
 *           enum: [0, 1, 2]
 *           description: E-Fatura tipi
 *         eInvoiceIdentityType:
 *           type: number
 *           enum: [0, 1, 2]
 *           description: E-Fatura kimlik tipi
 *         taxNumber:
 *           type: string
 *           description: Vergi numarası
 *         taxPlace:
 *           type: string
 *           description: Vergi dairesi
 *         companyTitle:
 *           type: string
 *           description: Firma ünvanı
 *         customerType:
 *           type: string
 *           enum: [individual, corporate]
 *           description: Müşteri tipi
 *         loyaltyLevel:
 *           type: string
 *           enum: [bronze, silver, gold, platinum]
 *           description: Sadakat seviyesi
 *         creditLimit:
 *           type: number
 *           description: Kredi limiti
 *         outstandingBalance:
 *           type: number
 *           description: Bakiye
 *         contractStartDate:
 *           type: string
 *           format: date
 *           description: Sözleşme başlangıç tarihi
 *         contractEndDate:
 *           type: string
 *           format: date
 *           description: Sözleşme bitiş tarihi
 *         contractTerms:
 *           type: string
 *           description: Sözleşme şartları
 *         vatNumber:
 *           type: string
 *           description: KDV numarası
 *         legalEntityType:
 *           type: string
 *           description: Tüzel kişilik tipi
 *         lastContactDate:
 *           type: string
 *           format: date
 *           description: Son iletişim tarihi
 *         preferredContactMethod:
 *           type: string
 *           enum: [email, phone, sms]
 *           description: Tercih edilen iletişim yöntemi
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: number
 *           description: Ekler
 *         additionalNotes:
 *           type: string
 *           description: Ek notlar
 *         customerAddresses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerAddress'
 *           description: Müşteri adresleri
 * 
 * /api/customers:
 *   get:
 *     summary: Tüm müşterileri listeler (Pagination ile)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
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
 *         description: Arama metni (isim, soyisim, TC, email veya telefon)
 *     responses:
 *       200:
 *         description: Müşteriler başarıyla getirildi
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
 *                     customers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Customer'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Toplam kayıt sayısı
 *                         page:
 *                           type: integer
 *                           description: Mevcut sayfa
 *                         limit:
 *                           type: integer
 *                           description: Sayfa başına kayıt sayısı
 *                         totalPages:
 *                           type: integer
 *                           description: Toplam sayfa sayısı
 *                         hasNextPage:
 *                           type: boolean
 *                           description: Sonraki sayfa var mı?
 *                         hasPrevPage:
 *                           type: boolean
 *                           description: Önceki sayfa var mı?
 * 
 *   post:
 *     summary: Yeni müşteri oluşturur
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Müşteri başarıyla oluşturuldu
 * 
 * /api/customers/{id}:
 *   get:
 *     summary: Müşteri detaylarını getirir
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Müşteri başarıyla getirildi
 * 
 *   patch:
 *     summary: Müşteri bilgilerini günceller
 *     tags: [Customers]
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
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Müşteri başarıyla güncellendi
 * 
 *   delete:
 *     summary: Müşteriyi siler (soft delete)
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Müşteri başarıyla silindi
 */

const router = express.Router();

router.use(protect);

// Public routes (authenticated)
router.get('/', getAllCustomers);
router.get('/:id', getCustomer);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createCustomer);
router.patch('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router; 