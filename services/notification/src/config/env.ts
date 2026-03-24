import 'dotenv/config';

interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
  JWT_ACCESS_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  CORS_ORIGIN: string;
  NODE_ENV: string;
}

function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if ((value === undefined || value === '') && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? '';
}

export const env: EnvConfig = {
  PORT: parseInt(process.env['PORT'] ?? '5006', 10),
  MONGO_URI: getEnv('MONGO_URI'),
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
  RESEND_API_KEY: getEnv('RESEND_API_KEY'),
  RESEND_FROM_EMAIL: process.env['RESEND_FROM_EMAIL'] ?? 'onboarding@resend.dev',
  // Firebase vars are optional — service runs without them
  FIREBASE_PROJECT_ID: process.env['FIREBASE_PROJECT_ID'] ?? '',
  FIREBASE_CLIENT_EMAIL: process.env['FIREBASE_CLIENT_EMAIL'] ?? '',
  FIREBASE_PRIVATE_KEY: process.env['FIREBASE_PRIVATE_KEY'] ?? '',
  CORS_ORIGIN: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
};
