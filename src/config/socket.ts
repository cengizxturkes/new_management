import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Message from '../models/Message';

export const configureSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3001', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization'],
      credentials: true
    }
  });

  // Aktif kullanıcıları tutmak için
  const activeUsers = new Map();

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error('Authentication error');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log('User connected:', socket.data.user._id);
    
    // Kullanıcıyı aktif kullanıcılar listesine ekle
    activeUsers.set(socket.data.user._id.toString(), {
      id: socket.data.user._id,
      name: `${socket.data.user.firstName} ${socket.data.user.lastName}`,
      email: socket.data.user.email,
      socketId: socket.id
    });
    
    // Tüm kullanıcılara aktif kullanıcı listesini gönder
    io.emit('activeUsers', Array.from(activeUsers.values()));

    // Arama istekleri
    socket.on('callRequest', (data) => {
      const receiverSocket = activeUsers.get(data.userId)?.socketId;
      if (receiverSocket) {
        io.to(receiverSocket).emit('callRequest', {
          id: socket.data.user._id,
          name: socket.data.user.name
        });
      }
    });

    socket.on('callAccepted', (data) => {
      const callerSocket = activeUsers.get(data.userId)?.socketId;
      if (callerSocket) {
        io.to(callerSocket).emit('callAccepted');
      }
    });

    socket.on('callRejected', (data) => {
      const callerSocket = activeUsers.get(data.userId)?.socketId;
      if (callerSocket) {
        io.to(callerSocket).emit('callRejected');
      }
    });

    socket.on('offer', (data) => {
      const receiverSocket = activeUsers.get(data.userId)?.socketId;
      if (receiverSocket) {
        io.to(receiverSocket).emit('offer', data.description);
      }
    });

    socket.on('answer', (data) => {
      const callerSocket = activeUsers.get(data.userId)?.socketId;
      if (callerSocket) {
        io.to(callerSocket).emit('answer', data.description);
      }
    });

    socket.on('ice-candidate', (data) => {
      const receiverSocket = activeUsers.get(data.userId)?.socketId;
      if (receiverSocket) {
        io.to(receiverSocket).emit('ice-candidate', data.candidate);
      }
    });

    socket.on('hangup', (data) => {
      const receiverSocket = activeUsers.get(data.userId)?.socketId;
      if (receiverSocket) {
        io.to(receiverSocket).emit('hangup');
      }
    });

    // Mesaj gönderme
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, content } = data;
        
        const message = await Message.create({
          sender: socket.data.user._id,
          receiver: receiverId,
          content,
          read: false
        });

        // Alıcının socket ID'sini bul
        const receiverSocketId = activeUsers.get(receiverId)?.socketId;
    
        // Flutter modeline uygun mesaj objesi
        const messageResponse = {
          status: "success",
          data: [{
            _id: message._id,
            sender: {
              _id: socket.data.user._id,
              email: socket.data.user.email
            },
            receiver: {
              _id: receiverId,
              email: activeUsers.get(receiverId)?.email || ""
            },
            content: message.content,
            read: message.read,
            createdAt: message.createdAt.toISOString(),
            updatedAt: message.updatedAt.toISOString(),
            __v: 0
          }]
        };
    
        // Mesajı alıcıya gönder
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', messageResponse);
        }
    
        // Mesajın gönderildiğini gönderen kullanıcıya bildir
        socket.emit('messageSent', messageResponse);
    
        console.log(`📩 Mesaj gönderildi: ${content}`);
      } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
        socket.emit('messageError', { 
          status: "error",
          message: 'Mesaj gönderilemedi' 
        });
      }
    });

    // Yazıyor... durumu
    socket.on('typing', (data: { receiverId: string }) => {
      io.to(data.receiverId).emit('userTyping', {
        userId: socket.data.user._id,
        name: socket.data.user.name
      });
    });

    // Yazma durumu bitti
    socket.on('stopTyping', (data: { receiverId: string }) => {
      io.to(data.receiverId).emit('userStoppedTyping', {
        userId: socket.data.user._id
      });
    });

    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.user._id);
      // Kullanıcıyı aktif listeden çıkar
      activeUsers.delete(socket.data.user._id.toString());
      // Tüm kullanıcılara güncel aktif kullanıcı listesini gönder
      io.emit('activeUsers', Array.from(activeUsers.values()));
    });
  });

  return io;
}; 