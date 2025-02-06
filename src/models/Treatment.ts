import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatment extends Document {
  active: boolean;
  treatmentName: string;
  categoryId: Schema.Types.ObjectId;
  treatmentType: number;
  processTimeInMinutes: number;
  intervalDays: number;
  allBranches: boolean;
  taxRate: number;
  createdPersonId: Schema.Types.ObjectId;
  createdBranchId: Schema.Types.ObjectId;
  itemTransactionActive: boolean;
  mainItemUnitId: Schema.Types.ObjectId;
  branchIds: Schema.Types.ObjectId[];
  barcode: string;
  treatmentCode: string;
  expireDateRequired: boolean;
  onlineAppointmentActive: boolean;
}

const TreatmentSchema = new Schema({
  active: {
    type: Boolean,
    default: true
  },
  treatmentName: {
    type: String,
    required: [true, 'Tedavi adı zorunludur']
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  treatmentType: {
    type: Number,
    default: 0
  },
  processTimeInMinutes: {
    type: Number,
    default: 0
  },
  intervalDays: {
    type: Number,
    default: 0
  },
  allBranches: {
    type: Boolean,
    default: true
  },
  taxRate: {
    type: Number,
    default: 0
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
  },
  itemTransactionActive: {
    type: Boolean,
    default: true
  },
  mainItemUnitId: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  branchIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  barcode: String,
  treatmentCode: String,
  expireDateRequired: {
    type: Boolean,
    default: true
  },
  onlineAppointmentActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ITreatment>('Treatment', TreatmentSchema); 