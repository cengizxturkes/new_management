import mongoose, { Schema, Document } from 'mongoose';

interface IAttachment {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface IAdmissionTreatment {
  admissionId: Schema.Types.ObjectId;
  treatmentId: Schema.Types.ObjectId;
  treatmentDate: Date;
  quantity: number;
  storageId: Schema.Types.ObjectId;
  createdPersonId: Schema.Types.ObjectId;
  createdBranchId: Schema.Types.ObjectId;
  personId: Schema.Types.ObjectId;
  customPrice: number;
  autoApplyCampaign: boolean;
  autoApplyCoupon: boolean;
}

export interface IAdmission extends Document {
  branchId: Schema.Types.ObjectId;
  admissionDate: Date;
  personId: Schema.Types.ObjectId;
  priceListId: Schema.Types.ObjectId;
  createdPersonId: Schema.Types.ObjectId;
  createdBranchId: Schema.Types.ObjectId;
  appointmentId: Schema.Types.ObjectId;
  notes?: string;
  appointmentType?: 'initial' | 'followup' | 'consultation' | 'emergency';
  appointmentStatus: 'scheduled' | 'completed' | 'cancelled' | 'noshow';
  invoiceNumber?: string;
  patientCondition?: string;
  referringDoctorId?: Schema.Types.ObjectId;
  expectedDuration?: number;
  followUpDate?: Date;
  attachments?: IAttachment[];
  isActive: boolean;
  admissionTreatments: IAdmissionTreatment[];
}

const AttachmentSchema = new Schema({
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  }
}, { _id: false });

const AdmissionSchema = new Schema({
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Şube ID zorunludur']
  },
  admissionDate: {
    type: Date,
    required: [true, 'Başvuru tarihi zorunludur']
  },
  personId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Personel ID zorunludur']
  },
  priceListId: {
    type: Schema.Types.ObjectId,
    ref: 'PriceList',
    required: [true, 'Fiyat listesi ID zorunludur']
  },
  createdPersonId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Oluşturan personel ID zorunludur']
  },
  createdBranchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Oluşturan şube ID zorunludur']
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Randevu ID zorunludur']
  },
  notes: String,
  appointmentType: {
    type: String,
    enum: ['initial', 'followup', 'consultation', 'emergency'],
    default: 'initial'
  },
  appointmentStatus: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'noshow'],
    required: [true, 'Randevu durumu zorunludur'],
    default: 'scheduled'
  },
  invoiceNumber: String,
  patientCondition: String,
  referringDoctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  expectedDuration: {
    type: Number,
    min: [0, 'Beklenen süre 0\'dan küçük olamaz']
  },
  followUpDate: Date,
  attachments: [AttachmentSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  admissionTreatments: [{
    admissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Admission',
      required: true
    },
    treatmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Treatment',
      required: true
    },
    treatmentDate: {
      type: Date,
      required: true
    },
    quantity: {
      type: Number,
      default: 0
    },
    storageId: {
      type: Schema.Types.ObjectId,
      ref: 'Storage',
      required: true
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
    personId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    customPrice: {
      type: Number,
      default: 0
    },
    autoApplyCampaign: {
      type: Boolean,
      default: true
    },
    autoApplyCoupon: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IAdmission>('Admission', AdmissionSchema); 