import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailableSlot extends Document {
  resourceId: Schema.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
}

const AvailableSlotSchema = new Schema({
  resourceId: {
    type: Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120 // 2 dakika sonra otomatik silinecek
  }
});

export default mongoose.model<IAvailableSlot>('AvailableSlot', AvailableSlotSchema); 