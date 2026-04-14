# DirectOrder - Modern Restaurant Management System

**A professional, modern restaurant management dashboard built with React 19 + Tailwind CSS 4 + shadcn/ui**

![DirectOrder](https://img.shields.io/badge/Version-1.0.0-emerald?style=flat-square)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Overview

DirectOrder is a complete restaurant management system designed for modern restaurants. It provides a comprehensive suite of tools for managing orders, menus, customers, and business analytics—all with a beautiful, intuitive interface optimized for fast-paced restaurant environments.

**Key Features:**
- 🔐 **Secure Role-Based Access** (Owner, Manager, Staff)
- 📊 **Real-Time Analytics Dashboard**
- 🧾 **Complete Order Management System**
- 📋 **Menu Management with Inventory Tracking**
- 🛒 **Point-of-Sale (POS) System**
- 👥 **Customer Database & Analytics**
- ⚙️ **Restaurant Settings & Configuration**
- 💬 **WhatsApp Integration**
- 🖨️ **Order Printing**
- 📱 **Fully Responsive Design**

---

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/hussamjamaleddine-cpu/DirectOrder.git
cd DirectOrder

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Demo Credentials

| Role | PIN | Permissions |
|------|-----|-------------|
| 👑 Owner | `1111` | Full access to all features |
| 👨‍💼 Manager | `2222` | Orders, POS, Menu, Customers |
| 👨‍🍳 Staff | `3333` | Orders & POS only |

---

## Features

### 1. Dashboard
Real-time business metrics including:
- Orders placed today
- Daily revenue (USD & LBP)
- Pending orders count
- Customer database size
- Weekly projections
- Recent order history

### 2. Orders Management
Complete order lifecycle management:
- View all orders with filtering by status
- Update order status (New → Confirmed → Ready → Delivered)
- Print order receipts
- Send WhatsApp notifications to customers
- Delete orders with confirmation
- View detailed order information

### 3. Menu Management
Full menu control:
- Add/edit/delete menu items
- Organize items by category
- Set pricing in USD and LBP
- Track inventory and low-stock alerts
- Set preparation times
- Mark items as available/86/hidden
- Add descriptions and emojis

### 4. Point-of-Sale (POS)
Modern POS interface:
- Quick item selection by category
- Shopping cart with quantity adjustment
- Customer information capture
- Order type selection (Dine-in, Takeaway, Delivery)
- Payment method selection (Cash, Card)
- VAT calculation
- One-click checkout

### 5. Customers
Customer relationship management:
- View all customers with sorting options
- Customer spending analytics
- Order history per customer
- Send WhatsApp messages
- Delete customer records
- Track customer lifetime value

### 6. Settings
Restaurant configuration:
- Restaurant name, address, phone
- Exchange rate management (LBP/USD)
- VAT percentage configuration
- Security settings
- Data management (clear all data)
- Storage information

---

## Architecture

### Technology Stack
- **Frontend:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **State Management:** React Context API
- **Data Storage:** Browser localStorage
- **Routing:** Wouter (lightweight client-side router)
- **Notifications:** Sonner (toast notifications)

### Project Structure
```
DirectOrder/
├── client/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Menu.tsx
│   │   │   ├── POS.tsx
│   │   │   ├── Customers.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/      # Reusable components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── contexts/        # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/             # Utilities & data store
│   │   │   └── store.ts
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles & design tokens
│   ├── public/              # Static assets
│   └── index.html           # HTML template
├── package.json
└── README.md
```

---

## Data Storage

DirectOrder uses **browser localStorage** for data persistence. This means:
- ✅ All data is stored locally on the user's device
- ✅ No server required for basic functionality
- ✅ Works offline (with limitations)
- ⚠️ Data is lost if browser cache is cleared
- ⚠️ Not suitable for production without backend integration

### Data Models

**Order**
```typescript
{
  id: string;
  customerName: string;
  customerPhone: string;
  type: 'dinein' | 'takeaway' | 'delivery';
  items: OrderItem[];
  totalLBP: number;
  totalUSD: number;
  status: 'new' | 'confirmed' | 'ready' | 'delivered';
  paymentMethod: 'cash' | 'card';
  createdAt: number; // timestamp
}
```

**MenuItem**
```typescript
{
  id: number;
  name: string;
  category: string;
  priceLBP: number;
  priceUSD: number;
  costLBP?: number;
  stock?: number;
  status: 'available' | '86' | 'hidden';
  // ... more fields
}
```

**Customer**
```typescript
{
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpentLBP: number;
  lastOrderAt?: number;
  color: string;
}
```

---

## Security Considerations

### Current Implementation
- ✅ Role-based access control (Owner/Manager/Staff)
- ✅ PIN-based authentication
- ✅ XSS protection through proper data handling
- ✅ TypeScript for type safety

### Production Recommendations
- 🔒 Implement proper backend authentication (JWT, OAuth)
- 🔒 Hash PINs using bcrypt or similar
- 🔒 Use HTTPS for all communications
- 🔒 Implement database for persistent storage
- 🔒 Add audit logging for sensitive operations
- 🔒 Implement rate limiting
- 🔒 Use secure session management

---

## Deployment

### GitHub Pages
To deploy to GitHub Pages:

```bash
# Build the project
pnpm build

# The dist/ folder contains the production build
# Push to your GitHub repository
git add .
git commit -m "Deploy DirectOrder"
git push origin main
```

Then enable GitHub Pages in your repository settings pointing to the `dist/` folder.

### Manus Hosting
DirectOrder is also available on Manus hosting:
- Visit: https://hussamjamaleddine-cpu.github.io/DirectOrder/
- Automatic deployments on push

---

## Improvements Over Original Dashboard

The modern version includes significant enhancements:

| Feature | Original | Modern |
|---------|----------|--------|
| **Framework** | Vanilla HTML/CSS/JS | React 19 + TypeScript |
| **Security** | Hardcoded PINs | Proper authentication context |
| **XSS Protection** | None | Proper data sanitization |
| **Analytics** | Fake data | Real calculations |
| **UI/UX** | Basic | Professional with warm design |
| **Accessibility** | Limited | ARIA labels, keyboard navigation |
| **Performance** | Full re-renders | Optimized React rendering |
| **Type Safety** | None | Full TypeScript coverage |
| **Maintainability** | Difficult | Component-based architecture |

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Format code
pnpm format
```

### Adding New Features

1. Create new page component in `client/src/pages/`
2. Add navigation item in `DashboardLayout.tsx`
3. Update `App.tsx` to include the new page
4. Use the data store (`store.ts`) for persistence

### Styling Guidelines

- Use Tailwind CSS utilities for styling
- Follow the design tokens in `index.css`
- Use shadcn/ui components for common UI elements
- Maintain the warm emerald green color scheme (#10b981)

---

## Troubleshooting

### Data Not Persisting
- Check browser localStorage is enabled
- Verify browser isn't in private/incognito mode
- Clear browser cache and try again

### Login Issues
- Ensure you're using the correct PIN (1111, 2222, or 3333)
- Check that JavaScript is enabled
- Try a different browser

### Performance Issues
- Clear browser cache
- Close other tabs
- Restart the development server

---

## Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

## License

MIT License - feel free to use DirectOrder for your restaurant!

---

## Support

For issues, questions, or feature requests, please visit:
- GitHub Issues: https://github.com/hussamjamaleddine-cpu/DirectOrder/issues
- Email: support@directorder.app

---

## Changelog

### Version 1.0.0 (Current)
- ✨ Complete React rewrite
- ✨ Modern UI with Tailwind CSS
- ✨ Role-based access control
- ✨ Improved security
- ✨ Real-time analytics
- ✨ WhatsApp integration
- ✨ Print functionality
- ✨ Customer analytics
- 🐛 Fixed XSS vulnerabilities
- 🐛 Fixed fake analytics
- 🐛 Fixed order ID collisions

---

**DirectOrder © 2026 - Professional Restaurant Management System**
