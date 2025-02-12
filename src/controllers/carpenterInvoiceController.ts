import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import CarpenterInvoice, { IInvoiceItem } from '../models/CarpenterInvoice';
import PDFDocument from 'pdfkit';
import path from 'path';
import { promises as fs } from 'fs';

interface ICalculatedInvoiceItem extends IInvoiceItem {
  squareMeter: number;
  totalPrice: number;
}

// Fatura oluştur
export const createCarpenterInvoice = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    deliveryMethod,
    packaging,
    approvedBy,
    items
  } = req.body;

  // @ts-ignore - auth middleware'den gelen user bilgisi
  const { id: createdPersonId, branchId: createdBranchId } = req.user;

  // Her bir ürün için metrekare ve toplam fiyat hesapla
  const calculatedItems: ICalculatedInvoiceItem[] = items.map((item: IInvoiceItem) => {
    const squareMeter = (item.width * item.height * item.quantity) / 10000; // cm2'den m2'ye çevir
    const totalPrice = squareMeter * item.unitPrice;
    return {
      ...item,
      squareMeter,
      totalPrice
    };
  });

  // Toplam metrekare ve tutarı hesapla
  const totalSquareMeter = calculatedItems.reduce((total: number, item: ICalculatedInvoiceItem) => total + item.squareMeter, 0);
  const subtotal = calculatedItems.reduce((total: number, item: ICalculatedInvoiceItem) => total + item.totalPrice, 0);
  
  // İskonto ve KDV hesapla
  const discountRate = 15;
  const discountAmount = (subtotal * discountRate / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxRate = 18;
  const taxAmount = (afterDiscount * taxRate / 100);
  const totalAmount = afterDiscount + taxAmount;

  // Fatura oluştur
  const invoice = await CarpenterInvoice.create({
    deliveryMethod,
    packaging,
    approvedBy,
    items: calculatedItems,
    totalSquareMeter,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    createdPersonId,
    createdBranchId
  });

  // PDF oluşturma işlemi
  try {
    const pdfBuffer = await generateInvoicePDF({
      ...invoice.toObject(),
      items: calculatedItems,
      date: invoice.date.toLocaleDateString('tr-TR'),
      totalSquareMeter: totalSquareMeter.toFixed(2),
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2)
    });

    // Faturayı güncelle ve PDF'i kaydet
    await CarpenterInvoice.findByIdAndUpdate(invoice._id, {
      pdfContent: pdfBuffer.toString('base64')
    });

    res.status(201).json({
      status: 'success',
      message: 'Fatura başarıyla oluşturuldu',
      data: {
        invoice,
        pdf: pdfBuffer.toString('base64')
      }
    });
  } catch (error) {
    console.error('PDF Oluşturma Hatası:', error);
    throw new AppError(`PDF oluşturulurken bir hata oluştu: ${error.message}`, 500);
  }
});

// PDF oluşturma fonksiyonu
async function generateInvoicePDF(invoice: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: 'Marangoz Faturası',
          Author: 'Ankara Mobilya',
        }
      });

      // Türkçe font tanımlama
      doc.registerFont('Arial-Regular', path.join(__dirname, '../../fonts/arial.ttf'));
      doc.registerFont('Arial-Bold', path.join(__dirname, '../../fonts/arial-bold.ttf'));

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Logo
      const logoPath = path.join(__dirname, '../../logo.jpeg');
      const logoData = await fs.readFile(logoPath);
      doc.image(logoData, 50, 45, { width: 100 });

      // Başlık
      doc.font('Arial-Bold').fontSize(20).text('MARANGOZ FATURASI', 200, 50, { align: 'right' });
      doc.moveDown();

      // Fatura detayları
      doc.font('Arial-Bold').fontSize(12);
      doc.text(`Fatura No: ${invoice.invoiceNo}`, 200, 90, { align: 'right' });
      doc.text(`Tarih: ${invoice.date}`, 200, 110, { align: 'right' });

      // Firma Bilgileri
      doc.font('Arial-Bold').fontSize(12).text('Firma Bilgileri:', 50, 150);
      doc.font('Arial-Regular').fontSize(10);
      doc.text('Ankara Mobilya', 50, 170);
      doc.text('Şirket Adresi', 50, 185);
      doc.text('34000 İstanbul / Türkiye', 50, 200);

      // Teslimat bilgileri
      doc.font('Arial-Bold').fontSize(12).text('Teslimat Bilgileri:', 300, 150);
      doc.font('Arial-Regular').fontSize(10);
      doc.text(`Teslim Şekli: ${invoice.deliveryMethod}`, 300, 170);
      doc.text(`Paketleme: ${invoice.packaging}`, 300, 185);
      doc.text(`Onaylayan: ${invoice.approvedBy}`, 300, 200);

      // Tablo başlığı
      const startY = 250;
      doc.font('Arial-Bold').fontSize(10);

      // Tablo başlık çerçevesi
      doc.rect(50, startY, 500, 20).stroke();
      doc.text('Sıra', 55, startY + 5, { width: 25 });
      doc.text('Ürün Adı', 85, startY + 5, { width: 100 });
      doc.text('Renk', 185, startY + 5, { width: 60 });
      doc.text('En x Boy', 255, startY + 5, { width: 60 });
      doc.text('Adet', 325, startY + 5, { width: 40 });
      doc.text('m²', 375, startY + 5, { width: 40 });
      doc.text('B.Fiyat', 425, startY + 5, { width: 50 });
      doc.text('Toplam', 485, startY + 5);

      // Ürünler
      let y = startY + 20;
      doc.font('Arial-Regular').fontSize(9);
      
      invoice.items.forEach((item: ICalculatedInvoiceItem, index: number) => {
        // Ürün satırı çerçevesi
        doc.rect(50, y, 500, 20).stroke();
        
        doc.text((index + 1).toString(), 55, y + 5, { width: 25 });
        doc.text(item.productName, 85, y + 5, { width: 100 });
        doc.text(item.color, 185, y + 5, { width: 60 });
        doc.text(`${item.width}x${item.height}`, 255, y + 5, { width: 60 });
        doc.text(item.quantity.toString(), 325, y + 5, { width: 40 });
        doc.text(item.squareMeter.toFixed(2), 375, y + 5, { width: 40 });
        doc.text(item.unitPrice.toFixed(2), 425, y + 5, { width: 50 });
        doc.text(item.totalPrice.toFixed(2), 485, y + 5);
        
        y += 20;
      });

      // Toplam bölümü
      y += 10;
      const totalBoxWidth = 200;
      const totalStartX = 350;
      
      doc.font('Arial-Bold').fontSize(10);
      
      // Toplam Alan
      doc.rect(totalStartX, y, totalBoxWidth, 20).stroke();
      doc.text(`Toplam Alan: ${invoice.totalSquareMeter} m²`, totalStartX + 10, y + 5);
      
      // Ara Toplam
      y += 20;
      doc.rect(totalStartX, y, totalBoxWidth, 20).stroke();
      doc.text(`Ara Toplam: ${invoice.subtotal} TL`, totalStartX + 10, y + 5);
      
      // İskonto
      y += 20;
      doc.rect(totalStartX, y, totalBoxWidth, 20).stroke();
      doc.text(`İskonto (%15): -${invoice.discountAmount} TL`, totalStartX + 10, y + 5);
      
      // KDV
      y += 20;
      doc.rect(totalStartX, y, totalBoxWidth, 20).stroke();
      doc.text(`KDV (%18): ${invoice.taxAmount} TL`, totalStartX + 10, y + 5);
      
      // Genel Toplam
      y += 20;
      doc.rect(totalStartX, y, totalBoxWidth, 25).stroke();
      doc.fontSize(12).text(`Genel Toplam: ${invoice.totalAmount} TL`, totalStartX + 10, y + 7);

      // Alt bilgi
      doc.fontSize(8);
      doc.font('Arial-Regular').text('Bu bir bilgisayar çıktısıdır.', 50, 750, { align: 'center' });
      doc.text('www.ankaramobilya.com', 50, 765, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Fatura listesi
export const getAllCarpenterInvoices = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const invoices = await CarpenterInvoice.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    status: 'success',
    message: 'Faturalar başarıyla getirildi',
    data: invoices
  });
});

// Fatura detayı
export const getCarpenterInvoice = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const invoice = await CarpenterInvoice.findOne({
    _id: req.params.id,
    isDeleted: false
  }).lean();

  if (!invoice) {
    throw new AppError('Fatura bulunamadı', 404);
  }

  // PDF oluştur
  const pdfBuffer = await generateInvoicePDF(invoice);

  res.status(200).json({
    status: 'success',
    message: 'Fatura başarıyla getirildi',
    data: {
      invoice,
      pdf: pdfBuffer.toString('base64')
    }
  });
});

// Faturayı güncelle
export const updateCarpenterInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await CarpenterInvoice.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!invoice) {
    throw new AppError('Bu ID ile fatura bulunamadı', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      invoice,
    },
  });
});

// Faturayı sil (soft delete)
export const deleteCarpenterInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await CarpenterInvoice.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!invoice) {
    throw new AppError('Bu ID ile fatura bulunamadı', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Fatura başarıyla silindi',
  });
});

// PDF faturası oluştur
export const generatePDF = catchAsync(async (req: Request, res: Response) => {
  const invoiceId = req.params.id;
  const invoice = await CarpenterInvoice.findById(invoiceId).populate('items');

  if (!invoice) {
    throw new AppError('Fatura bulunamadı', 404);
  }

  // Her bir ürün için metrekare ve toplam fiyat hesapla
  const calculatedItems: ICalculatedInvoiceItem[] = invoice.items.map((item: IInvoiceItem) => {
    const squareMeter = (item.width * item.height * item.quantity) / 10000;
    const totalPrice = squareMeter * item.unitPrice;
    return {
      ...item,
      squareMeter,
      totalPrice
    };
  });

  try {
    const pdfBuffer = await generateInvoicePDF({
      ...invoice.toObject(),
      items: calculatedItems,
      date: invoice.date.toLocaleDateString('tr-TR'),
      totalSquareMeter: invoice.totalSquareMeter.toFixed(2),
      subtotal: invoice.subtotal.toFixed(2),
      discountAmount: invoice.discountAmount.toFixed(2),
      taxAmount: invoice.taxAmount.toFixed(2),
      totalAmount: invoice.totalAmount.toFixed(2)
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=fatura-${invoice.invoiceNo}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Oluşturma Hatası:', error);
    throw new AppError(`PDF oluşturulurken bir hata oluştu: ${error.message}`, 500);
  }
}); 
