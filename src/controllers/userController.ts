import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseBuilder } from '../interfaces/ApiResponse';
import Branch from '../models/Branch';
import { PaginationOptions, PaginatedResponse } from '../interfaces/Pagination';
import Resource from '../models/Resource';

// JWT Token oluşturma
const createToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );
};

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role,
    branchId,
    address,
    isHaveResource
  } = req.body;

  // Role göre branchId zorunluluğunu kontrol et
  if (['manager', 'staff'].includes(role) && !branchId) {
    res.status(400).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Çalışanlar ve yöneticiler için şube bilgisi zorunludur')
        .withStatusCode(400)
        .build()
    );
    return;
  }

  // Eğer branchId varsa şubenin varlığını ve aktifliğini kontrol et
  if (branchId) {
    const branch = await Branch.findById(branchId);
    if (!branch) {
      res.status(404).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Belirtilen şube bulunamadı')
          .withStatusCode(404)
          .build()
      );
      return;
    }

    if (!branch.isActive) {
      res.status(400).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Pasif şubeye kullanıcı ataması yapılamaz')
          .withStatusCode(400)
          .build()
      );
      return;
    }

    // Eğer manager rolü seçildiyse, şubenin mevcut bir yöneticisi var mı kontrol et
    if (role === 'manager') {
      const existingManager = await User.findOne({ 
        branchId, 
        role: 'manager',
        isActive: true 
      });
      
      if (existingManager) {
        res.status(400).json(
          new ApiResponseBuilder()
            .success(false)
            .withMessage('Bu şubenin zaten aktif bir yöneticisi bulunmaktadır')
            .withStatusCode(400)
            .build()
        );
        return;
      }
    }
  }

  // Email kontrolü
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    res.status(400).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Bu email adresi zaten kullanımda')
        .withStatusCode(400)
        .build()
    );
    return;
  }

  // Telefon kontrolü
  const existingUserByPhone = await User.findOne({ phoneNumber });
  if (existingUserByPhone) {
    res.status(400).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Bu telefon numarası zaten kullanımda')
        .withStatusCode(400)
        .build()
    );
    return;
  }

  // Kullanıcıyı oluştur
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role,
    branchId,
    address,
    isHaveResource
  });

  // Eğer isHaveResource true ise ve branchId varsa resource oluştur
  if (isHaveResource && branchId) {
    const resource = await Resource.create({
      branchId: user.branchId,
      resourceName: `${user.firstName} ${user.lastName}`,
      active: true,
      appointmentActive: true,
      onlineAppointmentActive: true,
      createdPersonId: user._id,
      createdBranchId: user.branchId,
      userId: user._id
    });

    // Resource ID'yi kullanıcıya ata
    user.resourceId = resource._id;
    await user.save();
  }

  const token = createToken(user);

  res.status(201).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Kullanıcı başarıyla oluşturuldu')
      .withStatusCode(201)
      .withData({ user, token })
      .build()
  );
});

export const updateUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const updates = req.body;
  const userId = req.params.id;

  // Hassas alanların güncellenmesini engelle
  delete updates.password;
  delete updates.role;
  delete updates.rewardPoints;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    res.status(404).json({
      status: 'error',
      message: 'Kullanıcı bulunamadı'
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  // Soft delete - kullanıcıyı tamamen silmek yerine deaktif et
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    res.status(404).json({
      status: 'error',
      message: 'Kullanıcı bulunamadı'
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    message: 'Kullanıcı başarıyla deaktif edildi'
  });
});

export const getUserInfo = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  const user = await User.findById(userId)
    .select('-password')
    .populate('appointmentHistory');

  if (!user) {
    res.status(404).json({
      status: 'error',
      message: 'Kullanıcı bulunamadı'
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    search = ''
  } = req.query as PaginationOptions;

  // Arama filtresi oluştur
  const searchRegex = new RegExp(search, 'i');
  const filter = search ? {
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { 'phoneNumber.number': searchRegex }
    ]
  } : {};

  // Toplam kayıt sayısı
  const total = await User.countDocuments(filter);

  // Sayfalama ve sıralama
  const users = await User.find(filter)
    .sort(sort)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .select('-password')
    .populate('branchId', 'name');

  const totalPages = Math.ceil(total / Number(limit));

  res.status(200).json(
    new ApiResponseBuilder<PaginatedResponse<IUser>>()
      .success(true)
      .withMessage('Kullanıcılar başarıyla getirildi')
      .withData({
        data: users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      })
      .build()
  );
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Email ve şifre kontrolü
  if (!email || !password) {
    res.status(400).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Lütfen email ve şifre giriniz')
        .withStatusCode(400)
        .build()
    );
    return;
  }

  // Kullanıcıyı bul ve şifreyi de getir
  const user = await User.findOne({ email }).select('+password');
  if (!user || !await user.comparePassword(password)) {
    res.status(401).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Email veya şifre hatalı')
        .withStatusCode(401)
        .build()
    );
    return;
  }

  // Kullanıcı aktif değilse
  if (!user.isActive) {
    res.status(401).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Hesabınız aktif değil')
        .withStatusCode(401)
        .build()
    );
    return;
  }

  // Son giriş tarihini güncelle
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Token oluştur
  const token = createToken(user);

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Giriş başarılı')
      .withData({
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          branchId: user.branchId,
          phoneNumber: user.phoneNumber
        },
        token
      })
      .build()
  );
}); 