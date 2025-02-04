import express from 'express';
import { protect } from '../middleware/auth';

import {
  sendMessage,
  getMyMessages,
  getMessagesBetweenUsers,
  markMessageAsRead,
  getMyConversations,
  markAllMessagesAsRead
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Konuşulan kullanıcının ID'si
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       lastMessage:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           content:
 *                             type: string
 *                           sender:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                           read:
 *                             type: boolean
 *                       unreadCount:
 *                         type: number
 *                         description: Okunmamış mesaj sayısı
 */
router.get('/conversations', getMyConversations);

/**
 * @swagger
 * /api/messages/mark-all-read/{userId}:
 *   patch:
 *     summary: İki kullanıcı arasındaki tüm okunmamış mesajları okundu olarak işaretle
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Mesajları okundu olarak işaretlenecek kullanıcının ID'si
 *     responses:
 *       200:
 *         description: Mesajlar başarıyla okundu olarak işaretlendi
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
 *                   example: Tüm mesajlar okundu olarak işaretlendi
 *                 data:
 *                   type: object
 *                   properties:
 *                     modifiedCount:
 *                       type: number
 *                       description: Okundu olarak işaretlenen mesaj sayısı
 */
router.patch('/mark-all-read/:userId', markAllMessagesAsRead);

export default router; 