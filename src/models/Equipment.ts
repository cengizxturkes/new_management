import mongoose from 'mongoose';



const equipmentSchema = new mongoose.Schema({
  equipmentName: {
    type: String,
    required: [true, 'Ekipman adı zorunludur'],
  },
  serialNumber: {
    type: String,
    required: [true, 'Seri numarası zorunludur'],
    unique: true,
  },
  model: {
    type: String,
    required: [true, 'Model bilgisi zorunludur'],
  },
  brand: {
    type: String,
    required: [true, 'Marka bilgisi zorunludur'],
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Satın alma tarihi zorunludur'],
  },
  lastMaintenanceDate: {
    type: Date,
    required: [true, 'Son bakım tarihi zorunludur'],
  },
  nextMaintenanceDate: {
    type: Date,
    required: [true, 'Sonraki bakım tarihi zorunludur'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'broken'],
    default: 'active',
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment; 