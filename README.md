# Ghar Ka Kitchen

A microservices-based food delivery platform built with Node.js, Express, TypeScript, and MongoDB.

## Services

| Service | Port | Description |
|---------|------|-------------|
| auth    | 5000 | Authentication & user management |
| kitchen | 5001 | Kitchen & menu management |
| search  | 5002 | Search & discovery |
| order   | 5003 | Cart & order management |
| payment | 5004 | Payment processing & cook payouts |

## Tech Stack

- **Runtime**: Node.js (ESM)
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (access + refresh token rotation)
- **Real-time**: Socket.io (order tracking)
- **Payments**: Stripe (Connect for payouts)
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

### Kitchen Service

```bash
cd services/kitchen
cp .env.example .env
npm install
npm run dev
```

### Search Service

```bash
cd services/search
cp .env.example .env
npm install
npm run dev
```

### Order Service

```bash
cd services/order
cp .env.example .env
npm install
npm run dev
```

### Payment Service

```bash
cd services/payment
cp .env.example .env        # Add Stripe keys
npm install
npm run dev
```

Swagger docs: `http://localhost:5004/api-docs`

## API Overview

### Auth (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/verify-otp` | Verify OTP after registration |
| POST | `/resend-otp` | Resend expired OTP |
| POST | `/login` | Login with email + password |
| POST | `/refresh-token` | Refresh access token |

### Cart (`/api/cart`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user cart |
| POST | `/add` | Add item to cart |
| PATCH | `/update/:dishId` | Update item quantity |
| DELETE | `/remove/:dishId` | Remove item from cart |
| DELETE | `/clear` | Clear cart |

### Orders (`/api/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create order from cart |
| GET | `/` | Get order history |
| GET | `/:orderId` | Get order details |
| PATCH | `/:orderId/status` | Update order status (Cook) |
| PATCH | `/:orderId/cancel` | Cancel order |

### Payments (`/api/payments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-intent` | Create payment intent |
| POST | `/webhook` | Stripe webhook handler |
| GET | `/transaction/:orderId` | Get transaction details |
| GET | `/history` | Payment history |

### Payouts (`/api/payouts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/connect-account` | Setup Stripe Connect |
| GET | `/earnings` | Cook earnings summary |
| POST | `/trigger` | Manual payout |
| GET | `/history` | Payout history |
