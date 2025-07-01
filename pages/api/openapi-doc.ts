// ملف توثيق نقاط التكامل (OpenAPI)
export const openApiDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Realstatelive Open API',
    version: '1.0.0',
    description: 'نقطة نهاية مفتوحة لعرض جميع الوحدات العقارية بصيغة JSON.'
  },
  paths: {
    '/api/openapi': {
      get: {
        summary: 'جلب جميع الوحدات العقارية',
        responses: {
          200: {
            description: 'قائمة الوحدات',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'object' } }
              }
            }
          }
        }
      }
    }
  }
};
