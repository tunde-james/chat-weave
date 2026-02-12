import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chat Weave API',
      version: '1.0.0',
      description:
        'API documentation for Chat Weave - A real-time chat and threads platform',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from Clerk authentication',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'integer',
              description: 'HTTP status code',
              example: 400,
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Bad Request',
            },
            requestId: {
              type: 'string',
              description: 'Request correlation ID',
              example: 'abc123-def456',
            },
            details: {
              type: 'array',
              description: 'Validation error details',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Thread: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            body: { type: 'string' },
            excerpt: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            author: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                handle: { type: 'string' },
                displayName: { type: 'string' },
                avatarUrl: { type: 'string' },
              },
            },
            category: {
              type: 'object',
              properties: {
                slug: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            slug: { type: 'string' },
            name: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            clerkId: { type: 'string' },
            handle: { type: 'string' },
            displayName: { type: 'string' },
            bio: { type: 'string' },
            avatarUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            type: { type: 'string', enum: ['REPLY', 'LIKE', 'FOLLOW'] },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            actor: { $ref: '#/components/schemas/User' },
            thread: { $ref: '#/components/schemas/Thread' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        BadRequestError: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        TooManyRequestsError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/modules/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
