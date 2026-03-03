# Quick Start Guide: Testing Order Flow

## Prerequisites
- All services running (auth, kitchen, search, order)
- MongoDB running
- At least one approved kitchen with today's menu
- User account with saved addresses

## Step-by-Step Testing

### 1. Start All Services

```bash
# Terminal 1 - Auth Service
cd services/auth
npm run dev

# Terminal 2 - Kitchen Service
cd services/kitchen
npm run dev

# Terminal 3 - Search Service
cd services/search
npm run dev

# Terminal 4 - Order Service
cd services/order
npm run dev

# Terminal 5 - Frontend
cd frontend
npm run dev
```

### 2. Setup Test Data

#### A. Create a Cook Account
1. Register as a cook at `/register`
2. Verify OTP
3. Login

#### B. Setup Kitchen
1. Go to `/cook/kitchen-setup`
2. Fill in kitchen details
3. Submit (status will be PENDING)
4. Approve kitchen using script:
   ```bash
   cd services/kitchen
   node approve-kitchen.js
   ```

#### C. Create Today's Menu
1. Go to `/cook/menu-create`
2. Add dishes with:
   - Name, description, category
   - Price
   - Quantity and available quantity
3. Submit menu

#### D. Create a Buyer Account
1. Logout
2. Register as a buyer
3. Verify OTP
4. Login

#### E. Add Address
1. Go to `/profile`
2. Add delivery address
3. Set as default

### 3. Test Cart Flow

#### Add Items to Cart
1. Go to `/discover`
2. Browse dishes
3. Click "Add to Cart" on any dish
4. Try adding from another kitchen → Should show error (single kitchen constraint)

#### View Cart
1. Go to `/cart`
2. See all items
3. Update quantities using +/- buttons
4. Remove items using trash icon
5. Clear cart and re-add items

### 4. Test Checkout Flow

1. Click "Proceed to Checkout" from cart
2. Select delivery address
3. Choose time slot (must be 2+ hours from now)
4. Review order summary
5. Click "Place Order"
6. Should redirect to order detail page

### 5. Test Order Tracking

#### Real-time Updates
1. Keep order detail page open
2. In another browser/tab, login as cook
3. Go to cook's order list (implement this or use API directly)
4. Update order status via API:
   ```bash
   curl -X PATCH http://localhost:5003/api/orders/{orderId}/status \
     -H "Authorization: Bearer {cook_token}" \
     -H "Content-Type: application/json" \
     -d '{"status": "CONFIRMED"}'
   ```
5. Watch buyer's page update in real-time!

#### Status Progression
Update status in sequence:
- PLACED → CONFIRMED
- CONFIRMED → PREPARING
- PREPARING → READY
- READY → DELIVERED

### 6. Test Order Cancellation

#### Within 15 Minutes
1. Place a new order
2. Go to order detail page
3. Enter cancellation reason
4. Click "Cancel Order"
5. Should succeed and show CANCELLED status

#### After 15 Minutes
1. Wait 15+ minutes after placing order
2. Try to cancel
3. Should show error: "Cancellation window has passed"

### 7. Test Order History

1. Go to `/orders`
2. See all your orders
3. Click on any order to view details
4. Check status badges and timeline

## API Testing with cURL

### Get Cart
```bash
curl http://localhost:5003/api/cart \
  -H "Authorization: Bearer {token}"
```

### Add to Cart
```bash
curl -X POST http://localhost:5003/api/cart/add \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "kitchenId": "kitchen_id_here",
    "dishId": "dish_id_here",
    "quantity": 2
  }'
```

### Create Order
```bash
curl -X POST http://localhost:5003/api/orders/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "address_id_here",
    "timeSlot": "2024-12-20T14:00:00.000Z"
  }'
```

### Get Orders
```bash
curl http://localhost:5003/api/orders \
  -H "Authorization: Bearer {token}"
```

### Update Order Status (Cook)
```bash
curl -X PATCH http://localhost:5003/api/orders/{orderId}/status \
  -H "Authorization: Bearer {cook_token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'
```

### Cancel Order
```bash
curl -X PATCH http://localhost:5003/api/orders/{orderId}/cancel \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Changed my mind"}'
```

## Socket.io Testing

### Connect to Socket
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5003', {
  auth: {
    token: 'your_jwt_token_here'
  }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  // Join order room
  socket.emit('join:order', 'order_id_here');
});

socket.on('order:statusChanged', (order) => {
  console.log('Order status updated:', order);
});

socket.on('order:cancelled', (order) => {
  console.log('Order cancelled:', order);
});
```

## Common Issues & Solutions

### Issue: Cart is empty after adding items
**Solution**: Check if dish exists in today's menu and status is AVAILABLE

### Issue: Cannot place order
**Solution**: 
- Ensure address is added in profile
- Time slot must be 2+ hours from now
- Cart must not be empty

### Issue: Cannot cancel order
**Solution**: 
- Check if within 15-minute window
- Order status must be PLACED or CONFIRMED

### Issue: Real-time updates not working
**Solution**: 
- Check Socket.io connection in browser console
- Verify JWT token is valid
- Ensure order service is running

### Issue: Single kitchen constraint error
**Solution**: Clear cart before adding items from different kitchen

## Testing Checklist

- [ ] Add items to cart
- [ ] Update item quantities
- [ ] Remove items from cart
- [ ] Clear cart
- [ ] Single kitchen constraint works
- [ ] Place order with time slot
- [ ] View order history
- [ ] Track order in real-time
- [ ] Cancel order within window
- [ ] Cannot cancel after window
- [ ] Status transitions work correctly
- [ ] Cook can update order status
- [ ] Buyer receives real-time updates
- [ ] Dish quantities update correctly
- [ ] Cart expires after 30 minutes

## Performance Tips

1. **MongoDB Indexes**: Already created for optimal queries
2. **Socket.io Rooms**: Efficient broadcasting to specific users
3. **Cart TTL**: Automatic cleanup of expired carts
4. **Connection Pooling**: Mongoose handles this automatically

## Next Steps

After testing, you can:
1. Add more dishes to menus
2. Create multiple kitchens
3. Test with multiple buyers simultaneously
4. Monitor real-time updates across multiple devices
5. Test edge cases (network failures, concurrent updates, etc.)

Happy Testing! 🚀
