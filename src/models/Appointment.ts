import mongoose, { Schema, Document } from 'mongoose';
import { IResource } from './Resource';
import { IUser } from './User';
import { IBranch } from './Branch';
import { ICustomer } from './Customer';

export interface IAppointment extends Document {
  resourceId: IResource | Schema.Types.ObjectId;
  customerId: ICustomer | Schema.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: IUser | Schema.Types.ObjectId;
  createdBranchId: IBranch | Schema.Types.ObjectId;
}

const AppointmentSchema = new Schema({
  resourceId: {
    type: Schema.Types.ObjectId,
    ref: 'Resource',
    required: [true, 'Kaynak ID zorunludur']
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Müşteri ID zorunludur']
  },
  startTime: {
    type: Date,
    required: [true, 'Başlangıç zamanı zorunludur']
  },
  endTime: {
    type: Date,
    required: [true, 'Bitiş zamanı zorunludur']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: String,
  createdBy: {
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

// Randevu çakışmasını kontrol eden middleware
AppointmentSchema.pre('save', async function(next) {
  if (this.isModified('startTime') || this.isModified('endTime')) {
    const Appointment = mongoose.model('Appointment');
    const existingAppointment = await Appointment.findOne({
      resourceId: this.resourceId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: this.endTime },
          endTime: { $gt: this.startTime }
        }
      ],
      _id: { $ne: this._id }
    });

    if (existingAppointment) {
      next(new Error('Bu zaman diliminde başka bir randevu bulunmaktadır'));
      return;
    }
  }
  next();
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema); 