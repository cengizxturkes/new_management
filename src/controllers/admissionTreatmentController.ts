import { Request, Response } from 'express';
import AdmissionTreatment from '../models/AdmissionTreatment';
import Treatment from '../models/Treatment';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';

// Yeni tedavi oluştur
export const createAdmissionTreatment = catchAsync(async (req: Request, res: Response) => {
  const newAdmissionTreatment = await AdmissionTreatment.create(req.body);

  // Tedavinin saleCount'unu artır
  await Treatment.findByIdAndUpdate(
    req.body.treatmentId,
    { $inc: { saleCount: 1 } }
  );

  res.status(201).json({
    status: 'success',
    data: {
      admissionTreatment: newAdmissionTreatment,
    },
  });
});

// Tüm tedavileri getir
export const getAdmissionTreatments = catchAsync(async (_req: Request, res: Response) => {
  const admissionTreatments = await AdmissionTreatment.find({ isDeleted: false })
    .populate('admissionId')
    .populate('treatmentId')
    .populate('storageId')
    .populate('createdPersonId')
    .populate('createdBranchId');

  res.status(200).json({
    status: 'success',
    results: admissionTreatments.length,
    data: {
      admissionTreatments,
    },
  });
});

// ID'ye göre tedavi getir
export const getAdmissionTreatmentById = catchAsync(async (req: Request, res: Response) => {
  const admissionTreatment = await AdmissionTreatment.findOne({
    _id: req.params.id,
    isDeleted: false,
  })
    .populate('admissionId')
    .populate('treatmentId')
    .populate('storageId')
    .populate('createdPersonId')
    .populate('createdBranchId');

  if (!admissionTreatment) {
    throw new AppError('Bu ID ile tedavi bulunamadı', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      admissionTreatment,
    },
  });
});

// AdmissionId'ye göre tedavileri getir
export const getAdmissionTreatmentsByAdmissionId = catchAsync(async (req: Request, res: Response) => {
  const admissionTreatments = await AdmissionTreatment.find({
    admissionId: req.params.admissionId,
    isDeleted: false,
  })
    .populate('admissionId')
    .populate('treatmentId')
    .populate('storageId')
    .populate('createdPersonId')
    .populate('createdBranchId');

  res.status(200).json({
    status: 'success',
    results: admissionTreatments.length,
    data: {
      admissionTreatments,
    },
  });
});

// Tedaviyi güncelle
export const updateAdmissionTreatment = catchAsync(async (req: Request, res: Response) => {
  const admissionTreatment = await AdmissionTreatment.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('admissionId')
    .populate('treatmentId')
    .populate('storageId')
    .populate('createdPersonId')
    .populate('createdBranchId');

  if (!admissionTreatment) {
    throw new AppError('Bu ID ile tedavi bulunamadı', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      admissionTreatment,
    },
  });
});

// Tedaviyi sil (soft delete)
export const deleteAdmissionTreatment = catchAsync(async (req: Request, res: Response) => {
  const admissionTreatment = await AdmissionTreatment.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!admissionTreatment) {
    throw new AppError('Bu ID ile tedavi bulunamadı', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Tedavi başarıyla silindi',
  });
}); 