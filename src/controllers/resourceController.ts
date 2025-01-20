import { Request, Response, NextFunction } from 'express';
import Resource from '../models/Resource';
import User from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';

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
  const resource = await Resource.findById(req.params.id);

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