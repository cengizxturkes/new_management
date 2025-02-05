import { faker } from '@faker-js/faker/locale/tr';
import mongoose from 'mongoose';
import User from '../models/User';
import Branch from '../models/Branch';
import Customer from '../models/Customer';
import Resource from '../models/Resource';
import Appointment from '../models/Appointment';
import Currency from '../models/Currency';
import PriceList from '../models/PriceList';
import Admission from '../models/Admission';
import dotenv from 'dotenv';

dotenv.config();

const TOTAL_BRANCHES = 10;
const TOTAL_USERS = 100;
const TOTAL_CUSTOMERS = 500;
const TOTAL_RESOURCES = 50;
const APPOINTMENTS_PER_CUSTOMER = 20;
const ADMISSIONS_PER_APPOINTMENT = 10;

const generatePhoneNumber = () => ({
  countryCode: '+90',
  number: faker.string.numeric(10)
});

const generateCustomerAddress = () => ({
  phoneNumber: faker.string.numeric(10),
  secondaryPhoneNumber: Math.random() > 0.5 ? faker.string.numeric(10) : undefined,
  faxNumber: Math.random() > 0.8 ? faker.string.numeric(10) : undefined,
  email: faker.internet.email(),
  addressText: faker.location.streetAddress(),
  addressCountryId: 'TR',
  addressCityId: faker.string.numeric(2),
  addressDistrictId: faker.string.numeric(4),
  buildingName: Math.random() > 0.5 ? faker.location.buildingNumber() : undefined,
  buildingNumber: Math.random() > 0.5 ? faker.location.buildingNumber() : undefined,
  postalZone: faker.location.zipCode(),
  latitude: faker.location.latitude(),
  longitude: faker.location.longitude()
});

const seedTestData = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut verileri temizle
    await Promise.all([
      Branch.deleteMany({}),
      User.deleteMany({ email: { $ne: 'admin@sistem.com' } }),
      Customer.deleteMany({}),
      Resource.deleteMany({}),
      Appointment.deleteMany({}),
      Currency.deleteMany({}),
      PriceList.deleteMany({}),
      Admission.deleteMany({})
    ]);
    console.log('Mevcut veriler temizlendi');

    // Admin kullanıcısını bul
    const admin = await User.findOne({ email: 'admin@sistem.com' });
    if (!admin) {
      throw new Error('Admin kullanıcısı bulunamadı');
    }

    // Para birimlerini oluştur
    const currencies = await Currency.create([
      {
        name: 'Türk Lirası',
        code: 'TRY',
        symbol: '₺',
        createdPersonId: admin._id,
        isActive: true
      },
      {
        name: 'Amerikan Doları',
        code: 'USD',
        symbol: '$',
        createdPersonId: admin._id,
        isActive: true
      },
      {
        name: 'Euro',
        code: 'EUR',
        symbol: '€',
        createdPersonId: admin._id,
        isActive: true
      }
    ]);
    console.log('Para birimleri oluşturuldu');

    // Fiyat listelerini oluştur
    const priceLists = await PriceList.create([
      {
        priceListName: 'Standart Fiyat Listesi',
        validFrom: new Date(),
        validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        allBranches: true,
        createdPersonId: admin._id,
        currencyId: currencies[0]._id,
        isActive: true
      }
    ]);
    console.log('Fiyat listeleri oluşturuldu');

    // Şubeleri oluştur
    const branches = await Branch.create(
      Array(TOTAL_BRANCHES).fill(null).map((_, index) => ({
        branchName: `${faker.company.name()} Şube ${index + 1}`,
        branchType: 0,
        defaultCurrencyId: currencies[0]._id,
        defaultPriceListId: priceLists[0]._id,
        phoneNumber: generatePhoneNumber(),
        email: faker.internet.email(),
        addressText: faker.location.streetAddress(),
        addressCountryId: 'TR',
        addressCityId: faker.string.numeric(2),
        addressDistrictId: faker.string.numeric(4),
        postalZone: faker.location.zipCode(),
        managerPersonId: admin._id,
        createdPersonId: admin._id,
        companyId: 'MAIN',
        isActive: true
      }))
    );
    console.log(`${TOTAL_BRANCHES} şube oluşturuldu`);

    // Kullanıcıları oluştur
    const users = await User.create(
      Array(TOTAL_USERS).fill(null).map(() => ({
        email: faker.internet.email(),
        password: 'password123',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: generatePhoneNumber(),
        role: faker.helpers.arrayElement(['manager', 'staff', 'customer']),
        branchId: faker.helpers.arrayElement(branches)._id,
        isActive: true,
        rewardPoints: faker.number.int({ min: 0, max: 1000 })
      }))
    );
    console.log(`${TOTAL_USERS} kullanıcı oluşturuldu`);

    // Müşterileri oluştur
    const customers = await Customer.create(
      Array(TOTAL_CUSTOMERS).fill(null).map(() => ({
        citizenType: faker.helpers.arrayElement([1, 2]),
        identityNumber: faker.string.numeric(11),
        citizenCountryId: 'TR',
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        gender: faker.helpers.arrayElement([1, 2]),
        birthDate: faker.date.past(),
        pictureB64: Math.random() > 0.5 ? 'data:image/jpeg;base64,' + faker.string.alphanumeric(100) : undefined,
        customerType: faker.helpers.arrayElement(['individual', 'corporate']),
        loyaltyLevel: faker.helpers.arrayElement(['bronze', 'silver', 'gold', 'platinum']),
        customerAddresses: [generateCustomerAddress()],
        createdPersonId: faker.helpers.arrayElement(users)._id,
        createdBranchId: faker.helpers.arrayElement(branches)._id,
        isActive: true
      }))
    );
    console.log(`${TOTAL_CUSTOMERS} müşteri oluşturuldu`);

    // Resource'ları oluştur
    const resources = await Resource.create(
      Array(TOTAL_RESOURCES).fill(null).map(() => {
        const user = faker.helpers.arrayElement(users);
        return {
          branchId: user.branchId,
          resourceName: `${user.firstName} ${user.lastName}`,
          active: true,
          appointmentActive: true,
          onlineAppointmentActive: Math.random() > 0.3,
          createdPersonId: user._id,
          createdBranchId: user.branchId,
          userId: user._id,
          isDeleted: false
        };
      })
    );
    console.log(`${TOTAL_RESOURCES} resource oluşturuldu`);

    // Her müşteri için randevular oluştur
    const appointments = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // 1 ay öncesi
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 2); // 2 ay sonrası

    for (const customer of customers) {
      for (let i = 0; i < APPOINTMENTS_PER_CUSTOMER; i++) {
        const startTime = faker.date.between({ from: startDate, to: endDate });
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);

        appointments.push({
          resourceId: faker.helpers.arrayElement(resources)._id,
          customerId: customer._id,
          startTime,
          endTime,
          status: faker.helpers.arrayElement(['scheduled', 'completed', 'cancelled']),
          notes: Math.random() > 0.7 ? faker.lorem.sentence() : undefined,
          createdBy: faker.helpers.arrayElement(users)._id,
          createdBranchId: faker.helpers.arrayElement(branches)._id
        });
      }
    }

    const createdAppointments = await Appointment.create(appointments);
    console.log(`${createdAppointments.length} randevu oluşturuldu`);

    // Her randevu için başvurular oluştur
    const admissions = [];
    for (const appointment of createdAppointments) {
      for (let i = 0; i < ADMISSIONS_PER_APPOINTMENT; i++) {
        const resource = await Resource.findById(appointment.resourceId);
        admissions.push({
          branchId: resource?.branchId,
          admissionDate: appointment.startTime,
          personId: resource?.userId,
          priceListId: priceLists[0]._id,
          createdPersonId: appointment.createdBy,
          createdBranchId: appointment.createdBranchId,
          appointmentId: appointment._id,
          notes: Math.random() > 0.7 ? faker.lorem.sentence() : undefined,
          appointmentType: faker.helpers.arrayElement(['initial', 'followup', 'consultation', 'emergency']),
          appointmentStatus: faker.helpers.arrayElement(['scheduled', 'completed', 'cancelled', 'noshow']),
          invoiceNumber: Math.random() > 0.5 ? faker.string.numeric(8) : undefined,
          patientCondition: Math.random() > 0.6 ? faker.lorem.sentence() : undefined,
          referringDoctorId: Math.random() > 0.4 ? faker.helpers.arrayElement(users)._id : undefined,
          expectedDuration: faker.number.int({ min: 15, max: 120 }),
          followUpDate: Math.random() > 0.5 ? faker.date.future() : undefined,
          attachments: Math.random() > 0.7 ? [
            {
              fileName: faker.system.fileName(),
              fileType: faker.system.fileType(),
              fileSize: faker.number.int({ min: 1000, max: 10000000 })
            }
          ] : undefined,
          isActive: true
        });
      }
    }

    await Admission.create(admissions);
    console.log(`${admissions.length} başvuru oluşturuldu`);

    console.log('Test verileri başarıyla oluşturuldu!');
    process.exit(0);
  } catch (error) {
    console.error('Test verileri oluşturulurken hata:', error);
    process.exit(1);
  }
};

seedTestData(); 