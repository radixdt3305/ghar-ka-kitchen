import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ghar Ka Kitchen — Notification Service',
      version: '1.0.0',
      description: 'Push notifications, email alerts, and in-app notification management',
    },
    servers: [{ url: 'http://localhost:5006', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./dist/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
