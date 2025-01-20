import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import Admission from '../models/Admission';
import Appointment from '../models/Appointment';

// Başvuru oluşturma
export const createAdmission = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    appointmentId,
    personId,
    priceListId,
    notes,
    appointmentType,
    invoiceNumber,
    patientCondition,
    referringDoctorId,
    expectedDuration,
    followUpDate,
    attachments
  } = req.body;

  // Randevu kontrolü
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new AppError('Randevu bulunamadı', 404));
  }

  // Başvuru oluştur
  const admission = await Admission.create({
    branchId: req.user.branchId,
    admissionDate: new Date(),
    personId,
    priceListId,
    createdPersonId: req.user._id,
    createdBranchId: req.user.branchId,
    appointmentId,
    notes,
    appointmentType,
    invoiceNumber,
    patientCondition,
    referringDoctorId,
    expectedDuration,
    followUpDate,
    attachments
  });

  // Populate işlemi
  const populatedAdmission = await Admission.findById(admission._id)
    .populate('branchId', 'branchName')
    .populate({
      path: 'appointmentId',
      populate: {
        path: 'customerId',
        select: 'name surname identityNumber'
      }
    })
    .populate('personId', 'firstName lastName')
    .populate('priceListId', 'priceListName')
    .populate('referringDoctorId', 'firstName lastName');

  res.status(201).json({
    status: 'success',
    data: {
      admission: populatedAdmission
    }
  });
});

// Başvuruları listeleme
export const getAdmissions = catchAsync(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10,
    startDate,
    endDate,
    appointmentStatus,
    personId
  } = req.query;

  // Filtreleme
  const filter: any = { isActive: true };
  
  if (appointmentStatus) filter.appointmentStatus = appointmentStatus;
  if (personId) filter.personId = personId;
  if (startDate || endDate) {
    filter.admissionDate = {};
    if (startDate) filter.admissionDate.$gte = new Date(startDate as string);
    if (endDate) filter.admissionDate.$lte = new Date(endDate as string);
  }

  // Toplam kayıt sayısı
  const total = await Admission.countDocuments(filter);

  // Başvuruları getir
  const admissions = await Admission.find(filter)
    .sort({ admissionDate: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate('branchId', 'branchName')
    .populate({
      path: 'appointmentId',
      populate: {
        path: 'customerId',
        select: 'name surname identityNumber'
      }
    })
    .populate('personId', 'firstName lastName')
    .populate('priceListId', 'priceListName')
    .populate('referringDoctorId', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    data: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      admissions
    }
  });
});

// Başvuru detayı getirme
export const getAdmissionDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const admission = await Admission.findById(req.params.id)
    .populate('branchId', 'branchName')
    .populate({
      path: 'appointmentId',
      populate: [
        {
          path: 'customerId',
          select: 'name surname identityNumber customerType loyaltyLevel'
        },
        {
          path: 'resourceId',
          select: 'resourceName'
        }
      ]
    })
    .populate('personId', 'firstName lastName email phoneNumber')
    .populate('priceListId', 'priceListName validFrom validTo')
    .populate('createdPersonId', 'firstName lastName')
    .populate('createdBranchId', 'branchName')
    .populate('referringDoctorId', 'firstName lastName');

  if (!admission) {
    return next(new AppError('Başvuru bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      admission
    }
  });
});

// Başvuru güncelleme
export const updateAdmission = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    notes,
    appointmentType,
    appointmentStatus,
    invoiceNumber,
    patientCondition,
    referringDoctorId,
    expectedDuration,
    followUpDate,
    attachments
  } = req.body;

  // Sadece belirli alanların güncellenmesine izin ver
  const updates = {
    ...(notes && { notes }),
    ...(appointmentType && { appointmentType }),
    ...(appointmentStatus && { appointmentStatus }),
    ...(invoiceNumber && { invoiceNumber }),
    ...(patientCondition && { patientCondition }),
    ...(referringDoctorId && { referringDoctorId }),
    ...(expectedDuration && { expectedDuration }),
    ...(followUpDate && { followUpDate }),
    ...(attachments && { attachments })
  };

  const admission = await Admission.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  )
  .populate('branchId', 'branchName')
  .populate({
    path: 'appointmentId',
    populate: {
      path: 'customerId',
      select: 'name surname identityNumber'
    }
  })
  .populate('personId', 'firstName lastName')
  .populate('priceListId', 'priceListName')
  .populate('referringDoctorId', 'firstName lastName');

  if (!admission) {
    return next(new AppError('Başvuru bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      admission
    }
  });
});

// Başvuru silme (soft delete)
export const deleteAdmission = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const admission = await Admission.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!admission) {
    return next(new AppError('Başvuru bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Başvuru başarıyla silindi'
  });
}); 