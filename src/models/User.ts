import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *         - phoneNumber
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Kullanıcının email adresi
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: Kullanıcının şifresi
 *         firstName:
 *           type: string
 *           description: Kullanıcının adı
 *         lastName:
 *           type: string
 *           description: Kullanıcının soyadı
 *         phoneNumber:
 *           type: object
 *           properties:
 *             countryCode:
 *               type: string
 *               format: regex
 *               pattern: ^\+\d{1,4}$
 *               description: Ülke kodu
 *             number:
 *               type: string
 *               format: regex
 *               pattern: ^\d{10}$
 *               description: Telefon numarası
 *         role:
 *           type: string
 *           enum: [admin, manager, staff, customer]
 *           description: Kullanıcının rolü (manager ve staff için branchId zorunludur)
 *         branchId:
 *           type: string
 *           description: Kullanıcının bağlı olduğu şube ID'si (manager ve staff için zorunlu)
 *         isActive:
 *           type: boolean
 *           description: Kullanıcı hesabının aktif olup olmadığı
 *         rewardPoints:
 *           type: number
 *           description: Kullanıcının ödül puanları (sadece customer rolü için)
 *       example:
 *         email: ornek@email.com
 *         password: sifre123
 *         firstName: Ahmet
 *         lastName: Yılmaz
 *         phoneNumber:
 *           countryCode: +90
 *           number: 5551234567
 *         role: customer
 *         isActive: true
 *         rewardPoints: 100
 */

interface PhoneNumber {
  countryCode: string;
  number: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: PhoneNumber;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  branchId?: Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  rewardPoints: number;
  appointmentHistory: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isHaveResource: boolean;
  resourceId?: Schema.Types.ObjectId;
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

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email adresi zorunludur'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: 'Geçerli bir email adresi giriniz'
    }
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'Ad zorunludur'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Soyad zorunludur'],
    trim: true
  },
  phoneNumber: {
    type: PhoneNumberSchema,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff', 'customer'],
    default: 'customer'
  },
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  rewardPoints: {
    type: Number,
    default: 0
  },
  appointmentHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  }],
  isHaveResource: {
    type: Boolean,
    default: false
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    ref: 'Resource'
  }
}, {
  timestamps: true
});

// Şifre hashleme middleware
UserSchema.pre('save', async function(next) {
  // Eğer şifre değişmişse hashle
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// isHaveResource değiştiğinde resource güncelleme
UserSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  
  if (update.isHaveResource !== undefined) {
    const user = await this.model.findOne(this.getQuery());
    
    if (update.isHaveResource && !user.resourceId) {
      // Resource oluştur
      const resource = await mongoose.model('Resource').create({
        branchId: user.branchId,
        resourceName: `${user.firstName} ${user.lastName}`,
        active: true,
        appointmentActive: true,
        onlineAppointmentActive: true,
        createdPersonId: user._id,
        createdBranchId: user.branchId
      });

      update.resourceId = resource._id;
    } else if (!update.isHaveResource && user.resourceId) {
      // Resource'u soft delete yap
      await mongoose.model('Resource').findByIdAndUpdate(
        user.resourceId,
        { isDeleted: true }
      );
      update.resourceId = null;
    }
  }

  next();
});

// Şifre karşılaştırma metodu
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema); 