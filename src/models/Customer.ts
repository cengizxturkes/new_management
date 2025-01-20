import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerAddress {
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  faxNumber?: string;
  email: string;
  addressText: string;
  addressCountryId: string;
  addressCityId: string;
  addressDistrictId: string;
  buildingName?: string;
  buildingNumber?: string;
  postalZone: string;
  latitude?: number;
  longitude?: number;
}

export interface ICustomer extends Document {
  citizenType: number; // 1: Yerli, 2: Yabancı
  identityNumber: string;
  citizenCountryId: string;
  name: string;
  surname: string;
  gender: number; // 1: Erkek, 2: Kadın
  birthDate: Date;
  pictureB64?: string;
  notes?: string;
  createdPersonId: Schema.Types.ObjectId;
  createdBranchId: Schema.Types.ObjectId;
  eInvoiceType?: number;
  eInvoiceIdentityType?: number;
  taxNumber?: string;
  taxPlace?: string;
  companyTitle?: string;
  customerType: 'individual' | 'corporate';
  loyaltyLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  creditLimit?: number;
  outstandingBalance?: number;
  contractStartDate?: Date;
  contractEndDate?: Date;
  contractTerms?: string;
  vatNumber?: string;
  legalEntityType?: string;
  lastContactDate?: Date;
  preferredContactMethod?: 'email' | 'phone' | 'sms';
  attachments?: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
  additionalNotes?: string;
  customerAddresses: ICustomerAddress[];
  isActive: boolean;
}

const CustomerAddressSchema = new Schema({
  phoneNumber: {
    type: String,
    required: [true, 'Telefon numarası zorunludur'],
    validate: {
      validator: function(v: string) {
        return /^\d{10}$/.test(v);
      },
      message: 'Geçerli bir telefon numarası giriniz (10 haneli)'
    }
  },
  secondaryPhoneNumber: String,
  faxNumber: String,
  email: {
    type: String,
    required: [true, 'Email adresi zorunludur'],
    validate: {
      validator: function(v: string) {
        return /\S+@\S+\.\S+/.test(v);
      },
      message: 'Geçerli bir email adresi giriniz'
    }
  },
  addressText: {
    type: String,
    required: [true, 'Adres zorunludur']
  },
  addressCountryId: {
    type: String,
    required: [true, 'Ülke seçimi zorunludur']
  },
  addressCityId: {
    type: String,
    required: [true, 'Şehir seçimi zorunludur']
  },
  addressDistrictId: {
    type: String,
    required: [true, 'İlçe seçimi zorunludur']
  },
  buildingName: String,
  buildingNumber: String,
  postalZone: {
    type: String,
    required: [true, 'Posta kodu zorunludur']
  },
  latitude: Number,
  longitude: Number
}, { _id: false });

const CustomerSchema = new Schema({
  citizenType: {
    type: Number,
    required: [true, 'Vatandaşlık tipi zorunludur'],
    enum: [1, 2]
  },
  identityNumber: {
    type: String,
    required: [true, 'Kimlik numarası zorunludur'],
    unique: true
  },
  citizenCountryId: {
    type: String,
    required: [true, 'Vatandaşlık ülkesi zorunludur']
  },
  name: {
    type: String,
    required: [true, 'İsim zorunludur'],
    trim: true
  },
  surname: {
    type: String,
    required: [true, 'Soyisim zorunludur'],
    trim: true
  },
  gender: {
    type: Number,
    required: [true, 'Cinsiyet zorunludur'],
    enum: [1, 2]
  },
  birthDate: {
    type: Date,
    required: [true, 'Doğum tarihi zorunludur']
  },
  pictureB64: String,
  notes: String,
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
  eInvoiceType: {
    type: Number,
    enum: [0, 1, 2]
  },
  eInvoiceIdentityType: {
    type: Number,
    enum: [0, 1, 2]
  },
  taxNumber: String,
  taxPlace: String,
  companyTitle: String,
  customerType: {
    type: String,
    required: [true, 'Müşteri tipi zorunludur'],
    enum: ['individual', 'corporate']
  },
  loyaltyLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum']
  },
  creditLimit: {
    type: Number,
    min: 0
  },
  outstandingBalance: {
    type: Number,
    default: 0
  },
  contractStartDate: Date,
  contractEndDate: Date,
  contractTerms: String,
  vatNumber: String,
  legalEntityType: String,
  lastContactDate: Date,
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'sms']
  },
  attachments: [{
    fileName: String,
    fileType: String,
    fileSize: Number
  }],
  additionalNotes: String,
  customerAddresses: {
    type: [CustomerAddressSchema],
    required: [true, 'En az bir adres girilmelidir'],
    validate: {
      validator: function(v: any[]) {
        return v.length > 0;
      },
      message: 'En az bir adres girilmelidir'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Unique indexler
CustomerSchema.index({ identityNumber: 1 }, { unique: true });
CustomerSchema.index({ 'customerAddresses.phoneNumber': 1 }, { unique: true, sparse: true });
CustomerSchema.index({ 'customerAddresses.email': 1 }, { unique: true, sparse: true });

export default mongoose.model<ICustomer>('Customer', CustomerSchema); 