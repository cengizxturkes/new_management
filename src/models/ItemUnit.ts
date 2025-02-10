import mongoose, { Schema, Document } from 'mongoose';

export interface IItemUnit extends Document {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdPersonId: mongoose.Types.ObjectId;
  createdBranchId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ItemUnitSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Birim adı zorunludur'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Birim kodu zorunludur'],
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

export default mongoose.model<IItemUnit>('ItemUnit', ItemUnitSchema); 