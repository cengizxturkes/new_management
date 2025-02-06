import Branch from '../models/Branch';
import User, { IUser } from '../models/User';
import Currency from '../models/Currency';
import PriceList from '../models/PriceList';
import fs from 'fs';
import Location from '../models/Location';

const defaultBranch = {
  branchName: 'Ana Şube',
  branchType: 0,
  email: 'anasube@sistem.com',
  address: 'Atatürk Caddesi No: 123',
  phone: '+902165555555',
  phoneNumber: {
    countryCode: '+90',
    number: '2165555555'
  },
  companyId: 'MAIN',
  isActive: true
};

const defaultAdmin: Partial<IUser> = {
  email: 'admin@sistem.com',
  password: 'Admin123!',
  firstName: 'Sistem',
  lastName: 'Yöneticisi',
  phoneNumber: {
    countryCode: '+90',
    number: '5555555555'
  },
  role: 'admin' as const,
  isActive: true
};

// Varsayılan para birimlerini ekle
const defaultCurrencies = [
  {
    code: 'TRY',
    name: 'Türk Lirası',
    symbol: '₺',
    isActive: true
  },
  {
    code: 'USD',
    name: 'Amerikan Doları',
    symbol: '$',
    isActive: true
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    isActive: true
  }
];

const defaultPriceList = {
  priceListName: 'Varsayılan Fiyat Listesi',
  validFrom: new Date(),
  validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 yıl geçerli
  allBranches: true,
  isActive: true
};

const loadLocationData = async () => {
  try {
    console.log('Lokasyon verilerini yükleme başladı...');
    
    // Mevcut şehir ve ilçe verilerini kontrol et
    const existingCities = await Location.countDocuments();
    if (existingCities > 0) {
      console.log('Lokasyon verileri zaten mevcut.');
      return;
    }

    // JSON dosyalarını oku
    const cities = JSON.parse(fs.readFileSync('sehirler.json', 'utf8'));
    const districts = JSON.parse(fs.readFileSync('ilceler.json', 'utf8'));

    // Her şehir için ilçeleri eşleştir ve kaydet
    for (const city of cities) {
      const cityDistricts = districts.filter(
        (d: any) => d.sehir_id === city.sehir_id
      ).map((d: any) => ({
        districtId: d.ilce_id,
        districtName: d.ilce_adi
      }));

      await Location.create({
        cityId: city.sehir_id,
        cityName: city.sehir_adi,
        districts: cityDistricts
      });
    }

    console.log('Lokasyon verileri başarıyla yüklendi.');
  } catch (error) {
    console.error('Lokasyon verileri yüklenirken hata:', error);
    throw error;
  }
};

export const seedInitialData = async (): Promise<void> => {
  try {
    console.log('Başlangıç verilerini kontrol ediliyor...');
    
    // Lokasyon verilerini yükle
    await loadLocationData();
    
    // Para birimlerini ekle
    let defaultCurrency;
    for (const currency of defaultCurrencies) {
      const existingCurrency = await Currency.findOne({ code: currency.code });
      if (!existingCurrency) {
        const newCurrency = await Currency.create(currency);
        if (currency.code === 'TRY') {
          defaultCurrency = newCurrency;
        }
      } else if (currency.code === 'TRY') {
        defaultCurrency = existingCurrency;
      }
    }

    if (!defaultCurrency) {
      throw new Error('Varsayılan para birimi (TRY) oluşturulamadı');
    }

    // Admin kullanıcısını oluştur (önce oluşturmalıyız çünkü Branch için gerekli)
    let adminUser = await User.findOne({ email: defaultAdmin.email });
    if (!adminUser) {
      console.log('Varsayılan admin kullanıcısı oluşturuluyor...');
      adminUser = await User.create(defaultAdmin);
      console.log('Admin kullanıcısı oluşturuldu:', adminUser.email);
    }

    // Varsayılan fiyat listesini oluştur
    let mainPriceList = await PriceList.findOne({ priceListName: defaultPriceList.priceListName });
    if (!mainPriceList) {
      console.log('Varsayılan fiyat listesi oluşturuluyor...');
      mainPriceList = await PriceList.create({
        ...defaultPriceList,
        currencyId: defaultCurrency._id,
        createdPersonId: adminUser._id
      });
      console.log('Varsayılan fiyat listesi oluşturuldu');
    }

    // Ana şube kontrolü
    let mainBranch = await Branch.findOne({ branchName: defaultBranch.branchName });
    
    if (!mainBranch) {
      console.log('Ana şube oluşturuluyor...');
      mainBranch = await Branch.create({
        ...defaultBranch,
        defaultCurrencyId: defaultCurrency._id,
        defaultPriceListId: mainPriceList._id,
        managerPersonId: adminUser._id,
        createdPersonId: adminUser._id
      });


      // PriceList'i güncelle
      await PriceList.findByIdAndUpdate(mainPriceList._id, {
        createdBranchId: mainBranch._id
      });
    }

    // Admin kullanıcısının branchId'sini güncelle
    if (!adminUser.branchId) {
      await User.findByIdAndUpdate(adminUser._id, {
        branchId: mainBranch._id
      });
    }

    console.log('Başlangıç verileri kontrolü tamamlandı.');
  } catch (error) {
    console.error('Seed data oluşturulurken hata:', error);
    throw error;
  }
}; 