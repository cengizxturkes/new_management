import { Request, Response, NextFunction } from 'express';
import Resource from '../models/Resource';
import User from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import Appointment from '../models/Appointment';
import AvailableSlot from '../models/AvailableSlot';
import moment from 'moment';
import mongoose from 'mongoose';

export const createResource = catchAsync(async (req: Request, res: Response) => {
  const resource = await Resource.create({
    ...req.body,
    createdPersonId: req.user._id,
    createdBranchId: req.user.branchId
  });

  res.status(201).json({
    status: 'success',
    data: {
      resource
    }
  });
});

export const getAllResources = catchAsync(async (_req: Request, res: Response) => {
  const resources = await Resource.find({ isDeleted: false });

  res.status(200).json({
    status: 'success',
    results: resources.length,
    data: {
      resources
    }
  });
});

export const getResource = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const resource = await Resource.findById(req.params.id)
    .populate({
      path: 'userId',
      select: 'firstName lastName email phoneNumber role branchId isActive'
    });

  if (!resource) {
    return next(new AppError('Bu ID ile kaynak bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      resource
    }
  });
});

export const updateResource = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!resource) {
    return next(new AppError('Bu ID ile kaynak bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      resource
    }
  });
});

export const deleteResource = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );

  if (!resource) {
    return next(new AppError('Bu ID ile kaynak bulunamadı', 404));
  }

  // İlgili kullanıcının resource bilgilerini güncelle
  await User.findOneAndUpdate(
    { resourceId: req.params.id },
    { isHaveResource: false, resourceId: null }
  );

  res.status(200).json({
    status: 'success',
    data: null
  });
});

export const restoreResource = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { isDeleted: false },
    { new: true }
  );

  if (!resource) {
    return next(new AppError('Bu ID ile kaynak bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      resource
    }
  });
});

interface TimeSlot {
  _id: string;
  start: Date;
  end: Date;
  isAvailable: boolean;
}

export const getAvailableSlots = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { resourceId, durationInMinutes, queryStartDate, queryEndDate } = req.body;

  // ObjectId kontrolü
  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    return next(new AppError('Geçersiz resource ID formatı', 400));
  }

  // Tarih aralığı kontrolü
  const startDate = moment(queryStartDate);
  const endDate = moment(queryEndDate);
  const diffInDays = endDate.diff(startDate, 'days');

  if (diffInDays > 31) {
    return next(new AppError('Tarih aralığı en fazla 1 ay olabilir', 400));
  }

  if (endDate.isBefore(startDate)) {
    return next(new AppError('Bitiş tarihi başlangıç tarihinden önce olamaz', 400));
  }

  // Resource kontrolü
  const resource = await Resource.findById(resourceId);

  if (!resource) {
    return next(new AppError('Kaynak bulunamadı', 404));
  }

  if (resource.isDeleted) {
    return next(new AppError('Bu kaynak silinmiş durumda', 400));
  }

  if (!resource.active) {
    return next(new AppError('Bu kaynak aktif değil', 400));
  }

  if (!resource.appointmentActive) {
    return next(new AppError('Bu kaynak randevuya kapalı', 400));
  }

  // Tarih aralığındaki mevcut randevuları getir
  const existingAppointments = await Appointment.find({
    resourceId,
    startTime: { $gte: queryStartDate },
    endTime: { $lte: queryEndDate },
    status: { $ne: 'cancelled' }
  }).sort({ startTime: 1 });

  // Çalışma saatlerini slotlara böl
  const slots: TimeSlot[] = [];
  let currentTime = moment(queryStartDate);
  const endTime = moment(queryEndDate);

  // Önceki slotları temizle
  await AvailableSlot.deleteMany({ resourceId });

  while (currentTime.isBefore(endTime)) {
    const slotStart = currentTime.toDate();
    const slotEnd = moment(currentTime).add(durationInMinutes, 'minutes').toDate();

    // Bu slot için çakışma kontrolü
    const isSlotAvailable = !existingAppointments.some(appointment => {
      const appointmentStart = moment(appointment.startTime);
      const appointmentEnd = moment(appointment.endTime);
      
      return (
        (moment(slotStart).isSameOrAfter(appointmentStart) && moment(slotStart).isBefore(appointmentEnd)) ||
        (moment(slotEnd).isAfter(appointmentStart) && moment(slotEnd).isSameOrBefore(appointmentEnd)) ||
        (moment(slotStart).isBefore(appointmentStart) && moment(slotEnd).isAfter(appointmentEnd))
      );
    });

    if (isSlotAvailable) {
      // Slot'u veritabanına kaydet
      const availableSlot = await AvailableSlot.create({
        resourceId,
        startTime: slotStart,
        endTime: slotEnd
      });

      slots.push({
        _id: availableSlot._id.toString(),
        start: slotStart,
        end: slotEnd,
        isAvailable: true
      });
    }

    currentTime.add(durationInMinutes, 'minutes');
  }

  res.status(200).json({
    status: 'success',
    data: {
      resource: {
        _id: resource._id,
        resourceName: resource.resourceName
      },
      queryStartDate,
      queryEndDate,
      durationInMinutes,
      totalSlots: slots.length,
      availableSlots: slots
    }
  });
}); 