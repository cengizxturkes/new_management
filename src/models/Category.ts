import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdPersonId: mongoose.Types.ObjectId;
  createdBranchId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Kategori adı zorunludur'],
      trim: true,
    },
    description: {
      type: String,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
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

export default mongoose.model<ICategory>('Category', CategorySchema); 