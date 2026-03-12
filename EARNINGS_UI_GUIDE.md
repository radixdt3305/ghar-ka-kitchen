# 💰 How to View Your Total Earnings - Cook Guide

## 🎯 Where to Find Your Earnings

### **Method 1: From Cook Dashboard**
1. **Login as Cook** → You'll see Cook Dashboard
2. **Look for "Earnings" Card** (green icon with ₹ symbol)
3. **Click on "Earnings"** → Takes you to full earnings page

### **Method 2: Direct URL**
- Visit: `http://localhost:3000/cook/earnings`

## 📊 What You'll See on Earnings Page

### **Top Summary Cards:**
```
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   Total Earnings    │ │   Platform Fees     │ │    Net Amount       │
│      ₹15,450        │ │      -₹2,318        │ │      ₹13,132        │
│   45 transactions   │ │   15% commission    │ │  Available payout   │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

### **📈 Detailed Breakdown Tabs:**

#### **Daily Tab** (Last 30 Days)
```
📅 Mon, 15 Jan    ₹850    (5 orders)    ₹723 net
📅 Sun, 14 Jan    ₹1,200  (8 orders)    ₹1,020 net
📅 Sat, 13 Jan    ₹2,100  (12 orders)   ₹1,785 net
```

#### **Weekly Tab** (Last 12 Weeks)
```
📊 Week of Jan 8   ₹8,500   (45 orders)   ₹7,225 net
📊 Week of Jan 1   ₹6,200   (32 orders)   ₹5,270 net
📊 Week of Dec 25  ₹9,800   (58 orders)   ₹8,330 net
```

#### **Monthly Tab** (Last 12 Months)
```
📈 January 2024    ₹35,600  (180 orders)  ₹30,260 net
📈 December 2023   ₹42,100  (220 orders)  ₹35,785 net
📈 November 2023   ₹38,900  (195 orders)  ₹33,065 net
```

### **💳 Payout History:**
- Shows all completed payouts
- Processing payouts
- Failed payouts with reasons
- Payout dates and amounts

### **🏦 Bank Account Connection:**
- "Connect Bank Account" button
- Links to Stripe for payout setup

## 🔧 If You Don't See Earnings Page

### **Check Your Role:**
- Make sure you're logged in as **Cook** (not Customer)
- Cook dashboard should show kitchen management options

### **Navigation Path:**
```
Login → Cook Dashboard → Earnings Card → Full Earnings Page
```

### **Cook Dashboard Cards Should Show:**
1. ✅ Create Today's Menu
2. ✅ Manage Menus  
3. ✅ Orders
4. ✅ **Earnings** ← This should be visible

## 📱 Mobile View
- Same functionality on mobile
- Cards stack vertically
- Tabs work the same way

## 🎨 Visual Indicators
- **Green color** for earnings and net amounts
- **Red color** for platform fees
- **Icons**: 💰 for earnings, 📊 for breakdown, 🏦 for payouts

## 🚀 Quick Access
**Bookmark this URL**: `http://localhost:3000/cook/earnings`

Your earnings page is fully functional with:
- ✅ Real-time data from your completed orders
- ✅ Daily, weekly, monthly breakdowns
- ✅ Platform fee calculations (15%)
- ✅ Net payout amounts
- ✅ Payout history tracking
- ✅ Bank account connection for payouts