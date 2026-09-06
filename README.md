# Rangin Sutar Bunon - Handcrafted Artisanal E-Commerce Platform

A production-ready, full-stack E-Commerce platform for **Rangin Sutar Bunon**, built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma ORM, and Supabase PostgreSQL.

Designed with a premium "wow" aesthetic, responsive mobile-first navigation, Cash on Delivery (COD) order management, real-time customer order tracking, and a comprehensive Admin Dashboard.

---

## 🚀 Quick Start (Local Setup)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (`.env`)
Create or edit your `.env` file with your Supabase PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres.lolljwugmxrkdulnfodq:h%40bib%40r%40ngin2018@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.lolljwugmxrkdulnfodq:h%40bib%40r%40ngin2018@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="rangin-sutar-bunon-super-secret-jwt-key-2026"
```

### 3. Push Database Schema & Seed Data
Push the relational schema to Supabase and populate demo items & admin account:
```bash
npx prisma db push
npx tsx scripts/seed.ts
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Default Credentials

- **Admin Login Page**: `http://localhost:3000/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

---

## 📖 Step-by-Step Testing & Features Guide

### 🛒 Customer Storefront Flow

1. **Home Page (`/`)**:
   - Browse the announcement banner, hero section, trust badges, category quick tabs, featured & popular product grids, and "Why Choose Us" showcase.

2. **Shop Catalog (`/shop`)**:
   - Search products by keywords (e.g. *"Jamdani"*, *"Tea"*).
   - Filter by artisan category tabs (Textiles, Pottery, Teas, Brassware).
   - Sort products by price (Low to High, High to Low), newest arrivals, or featured highlights.

3. **Product Details Page (`/product/[id]`)**:
   - View high-resolution image gallery with active thumbnail switcher.
   - Inspect prices, discount badges, stock availability, and full descriptions.
   - Adjust quantity (+ / -) and click **"Add to Cart"** or **"Buy Now (COD)"**.

4. **Shopping Cart Drawer & Page (`/cart`)**:
   - Click the bag icon at the top right to open the slide-over drawer.
   - View subtotal, dynamic delivery charge, and grand total.

5. **Checkout Form (`/checkout`)**:
   - Complete customer shipping details (Name, 10-digit mobile number, address, city, state, PIN code, optional delivery note).
   - Click **"Place Order (Cash on Delivery)"**.

6. **Order Success (`/order-success`)**:
   - Receive a unique Order ID (`ORD-YYYYMMDD-XXX`) with one-click copy button.

7. **Order Status Tracker (`/order-status`)**:
   - Enter your **Order ID** and **Mobile Number** to view the live step-by-step progress bar (Order Placed ➔ Confirmed ➔ Processing ➔ Shipped ➔ Out for Delivery ➔ Delivered / Cancelled).

---

### 🛡️ Admin Dashboard Flow

1. **Login (`/admin/login`)**:
   - Log in with `admin` / `admin123`.

2. **Dashboard Overview (`/admin`)**:
   - View key metrics cards: Total Sales Revenue (₹), Total Orders, Pending Orders, Delivered Orders, Cancelled Orders, Total Products, Total Customers.
   - Inspect recent orders table.

3. **Product Management (`/admin/products`)**:
   - View, add, edit, or soft-delete catalog products.
   - Upload custom product images to `/public/uploads` or input image URLs.
   - Set stock quantities, regular/discount prices, categories, and featured toggles.
   - Prevent accidental deletion with the built-in confirmation dialog.

4. **Order Management (`/admin/orders`)**:
   - Filter orders by status tabs.
   - Inspect complete shipping address, ordered items, and historical delivery charge snapshot.
   - Change order status from dropdown menu (syncs live to customer order tracker).

5. **Customer Directory (`/admin/customers`)**:
   - Browse customer profiles, order counts, and lifetime spending values.
   - Open history modal to view past order records.

6. **Delivery Charge Settings (`/admin/settings/delivery`)**:
   - Modify the store default delivery fee (e.g. ₹80 ➔ ₹100).
   - *Snapshot Logic*: New orders inherit the new rate, while past orders preserve their original delivery fee.

7. **SEO & Branding Settings (`/admin/settings/seo`)**:
   - Upload custom website logo and favicon.
   - Modify site title, meta description, keywords, and Open Graph social sharing cards.

---

## ☁️ Deployment on Vercel

1. Push your repository to GitHub / GitLab.
2. Log into [Vercel.com](https://vercel.com) and import the repository.
3. Add the following Environment Variables in Vercel settings:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
4. Click **Deploy**. Vercel will compile and host your production website automatically!
