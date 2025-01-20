import { Request, Response } from 'express';
import Branch from '../models/Branch';
import User from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseBuilder } from '../interfaces/ApiResponse';
import { Types } from 'mongoose';

// Telefon numarası kontrolü için yardımcı fonksiyon
const isValidPhoneNumber = (phoneNumber: any): boolean => {
  return phoneNumber && 
         typeof phoneNumber === 'object' && 
         typeof phoneNumber.countryCode === 'string' &&
         typeof phoneNumber.number === 'string' &&
         /^\+\d{1,4}$/.test(phoneNumber.countryCode) &&
         /^\d{10}$/.test(phoneNumber.number);
};

// Şube oluşturma
export const createBranch = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { 
    branchName, 
    addressText, 
    phoneNumber,
    email,
    addressCountryId,
    addressCityId,
    addressDistrictId,
    postalZone,
    managerPersonId,
    defaultCurrencyId,
    defaultPriceListId,
    companyId,
    branchType = 0
  } = req.body;

  // Telefon numarası validasyonu
  if (!isValidPhoneNumber(phoneNumber)) {
    res.status(400).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Geçersiz telefon numarası formatı')
        .withStatusCode(400)
        .build()
    );
    return;
  }

  const branch = await Branch.create({
    branchName,
    addressText,
    phoneNumber,
    email,
    addressCountryId,
    addressCityId,
    addressDistrictId,
    postalZone,
    managerPersonId,
    defaultCurrencyId,
    defaultPriceListId,
    companyId,
    branchType,
    createdPersonId: req.user._id,
    isActive: true
  });

  res.status(201).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Şube başarıyla oluşturuldu')
      .withStatusCode(201)
      .withData(branch)
      .build()
  );
});

// Şube bilgilerini getirme
export const getBranch = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const branch = await Branch.findById(req.params.id)
    .populate('managerPersonId', 'firstName lastName email phoneNumber')
    .lean();

  if (!branch) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Şube bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  // Şubedeki çalışanları getir
  const employees = await User.find({ 
    branchId: branch._id,
    isActive: true 
  })
  .select('firstName lastName email phoneNumber role')
  .lean();

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Şube bilgileri başarıyla getirildi')
      .withData({ ...branch, employees })
      .build()
  );
});

// Şube güncelleme
export const updateBranch = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { branchName, addressText, phoneNumber, managerPersonId, isActive } = req.body;
  const branchId = req.params.id;

  const branch = await Branch.findById(branchId);
  if (!branch) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Şube bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  // Telefon numarası değişiyorsa ve başka şube kullanıyorsa kontrol et
  if (phoneNumber && phoneNumber !== branch.phoneNumber) {
    const existingBranchByPhone = await Branch.findOne({ 
      phoneNumber, 
      _id: { $ne: branchId } 
    });
    if (existingBranchByPhone) {
      res.status(400).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Bu telefon numarası başka bir şube tarafından kullanılıyor')
          .withStatusCode(400)
          .build()
      );
      return;
    }
  }

  // Yönetici değişiyorsa
  if (managerPersonId && managerPersonId !== branch.managerPersonId?.toString()) {
    const manager = await User.findById(managerPersonId);
    if (!manager) {
      res.status(404).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Belirtilen yönetici bulunamadı')
          .withStatusCode(404)
          .build()
      );
      return;
    }

    if (manager.role !== 'manager') {
      res.status(400).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Belirtilen kullanıcı yönetici rolüne sahip değil')
          .withStatusCode(400)
          .build()
      );
      return;
    }

    // Eski yöneticinin branchId'sini temizle
    if (branch.managerPersonId) {
      await User.findByIdAndUpdate(branch.managerPersonId, { $unset: { branchId: 1 } });
    }

    // Yeni yöneticinin branchId'sini güncelle
    await User.findByIdAndUpdate(managerPersonId, { branchId: branchId });
  }

  // Şube pasife çekiliyorsa, tüm çalışanların branchId'sini temizle
  if (branch.isActive && !isActive) {
    await User.updateMany(
      { branchId: branchId },
      { $unset: { branchId: 1 } }
    );
  }

  const updatedBranch = await Branch.findByIdAndUpdate(
    branchId,
    { 
      branchName, 
      addressText, 
      phoneNumber, 
      managerPersonId: managerPersonId, 
      isActive 
    },
    { new: true, runValidators: true }
  ).populate('managerPersonId', 'firstName lastName email phoneNumber');

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Şube başarıyla güncellendi')
      .withData(updatedBranch)
      .build()
  );
});

// Şubedeki çalışanları listeleme
export const getBranchEmployees = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { role } = req.query;
  const branchId = req.params.id;

  // Şubenin varlığını kontrol et
  const branch = await Branch.findById(branchId);
  if (!branch) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Şube bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  // Çalışanları filtrele
  const query: any = { branchId, isActive: true };
  if (role) {
    query.role = role;
  }

  const employees = await User.find(query)
    .select('firstName lastName email phoneNumber role')
    .lean();

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Şube çalışanları başarıyla getirildi')
      .withData(employees)
      .withStatusCode(200)
      .build()
  );
});

// Çalışanı şubeye atama/şubeden çıkarma
export const assignEmployeeToBranch = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { employeeId, action } = req.body;
  const branchId = req.params.id;

  // Şubenin varlığını ve aktifliğini kontrol et
  const branch = await Branch.findById(branchId);
  if (!branch) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Şube bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  if (!branch.isActive) {
    res.status(400).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Pasif şubeye çalışan ataması yapılamaz')
        .withStatusCode(400)
        .build()
    );
    return;
  }

  // Çalışanın varlığını kontrol et
  const employee = await User.findById(employeeId);
  if (!employee) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Çalışan bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  if (action === 'assign') {
    if (employee.branchId) {
      res.status(400).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Bu çalışan zaten başka bir şubede görevli')
          .withStatusCode(400)
          .build()
      );
      return;
    }

    employee.branchId = new Types.ObjectId(branchId);
  } else if (action === 'remove') {
    if (employee.branchId?.toString() !== branchId) {
      res.status(400).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Bu çalışan bu şubede görevli değil')
          .withStatusCode(400)
          .build()
      );
      return;
    }

    employee.branchId = undefined;
  }

  await employee.save();

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage(action === 'assign' ? 'Çalışan şubeye atandı' : 'Çalışan şubeden çıkarıldı')
      .withData(employee)
      .build()
  );
});

// Tüm şubeleri getirme
export const getAllBranches = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const branches = await Branch.find()
    .populate('managerPersonId', 'firstName lastName email phoneNumber')
    .sort('-createdAt');

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Şubeler başarıyla getirildi')
      .withData(branches)
      .build()
  );
}); 