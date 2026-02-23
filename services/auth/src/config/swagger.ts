import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ghar Ka Kitchen - Auth Service API",
      version: "1.0.0",
      description:
        "Authentication and authorization service for Ghar Ka Kitchen food delivery platform",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Address: {
          type: "object",
          required: ["label", "street", "city", "pincode", "lat", "lng"],
          properties: {
            label: { type: "string", example: "Home" },
            street: { type: "string", example: "123 MG Road" },
            city: { type: "string", example: "Mumbai" },
            pincode: { type: "string", example: "400001" },
            lat: { type: "number", example: 19.076 },
            lng: { type: "number", example: 72.8777 },
            isDefault: { type: "boolean", default: false },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "phone", "password"],
          properties: {
            name: { type: "string", example: "Rahul Sharma" },
            email: {
              type: "string",
              format: "email",
              example: "rahul@example.com",
            },
            phone: { type: "string", example: "9876543210" },
            password: { type: "string", example: "Str0ng@Pass!" },
            role: {
              type: "string",
              enum: ["buyer", "cook", "admin", "delivery"],
              default: "buyer",
            },
            addresses: {
              type: "array",
              items: { $ref: "#/components/schemas/Address" },
              description: "Optional initial addresses (can be added later)",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        VerifyOtpRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", format: "email" },
            otp: { type: "string", example: "123456" },
            purpose: {
              type: "string",
              enum: ["registration", "password_reset", "login"],
            },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
        ResendOtpRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "rahul@example.com",
            },
            purpose: {
              type: "string",
              enum: ["registration", "password_reset", "login"],
              default: "registration",
            },
          },
        },
      },
    },
  },
  apis: ["./dist/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
