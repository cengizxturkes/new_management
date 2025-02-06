import mongoose, { Schema, Document } from 'mongoose';

export interface IStorage extends Document {
  name: string;
  branchId: mongoose.Types.ObjectId;
  description?: string;
  isActive: boolean;
  isDeleted: boolean;
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
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    description: {
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

export default mongoose.model<IStorage>('Storage', StorageSchema); 