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