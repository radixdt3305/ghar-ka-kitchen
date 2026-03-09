# Complete Implementation - Dish Validation & Order Rejection

## ✅ Backend Implementation

### 1. Dish Availability Validation
**File**: `services/order/src/services/order.service.ts`

**Checks**:
- ✅ Dish exists in menu
- ✅ Dish status is 'available' (not sold_out/unavailable)
- ✅ Sufficient quantity available

**Error Messages**:
- "Biryani is no longer available"
- "Biryani is currently sold_out"
- "Biryani - Only 5 available, you requested 10"

### 2. Order Rejection with Auto-Refund
**Files Created**:
- `services/payment/src/services/refund.service.ts`
- `services/payment/src/controllers/refund.controller.ts`
- `services/payment/src/routes/refund.routes.ts`

**Files Modified**:
- `services/order/src/services/order.service.ts` - Added rejectOrder()
- `services/order/src/controllers/order.controller.ts` - Added rejectOrder controller
- `services/order/src/routes/order.routes.ts` - Added PATCH /orders/:orderId/reject

**API Endpoint**: `PATCH /api/orders/:orderId/reject` (Cook only)

## ✅ Frontend Implementation

### 1. Order API Updates
**File**: `frontend/src/api/order.api.ts`

**Changes**:
- Added `REJECTED` status to OrderStatus enum
- Added `rejectOrder()` API method

### 2. Cook Orders Page UI
**File**: `frontend/src/pages/cook/CookOrdersPage.tsx`

**New Features**:
- ✅ "Reject" button appears for PLACED and CONFIRMED orders
- ✅ Prompts cook for rejection reason
- ✅ Shows reject button next to confirm button
- ✅ Red badge for REJECTED orders
- ✅ Filters out REJECTED orders from "Active" view

**UI Layout**:
```
[Confirm Order] [Reject]  <- For PLACED orders
[Start Preparing] [Reject] <- For CONFIRMED orders
```

## How It Works

### Order Placement Flow:
1. User adds items to cart
2. User clicks "Place Order"
3. System validates:
   - Dish exists ✅
   - Dish status = 'available' ✅
   - Sufficient quantity ✅
4. If validation fails → Error shown
5. If validation passes → Order created

### Order Rejection Flow:
1. Cook sees new order with [Confirm] [Reject] buttons
2. Cook clicks "Reject"
3. Popup asks for reason
4. System:
   - Processes Stripe refund automatically
   - Restores dish quantities
   - Updates order status to REJECTED
   - Notifies user via Socket.io
5. User sees order as REJECTED with refund processed

## Testing

### Test Sold Out Validation:
1. Cook marks dish as "sold_out"
2. User tries to place order with that dish
3. Error: "Biryani is currently sold_out"

### Test Reject Order:
1. User places order
2. Cook clicks "Reject" button
3. Enter reason: "Ingredients not available"
4. Order status → REJECTED
5. Refund processed automatically
6. Dish quantities restored

## API Endpoints Summary

```bash
# Reject order (Cook only)
PATCH /api/orders/:orderId/reject
Authorization: Bearer <cook_token>
Body: { "reason": "Ingredients not available" }

# Process refund (Internal)
POST /api/refunds/:orderId
Body: { "reason": "Order rejected by cook" }
```
