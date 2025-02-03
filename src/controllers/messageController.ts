import { Request, Response, NextFunction } from 'express';
import Message from '../models/Message';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import User from '../models/User';
import mongoose from 'mongoose';

// Mesaj gönderme
export const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { receiverId, content } = req.body;
  
  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    content
  });

  res.status(201).json({
    status: 'success',
    data: message
  });
});

// Kullanıcının tüm mesajlarını getirme
export const getMyMessages = catchAsync(async (req: Request, res: Response) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user._id },
      { receiver: req.user._id }
    ]
  })
  .populate('sender', 'name email')
  .populate('receiver', 'name email')
  .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: messages
  });
});

// İki kullanıcı arasındaki mesajları getirme
export const getMessagesBetweenUsers = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id }
    ]
  })
  .populate('sender', 'name email')
  .populate('receiver', 'name email')
  .sort('createdAt');

  res.status(200).json({
    status: 'success',
    data: messages
  });
});

// Mesajı okundu olarak işaretleme
export const markMessageAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    return next(new AppError('Mesaj bulunamadı', 404));
  }

  if (message.receiver.toString() !== req.user._id.toString()) {
    return next(new AppError('Bu işlem için yetkiniz yok', 403));
  }

  message.read = true;
  await message.save();

  res.status(200).json({
    status: 'success',
    data: message
  });
});

export const getMyConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Kullanıcının tüm konuşmalarını bul (hem gönderici hem alıcı olarak)
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        // Her konuşma için son mesajı al
        $sort: { createdAt: -1 }
      },
      {
        // Konuşmaları grupla
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$receiver',
              else: '$sender'
            }
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$receiver', userId] },
                  { $eq: ['$read', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        // Kullanıcı bilgilerini getir
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        // Sonuç formatını düzenle
        $project: {
          _id: 1,
          user: {
            _id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            email: '$user.email'
          },
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            sender: '$lastMessage.sender',
            createdAt: '$lastMessage.createdAt',
            read: '$lastMessage.read'
          },
          unreadCount: 1
        }
      },
      {
        // Tarihe göre sırala
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.status(200).json({
      isSuccess: true,
      message: 'Konuşmalar başarıyla getirildi',
      statusCode: 200,
      data: conversations
    });

  } catch (error) {
    console.error('Konuşmaları getirme hatası:', error);
    res.status(500).json({
      isSuccess: false,
      message: 'Konuşmalar getirilirken bir hata oluştu',
      statusCode: 500,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
};

export const getMessageMaster = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;

  // Tüm konuşmaları getir
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { receiver: new mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
            then: "$receiver",
            else: "$sender"
          }
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ["$receiver", new mongoose.Types.ObjectId(userId)] },
                  { $eq: ["$read", false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: "$user"
    },
    {
      $project: {
        _id: 1,
        user: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1
        },
        lastMessage: 1,
        unreadCount: 1
      }
    }
  ]);

  // Son 24 saat içindeki mesaj istatistikleri
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const lastDayStats = await Message.aggregate([
    {
      $match: {
        createdAt: { $gte: oneDayAgo },
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { receiver: new mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $group: {
        _id: null,
        sentCount: {
          $sum: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              1,
              0
            ]
          }
        },
        receivedCount: {
          $sum: {
            $cond: [
              { $eq: ["$receiver", new mongoose.Types.ObjectId(userId)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  // Online kullanıcıları getir (son 5 dakika içinde aktif olanlar)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const onlineUsers = await User.find({
    lastSeen: { $gte: fiveMinutesAgo },
    _id: { $ne: userId }
  }).select('_id firstName lastName lastSeen');

  // Toplam okunmamış mesaj sayısı
  const totalUnreadCount = await Message.countDocuments({
    receiver: userId,
    read: false
  });

  // Arşivlenmiş konuşmaları getir
  const archivedConversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { receiver: new mongoose.Types.ObjectId(userId) }
        ],
        archived: true
      }
    },
    // ... (benzer aggregation pipeline'ı conversations ile)
  ]);

  res.status(200).json({
    isSuccess: true,
    message: 'Mesajlaşma verileri başarıyla getirildi',
    statusCode: 200,
    data: {
      conversations,
      totalUnreadCount,
      lastDayStats: lastDayStats[0] || { sentCount: 0, receivedCount: 0 },
      onlineUsers,
      archivedConversations
    }
  });
}); 