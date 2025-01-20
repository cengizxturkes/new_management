import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  cityId: string;
  cityName: string;
  districts: {
    districtId: string;
    districtName: string;
  }[];
}

const DistrictSchema = new Schema({
  districtId: {
    type: String,
    required: true
  },
  districtName: {
    type: String,
    required: true
  }
}, { _id: false });

const CitySchema = new Schema({
  cityId: {
    type: String,
    required: true,
    unique: true
  },
  cityName: {
    type: String,
    required: true
  },
  districts: [DistrictSchema]
}, {
  timestamps: true
});

export default mongoose.model<ICity>('Location', CitySchema); 