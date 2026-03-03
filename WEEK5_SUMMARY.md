# Week 5 Implementation Summary: Order Service + Cart

## ✅ Completed Features

### Backend (Order Service - Port 5003)

#### 1. Service Setup
- ✅ Order service with Express + TypeScript + MongoDB
- ✅ Environment configuration
- ✅ Database connection setup

#### 2. Models
- ✅ **Cart Model**: userId, kitchenId, items[], totalAmount, expiresAt (30min TTL)
- ✅ **Order Model**: orderId, userId, kitchenId, items[], deliveryAddress, timeSlot, status, statusHistory, totalAmount, cancelReason
- ✅ **OrderStatus Enum**: PLACED → CONFIRMED → PREPARING → READY → DELIVERED (+ CANCELLED)

#### 3. Cart Management APIs (`/api/cart`)
- ✅ GET `/` - Get user cart
- ✅ POST `/add` - Add item (validates single kitchen constraint)
- ✅ PATCH `/update/:dishId` - Update quantity
- ✅ DELETE `/remove/:dishId` - Remove item
- ✅ DELETE `/clear` - Clear cart

#### 4. Order Management APIs (`/api/orders`)
- ✅ POST `/create` - Create order from cart with time slot
- ✅ GET `/` - Order history (filtered by role: buyer/cook)
- ✅ GET `/:orderId` - Order details
- ✅ PATCH `/:orderId/status` - Update status (Cook only, validates state machine)
- ✅ PATCH `/:orderId/cancel` - Cancel order (15min window check)

#### 5. Business Logic
- ✅ **Single Kitchen Constraint**: Cart can only contain items from one kitchen
- ✅ **State Machine**: Validates order status transitions
- ✅ **Time Slot Validation**: Minimum 2 hours from now
- ✅ **Cancel Window**: 15 minutes from order placement
- ✅ **Quantity Management**: Updates dish availableQuantity on order/cancel
- ✅ **Cart Expiry**: Auto-expires after 30 minutes of inactivity

#### 6. Real-time Updates (Socket.io)
- ✅ JWT authentication for socket connections
- ✅ Room-based subscriptions: `order:{orderId}`, `user:{userId}`, `kitchen:{kitchenId}`
- ✅ Events: `order:created`, `order:statusChanged`, `order:cancelled`

#### 7. Inter-service Communication
- ✅ Kitchen Service integration: Validate dishes, update quantities
- ✅ Auth Service integration: Fetch user addresses

### Frontend

#### 8. API Layer
- ✅ `cart.api.ts` - Cart CRUD operations
- ✅ `order.api.ts` - Order operations
- ✅ Socket.io client setup

#### 9. Pages
- ✅ **CartPage**: Display items, update quantity, remove items, clear cart
- ✅ **CheckoutPage**: Address selection, time slot picker, order summary
- ✅ **OrdersPage**: Order history list with status badges
- ✅ **OrderDetailPage**: Live order tracking with status timeline, cancel functionality

#### 10. UI Components
- ✅ Badge component for status display
- ✅ RadioGroup component for address selection
- ✅ Real-time status updates via Socket.io

#### 11. Routes
- ✅ `/cart` - Cart page
- ✅ `/checkout` - Checkout flow
- ✅ `/orders` - Order history
- ✅ `/orders/:orderId` - Order tracking

### Kitchen Service Updates
- ✅ GET `/api/menu/:kitchenId/today` - Get today's menu by kitchen
- ✅ PATCH `/api/menu/:kitchenId/dish/:dishId/quantity` - Update dish quantity

## 🎯 Key Features Implemented

1. **Cart Management**
   - Single kitchen constraint enforcement
   - Real-time total calculation
   - Auto-expiry after 30 minutes

2. **Order Placement**
   - Time slot selection (min 2 hours ahead)
   - Address selection from user profile
   - Automatic cart clearing after order

3. **Order Tracking**
   - Real-time status updates via Socket.io
   - Visual status timeline (5 stages)
   - Order history for buyers and cooks

4. **Order Cancellation**
   - 15-minute cancellation window
   - Reason required
   - Automatic quantity restoration

5. **State Machine**
   - Validates status transitions
   - Prevents invalid state changes
   - Maintains status history

## 📁 File Structure

```
services/order/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   ├── db.ts
│   │   └── socket.ts
│   ├── models/
│   │   ├── cart.model.ts
│   │   └── order.model.ts
│   ├── interfaces/
│   │   └── order.interface.ts
│   ├── services/
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── controllers/
│   │   ├── cart.controller.ts
│   │   └── order.controller.ts
│   ├── routes/
│   │   ├── cart.routes.ts
│   │   └── order.routes.ts
│   ├── utils/
│   │   └── http-client.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── .env
└── .env.example

frontend/src/
├── api/
│   ├── cart.api.ts
│   └── order.api.ts
├── pages/
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── OrdersPage.tsx
│   └── OrderDetailPage.tsx
└── components/ui/
    ├── badge.tsx
    └── radio-group.tsx
```

## 🚀 How to Run

### 1. Start Order Service
```bash
cd services/order
cp .env.example .env  # Update with your values
npm install
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm install socket.io-client  # Already done
npm run dev
```

### 3. Ensure Other Services are Running
- Auth Service (Port 5000)
- Kitchen Service (Port 5001)
- Search Service (Port 5002)

## 🔧 Environment Variables

```env
PORT=5003
MONGO_URI=mongodb://localhost:27017/ghar-ka-kitchen-order
JWT_ACCESS_SECRET=your_access_secret_here
KITCHEN_SERVICE_URL=http://localhost:5001
AUTH_SERVICE_URL=http://localhost:5000
```

## 📊 Order Status Flow

```
PLACED → CONFIRMED → PREPARING → READY → DELIVERED
  ↓          ↓
CANCELLED  CANCELLED
(within 15 min)
```

## 🎨 Frontend Features

1. **Cart Page**
   - Empty state with call-to-action
   - Item list with quantity controls
   - Total amount display
   - Clear cart option

2. **Checkout Page**
   - Address selection (radio buttons)
   - Time slot picker (datetime-local input)
   - Order summary
   - Place order button

3. **Orders Page**
   - Order list with status badges
   - Click to view details
   - Sorted by creation date

4. **Order Detail Page**
   - Visual status timeline
   - Real-time updates via Socket.io
   - Order items and total
   - Delivery address and time
   - Cancel order (if within window)

## 🔐 Security

- JWT authentication for all endpoints
- Socket.io authentication with JWT
- Role-based access control (Cook can update status)
- User can only access their own orders

## ✨ Next Steps (Optional Enhancements)

- [ ] Payment integration
- [ ] Order rating and reviews
- [ ] Push notifications
- [ ] Order analytics for cooks
- [ ] Delivery tracking with maps
- [ ] Multiple payment methods
- [ ] Promo codes and discounts

## 📝 Notes

- Cart expires after 30 minutes automatically (MongoDB TTL index)
- Orders can only be cancelled within 15 minutes of placement
- Time slots must be at least 2 hours in the future
- Single kitchen constraint prevents mixing items from different kitchens
- Real-time updates work via Socket.io rooms for efficient broadcasting
