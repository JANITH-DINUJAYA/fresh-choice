# Fresh Choice — Wholesome Food E-Commerce Platform

A premium, full-stack Next.js web application built for **Fresh Choice**, a healthy homemade meal brand based in Colombo, Sri Lanka.

---

## 🚀 Key Features

### 🥗 Customer Web Storefront
* **Premium Cinematic UI** — Earthy greens & creams, glassmorphism, responsive navigation inspired by premium brand aesthetics.
* **Menu Browsing** — Search, sorting, and category filters (Salads, Rice & Curry, Bowls, Drinks, Snacks).
* **Detailed Meal View** — Ingredients breakdowns, portion size indicators, real-time availability badges.
* **Flexible Checkout** — Supports Cash on Delivery (COD) and Bank Transfer payments (with step-by-step transfer validation).
* **Pre-order Scheduling** — Customers can choose delivery ASAP or select date/time slots for future deliveries.
* **Zone-based Shipping** — Auto-calculates Colombo zone delivery fees and alerts when close to free shipping limits.
* **Interactive Order Tracking** — Customer dashboard tracks order states (Pending → Preparing → Ready → Delivered).

### 🛡️ Admin Dashboard
* **Separate Layout System** — Fully isolated dashboard layout at `/admin` (accessible only by authenticated staff).
* **Role-Based Access Control (RBAC)** — Strict claims authorization:
  * `super_admin`: Create and manage team accounts, reset configs, full catalog/order access.
  * `admin`: Manage meals, inventory, customers, order details.
  * `staff`: Access order queue processing and update daily stock.
* **Analytics Board** — Graphs for daily revenue, today's orders count, LTV value, and low-stock alerts.
* **Meal Creator** — Form modal to upload meals with ribbon badges, ingredients tags, price, and availability switch.
* **Inventory Control** — Dynamic stock counters, low-stock warnings, and bulk reset.

---

## 🛠️ Tech Stack
* **Framework:** Next.js 15 (App Router, JavaScript)
* **Styling:** CSS Modules, Custom Utility Variables
* **Database & Auth:** Google Firebase (Auth, Firestore, Custom User Claims)
* **State Management:** React Context (Cart state with LocalStorage sync)

---

## ⚙️ Quick Start Setup

### 1. Configure Firebase & Credentials
Refer to the detailed [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for full configuration steps.

### 2. Install Dependencies
```bash
cd fresh-choice
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file by copying the template:
```bash
cp .env.example .env.local
```
Fill in the credentials matching your Firebase Web App and Service Account.

### 4. Seed the Super Admin Account
```bash
node scripts/seed-super-admin.js
```
Use the output credentials to log in at the `/admin/login` page.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the customer storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to manage menu offerings.

---

## 📁 Project Directory Structure
* `src/app/(customer)/*` — Storefront routes (Home, Menu, Detail, Checkout, Tracker, About, Contact).
* `src/app/admin/*` — Admin Dashboard management pages.
* `src/app/api/*` — Backend functions/API endpoints (order processor, user creator).
* `src/components/*` — Reusable elements (Navbar, Footer, Sidebars, Cards, Drawer).
* `src/lib/*` — Auth hooks, Cart context, constants, and Firebase client SDK.
* `scripts/*` — Server scripts (bootstrap seeder).
