# Rangin Sutar Bunon (রঙ্গিন সুতার বুনন)

A modern, high-performance E-Commerce platform for **Rangin Sutar Bunon** — authentic Bengali handcrafted textiles, Jamdani, silk shawls, terracotta pottery, and artisan home decor.

Built with **Next.js**, **React**, **TypeScript**, **Better Auth**, **shadcn/ui**, **Tailwind CSS**, and **MongoDB**.

---

## 🚀 Key Features

- **⚡ Blazing Fast Loading Speed**: Instant edge-cached static rendering (ISR) and optimized queries so the storefront loads immediately on entry.
- **🍃 MongoDB Database**: High-performance MongoDB Atlas connection with singleton connection pooling.
- **🔐 Better Auth**: Modern, secure authentication with credentials, session management, and role-based permissions.
- **🎨 shadcn/ui Components**: Clean, accessible, beautifully crafted UI components.
- **👑 Dedicated Boss / Admin Panel (`/boss`)**:
  - Live inventory and product catalog management.
  - Multi-category management and product tagging.
  - Order tracking and real-time status updates (Order Placed, Processing, Shipped, Delivered, etc.).
  - Customer registry and order metrics.
  - Dynamic customization of Hero section, Top announcement banner, SEO metadata, and Footer links.
- **📦 Seamless Customer Checkout**:
  - 100% Cash on Delivery (COD) across Bangladesh.
  - Strict 11-digit Bangladesh mobile validation.
  - Real-time order tracking via Order ID and mobile number.

---

## 🛠️ Environment Configuration

Create a `.env` file in the root directory:

```env
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=rangin-sutar-bunon

BETTER_AUTH_SECRET=your-better-auth-secret
BETTER_AUTH_URL=https://rangin-sutar-bunon.vercel.app

```

---

## 📦 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Seed initial data (Admin user, categories, products, settings)
npx tsx scripts/seed-mongo.ts

# 3. Start local development server
npm run dev

# 4. Production build
npm run build
npm start
```

---

## 🌐 Deployed Site

**Production URL**: [https://rangin-sutar-bunon.vercel.app/](https://rangin-sutar-bunon.vercel.app/)
