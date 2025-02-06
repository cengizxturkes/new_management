import mongoose, { Schema, Document } from 'mongoose';

export interface IPerson extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  specialization?: string;
  branchId: mongoose.Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PersonSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'İsim zorunludur'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Soyisim zorunludur'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'E-posta zorunludur'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Telefon numarası zorunludur'],
    },
    title: {
      type: String,
      required: [true, 'Ünvan zorunludur'],
    },
    specialization: {
      type: String,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
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

export default mongoose.model<IPerson>('Person', PersonSchema); 