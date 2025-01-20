import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import Appointment from '../models/Appointment';
import Resource, { IResource } from '../models/Resource';
import AvailableSlot from '../models/AvailableSlot';

import { ICustomer } from '../models/Customer';


export const createAppointment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('Randevu oluşturma isteği:', req.body);

  // Body kontrolü
  if (!req.body.slotId) {
    return next(new AppError('slotId zorunludur. Önce /resources/available-slots endpoint\'ini kullanarak uygun bir slot seçin', 400));
  }

  const { slotId, customerId, notes } = req.body;

  // Slot kontrolü
  console.log('Slot kontrolü yapılıyor...', { slotId });
  const slot = await AvailableSlot.findById(slotId);
  if (!slot) {
    console.log('Slot bulunamadı veya süresi dolmuş:', { slotId });
    return next(new AppError('Geçersiz veya süresi dolmuş slot ID. Lütfen tekrar slot sorgulaması yapın', 400));
  }
  console.log('Slot bulundu:', { 
    slotId: slot._id,
    resourceId: slot.resourceId,
    startTime: slot.startTime,
    endTime: slot.endTime 
  });

  // Resource kontrolü
  console.log('Resource kontrolü yapılıyor...', { resourceId: slot.resourceId });
  const resource = await Resource.findById(slot.resourceId);
  if (!resource || resource.isDeleted || !resource.active || !resource.appointmentActive) {
    console.log('Resource uygun değil:', { 
      resourceExists: !!resource,
      isDeleted: resource?.isDeleted,
      active: resource?.active,
      appointmentActive: resource?.appointmentActive 
    });
    await AvailableSlot.findByIdAndDelete(slotId);
    return next(new AppError('Seçilen kaynak artık müsait değil. Lütfen tekrar slot sorgulaması yapın', 400));
  }
  console.log('Resource kontrolü başarılı');

  // Çakışma kontrolü
  console.log('Çakışma kontrolü yapılıyor...');
  const existingAppointment = await Appointment.findOne({
    resourceId: slot.resourceId,
    status: { $ne: 'cancelled' },
    $or: [
      {
        startTime: { $lt: slot.endTime },
        endTime: { $gt: slot.startTime }
      }
    ]
  });

  if (existingAppointment) {
    console.log('Çakışan randevu bulundu:', {
      existingAppointmentId: existingAppointment._id,
      startTime: existingAppointment.startTime,
      endTime: existingAppointment.endTime
    });
    await AvailableSlot.findByIdAndDelete(slotId);
    return next(new AppError('Bu zaman dilimi artık müsait değil. Lütfen tekrar slot sorgulaması yapın', 400));
  }
  console.log('Çakışma kontrolü başarılı');

  // Randevu oluştur
  console.log('Randevu oluşturuluyor...');
  const appointment = await Appointment.create({
    resourceId: slot.resourceId,
    customerId,
    startTime: slot.startTime,
    endTime: slot.endTime,
    notes,
    createdBy: req.user._id,
    createdBranchId: req.user.branchId
  });
  console.log('Randevu oluşturuldu:', { appointmentId: appointment._id });

  // Kullanılan slot'u sil
  console.log('Kullanılan slot siliniyor...');
  await AvailableSlot.findByIdAndDelete(slotId);
  console.log('Slot silindi');

  res.status(201).json({
    status: 'success',
    data: {
      appointment
    }
  });
});

export const getAppointments = catchAsync(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    startDate, 
    endDate, 
    status,
    resourceId,
    customerId
  } = req.query;

  // Filtreleme
  const filter: any = {};
  
  if (status) filter.status = status;
  if (resourceId) filter.resourceId = resourceId;
  if (customerId) filter.customerId = customerId;
  if (startDate || endDate) {
    filter.startTime = {};
    if (startDate) filter.startTime.$gte = new Date(startDate as string);
    if (endDate) filter.startTime.$lte = new Date(endDate as string);
  }

  // Toplam kayıt sayısı
  const total = await Appointment.countDocuments(filter);

  // Randevuları getir
  const appointments = await Appointment.find(filter)
    .sort({ startTime: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate('resourceId', 'resourceName active appointmentActive')
    .populate('customerId', 'firstName lastName email phoneNumber')
    .populate('createdBy', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    data: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      appointments
    }
  });
});

export const getAppointmentDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log('Randevu detayları getiriliyor...', { appointmentId: req.params.id });

  // Önce randevuyu populate etmeden getir
  const rawAppointment = await Appointment.findById(req.params.id);
  console.log('Ham randevu detayları:', {
    appointmentId: rawAppointment?._id,
    customerId: rawAppointment?.customerId,
    resourceId: rawAppointment?.resourceId,
    status: rawAppointment?.status
  });

  const appointment = await Appointment.findById(req.params.id)
    .populate({
      path: 'resourceId',
      select: 'resourceName active appointmentActive branchId userId',
      populate: [
        {
          path: 'userId',
          select: 'firstName lastName email phoneNumber role'
        },
        {
          path: 'branchId',
          select: 'name address phone'
        }
      ]
    })
    .populate({
      path: 'customerId',
      select: '_id name surname identityNumber citizenType gender birthDate customerType loyaltyLevel customerAddresses notes isActive'
    })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName email role'
    })
    .populate({
      path: 'createdBranchId',
      select: 'name address phone'
    });

  if (!appointment) {
    console.log('Randevu bulunamadı:', { appointmentId: req.params.id });
    return next(new AppError('Randevu bulunamadı', 404));
  }

  // Debug için appointment ve customer bilgilerini detaylı logla
  console.log('Randevu ve müşteri detayları:', {
    appointmentId: appointment._id,
    appointmentStatus: appointment.status,
    resourceId: (appointment.resourceId as IResource)?._id,
    resourceName: (appointment.resourceId as IResource)?.resourceName,
    customerId: (appointment.customerId as ICustomer)?._id,
    customerName: `${(appointment.customerId as ICustomer)?.name} ${(appointment.customerId as ICustomer)?.surname}`,
    customerLoyaltyLevel: (appointment.customerId as ICustomer)?.loyaltyLevel,
    startTime: appointment.startTime,
    endTime: appointment.endTime
  });

  res.status(200).json({
    status: 'success',
    data: {
      appointment
    }
  });
});

export const updateAppointment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { status, notes } = req.body;
  
  // Sadece belirli alanların güncellenmesine izin ver
  const updates = {
    ...(status && { status }),
    ...(notes && { notes })
  };

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  ).populate('resourceId', 'resourceName')
   .populate('customerId', 'firstName lastName email phoneNumber');

  if (!appointment) {
    return next(new AppError('Randevu bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      appointment
    }
  });
});