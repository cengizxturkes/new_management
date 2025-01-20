import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import User from '../models/User';
import Resource from '../models/Resource';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import jwt from 'jsonwebtoken';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role,
    branchId,
    address,
    isHaveResource = false
  } = req.body;

  // Email kontrolü
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Bu email adresi zaten kullanımda', 409));
  }

  // Role göre branchId kontrolü
  if (['manager', 'staff'].includes(role) && !branchId) {
    return next(new AppError('Manager ve staff rolleri için branchId zorunludur', 400));
  }

  // BranchId formatını kontrol et
  let validBranchId = branchId;
  if (branchId && !Types.ObjectId.isValid(branchId)) {
    return next(new AppError('Geçersiz branchId formatı', 400));
  }

  // Kullanıcı oluşturma
  const newUser = await User.create({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role,
    branchId: validBranchId,
    address,
    isHaveResource
  });

  // Eğer isHaveResource true ise ve role manager veya staff ise resource oluştur
  if (isHaveResource && ['manager', 'staff'].includes(role)) {
    const resource = await Resource.create({
      branchId: newUser.branchId,
      resourceName: `${newUser.firstName} ${newUser.lastName}`,
      active: true,
      appointmentActive: true,
      onlineAppointmentActive: true,
      createdPersonId: newUser._id,
      createdBranchId: newUser.branchId
    });

    // Kullanıcıya resource'u bağla
    newUser.resourceId = resource._id;
    await newUser.save();
  }

  // Password'ü response'dan çıkar
  const userObject = newUser.toObject();
  const { password: _, ...userWithoutPassword } = userObject;

  // Token oluştur
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: userWithoutPassword
    }
  });
});

// ... diğer auth controller fonksiyonları ... 