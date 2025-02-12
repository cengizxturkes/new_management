import mongoose from 'mongoose';

interface IInvoiceDocument {
  invoiceNo: string;
  _id: mongoose.Types.ObjectId;
}

export async function generateInvoiceNumber(modelName: string): Promise<string> {
  try {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const prefix = 'MRG'; // Marangoz faturası
    
    const Model = mongoose.model(modelName);
    
    // Son faturayı bul
    const lastInvoice = await Model.findOne<IInvoiceDocument>({
      invoiceNo: { 
        $regex: new RegExp(`^${prefix}${year}${month}`) 
      }
    }).sort({ invoiceNo: -1 }).lean();

    let sequence = '00001';
    if (lastInvoice?.invoiceNo) {
      const lastSequence = parseInt(lastInvoice.invoiceNo.slice(-5));
      if (!isNaN(lastSequence)) {
        sequence = (lastSequence + 1).toString().padStart(5, '0');
      }
    }

    const invoiceNumber = `${prefix}${year}${month}${sequence}`;
    
    // Oluşturulan numaranın benzersiz olduğunu kontrol et
    const exists = await Model.findOne<IInvoiceDocument>({ invoiceNo: invoiceNumber });
    if (exists) {
      throw new Error('Fatura numarası zaten mevcut. Lütfen tekrar deneyin.');
    }

    return invoiceNumber;
  } catch (error) {
    console.error('Fatura numarası oluşturma hatası:', error);
    throw new Error('Fatura numarası oluşturulamadı: ' + error.message);
  }
} 