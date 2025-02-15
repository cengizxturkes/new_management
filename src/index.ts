import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import { specs } from './config/swagger';
import userRoutes from './routes/userRoutes';
import branchRoutes from './routes/branchRoutes';
import { seedInitialData } from './utils/seedData';
import storageRoutes from './routes/storageRoutes';

import locationRoutes from './routes/locationRoutes';
import priceListRoutes from './routes/priceListRoutes';
import currencyRoutes from './routes/currencyRoutes';
import customerRoutes from './routes/customerRoutes';
import resourceRoutes from './routes/resourceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import admissionRoutes from './routes/admissionRoutes';
import messageRoutes from './routes/messageRoutes';
import { createServer } from 'http';
import { configureSocket } from './config/socket';
import unitRoutes from './routes/unitRoutes';
import treatmentRoutes from './routes/treatmentRoutes';
import admissionTreatmentRoutes from './routes/admissionTreatmentRoutes';
import categoryRoutes from './routes/categoryRoutes';
import './models/Storage'; // Storage modelini import ediyoruz
import './models/Person'; // Person modelini import ediyoruz
import './models/Category'; // Category modelini import ediyoruz
import './models/ItemUnit'; // ItemUnit modelini import ediyoruz
import stockRoutes from './routes/stockRoutes';
import stockVoucherRoutes from './routes/stockVoucherRoutes';
import carpenterInvoiceRoutes from './routes/carpenterInvoiceRoutes';

dotenv.config();

const app = express();

// CORS ayarları
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'], // Flutter web uygulamasının URL'i
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('src/public')); // Test sayfası için static dosya servisi

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/price-lists', priceListRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/admission-treatments', admissionTreatmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/stock-vouchers', stockVoucherRoutes);
app.use('/api/carpenter-invoices', carpenterInvoiceRoutes);
app.use('/api/storages', storageRoutes);

const httpServer = createServer(app);
export const io = configureSocket(httpServer);

// MongoDB bağlantısı ve sunucu başlatma
const startServer = async () => {
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB bağlantısı başarılı');

    try {
      // Başlangıç verilerini oluştur
      await seedInitialData();

      
      const PORT = process.env.PORT || 3000;
      httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
      });
    } catch (seedError) {
      console.error('Başlangıç verileri oluşturulurken hata:', seedError);
      process.exit(1);
    }
  } catch (dbError: any) {
    console.error('MongoDB bağlantısı sırasında hata:', dbError.message);
    process.exit(1);
  }
};

startServer().catch((error) => {
  console.error('Sunucu başlatılırken beklenmeyen hata:', error);
  process.exit(1);
});

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Hata:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Bir şeyler ters gitti!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Beklenmeyen hataları yakala
process.on('unhandledRejection', (err: any) => {
  console.error('Yakalanmamış Promise Reddi:', err);
  process.exit(1);
}); 