# Ghar Ka Kitchen - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                      http://localhost:5173                       │
│                                                                   │
│  Pages: Home | Discovery | Cart | Checkout | Orders | Profile   │
│  Real-time: Socket.io Client for Order Tracking                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Microservices Layer                         │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│             │             │             │                       │
│  Auth       │  Kitchen    │  Search     │  Order                │
│  Service    │  Service    │  Service    │  Service              │
│  :5000      │  :5001      │  :5002      │  :5003                │
│             │             │             │                       │
│  • Register │  • Kitchen  │  • Elastic  │  • Cart Management    │
│  • Login    │    CRUD     │    Search   │  • Order Creation     │
│  • OTP      │  • Menu     │  • Filters  │  • Status Updates     │
│  • JWT      │    CRUD     │  • Geo      │  • Real-time (Socket) │
│  • Profile  │  • Approval │    Search   │  • Cancellation       │
│             │             │             │                       │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
       │              │              │              │
       │              │              │              │
       ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                              │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│             │             │             │                       │
│  MongoDB    │  MongoDB    │ Elasticsearch│  MongoDB             │
│  (Auth)     │  (Kitchen)  │  (Search)   │  (Order)             │
│             │             │             │                       │
│  • Users    │  • Kitchens │  • Indexed  │  • Carts (TTL 30min) │
│  • OTPs     │  • Menus    │    Dishes   │  • Orders            │
│  • Tokens   │  • Dishes   │  • Kitchens │  • Status History    │
│             │             │             │                       │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
```

## Service Communication

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Order   │────────▶│ Kitchen  │────────▶│   Auth   │
│ Service  │  HTTP   │ Service  │  HTTP   │ Service  │
└──────────┘         └──────────┘         └──────────┘
     │                     │                     │
     │                     │                     │
     ▼                     ▼                     ▼
Validate Dish        Update Quantity      Get User Address
Get Menu             Check Availability   Verify User
```

## Order Flow Sequence

```
Buyer                Frontend              Order Service         Kitchen Service
  │                     │                       │                      │
  │──Add to Cart───────▶│                       │                      │
  │                     │──POST /cart/add──────▶│                      │
  │                     │                       │──Validate Dish──────▶│
  │                     │                       │◀─────────────────────│
  │                     │◀──Cart Updated────────│                      │
  │                     │                       │                      │
  │──Checkout──────────▶│                       │                      │
  │                     │──POST /orders/create─▶│                      │
  │                     │                       │──Update Quantity────▶│
  │                     │                       │◀─────────────────────│
  │                     │◀──Order Created───────│                      │
  │                     │                       │                      │
  │                     │◀──Socket: order:created──────────────────────│
  │◀──Real-time Update─│                       │                      │
```

## Real-time Architecture (Socket.io)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Socket.io Server                            │
│                    (Order Service :5003)                         │
│                                                                   │
│  Rooms:                                                          │
│  • user:{userId}      - User-specific updates                   │
│  • order:{orderId}    - Order-specific updates                  │
│  • kitchen:{kitchenId} - Kitchen-specific updates (for cooks)   │
│                                                                   │
│  Events:                                                         │
│  • order:created      - New order placed                        │
│  • order:statusChanged - Status updated                         │
│  • order:cancelled    - Order cancelled                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Connected Clients                             │
├──────────────────────┬──────────────────────┬───────────────────┤
│                      │                      │                    │
│  Buyer (Browser)     │  Cook (Browser)      │  Admin (Future)   │
│  • Joins user room   │  • Joins user room   │  • Joins all      │
│  • Joins order room  │  • Joins kitchen room│    rooms          │
│  • Receives updates  │  • Receives orders   │  • Monitors all   │
│                      │  • Updates status    │                    │
└──────────────────────┴──────────────────────┴───────────────────┘
```

## Order State Machine

```
                    ┌──────────┐
                    │  PLACED  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │CONFIRMED │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │PREPARING │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  READY   │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │DELIVERED │
                    └──────────┘

Cancel allowed from PLACED/CONFIRMED within 15 minutes:
    PLACED ──────▶ CANCELLED
    CONFIRMED ───▶ CANCELLED
```

## Data Models

### Cart Model
```typescript
{
  userId: string,
  kitchenId: string,
  items: [
    {
      dishId: string,
      name: string,
      price: number,
      quantity: number
    }
  ],
  totalAmount: number,
  expiresAt: Date  // TTL index: 30 minutes
}
```

### Order Model
```typescript
{
  orderId: string,  // nanoid(10)
  userId: string,
  kitchenId: string,
  items: [
    {
      dishId: string,
      name: string,
      price: number,
      quantity: number
    }
  ],
  deliveryAddress: {
    label: string,
    street: string,
    city: string,
    pincode: string,
    lat: number,
    lng: number
  },
  timeSlot: Date,
  status: OrderStatus,
  statusHistory: [
    {
      status: OrderStatus,
      timestamp: Date
    }
  ],
  totalAmount: number,
  cancelReason?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Authentication Flow                         │
│                                                                   │
│  1. User Login ──▶ Auth Service ──▶ Generate JWT Tokens         │
│                                      • Access Token (15min)      │
│                                      • Refresh Token (7days)     │
│                                                                   │
│  2. API Request ──▶ Middleware ──▶ Verify Access Token          │
│                                                                   │
│  3. Token Expired ──▶ Frontend ──▶ Refresh Token Endpoint       │
│                                                                   │
│  4. Socket.io ──▶ Auth Middleware ──▶ Verify JWT in handshake  │
└─────────────────────────────────────────────────────────────────┘
```

## Shared Authentication Package

```
packages/shared-auth/
├── auth.middleware.ts    - JWT verification
├── role.middleware.ts    - Role-based access control
├── token.util.ts         - Token generation/validation
└── types.ts              - Shared types

Used by: Auth, Kitchen, Search, Order services
```

## Database Indexes

### Order Service
```javascript
// Cart
{ userId: 1 }  // unique
{ expiresAt: 1 }  // TTL index

// Order
{ orderId: 1 }  // unique
{ userId: 1, createdAt: -1 }
{ kitchenId: 1, createdAt: -1 }
{ status: 1 }
```

## API Gateway (Future Enhancement)

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (Future)                        │
│                      http://localhost:8000                       │
│                                                                   │
│  Routes:                                                         │
│  • /api/auth/*     ──▶ Auth Service :5000                       │
│  • /api/kitchen/*  ──▶ Kitchen Service :5001                    │
│  • /api/search/*   ──▶ Search Service :5002                     │
│  • /api/orders/*   ──▶ Order Service :5003                      │
│  • /api/cart/*     ──▶ Order Service :5003                      │
│                                                                   │
│  Features:                                                       │
│  • Rate limiting                                                 │
│  • Request logging                                               │
│  • Load balancing                                                │
│  • Circuit breaker                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                            │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Frontend    │      │  Frontend    │      │  Frontend    │
│  Instance 1  │      │  Instance 2  │      │  Instance 3  │
└──────────────┘      └──────────────┘      └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Service    │      │   Service    │      │   Service    │
│  Instances   │      │  Instances   │      │  Instances   │
│  (Scaled)    │      │  (Scaled)    │      │  (Scaled)    │
└──────────────┘      └──────────────┘      └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  MongoDB Cluster │
                    │  (Replica Set)   │
                    └──────────────────┘
```

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB (Mongoose), Elasticsearch |
| Real-time | Socket.io |
| Authentication | JWT (access + refresh tokens) |
| API Documentation | Swagger UI |
| Package Manager | npm |
| Module System | ESM (ES Modules) |

## Performance Considerations

1. **Database Indexes**: Optimized queries with proper indexes
2. **TTL Indexes**: Auto-cleanup of expired carts
3. **Socket.io Rooms**: Efficient real-time broadcasting
4. **Connection Pooling**: Mongoose default pooling
5. **Caching** (Future): Redis for frequently accessed data
6. **CDN** (Future): Static asset delivery

## Scalability Strategy

1. **Horizontal Scaling**: Multiple service instances
2. **Database Sharding**: Partition by userId or kitchenId
3. **Message Queue** (Future): RabbitMQ/Kafka for async tasks
4. **Microservices**: Independent scaling per service
5. **Load Balancing**: Distribute traffic across instances

## Monitoring & Logging (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Monitoring Stack                            │
├─────────────────────────────────────────────────────────────────┤
│  • Prometheus - Metrics collection                              │
│  • Grafana - Visualization                                      │
│  • ELK Stack - Centralized logging                              │
│  • Sentry - Error tracking                                      │
│  • New Relic - APM                                              │
└─────────────────────────────────────────────────────────────────┘
```

This architecture provides a solid foundation for a scalable, maintainable food delivery platform! 🚀
