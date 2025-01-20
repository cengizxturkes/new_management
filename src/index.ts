import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import userRoutes from './routes/userRoutes';
import branchRoutes from './routes/branchRoutes';
import { seedInitialData } from './utils/seedData';
import locationRoutes from './routes/locationRoutes';
import priceListRoutes from './routes/priceListRoutes';
import currencyRoutes from './routes/currencyRoutes';
import customerRoutes from './routes/customerRoutes';
import resourceRoutes from './routes/resourceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import admissionRoutes from './routes/admissionRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

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
      app.listen(PORT, () => {
        console.log(`Server ${PORT} portunda çalışıyor`);
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