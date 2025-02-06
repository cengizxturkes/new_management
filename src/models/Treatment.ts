import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatment extends Document {
  name: string;
  code: string;
  description?: string;
  price: number;
  duration: number; // dakika cinsinden
  treatmentPictureb64?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TreatmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tedavi adı zorunludur'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Tedavi kodu zorunludur'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Tedavi fiyatı zorunludur'],
      min: 0,
    },
    duration: {
      type: Number,
      required: [true, 'Tedavi süresi zorunludur'],
      min: 1,
    },
    treatmentPictureb64: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
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

export default mongoose.model<ITreatment>('Treatment', TreatmentSchema); 