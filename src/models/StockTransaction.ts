import mongoose, { Schema, Document } from 'mongoose';

export interface IStockTransaction extends Document {
  sourceStorageId: mongoose.Types.ObjectId;
  targetStorageId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  quantity: number;
  transactionType: 'IN' | 'OUT' | 'TRANSFER';
  transactionDate: Date;
  qrCode: string;
  description?: string;
  createdPersonId: mongoose.Types.ObjectId;
  createdBranchId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StockTransactionSchema: Schema = new Schema(
  {
    sourceStorageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Storage',
      required: [true, 'Kaynak depo zorunludur'],
    },
    targetStorageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Storage',
      required: [true, 'Hedef depo zorunludur'],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Treatment',
      required: [true, 'Ürün zorunludur'],
    },
    quantity: {
      type: Number,
      required: [true, 'Miktar zorunludur'],
      min: [1, 'Miktar en az 1 olmalıdır'],
    },
    transactionType: {
      type: String,
      enum: ['IN', 'OUT', 'TRANSFER'],
      required: [true, 'İşlem tipi zorunludur'],
    },
    transactionDate: {
      type: Date,
      required: [true, 'İşlem tarihi zorunludur'],
      default: Date.now,
    },
    qrCode: {
      type: String,
      required: [true, 'QR kod zorunludur'],
      unique: true,
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
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
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

// İndeksler
StockTransactionSchema.index({ sourceStorageId: 1, targetStorageId: 1 });
StockTransactionSchema.index({ itemId: 1 });
StockTransactionSchema.index({ qrCode: 1 }, { unique: true });
StockTransactionSchema.index({ transactionDate: 1 });
StockTransactionSchema.index({ status: 1 });

export default mongoose.model<IStockTransaction>('StockTransaction', StockTransactionSchema); 