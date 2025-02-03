import express from 'express';
import { protect } from '../middleware/auth';

import {
  sendMessage,
  getMyMessages,
  getMessagesBetweenUsers,
  markMessageAsRead,
  getMyConversations,
  getMessageMaster
} from '../controllers/messageController';

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Mesajlaşma işlemleri
 */

const router = express.Router();

// Tüm mesaj route'ları için authentication gerekli
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Konuşulan kullanıcının ID'si
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Kullanıcı ID'si
 *             firstName:
 *               type: string
 *               description: Kullanıcının adı
 *             lastName:
 *               type: string
 *               description: Kullanıcının soyadı
 *             email:
 *               type: string
 *               description: Kullanıcının e-posta adresi
 *         lastMessage:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Mesaj ID'si
 *             content:
 *               type: string
 *               description: Mesaj içeriği
 *             sender:
 *               type: string
 *               description: Gönderen kullanıcının ID'si
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Mesajın gönderilme tarihi
 *             read:
 *               type: boolean
 *               description: Mesajın okunma durumu
 *         unreadCount:
 *           type: number
 *           description: Okunmamış mesaj sayısı
 *       example:
 *         _id: "65be1234c9d2f1e6e8123456"
 *         user:
 *           _id: "65be1234c9d2f1e6e8123456"
 *           firstName: "John"
 *           lastName: "Doe"
 *           email: "john@example.com"
 *         lastMessage:
 *           _id: "65be1234c9d2f1e6e8123456"
 *           content: "Merhaba, nasılsın?"
 *           sender: "65be1234c9d2f1e6e8123456"
 *           createdAt: "2024-02-03T12:00:00.000Z"
 *           read: false
 *         unreadCount: 3
 */

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     summary: Yeni bir mesaj gönder
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: Alıcı kullanıcının ID'si
 *               content:
 *                 type: string
 *                 description: Mesaj içeriği
 *     responses:
 *       201:
 *         description: Mesaj başarıyla gönderildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 */
router.post('/send', sendMessage);

/**
 * @swagger
 * /api/messages/my-messages:
 *   get:
 *     summary: Kullanıcının tüm mesajlarını getir
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mesajlar başarıyla getirildi
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
 *                     $ref: '#/components/schemas/Message'
 */
router.get('/my-messages', getMyMessages);

/**
 * @swagger
 * /api/messages/conversation/{userId}:
 *   get:
 *     summary: İki kullanıcı arasındaki mesajları getir
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Diğer kullanıcının ID'si
 *     responses:
 *       200:
 *         description: Konuşma başarıyla getirildi
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
 *                     $ref: '#/components/schemas/Message'
 */
router.get('/conversation/:userId', getMessagesBetweenUsers);

/**
 * @swagger
 * /api/messages/mark-read/{messageId}:
 *   patch:
 *     summary: Mesajı okundu olarak işaretle
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Okundu olarak işaretlenecek mesajın ID'si
 *     responses:
 *       200:
 *         description: Mesaj başarıyla okundu olarak işaretlendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       404:
 *         description: Mesaj bulunamadı
 *       403:
 *         description: Bu işlem için yetkiniz yok
 */
router.patch('/mark-read/:messageId', markMessageAsRead);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Kullanıcının tüm konuşmalarını son mesajlarıyla birlikte getir
 *     description: |
 *       Bu endpoint, giriş yapmış kullanıcının tüm konuşmalarını getirir.
 *       Her konuşma için:
 *       - Konuşulan kişinin bilgileri
 *       - Son mesajın detayları
 *       - Okunmamış mesaj sayısı
 *       bilgilerini içerir.
 *       
 *       Konuşmalar son mesaj tarihine göre sıralanır (en son konuşma en üstte).
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Konuşmalar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Konuşmalar başarıyla getirildi
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Yetkilendirme hatası
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
 *                   example: Lütfen giriş yapın
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *       500:
 *         description: Sunucu hatası
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
 *                   example: Konuşmalar getirilirken bir hata oluştu
 *                 statusCode:
 *                   type: number
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get('/conversations', getMyConversations);

/**
 * @swagger
 * /api/messages/master:
 *   get:
 *     summary: Tüm mesajlaşma verilerini tek seferde getir
 *     description: |
 *       Bu endpoint, kullanıcının mesajlaşma ile ilgili tüm verilerini tek seferde getirir:
 *       - Tüm konuşmaların özeti (son mesajlar ve kullanıcı bilgileri)
 *       - Toplam okunmamış mesaj sayısı
 *       - Son 24 saat içindeki mesaj istatistikleri
 *       - Online kullanıcılar
 *       - Arşivlenmiş konuşmalar
 *       
 *       Veriler, kullanıcı deneyimini optimize etmek için gruplanmış ve sıralanmış şekilde gelir.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Veriler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Mesajlaşma verileri başarıyla getirildi
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Conversation'
 *                       description: Tüm konuşmaların listesi
 *                     totalUnreadCount:
 *                       type: number
 *                       example: 5
 *                       description: Toplam okunmamış mesaj sayısı
 *                     lastDayStats:
 *                       type: object
 *                       properties:
 *                         sentCount:
 *                           type: number
 *                           example: 10
 *                           description: Son 24 saatte gönderilen mesaj sayısı
 *                         receivedCount:
 *                           type: number
 *                           example: 8
 *                           description: Son 24 saatte alınan mesaj sayısı
 *                     onlineUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Kullanıcı ID'si
 *                           firstName:
 *                             type: string
 *                             description: Kullanıcı adı
 *                           lastName:
 *                             type: string
 *                             description: Kullanıcı soyadı
 *                           lastSeen:
 *                             type: string
 *                             format: date-time
 *                             description: Son görülme zamanı
 *                     archivedConversations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Conversation'
 *                       description: Arşivlenmiş konuşmaların listesi
 *       401:
 *         description: Yetkilendirme hatası
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
 *                   example: Lütfen giriş yapın
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *       500:
 *         description: Sunucu hatası
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
 *                   example: Veriler getirilirken bir hata oluştu
 *                 statusCode:
 *                   type: number
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get('/master', getMessageMaster);

export default router; 