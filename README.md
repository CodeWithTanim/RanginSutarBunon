# Rangin Sutar Bunon (রঙ্গিন সুতার বুনন)

A modern, full-stack E-Commerce platform crafted for **Rangin Sutar Bunon** — specializing exclusively in **handmade crochet products**, artisan yarn crafts, crochet bags, apparel, accessories, plushies (amigurumi), and handcrafted crochet home decor.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **MongoDB Atlas**.

---

## ✨ Platform Features

### 🧶 Handmade Crochet Storefront
- **Curated Crochet Catalog (`/shop` & `/product/[id]`)**: Showcase handmade crochet creations with featured collections, multi-category filtering, live keyword search, original & discounted pricing, and live stock availability.
- **Interactive Shopping Cart & Drawer (`/cart`)**: Slide-over cart drawer and dedicated cart view with instant quantity adjustments, item removal, and automatic delivery fee calculation.
- **Dynamic Branding & Storefront Customization**: Configurable Hero banner, top announcement bar, brand display modes (logo, title, or both), store metadata, and dynamic footer details.
- **Customer Inquiry Portal (`/contact`)**: Built-in contact form allowing shoppers to send custom crochet requests and inquiries directly to the admin inbox.
- **Themed Loading & 404 Pages**: Seamless route transitions and a cohesive store-themed `Not Found` page.

### 👤 Customer Accounts & Checkout
- **Protected Customer Profile & Dashboard (`/account`)**: Server-side Next.js middleware (`middleware.ts`) automatically protects `/account` and `/profile`, redirecting unauthenticated visitors straight to login while keeping the navbar reactive (`Login` vs. `Profile` & `Sign Out`).
- **Bangladeshi Mobile Validation**: Dedicated customer registration (`/account/register`) and login (`/account/login`) tailored for strict **11-digit Bangladeshi mobile numbers** (`01XXXXXXXXX`).
- **Multi-Number & Multi-Address Book**: Customers can save and manage multiple phone numbers and delivery addresses right from their profile settings.
- **100% Cash on Delivery Checkout (`/checkout`)**: Streamlined COD checkout workflow across Bangladesh with optional customer notes and instant order confirmation (`/order-success`).
- **Live Order Tracking (`/order-status` & `/account`)**: Visual step-by-step progress tracking (`Order Placed` → `Confirmed` → `Processing` → `Shipped` → `Out for Delivery` → `Delivered`) accessible both inside the customer dashboard and publicly via Order ID & mobile number.

### 👑 Boss / Admin Management Portal (`/boss`)
- **Secure Role Protection**: Protected admin routes powered by HTTP-only JWT sessions and Next.js server middleware, plus a clean admin header featuring the store logo and `ADMIN` badge.
- **Dashboard Overview (`/boss`)**: At-a-glance analytics for Total Sales Revenue (excluding cancelled orders), Total Orders, Pending Orders, Delivered Orders, Product Count, and Unique Customer Profiles.
- **Crochet Product & Category Management (`/boss/products`)**: Full CRUD controls for adding, editing, and removing crochet products, setting discount prices, managing stock levels, toggling Featured/Active badges, uploading images, and organizing product categories.
- **Order Management (`/boss/orders`)**: Search by Order ID, name, or phone; filter by order status; inspect detailed order breakdowns; update fulfillment statuses in real time; or delete orders.
- **Customer Directory (`/boss/customers`)**: View registered buyer profiles, saved contact numbers/addresses, total orders, and lifetime purchase values.
- **Messages Inbox (`/boss/messages`)**: Read customer inquiries from the Contact page, toggle Read/Unread states, and remove resolved messages.
- **Delivery Charge Configuration (`/boss/settings/delivery`)**: Update default nationwide Cash on Delivery charges dynamically.
- **SEO & Storefront Settings (`/boss/settings/seo`)**: Manage page titles, meta descriptions, keywords, Open Graph tags, store logo, favicon, hero banner, social profile links, and footer content.
- **Admin Account Security (`/boss/settings/security`)**: Update admin display name, login username, and password directly inside the panel with bcrypt password hashing.
- **React Hot Toast Notifications**: Theme-matched, non-intrusive toast alerts confirming every admin create, edit, update, upload, and delete action.

### 🤖 Real-Time Multi-Admin Telegram Bot Notifications
- **Multi-Admin Parallel Dispatch (`/boss/settings/telegram`)**: Configure a Telegram bot token and multiple admin Chat IDs from the admin dashboard to notify all store managers simultaneously.
- **Comprehensive Event Alerts**: Instant formatted HTML notifications delivered in real time for:
  - 🛍️ New Customer Orders (complete item list, COD total, phone, address, and customer notes)
  - 🔄 Order Status Changes
  - 🎉 New Customer Account Registrations
  - 📩 Contact Form Submissions
  - 🔐 Admin Dashboard Sign-Ins & Failed Login Security Alerts
  - 🛡️ Admin Profile & Credential Updates
- **Built-in Test Tool**: Verify bot connectivity and multi-admin delivery directly from the Telegram settings page.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, React Hot Toast
- **Database**: MongoDB Atlas with connection pooling and health check monitoring (`/api/health`)
- **Authentication & Security**: Next.js Middleware, JOSE (JWT HTTP-only cookies), bcryptjs

---

## 📦 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build & start for production
npm run build
npm start
```

---

## 🌐 Live Storefront

- **Website**: [https://rangin-sutar-bunon.vercel.app/](https://rangin-sutar-bunon.vercel.app/)
