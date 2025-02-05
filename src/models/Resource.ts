import mongoose, { Schema, Document } from 'mongoose';

export interface IResourceUser {
  _id?: Schema.Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: {
    countryCode: string;
    number: string;
  };
  pictureB64?: string;
  role?: string;
}

export interface IResource extends Document {
  branchId: Schema.Types.ObjectId;
  active: boolean;
  resourceName: string;
  appointmentActive: boolean;
  onlineAppointmentActive: boolean;
  onlineAppointmentNotes?: string;
  createdPersonId: Schema.Types.ObjectId;
  createdBranchId: Schema.Types.ObjectId;
  isDeleted: boolean;
  userId?: Schema.Types.ObjectId | IResourceUser;
}

const ResourceSchema = new Schema({
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Şube ID zorunludur']
  },
  active: {
    type: Boolean,
    default: true
  },
  resourceName: {
    type: String,
    required: [true, 'Kaynak adı zorunludur']
  },
  appointmentActive: {
    type: Boolean,
    default: true
  },
  onlineAppointmentActive: {
    type: Boolean,
    default: true
  },
  onlineAppointmentNotes: String,
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
  isDeleted: {
    type: Boolean,
    default: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model<IResource>('Resource', ResourceSchema); 