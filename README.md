# Ghar Ka Kitchen

A microservices-based food delivery platform built with Node.js, Express, TypeScript, and MongoDB.

## Services

| Service | Port | Description |
|---------|------|-------------|
| auth    | 5000 | Authentication & user management |

## Tech Stack

- **Runtime**: Node.js (ESM)
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (access + refresh token rotation)
- **Docs**: Swagger UI (`/api-docs`)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance

### Auth Service

```bash
cd services/auth
cp .env.example .env        # fill in your values
npm install
npm run dev                  # starts tsc --watch + node --watch
```

Swagger docs: `http://localhost:5000/api-docs`

## API Overview

### Auth (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/verify-otp` | Verify OTP after registration |
| POST | `/resend-otp` | Resend expired OTP |
| POST | `/login` | Login with email + password |
| POST | `/refresh-token` | Refresh access token |
