import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceList extends Document {
  priceListName: string;
  validFrom: Date;
  validTo: Date;
  allBranches: boolean;
  createdPersonId: Schema.Types.ObjectId;
  createdBranchId?: Schema.Types.ObjectId;
  currencyId: Schema.Types.ObjectId;
  branchIds: Schema.Types.ObjectId[];
  isActive: boolean;
}

const PriceListSchema = new Schema({
  priceListName: {
    type: String,
    required: true,
    trim: true
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  allBranches: {
    type: Boolean,
    default: false
  },
  createdPersonId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBranchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: false
  },
  currencyId: {
    type: Schema.Types.ObjectId,
    ref: 'Currency',
    required: true
  },
  branchIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IPriceList>('PriceList', PriceListSchema); 