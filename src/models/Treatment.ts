import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatment extends Document {
  name: string;
  code: string;
  description?: string;
  descriptionHtml?: string;
  price: number;
  duration: number; // dakika cinsinden
  treatmentPictureb64?: string;
  saleCount: number;
  isActive: boolean;
  isDeleted: boolean;
  categoryId: mongoose.Types.ObjectId;
  treatmentType: number;
  processTimeInMinutes: number;
  intervalDays: number;
  allBranches: boolean;
  taxRate: number;
  createdPersonId: mongoose.Types.ObjectId;
  createdBranchId: mongoose.Types.ObjectId;
  itemTransactionActive: boolean;
  mainItemUnitId: mongoose.Types.ObjectId;
  branchIds: mongoose.Types.ObjectId[];
  barcode: string;
  expireDateRequired: boolean;
  onlineAppointmentActive: boolean;
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
    descriptionHtml: {
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
    saleCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategori ID zorunludur'],
    },
    treatmentType: {
      type: Number,
      required: [true, 'Tedavi tipi zorunludur'],
      default: 0,
    },
    processTimeInMinutes: {
      type: Number,
      required: [true, 'İşlem süresi zorunludur'],
      min: 1,
    },
    intervalDays: {
      type: Number,
      required: [true, 'Aralık gün sayısı zorunludur'],
      min: 0,
    },
    allBranches: {
      type: Boolean,
      default: false,
    },
    taxRate: {
      type: Number,
      required: [true, 'Vergi oranı zorunludur'],
      min: 0,
      max: 100,
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
    itemTransactionActive: {
      type: Boolean,
      default: false,
    },
    mainItemUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemUnit',
      required: [true, 'Ana birim ID zorunludur'],
    },
    branchIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    }],
    barcode: {
      type: String,
      unique: true,
      sparse: true,
    },
    expireDateRequired: {
      type: Boolean,
      default: false,
    },
    onlineAppointmentActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export default mongoose.model<ITreatment>('Treatment', TreatmentSchema); 