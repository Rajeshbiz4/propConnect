import swaggerJsdoc from 'swagger-jsdoc';

const bearerSecurity = [{ bearerAuth: [] }];

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'PropConnect API',
      version: '1.0.0',
      description: 'Backend APIs for PropConnect agent/broker property management platform.'
    },
    servers: [
      { url: '/', description: 'Current server' }
    ],
    tags: [
      { name: 'System' },
      { name: 'Authentication' },
      { name: 'Profile' },
      { name: 'Dashboard' },
      { name: 'Properties' },
      { name: 'Enquiries' },
      { name: 'Public' },
      { name: 'Admin' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'agencyName', 'email', 'mobile', 'password'],
          properties: {
            name: { type: 'string' },
            agencyName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            mobile: { type: 'string' },
            whatsapp: { type: 'string' },
            password: { type: 'string', minLength: 8 },
            city: { type: 'string' },
            officeAddress: { type: 'string' }
          }
        },
        PropertyRequest: {
          type: 'object',
          required: ['title', 'purpose', 'propertyType'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            purpose: { type: 'string', enum: ['rent', 'sale'] },
            propertyType: { type: 'string', enum: ['flat', 'house', 'bungalow', 'plot', 'shop', 'office', 'commercial', 'warehouse', 'pg', 'other'] },
            bhk: { type: 'string' },
            carpetArea: { type: 'number' },
            builtUpArea: { type: 'number' },
            monthlyRent: { type: 'number' },
            deposit: { type: 'number' },
            sellingPrice: { type: 'number' },
            status: { type: 'string' },
            isPublished: { type: 'boolean' },
            address: { type: 'object', additionalProperties: true },
            amenities: { type: 'array', items: { type: 'string' } }
          },
          additionalProperties: true
        }
      }
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['System'],
          summary: 'Check API and database health',
          responses: { '200': { description: 'API is healthy' }, '503': { description: 'Database is unavailable' } }
        }
      },
      '/api/auth/register': {
        post: {
          tags: ['Authentication'], summary: 'Register an agent',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
          responses: { '201': { description: 'Agent registered' }, '400': { description: 'Validation error' }, '409': { description: 'Email already exists' } }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'], summary: 'Login',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: { '200': { description: 'Login successful' }, '401': { description: 'Invalid credentials' } }
        }
      },
      '/api/auth/me': {
        get: { tags: ['Authentication'], summary: 'Get logged-in user', security: bearerSecurity, responses: { '200': { description: 'Current user' }, '401': { description: 'Unauthorized' } } }
      },
      '/api/auth/forgot-password': {
        post: {
          tags: ['Authentication'], summary: 'Generate password reset token',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } }, required: ['email'] } } } },
          responses: { '200': { description: 'Reset request accepted' } }
        }
      },
      '/api/auth/reset-password/{token}': {
        post: {
          tags: ['Authentication'], summary: 'Reset password',
          parameters: [{ in: 'path', name: 'token', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { password: { type: 'string', minLength: 8 } }, required: ['password'] } } } },
          responses: { '200': { description: 'Password reset successful' }, '400': { description: 'Invalid or expired token' } }
        }
      },
      '/api/profile': {
        put: { tags: ['Profile'], summary: 'Update profile', security: bearerSecurity, requestBody: { content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } } }, responses: { '200': { description: 'Profile updated' } } }
      },
      '/api/profile/change-password': {
        put: {
          tags: ['Profile'], summary: 'Change password', security: bearerSecurity,
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string', minLength: 8 } }, required: ['currentPassword', 'newPassword'] } } } },
          responses: { '200': { description: 'Password changed' }, '400': { description: 'Invalid password' } }
        }
      },
      '/api/dashboard': {
        get: { tags: ['Dashboard'], summary: 'Get agent/admin dashboard', security: bearerSecurity, responses: { '200': { description: 'Dashboard counters and recent properties' } } }
      },
      '/api/properties': {
        get: {
          tags: ['Properties'], summary: 'List owned properties', security: bearerSecurity,
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'string' } },
            { in: 'query', name: 'purpose', schema: { type: 'string', enum: ['rent', 'sale'] } },
            { in: 'query', name: 'propertyType', schema: { type: 'string' } }
          ],
          responses: { '200': { description: 'Property list' } }
        },
        post: {
          tags: ['Properties'], summary: 'Create property', security: bearerSecurity,
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PropertyRequest' } } } },
          responses: { '201': { description: 'Property created' }, '400': { description: 'Validation error' } }
        }
      },
      '/api/properties/{id}': {
        get: { tags: ['Properties'], summary: 'Get property', security: bearerSecurity, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Property' }, '404': { description: 'Not found' } } },
        put: { tags: ['Properties'], summary: 'Update property', security: bearerSecurity, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/PropertyRequest' } } } }, responses: { '200': { description: 'Property updated' } } },
        delete: { tags: ['Properties'], summary: 'Archive property', security: bearerSecurity, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Property archived' } } }
      },
      '/api/properties/{id}/duplicate': {
        post: { tags: ['Properties'], summary: 'Duplicate property', security: bearerSecurity, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Property duplicated' } } }
      },
      '/api/properties/{id}/images': {
        post: {
          tags: ['Properties'], summary: 'Upload and optimize property images', security: bearerSecurity,
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { images: { type: 'array', maxItems: 20, items: { type: 'string', format: 'binary' } } } } } } },
          responses: { '201': { description: 'Images uploaded' }, '400': { description: 'Upload/optimization error' } }
        }
      },
      '/api/properties/{id}/images/{imageId}': {
        delete: { tags: ['Properties'], summary: 'Delete property image', security: bearerSecurity, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }, { in: 'path', name: 'imageId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Image deleted' } } }
      },
      '/api/properties/{id}/images/{imageId}/cover': {
        put: { tags: ['Properties'], summary: 'Set cover image', security: bearerSecurity, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }, { in: 'path', name: 'imageId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Cover image updated' } } }
      },
      '/api/enquiries/public': {
        post: {
          tags: ['Enquiries'], summary: 'Create public tenant enquiry',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['propertyId', 'tenantName', 'mobile'], properties: { propertyId: { type: 'string' }, tenantName: { type: 'string' }, mobile: { type: 'string' }, email: { type: 'string', format: 'email' }, message: { type: 'string' } } } } } },
          responses: { '201': { description: 'Enquiry created' } }
        }
      },
      '/api/enquiries': {
        get: { tags: ['Enquiries'], summary: 'List enquiries', security: bearerSecurity, parameters: [{ in: 'query', name: 'status', schema: { type: 'string' } }], responses: { '200': { description: 'Enquiry list' } } }
      },
      '/api/enquiries/{id}/status': {
        put: { tags: ['Enquiries'], summary: 'Update enquiry status', security: bearerSecurity, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } }, required: ['status'] } } } }, responses: { '200': { description: 'Status updated' } } }
      },
      '/api/public/agents/{slug}': {
        get: { tags: ['Public'], summary: 'Get public agent profile', parameters: [{ in: 'path', name: 'slug', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Public agent profile' }, '404': { description: 'Agent not found' } } }
      },
      '/api/public/agents/{slug}/properties': {
        get: {
          tags: ['Public'], summary: 'List public properties for agent',
          parameters: [
            { in: 'path', name: 'slug', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'purpose', schema: { type: 'string' } },
            { in: 'query', name: 'propertyType', schema: { type: 'string' } },
            { in: 'query', name: 'bhk', schema: { type: 'string' } },
            { in: 'query', name: 'city', schema: { type: 'string' } },
            { in: 'query', name: 'area', schema: { type: 'string' } },
            { in: 'query', name: 'minPrice', schema: { type: 'number' } },
            { in: 'query', name: 'maxPrice', schema: { type: 'number' } }
          ],
          responses: { '200': { description: 'Public property list' } }
        }
      },
      '/api/public/agents/{slug}/properties/{id}': {
        get: { tags: ['Public'], summary: 'Get public property details', parameters: [{ in: 'path', name: 'slug', required: true, schema: { type: 'string' } }, { in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Public property details' }, '404': { description: 'Property not found' } } }
      },
      '/api/admin/dashboard': {
        get: { tags: ['Admin'], summary: 'Get admin dashboard', security: bearerSecurity, responses: { '200': { description: 'Admin dashboard' } } }
      },
      '/api/admin/agents': {
        get: { tags: ['Admin'], summary: 'List agents', security: bearerSecurity, responses: { '200': { description: 'Agent list' } } }
      },
      '/api/admin/agents/{id}/status': {
        put: { tags: ['Admin'], summary: 'Update agent status', security: bearerSecurity, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['active', 'blocked'] } }, required: ['status'] } } } }, responses: { '200': { description: 'Agent status updated' } } }
      },
      '/api/admin/properties': {
        get: { tags: ['Admin'], summary: 'List all properties', security: bearerSecurity, responses: { '200': { description: 'All properties' } } }
      }
    }
  },
  apis: []
});

export default swaggerSpec;
