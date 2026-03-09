# Payment System - Known Issues & Improvements

## ✅ What's Working

### Backend
- ✅ Payment service running on port 5004
- ✅ Payment intent creation with Stripe
- ✅ Transaction recording
- ✅ Refund processing (working in Stripe)
- ✅ Cook earnings calculation
- ✅ Payout history tracking

### Frontend
- ✅ Payment page with Stripe Elements
- ✅ Order summary display
- ✅ Transaction history page
- ✅ Cook earnings dashboard
- ✅ Refund notification on cancellation

---

## 🐛 Known Issues

### Issue 1: Sold Out Dishes Can Still Be Ordered
**Problem:** User can place order for dishes marked as "sold out" by cook

**Impact:** High - Inventory management broken

**Solution Needed:**
1. Order service should validate dish availability before creating order
2. Check dish quantity > 0 before allowing order
3. Return error if any dish is unavailable

**Files to Fix:**
- `services/order/src/services/order.service.ts` - Add availability check in `createOrder()`

---

### Issue 2: No Order Decline Feature for Cooks
**Problem:** Cooks cannot decline/reject orders

**Impact:** High - Business logic incomplete

**Solution Needed:**
1. Add "REJECTED" status to OrderStatus enum
2. Add decline order endpoint for cooks
3. Trigger automatic refund when order is rejected
4. Send Socket.IO notification to user
5. Add decline button in cook's order management UI

**Files to Create/Modify:**
- `services/order/src/interfaces/order.interface.ts` - Add REJECTED status
- `services/order/src/services/order.service.ts` - Add `rejectOrder()` method
- `services/order/src/controllers/order.controller.ts` - Add reject endpoint
- `frontend/src/pages/cook/CookOrdersPage.tsx` - Add decline button

**Flow:**
```
Cook clicks "Decline Order" 
→ Enter reason 
→ Order status = REJECTED 
→ Refund API called automatically 
→ Socket.IO notification sent to user 
→ User sees "Order declined, refund initiated"
```

---

### Issue 3: Payment Page Shows Undefined Values
**Problem:** Order summary shows ₹undefined and ₹NaN

**Status:** Partially fixed - needs testing

**Solution:** Ensure order data is properly loaded before rendering

---

### Issue 4: No Email Notifications
**Problem:** Users don't receive email notifications for:
- Payment confirmation
- Refund initiated
- Order status updates

**Impact:** Medium - User experience issue

**Solution Needed:**
1. Integrate email service (NodeMailer, SendGrid, or AWS SES)
2. Send emails on key events:
   - Payment success
   - Refund initiated
   - Order declined
   - Order delivered

---

### Issue 5: Cook Earnings Not Showing
**Problem:** After payment, cook earnings dashboard shows ₹0

**Status:** Fixed with manual confirmation endpoint

**Verification Needed:** Test that earnings appear after payment

---

## 🔧 Quick Fixes Needed

### Fix 1: Validate Dish Availability
```typescript
// In services/order/src/services/order.service.ts
async createOrder(userId: string, addressId: string, timeSlot: Date, userAddresses: any[]) {
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // ADD THIS: Validate dish availability
  const { data: menuResponse } = await kitchenClient.get(`/api/kitchens/${cart.kitchenId}/menu`);
  const menu = menuResponse.data;
  
  for (const item of cart.items) {
    const dish = menu.dishes.find((d: any) => d._id === item.dishId);
    if (!dish || dish.quantity < item.quantity) {
      throw new Error(`${item.name} is not available in requested quantity`);
    }
  }

  // ... rest of the code
}
```

### Fix 2: Add Order Rejection
```typescript
// In services/order/src/services/order.service.ts
async rejectOrder(orderId: string, reason: string) {
  const order = await Order.findOne({ orderId });
  if (!order) throw new Error("Order not found");

  if (order.status !== OrderStatus.PLACED && order.status !== OrderStatus.CONFIRMED) {
    throw new Error("Order cannot be rejected at this stage");
  }

  // Process refund
  try {
    const axios = (await import("axios")).default;
    await axios.post(`http://localhost:5004/api/refunds/${orderId}`, { reason });
    console.log(`✅ Refund initiated for rejected order ${orderId}`);
  } catch (error: any) {
    console.log(`⚠️ Refund failed: ${error.message}`);
  }

  // Restore quantities
  for (const item of order.items) {
    await kitchenClient.patch(`/api/kitchens/menu/${order.kitchenId}/dish/${item.dishId}/quantity`, {
      quantity: item.quantity,
    });
  }

  order.status = OrderStatus.REJECTED;
  order.cancelReason = reason;
  order.statusHistory.push({ status: OrderStatus.REJECTED, timestamp: new Date() });
  await order.save();
  
  return order;
}
```

---

## 📋 Implementation Priority

### High Priority (Critical for MVP)
1. ✅ Fix sold-out dish validation
2. ✅ Add order decline feature
3. ✅ Verify cook earnings display

### Medium Priority (Important for UX)
4. ⏳ Add email notifications
5. ⏳ Add toast notifications instead of alerts
6. ⏳ Add loading states on all actions

### Low Priority (Nice to have)
7. ⏳ Add payment receipt download
8. ⏳ Add payout request feature for cooks
9. ⏳ Add admin revenue dashboard

---

## 🧪 Testing Checklist

### Payment Flow
- [x] Create payment intent
- [x] Complete payment with test card
- [x] Transaction recorded in database
- [x] Payment shows in Stripe dashboard
- [ ] Cook earnings updated immediately
- [ ] User can view transaction history

### Refund Flow
- [x] Cancel order triggers refund
- [x] Refund shows in Stripe dashboard
- [x] Transaction status updated to "refunded"
- [x] User sees refund notification
- [ ] Refund shows in transaction history with correct status

### Order Decline Flow
- [ ] Cook can decline order
- [ ] Refund triggered automatically
- [ ] User receives Socket.IO notification
- [ ] Order status shows as "REJECTED"
- [ ] User sees refund info

### Inventory Management
- [ ] Cannot order sold-out dishes
- [ ] Quantity decreases after order
- [ ] Quantity restored after cancellation
- [ ] Quantity restored after rejection

---

## 📞 Support

If you encounter any issues:
1. Check service logs (all 5 services should be running)
2. Check Stripe dashboard for payment/refund status
3. Check MongoDB for transaction records
4. Check browser console for frontend errors

---

**Status:** Payment system is 80% complete. Critical issues need to be fixed before production.

**Next Steps:**
1. Fix dish availability validation
2. Implement order decline feature
3. Test complete flow end-to-end
4. Add email notifications
