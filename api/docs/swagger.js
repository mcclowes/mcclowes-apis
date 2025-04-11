import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'McClowes API Documentation',
      version: '1.1.0',
      description: 'API documentation for McClowes Todoist integration',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'query',
          name: 'hash',
          description: 'API key for authentication',
        },
      },
    },
    security: [{
      ApiKeyAuth: [],
    }],
  },
  apis: ['./api/todoist/*.js'], // Path to the API docs
};

export const specs = swaggerJsdoc(options); 