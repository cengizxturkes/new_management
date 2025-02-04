import { Request, Response } from 'express';
import Customer from '../models/Customer';
import User from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponseBuilder } from '../interfaces/ApiResponse';

export const getAllCustomers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Pagination parametreleri
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Filtreleme parametreleri
  const filter: any = { isActive: true };
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search as string, 'i');
    filter.$or = [
      { name: searchRegex },
      { surname: searchRegex },
      { identityNumber: searchRegex },
      { 'customerAddresses.email': searchRegex },
      { 'customerAddresses.phoneNumber': searchRegex }
    ];
  }

  // Toplam kayıt sayısı
  const total = await Customer.countDocuments(filter);

  // Müşterileri getir
  const customers = await Customer.find(filter)
    .populate('createdPersonId', 'firstName lastName')
    .populate('createdBranchId', 'branchName')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  // pictureB64 null veya undefined ise boş string olarak ayarla
  const formattedCustomers = customers.map(customer => {
    const customerObj = customer.toObject();
    customerObj.pictureB64 = customerObj.pictureB64 || '';
    return customerObj;
  });

  // Pagination meta verisi
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Müşteriler başarıyla getirildi')
      .withData({
        customers: formattedCustomers,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      })
      .build()
  );
});

export const getCustomer = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const customer = await Customer.findById(req.params.id)
    .populate('createdPersonId', 'firstName lastName email')
    .populate('createdBranchId', 'branchName');

  if (!customer) {
    res.status(200).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Müşteri bulunamadı')
        .build()
    );
    return;
  }

  // createdPersonName oluştur
  const createdPerson = await User.findById(customer.createdPersonId);
  const customerObj = customer.toObject();
  customerObj.pictureB64 = customerObj.pictureB64 || '';
  const responseData = {
    ...customerObj,
    createdPersonName: createdPerson ? `${createdPerson.firstName} ${createdPerson.lastName}` : 'Bilinmiyor'
  };

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Müşteri başarıyla getirildi')
      .withData(responseData)
      .build()
  );
});

export const createCustomer = catchAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    // TC kontrolü
    const existingCustomerByTC = await Customer.findOne({ 
      identityNumber: req.body.identityNumber,
      isActive: true 
    });

    if (existingCustomerByTC) {
      res.status(200).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Bu kimlik numarası ile kayıtlı aktif bir müşteri bulunmaktadır')
          .build()
      );
      return;
    }

    // Telefon numarası kontrolü
    const phoneNumbers = req.body.customerAddresses.map((addr: any) => addr.phoneNumber);
    const existingCustomerByPhone = await Customer.findOne({
      'customerAddresses.phoneNumber': { $in: phoneNumbers },
      isActive: true
    });

    if (existingCustomerByPhone) {
      res.status(200).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Girilen telefon numaralarından biri ile kayıtlı aktif bir müşteri bulunmaktadır')
          .build()
      );
      return;
    }

    // Email kontrolü
    const emails = req.body.customerAddresses.map((addr: any) => addr.email);
    const existingCustomerByEmail = await Customer.findOne({
      'customerAddresses.email': { $in: emails },
      isActive: true
    });

    if (existingCustomerByEmail) {
      res.status(200).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Girilen email adreslerinden biri ile kayıtlı aktif bir müşteri bulunmaktadır')
          .build()
      );
      return;
    }

    // Token'dan kullanıcı ve şube bilgilerini al
    const createdPersonId = req.user._id;
    const createdBranchId = req.user.branchId;

    const customer = await Customer.create({
      ...req.body,
      createdPersonId,
      createdBranchId
    });

    res.status(200).json(
      new ApiResponseBuilder()
        .success(true)
        .withMessage('Müşteri başarıyla oluşturuldu')
        .withData(customer)
        .build()
    );
  } catch (error: any) {
    // MongoDB duplicate key hatası kontrolü
    if (error.code === 11000) {
      let message = 'Bu bilgiler ile kayıtlı bir müşteri bulunmaktadır';
      
      if (error.keyPattern?.identityNumber) {
        message = 'Bu kimlik numarası ile kayıtlı (silinmiş) bir müşteri bulunmaktadır';
      } else if (error.keyPattern?.['customerAddresses.phoneNumber']) {
        message = 'Bu telefon numarası ile kayıtlı (silinmiş) bir müşteri bulunmaktadır';
      } else if (error.keyPattern?.['customerAddresses.email']) {
        message = 'Bu email adresi ile kayıtlı (silinmiş) bir müşteri bulunmaktadır';
      }

      res.status(200).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage(message)
          .build()
      );
      return;
    }

    // Diğer validasyon hataları için
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(200).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Validasyon hatası')
          .withData({ errors: messages })
          .build()
      );
      return;
    }

    // Beklenmeyen hatalar için
    throw error;
  }
});

export const updateCustomer = catchAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      res.status(200).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Müşteri bulunamadı')
          .build()
      );
      return;
    }

    // TC kontrolü (eğer TC değiştiriliyorsa)
    if (req.body.identityNumber && req.body.identityNumber !== customer.identityNumber) {
      const existingCustomerByTC = await Customer.findOne({
        identityNumber: req.body.identityNumber,
        _id: { $ne: req.params.id },
        isActive: true
      });

      if (existingCustomerByTC) {
        res.status(200).json(
          new ApiResponseBuilder()
            .success(false)
            .withMessage('Bu kimlik numarası ile kayıtlı aktif bir müşteri bulunmaktadır')
            .build()
        );
        return;
      }
    }

    // Telefon numarası kontrolü (eğer adresler güncelleniyorsa)
    if (req.body.customerAddresses) {
      const phoneNumbers = req.body.customerAddresses.map((addr: any) => addr.phoneNumber);
      const existingCustomerByPhone = await Customer.findOne({
        'customerAddresses.phoneNumber': { $in: phoneNumbers },
        _id: { $ne: req.params.id },
        isActive: true
      });

      if (existingCustomerByPhone) {
        res.status(200).json(
          new ApiResponseBuilder()
            .success(false)
            .withMessage('Girilen telefon numaralarından biri ile kayıtlı aktif bir müşteri bulunmaktadır')
            .build()
        );
        return;
      }
    }

    // Email kontrolü (eğer adresler güncelleniyorsa)
    if (req.body.customerAddresses) {
      const emails = req.body.customerAddresses.map((addr: any) => addr.email);
      const existingCustomerByEmail = await Customer.findOne({
        'customerAddresses.email': { $in: emails },
        _id: { $ne: req.params.id },
        isActive: true
      });

      if (existingCustomerByEmail) {
        res.status(200).json(
          new ApiResponseBuilder()
            .success(false)
            .withMessage('Girilen email adreslerinden biri ile kayıtlı aktif bir müşteri bulunmaktadır')
            .build()
        );
        return;
      }
    }

    // createdPersonId ve createdBranchId güncellenmemeli
    const { createdPersonId, createdBranchId, ...updateData } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdPersonId', 'firstName lastName');

    res.status(200).json(
      new ApiResponseBuilder()
        .success(true)
        .withMessage('Müşteri başarıyla güncellendi')
        .withData(updatedCustomer)
        .build()
    );
  } catch (error: any) {
    // MongoDB duplicate key hatası kontrolü
    if (error.code === 11000) {
      let message = 'Bu bilgiler ile kayıtlı bir müşteri bulunmaktadır';
      
      if (error.keyPattern?.identityNumber) {
        message = 'Bu kimlik numarası ile kayıtlı (silinmiş) bir müşteri bulunmaktadır';
      } else if (error.keyPattern?.['customerAddresses.phoneNumber']) {
        message = 'Bu telefon numarası ile kayıtlı (silinmiş) bir müşteri bulunmaktadır';
      } else if (error.keyPattern?.['customerAddresses.email']) {
        message = 'Bu email adresi ile kayıtlı (silinmiş) bir müşteri bulunmaktadır';
      }

      res.status(200).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage(message)
          .build()
      );
      return;
    }

    // Diğer validasyon hataları için
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(200).json(
        new ApiResponseBuilder()
          .success(false)
          .withMessage('Validasyon hatası')
          .withData({ errors: messages })
          .build()
      );
      return;
    }

    // Beklenmeyen hatalar için
    throw error;
  }
});

export const deleteCustomer = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404).json(
      new ApiResponseBuilder()
        .success(false)
        .withMessage('Müşteri bulunamadı')
        .withStatusCode(404)
        .build()
    );
    return;
  }

  // Soft delete
  await Customer.findByIdAndUpdate(req.params.id, { isActive: false });

  res.status(200).json(
    new ApiResponseBuilder()
      .success(true)
      .withMessage('Müşteri başarıyla silindi')
      .build()
  );
}); 