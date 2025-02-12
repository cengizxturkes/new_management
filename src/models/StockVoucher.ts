import mongoose, { Schema, Document } from 'mongoose';

export interface IStockVoucherItem {
  treatmentId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

export interface IStockVoucher extends Document {
  voucherNo: string;
  voucherType: 'IN' | 'OUT';
  voucherDate: Date;
  storageId: mongoose.Types.ObjectId;
  items: IStockVoucherItem[];
  totalAmount: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'CANCELLED';
  description?: string;
  createdPersonId: mongoose.Types.ObjectId;
  createdBranchId: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StockVoucherItemSchema = new Schema({
  treatmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment',
    required: [true, 'Ürün zorunludur'],
  },
  quantity: {
    type: Number,
    required: [true, 'Miktar zorunludur'],
    min: [0.01, 'Miktar 0\'dan büyük olmalıdır'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'Birim fiyat zorunludur'],
    min: [0, 'Birim fiyat 0\'dan küçük olamaz'],
  },
  totalPrice: {
    type: Number,
    required: [true, 'Toplam fiyat zorunludur'],
    min: [0, 'Toplam fiyat 0\'dan küçük olamaz'],
  },
  description: {
    type: String,
  },
}, { _id: true });

const StockVoucherSchema: Schema = new Schema(
  {
    voucherNo: {
      type: String,
      unique: true,
    },
    voucherType: {
      type: String,
      enum: ['IN', 'OUT'],
      required: [true, 'Fiş tipi zorunludur'],
    },
    voucherDate: {
      type: Date,
      required: [true, 'Fiş tarihi zorunludur'],
      default: Date.now,
    },
    storageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Storage',
      required: [true, 'Depo zorunludur'],
    },
    items: [StockVoucherItemSchema],
    totalAmount: {
      type: Number,
      required: [true, 'Toplam tutar zorunludur'],
      min: [0, 'Toplam tutar 0\'dan küçük olamaz'],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'APPROVED', 'CANCELLED'],
      default: 'DRAFT',
    },
    description: {
      type: String,
    },
    createdPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'Oluşturan kişi zorunludur'],
    },
    createdBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Oluşturan şube zorunludur'],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
    },
    approvedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Fiş numarası otomatik oluşturma
StockVoucherSchema.pre('save', async function(next) {
  try {
    if (!this.voucherNo) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const prefix = this.voucherType === 'IN' ? 'GF' : 'CF'; // Giriş Fişi / Çıkış Fişi
      
      const lastVoucher = await mongoose.model('StockVoucher').findOne({
        voucherNo: new RegExp(`^${prefix}${year}${month}`)
      }).sort({ voucherNo: -1 });

      let sequence = '00001';
      if (lastVoucher) {
        const lastSequence = parseInt(lastVoucher.voucherNo.slice(-5));
        sequence = (lastSequence + 1).toString().padStart(5, '0');
      }

      this.voucherNo = `${prefix}${year}${month}${sequence}`;
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Toplam tutarı hesapla
StockVoucherSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total: number, item: IStockVoucherItem) => total + item.totalPrice, 0);
  next();
});

// İndeksler
StockVoucherSchema.index({ voucherNo: 1 }, { unique: true });
StockVoucherSchema.index({ voucherType: 1 });
StockVoucherSchema.index({ voucherDate: 1 });
StockVoucherSchema.index({ storageId: 1 });
StockVoucherSchema.index({ status: 1 });
StockVoucherSchema.index({ createdPersonId: 1 });
StockVoucherSchema.index({ createdBranchId: 1 });

export default mongoose.model<IStockVoucher>('StockVoucher', StockVoucherSchema); 