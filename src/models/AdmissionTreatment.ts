import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmissionTreatment extends Document {
  admissionId: mongoose.Types.ObjectId;
  treatmentId: mongoose.Types.ObjectId;
  treatmentDate: Date;
  quantity: number;
  storageId: mongoose.Types.ObjectId;
  createdPersonId: mongoose.Types.ObjectId;
  createdBranchId: mongoose.Types.ObjectId;
  customPrice: number;
  autoApplyCampaign: boolean;
  autoApplyCoupon: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const AdmissionTreatmentSchema: Schema = new Schema(
  {
    admissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admission',
      required: true,
    },
    treatmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Treatment',
      required: true,
    },
    treatmentDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    storageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Storage',
      required: true,
    },
    createdPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true,
    },
    createdBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    customPrice: {
      type: Number,
      default: 0,
    },
    autoApplyCampaign: {
      type: Boolean,
      default: true,
    },
    autoApplyCoupon: {
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

export default mongoose.model<IAdmissionTreatment>('AdmissionTreatment', AdmissionTreatmentSchema); 