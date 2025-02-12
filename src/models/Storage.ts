import mongoose, { Schema, Document } from 'mongoose';

export interface IStorage extends Document {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  branchId: mongoose.Types.ObjectId;
  createdPersonId: mongoose.Types.ObjectId;
  createdBranchId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StorageSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Depo adı zorunludur'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Depo kodu zorunludur'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Şube ID zorunludur'],
    },
    createdPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'Oluşturan kişi ID zorunludur'],
    },
    createdBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Oluşturan şube ID zorunludur'],
    },
  },
  {
    timestamps: true,
  }
);

// İndeksler
StorageSchema.index({ code: 1 }, { unique: true });
StorageSchema.index({ branchId: 1 });
StorageSchema.index({ isActive: 1 });

export default mongoose.model<IStorage>('Storage', StorageSchema); 