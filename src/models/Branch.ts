import mongoose, { Schema, Document } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       required:
 *         - branchName
 *         - branchType
 *         - email
 *         - addressText
 *         - addressCountryId
 *         - addressCityId
 *         - addressDistrictId
 *         - postalZone
 *         - phoneNumber
 *         - defaultCurrencyId
 *         - defaultPriceListId
 *         - managerPersonId
 *         - createdPersonId
 *         - companyId
 *       properties:
 *         branchName:
 *           type: string
 *           description: Şube adı
 *         branchType:
 *           type: number
 *           description: Şube tipi
 *           default: 0
 *         email:
 *           type: string
 *           format: email
 *           description: Şube email adresi
 *         addressText:
 *           type: string
 *           description: Şube açık adresi
 *         addressCountryId:
 *           type: string
 *           description: Ülke ID
 *         addressCityId:
 *           type: string
 *           description: Şehir ID
 *         addressDistrictId:
 *           type: string
 *           description: İlçe ID
 *         postalZone:
 *           type: string
 *           description: Posta kodu
 *         phoneNumber:
 *           type: object
 *           properties:
 *             countryCode:
 *               type: string
 *               pattern: ^\+\d{1,4}$
 *               description: ulketelkod(+90)
 *             number:
 *               type: string
 *               pattern: ^\d{10}$
 *               description: Telefon numarası (10 haneli)
 *         defaultCurrencyId:
 *           type: string
 *           format: uuid
 *           description: Varsayılan para birimi ID
 *         defaultPriceListId:
 *           type: string
 *           format: uuid
 *           description: Varsayılan fiyat listesi ID
 *         managerPersonId:
 *           type: string
 *           format: uuid
 *           description: Şube müdürünün ID'si
 *         createdPersonId:
 *           type: string
 *           format: uuid
 *           description: Şubeyi oluşturan kullanıcının ID'si
 *         companyId:
 *           type: string
 *           description: Şirket ID
 *         isActive:
 *           type: boolean
 *           description: Şubenin aktif olup olmadığı
 *           default: true
 *       example:
 *         branchName: Merkez Şube
 *         branchType: 0
 *         email: merkez@firma.com
 *         addressText: Atatürk Cad. No:123
 *         addressCountryId: TR
 *         addressCityId: "34"
 *         addressDistrictId: "1234"
 *         postalZone: "34100"
 *         phoneNumber:
 *           countryCode: "+90"
 *           number: "2121234567"
 *         defaultCurrencyId: "678dc24d31735be6836089b9"
 *         defaultPriceListId: "60d5ecb8b5c9c62b3c7c1b5f"
 *         managerPersonId: "60d5ecb8b5c9c62b3c7c1b60"
 *         createdPersonId: "60d5ecb8b5c9c62b3c7c1b61"
 *         companyId: "MAIN"
 *         isActive: true
 */

interface PhoneNumber {
  countryCode: string;
  number: string;
}

export interface IBranch extends Document {
  branchName: string;
  branchType: number;
  defaultCurrencyId: Schema.Types.ObjectId;
  defaultPriceListId: Schema.Types.ObjectId;
  phoneNumber: PhoneNumber;
  email: string;
  addressText: string;
  addressCountryId: string;
  addressCityId: string;
  addressDistrictId: string;
  postalZone: string;
  managerPersonId: Schema.Types.ObjectId;
  createdBranchId?: Schema.Types.ObjectId;
  createdPersonId: Schema.Types.ObjectId;
  companyId: string;
  isActive: boolean;
}

const PhoneNumberSchema = new Schema({
  countryCode: {
    type: String,
    required: [true, 'Ülke kodu zorunludur'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\+\d{1,4}$/.test(v);
      },
      message: 'Geçerli bir ülke kodu giriniz (Örn: +90)'
    }
  },
  number: {
    type: String,
    required: [true, 'Telefon numarası zorunludur'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\d{10}$/.test(v);
      },
      message: 'Geçerli bir telefon numarası giriniz (10 haneli)'
    }
  }
}, { _id: false });

const BranchSchema: Schema = new Schema({
  branchName: {
    type: String,
    required: [true, 'Şube adı zorunludur'],
    unique: true,
    trim: true
  },
  branchType: {
    type: Number,
    required: true,
    default: 0
  },
  defaultCurrencyId: {
    type: Schema.Types.ObjectId,
    ref: 'Currency',
    required: true
  },
  defaultPriceListId: {
    type: Schema.Types.ObjectId,
    ref: 'PriceList',
    required: true
  },
  phoneNumber: {
    type: PhoneNumberSchema,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: 'Geçerli bir email adresi giriniz'
    }
  },
  addressText: {
    type: String,
    required: true
  },
  addressCountryId: {
    type: String,
    required: true
  },
  addressCityId: {
    type: String,
    required: true
  },
  addressDistrictId: {
    type: String,
    required: true
  },
  postalZone: {
    type: String,
    required: true
  },
  managerPersonId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBranchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch'
  },
  createdPersonId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IBranch>('Branch', BranchSchema); 