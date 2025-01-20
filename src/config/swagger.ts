import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'İşletme Yönetim Sistemi API',
      version: '1.0.0',
      description: 'İşletme yönetim sistemi için REST API dökümantasyonu',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Geliştirme sunucusu',
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'Kullanıcı yönetimi işlemleri'
      },
      {
        name: 'Branches',
        description: 'Şube yönetimi işlemleri'
      },
      {
        name: 'Locations',
        description: 'Lokasyon yönetimi işlemleri'
      }
    ],
    components: {
      schemas: {
        Location: {
          type: 'object',
          properties: {
            cityId: {
              type: 'string',
              description: 'Şehir ID'
            },
            cityName: {
              type: 'string',
              description: 'Şehir adı'
            },
            districts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  districtId: {
                    type: 'string',
                    description: 'İlçe ID'
                  },
                  districtName: {
                    type: 'string',
                    description: 'İlçe adı'
                  }
                }
              }
            }
          },
          example: {
            cityId: "34",
            cityName: "İSTANBUL",
            districts: [
              {
                districtId: "1234",
                districtName: "KADIKÖY"
              },
              {
                districtId: "1235",
                districtName: "BEŞİKTAŞ"
              }
            ]
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            isSuccess: {
              type: 'boolean',
              description: 'İşlem başarı durumu'
            },
            message: {
              type: 'string',
              description: 'İşlem mesajı'
            },
            statusCode: {
              type: 'number',
              description: 'HTTP durum kodu'
            },
            data: {
              type: 'object',
              description: 'Dönen veri'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'İşlem zamanı'
            }
          }
        },
        PriceList: {
          type: 'object',
          required: [
            'priceListName',
            'validFrom',
            'validTo',
            'createdPersonId',
            'currencyId'
          ],
          properties: {
            priceListName: {
              type: 'string',
              description: 'Fiyat listesi adı'
            },
            validFrom: {
              type: 'string',
              format: 'date-time',
              description: 'Geçerlilik başlangıç tarihi'
            },
            validTo: {
              type: 'string',
              format: 'date-time',
              description: 'Geçerlilik bitiş tarihi'
            },
            allBranches: {
              type: 'boolean',
              description: 'Tüm şubelerde geçerli mi?',
              default: false
            },
            createdPersonId: {
              type: 'string',
              format: 'uuid',
              description: 'Oluşturan kullanıcı ID'
            },
            createdBranchId: {
              type: 'string',
              format: 'uuid',
              description: 'Oluşturan şube ID'
            },
            currencyId: {
              type: 'string',
              format: 'uuid',
              description: 'Para birimi ID'
            },
            branchIds: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid'
              },
              description: 'Geçerli olduğu şube IDleri'
            },
            isActive: {
              type: 'boolean',
              description: 'Aktif mi?',
              default: true
            }
          },
          example: {
            priceListName: '2024 Ocak Fiyat Listesi',
            validFrom: '2024-01-01T00:00:00.000Z',
            validTo: '2024-12-31T23:59:59.999Z',
            allBranches: true,
            currencyId: '60d5ecb8b5c9c62b3c7c1b5f',
            branchIds: ['60d5ecb8b5c9c62b3c7c1b5e'],
            isActive: true
          }
        },
        Customer: {
          type: 'object',
          required: [
            'citizenType',
            'identityNumber',
            'citizenCountryId',
            'name',
            'surname',
            'gender',
            'birthDate',
            'customerType',
            'customerAddresses'
          ],
          properties: {
            citizenType: {
              type: 'number',
              enum: [1, 2],
              description: '1: Yerli, 2: Yabancı'
            },
            identityNumber: {
              type: 'string',
              description: 'TC Kimlik No veya Yabancı Kimlik No'
            },
            citizenCountryId: {
              type: 'string',
              description: 'Vatandaşlık ülkesi ID'
            },
            name: {
              type: 'string',
              description: 'Müşteri adı'
            },
            surname: {
              type: 'string',
              description: 'Müşteri soyadı'
            },
            gender: {
              type: 'number',
              enum: [1, 2],
              description: '1: Erkek, 2: Kadın'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              description: 'Doğum tarihi'
            },
            pictureB64: {
              type: 'string',
              description: 'Base64 formatında profil fotoğrafı'
            },
            notes: {
              type: 'string',
              description: 'Genel notlar'
            },
            eInvoiceType: {
              type: 'number',
              enum: [0, 1, 2],
              description: 'E-Fatura tipi'
            },
            eInvoiceIdentityType: {
              type: 'number',
              enum: [0, 1, 2],
              description: 'E-Fatura kimlik tipi'
            },
            taxNumber: {
              type: 'string',
              description: 'Vergi numarası'
            },
            taxPlace: {
              type: 'string',
              description: 'Vergi dairesi'
            },
            companyTitle: {
              type: 'string',
              description: 'Firma ünvanı'
            },
            customerType: {
              type: 'string',
              enum: ['individual', 'corporate'],
              description: 'Müşteri tipi: Bireysel veya Kurumsal'
            },
            loyaltyLevel: {
              type: 'string',
              enum: ['bronze', 'silver', 'gold', 'platinum'],
              description: 'Sadakat seviyesi'
            },
            creditLimit: {
              type: 'number',
              description: 'Kredi limiti'
            },
            outstandingBalance: {
              type: 'number',
              description: 'Bakiye'
            },
            contractStartDate: {
              type: 'string',
              format: 'date',
              description: 'Sözleşme başlangıç tarihi'
            },
            contractEndDate: {
              type: 'string',
              format: 'date',
              description: 'Sözleşme bitiş tarihi'
            },
            contractTerms: {
              type: 'string',
              description: 'Sözleşme şartları'
            },
            vatNumber: {
              type: 'string',
              description: 'KDV numarası'
            },
            legalEntityType: {
              type: 'string',
              description: 'Tüzel kişilik tipi'
            },
            lastContactDate: {
              type: 'string',
              format: 'date',
              description: 'Son iletişim tarihi'
            },
            preferredContactMethod: {
              type: 'string',
              enum: ['email', 'phone', 'sms'],
              description: 'Tercih edilen iletişim yöntemi'
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  fileName: {
                    type: 'string'
                  },
                  fileType: {
                    type: 'string'
                  },
                  fileSize: {
                    type: 'number'
                  }
                }
              },
              description: 'Ekli dosyalar'
            },
            additionalNotes: {
              type: 'string',
              description: 'Ek notlar'
            },
            customerAddresses: {
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'phoneNumber',
                  'email',
                  'addressText',
                  'addressCountryId',
                  'addressCityId',
                  'addressDistrictId',
                  'postalZone'
                ],
                properties: {
                  phoneNumber: {
                    type: 'string',
                    pattern: '^\d{10}$',
                    description: '10 haneli telefon numarası'
                  },
                  secondaryPhoneNumber: {
                    type: 'string',
                    description: 'İkincil telefon numarası'
                  },
                  faxNumber: {
                    type: 'string',
                    description: 'Faks numarası'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'E-posta adresi'
                  },
                  addressText: {
                    type: 'string',
                    description: 'Açık adres'
                  },
                  addressCountryId: {
                    type: 'string',
                    description: 'Ülke ID'
                  },
                  addressCityId: {
                    type: 'string',
                    description: 'Şehir ID'
                  },
                  addressDistrictId: {
                    type: 'string',
                    description: 'İlçe ID'
                  },
                  buildingName: {
                    type: 'string',
                    description: 'Bina adı'
                  },
                  buildingNumber: {
                    type: 'string',
                    description: 'Bina numarası'
                  },
                  postalZone: {
                    type: 'string',
                    description: 'Posta kodu'
                  },
                  latitude: {
                    type: 'number',
                    description: 'Enlem'
                  },
                  longitude: {
                    type: 'number',
                    description: 'Boylam'
                  }
                }
              }
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Müşteri aktif mi?'
            }
          },
          example: {
            citizenType: 1,
            identityNumber: "12345678901",
            citizenCountryId: "TR",
            name: "Ahmet",
            surname: "Yılmaz",
            gender: 1,
            birthDate: "1990-01-01",
            customerType: "individual",
            customerAddresses: [
              {
                phoneNumber: "5321234567",
                email: "ahmet@example.com",
                addressText: "Atatürk Cad. No:123",
                addressCountryId: "TR",
                addressCityId: "34",
                addressDistrictId: "1234",
                postalZone: "34100"
              }
            ]
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: [
    './src/routes/*.ts',
    './src/models/*.ts',
    './src/controllers/*.ts'
  ],
};

export const specs = swaggerJsdoc(options); 