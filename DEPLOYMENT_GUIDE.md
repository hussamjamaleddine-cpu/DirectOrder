# DirectOrder - Complete Deployment & Setup Guide

**A Complete Restaurant Ecosystem for Physical Restaurants, Cloud Kitchens, and Third-Party Operations**

---

## 📋 System Overview

DirectOrder is a **dual-interface restaurant management system** consisting of:

1. **Customer-Facing Website** - Where customers browse menu and place orders
2. **Operations Dashboard** - Where restaurant staff manage orders, menu, and operations

Both interfaces share the same menu and order data, allowing real-time synchronization.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   DIRECTORDER ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PUBLIC CUSTOMER WEBSITE                                   │
│  ├─ Browse menu by category                               │
│  ├─ Add items to cart with special requests               │
│  ├─ Place order via WhatsApp                              │
│  ├─ No authentication required                            │
│  └─ Mobile-optimized (iOS, Android, Web)                  │
│                                                             │
│  ↓ (Shared Data via localStorage)                         │
│                                                             │
│  OPERATIONS DASHBOARD                                      │
│  ├─ Receive orders in real-time                           │
│  ├─ Manage menu & inventory                               │
│  ├─ Update order status                                   │
│  ├─ Customer database & analytics                         │
│  ├─ Role-based access (Owner/Manager/Staff)              │
│  └─ POS system for counter orders                         │
│                                                             │
│  DEPLOYMENT OPTIONS:                                       │
│  ├─ Single Domain: Both on same URL (switch via button)   │
│  ├─ Separate Domains: Customer site + Dashboard on own    │
│  └─ Multi-Location: Different restaurants on same system  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ and pnpm
- Git
- GitHub account

### Local Development

```bash
# Clone the repository
git clone https://github.com/hussamjamaleddine-cpu/DirectOrder.git
cd DirectOrder

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
# - Dashboard: http://localhost:3000
# - Customer Site: Click "View Customer Site" button in dashboard
```

**Demo Credentials:**
- Owner PIN: `1111`
- Manager PIN: `2222`
- Staff PIN: `3333`

---

## 📱 Usage Scenarios

### Scenario 1: Physical Restaurant with Dine-In & Delivery

**Setup:**
- Tablet in kitchen running Dashboard (Operations)
- Website on customer-facing devices (phone, kiosk, web)
- Manager accessing from office/home

**Workflow:**
1. Customer orders via website or POS
2. Order appears in dashboard kitchen display
3. Staff updates status (New → Confirmed → Ready → Delivered)
4. Customer receives WhatsApp notification
5. Manager tracks analytics from anywhere

**Devices:**
- Kitchen: iPad/Android tablet with Dashboard
- Counter: PC/Tablet with POS
- Customers: Phone/Web browser
- Manager: Laptop/Phone from anywhere

---

### Scenario 2: Cloud Kitchen (No Physical Storefront)

**Setup:**
- Website for online orders only
- Dashboard in kitchen for order management
- No dine-in, only delivery/takeaway
- Remote owner managing from another country

**Workflow:**
1. Customer orders via website
2. Order sent to kitchen via WhatsApp + Dashboard
3. Kitchen staff prepares and updates status
4. Delivery driver assigned
5. Owner monitors from remote location

**Devices:**
- Kitchen: Tablet with Dashboard
- Delivery: Driver phone with tracking
- Customers: Phone/Web
- Owner: Laptop/Phone from anywhere (even different country)

---

### Scenario 3: Third-Party Delivery Operation

**Setup:**
- Restaurant provides menu
- Third-party handles orders & delivery
- Shared dashboard access
- Multiple restaurants on same system

**Workflow:**
1. Customer orders via third-party app
2. Order syncs to restaurant dashboard
3. Restaurant prepares
4. Third-party driver delivers
5. Both parties see real-time updates

---

## 🌐 Deployment Options

### Option 1: GitHub Pages (Free, Recommended for Starting)

**Pros:**
- Free hosting
- Easy deployment
- Works globally
- Custom domain support

**Steps:**

```bash
# 1. Build the project
pnpm build

# 2. Push to GitHub
git add .
git commit -m "Deploy DirectOrder v1.0"
git push origin main

# 3. Enable GitHub Pages
# - Go to Settings → Pages
# - Select "Deploy from a branch"
# - Choose "main" branch and "/dist" folder
# - Save

# 4. Access your site
# https://hussamjamaleddine-cpu.github.io/DirectOrder/
```

**Custom Domain:**
```bash
# 1. In GitHub Settings → Pages
# 2. Add custom domain (e.g., directorder.yourrestaurant.com)
# 3. Update DNS records at your domain registrar:
#    - CNAME: directorder.yourrestaurant.com → hussamjamaleddine-cpu.github.io
#    - Or use A records (GitHub will show exact values)
# 4. Wait for DNS propagation (5-30 minutes)
```

---

### Option 2: Manus Hosting (Built-in, Recommended for Production)

Manus provides built-in hosting with automatic deployments:

**Pros:**
- Automatic deployments on push
- Built-in custom domain support
- SSL/HTTPS included
- Better performance
- Database ready for future upgrades

**Steps:**
1. Project is already set up in Manus
2. Just push to GitHub
3. Automatic deployment happens
4. Access via: `directorder-etawgaga.manus.space`

**Add Custom Domain:**
- Go to Manus Dashboard → Settings → Domains
- Add your custom domain
- Update DNS records
- Done!

---

### Option 3: Self-Hosted (Advanced)

For complete control, deploy to your own server:

```bash
# Build
pnpm build

# Deploy dist/ folder to your server
# Examples: Vercel, Netlify, Railway, Render, DigitalOcean, AWS

# Using Vercel (easiest)
npm i -g vercel
vercel
```

---

## 🔧 Configuration

### Restaurant Settings

Access via Dashboard → Settings:

1. **Restaurant Information**
   - Name
   - Address
   - Phone number

2. **Financial Settings**
   - Exchange rate (LBP per USD)
   - VAT percentage

3. **Security**
   - Owner/Manager/Staff PINs
   - (Production: Use proper authentication)

### Menu Management

1. **Add Items** (Dashboard → Menu)
   - Name, emoji, price
   - Category, description
   - Cost tracking, inventory
   - Availability status

2. **Sync to Customer Site**
   - Automatic (same data store)
   - Changes appear immediately

3. **Inventory Tracking**
   - Mark items as "86" (out of stock)
   - Set low-stock alerts
   - Track costs for profitability

---

## 📊 Order Flow

### Customer Places Order

1. Customer visits website
2. Browses menu by category
3. Adds items to cart
4. Enters name & phone
5. Clicks "Order via WhatsApp"
6. WhatsApp opens with pre-filled order
7. Customer sends to restaurant
8. Order appears in Dashboard

### Restaurant Manages Order

1. Order received in Dashboard
2. Staff confirms order
3. Kitchen prepares
4. Staff marks as "Ready"
5. Delivery/Pickup assigned
6. Staff marks as "Delivered"
7. Order history saved

---

## 🔐 Security & Data

### Current Implementation
- ✅ Role-based access control
- ✅ PIN authentication
- ✅ XSS protection
- ✅ Type-safe data handling

### Data Storage
- **Local:** Browser localStorage (current)
- **Recommended:** Backend database for production

### Production Recommendations
1. Implement proper backend authentication (JWT/OAuth)
2. Use bcrypt for PIN hashing
3. Add HTTPS/SSL (automatic on Manus/GitHub Pages)
4. Implement database (PostgreSQL/MongoDB)
5. Add audit logging
6. Rate limiting on APIs
7. Regular backups

---

## 📱 Multi-Device Setup

### Kitchen Display System (Tablet)
```
1. Open Dashboard on iPad/Android tablet
2. Login as Manager/Staff
3. Keep Orders page visible
4. Update status as items are prepared
5. Sticky bottom bar shows pending count
```

### Point-of-Sale (Counter PC/Tablet)
```
1. Open Dashboard
2. Login as Staff
3. Go to POS section
4. Add items to cart
5. Enter customer info
6. Checkout
```

### Customer Website (Phone/Kiosk)
```
1. Open website URL
2. Browse menu
3. Add items to cart
4. Place order via WhatsApp
5. Receive confirmation
```

### Manager Access (Remote)
```
1. Open Dashboard from anywhere
2. Login with Manager PIN
3. View orders, customers, analytics
4. Manage menu
5. No physical location needed
```

---

## 🌍 Global Remote Management

DirectOrder is designed for remote management:

**Owner in Different Country:**
```
1. Open Dashboard from laptop/phone
2. Login with Owner PIN
3. View all orders in real-time
4. See analytics and revenue
5. Manage menu from anywhere
6. No location restrictions
```

**Benefits:**
- ✅ Manage multiple locations
- ✅ Monitor from home/office
- ✅ No physical presence needed
- ✅ Works across time zones
- ✅ Mobile-friendly interface

---

## 🔄 Data Synchronization

### How It Works
1. **Customer Site** → Places order → Saves to localStorage
2. **Dashboard** → Reads from same localStorage
3. **Both interfaces** → See same data in real-time

### Limitations (Current)
- Data is local to browser
- Not synced between devices
- Clearing browser cache deletes data

### Future Improvements
- Backend database sync
- Cloud storage
- Multi-device sync
- Offline queue with sync

---

## 🐛 Troubleshooting

### Orders Not Appearing
- Check browser localStorage is enabled
- Verify not in private/incognito mode
- Clear cache and refresh

### Login Issues
- Verify correct PIN (1111, 2222, 3333)
- Check JavaScript is enabled
- Try different browser

### Menu Not Showing on Customer Site
- Add items via Dashboard → Menu
- Verify items are marked "Available"
- Refresh customer website

### WhatsApp Not Opening
- Verify phone number in Settings
- Check WhatsApp is installed
- Try on mobile device

---

## 📈 Next Steps

### Phase 1: Setup & Launch
- [ ] Configure restaurant info
- [ ] Add menu items
- [ ] Test customer ordering
- [ ] Deploy to GitHub Pages

### Phase 2: Operations
- [ ] Train staff on dashboard
- [ ] Set up tablet in kitchen
- [ ] Configure POS for counter
- [ ] Monitor analytics

### Phase 3: Optimization
- [ ] Track best-selling items
- [ ] Optimize pricing
- [ ] Improve menu based on data
- [ ] Add new features

### Phase 4: Scale
- [ ] Add backend database
- [ ] Implement proper authentication
- [ ] Add payment processing
- [ ] Multi-location support

---

## 📞 Support & Resources

**Documentation:**
- GitHub: https://github.com/hussamjamaleddine-cpu/DirectOrder
- README: See README_DIRECTORDER.md

**Issues & Features:**
- GitHub Issues: Report bugs or request features
- Email: support@directorder.app

**Community:**
- Share your setup
- Help other restaurants
- Contribute improvements

---

## 🎯 Key Features Summary

| Feature | Customer Site | Dashboard | Notes |
|---------|---------------|-----------|-------|
| Browse Menu | ✅ | ✅ | Same menu data |
| Place Order | ✅ | ✅ | Via WhatsApp or POS |
| Order Status | ✅ | ✅ | Real-time updates |
| Manage Menu | ❌ | ✅ | Owner/Manager only |
| Customer DB | ❌ | ✅ | Analytics & history |
| Analytics | ❌ | ✅ | Revenue, KPIs |
| POS System | ❌ | ✅ | Counter orders |
| Settings | ❌ | ✅ | Owner only |
| Mobile Ready | ✅ | ✅ | All devices |
| Offline Support | 🔄 | 🔄 | Limited (future) |

---

## 🚀 Launch Checklist

Before going live:

- [ ] Restaurant info configured
- [ ] Menu items added (at least 10)
- [ ] Pricing verified in LBP & USD
- [ ] Exchange rate set correctly
- [ ] VAT percentage configured
- [ ] WhatsApp number set
- [ ] Domain configured (if custom)
- [ ] Tested customer ordering flow
- [ ] Tested dashboard operations
- [ ] Staff trained on system
- [ ] Tablet/devices set up
- [ ] Backup plan for outages

---

**DirectOrder © 2026 - Professional Restaurant Management System**

*Built for restaurants that want to operate globally, whether they're in a physical location, cloud kitchen, or managing from anywhere in the world.*
