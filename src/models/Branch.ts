import mongoose, { Schema, Document } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       required:
 *         - branchName
 *         - address
 *         - phone
 *         - email
 *       properties:
 *         branchName:
 *           type: string
 *           description: Şube adı
 *         address:
 *           type: string
 *           description: Şube adresi
 *         phone:
 *           type: string
 *           description: Telefon numarası
 *         email:
 *           type: string
 *           format: email
 *           description: Şube email adresi
 *         managerPersonId:
 *           type: string
 *           description: Şube müdürünün ID'si
 *         isActive:
 *           type: boolean
 *           description: Şubenin aktif olup olmadığı
 *           default: true
 *         isDeleted:
 *           type: boolean
 *           description: Şubenin silinip silinmediği
 *           default: false
 *       example:
 *         branchName: Merkez Şube
 *         address: Atatürk Cad. No:123
 *         phone: "+902121234567"
 *         email: merkez@firma.com
 *         managerPersonId: "60d5ecb8b5c9c62b3c7c1b60"
 *         isActive: true
 *         isDeleted: false
 */

interface PhoneNumber {
  countryCode: string;
  number: string;
}

export interface IBranch extends Document {
  branchName: string;
  address: string;
  phone: string;
  phoneNumber?: PhoneNumber;
  email: string;
  managerPersonId?: mongoose.Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
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

const BranchSchema: Schema = new Schema(
  {
    branchName: {
      type: String,
      required: [true, 'Şube adı zorunludur'],
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      required: [true, 'Adres zorunludur'],
    },
    phone: {
      type: String,
      required: [true, 'Telefon numarası zorunludur'],
    },
    phoneNumber: {
      type: PhoneNumberSchema,
    },
    email: {
      type: String,
      required: [true, 'E-posta zorunludur'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    managerPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBranch>('Branch', BranchSchema); 