import { Request, Response, NextFunction } from 'express';
import Message from '../models/Message';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';

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