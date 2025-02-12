import mongoose, { Schema, Document } from 'mongoose';
import { generateInvoiceNumber } from '../utils/invoiceNumberGenerator';

export interface IInvoiceItem {
  productName: string;
  color: string;
  width: number;
  height: number;
  quantity: number;
  unitPrice: number;
  squareMeter?: number;
  totalPrice?: number;
}

export interface ICarpenterInvoice extends Document {
  invoiceNo: string;
  date: Date;
  deliveryMethod: string;
  packaging: string;
  approvedBy: string;
  items: IInvoiceItem[];
  totalSquareMeter: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdPersonId: mongoose.Types.ObjectId;
  createdBranchId: mongoose.Types.ObjectId;
  isDeleted: boolean;
  pdfContent?: string;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  productName: { type: String, required: true },
  color: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  squareMeter: { type: Number },
  totalPrice: { type: Number }
});

const carpenterInvoiceSchema = new Schema<ICarpenterInvoice>({
  invoiceNo: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  deliveryMethod: { type: String, required: true },
  packaging: { type: String, required: true },
  approvedBy: { type: String, required: true },
  items: [InvoiceItemSchema],
  totalSquareMeter: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  createdPersonId: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
  createdBranchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  isDeleted: { type: Boolean, default: false },
  pdfContent: { type: String, required: false }
}, {
  timestamps: true
});

// Fatura numarası oluşturma
carpenterInvoiceSchema.pre('validate', async function(next) {
  try {
    if (!this.invoiceNo) {
      const generatedNumber = await generateInvoiceNumber('CarpenterInvoice');
      this.set('invoiceNo', generatedNumber);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const CarpenterInvoice = mongoose.model<ICarpenterInvoice>('CarpenterInvoice', carpenterInvoiceSchema);

export default CarpenterInvoice; 