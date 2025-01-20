import mongoose, { Schema, Document } from 'mongoose';

export interface ICurrency extends Document {
  code: string;        // TRY, USD, EUR
  name: string;        // Türk Lirası, Amerikan Doları, Euro
  symbol: string;      // ₺, $, €
  isActive: boolean;
}

const CurrencySchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ICurrency>('Currency', CurrencySchema); 