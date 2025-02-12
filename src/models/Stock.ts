import mongoose, { Schema, Document } from 'mongoose';

export interface IStock extends Document {
  storageId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  quantity: number;
  criticalLevel: number;
  isActive: boolean;
  lastUpdatedBy: mongoose.Types.ObjectId;
  lastUpdateDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema: Schema = new Schema(
  {
    storageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Storage',
      required: [true, 'Depo zorunludur'],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Treatment',
      required: [true, 'Ürün zorunludur'],
    },
    quantity: {
      type: Number,
      required: [true, 'Miktar zorunludur'],
      default: 0,
      min: [0, 'Miktar 0\'dan küçük olamaz'],
    },
    criticalLevel: {
      type: Number,
      required: [true, 'Kritik seviye zorunludur'],
      default: 10,
      min: [0, 'Kritik seviye 0\'dan küçük olamaz'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'Son güncelleyen kişi zorunludur'],
    },
    lastUpdateDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// İndeksler
StockSchema.index({ storageId: 1, itemId: 1 }, { unique: true });
StockSchema.index({ quantity: 1 });
StockSchema.index({ criticalLevel: 1 });

// Stok miktarı kritik seviyenin altına düştüğünde kontrol
StockSchema.pre('save', function(next) {
  if (this.quantity <= this.criticalLevel) {
    // TODO: Bildirim gönder
    console.log(`Kritik stok seviyesi uyarısı: ${this.itemId} - Mevcut: ${this.quantity}, Kritik Seviye: ${this.criticalLevel}`);
  }
  next();
});

export default mongoose.model<IStock>('Stock', StockSchema); 