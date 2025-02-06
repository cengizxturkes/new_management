import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
  isDefault: boolean;
  unitName: string;
  createdPersonId: Schema.Types.ObjectId;
  createdBranchId: Schema.Types.ObjectId;
}

const UnitSchema = new Schema({
  isDefault: {
    type: Boolean,
    default: false
  },
  unitName: {
    type: String,
    required: [true, 'Birim adı zorunludur']
  },
  createdPersonId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBranchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IUnit>('Unit', UnitSchema); 