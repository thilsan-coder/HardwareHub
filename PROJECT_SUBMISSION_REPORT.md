# HardwareHub — Full-Stack Product Management Assessment Report
**Assessment Specification:** Intern Full-Stack Development Task (Laravel 12 + React + Flutter)  
**Project Name:** HardwareHub — Inventory & Product Management Suite  
**Evaluation Status:** 100% Requirements Fulfilled + Production Extensions  

---

## 1. Executive Summary & Objective

The goal of this project was to design and implement a full-stack, enterprise-grade Product Management application comprising a **Laravel 12 REST API Backend**, a **React + Vite Web Frontend**, and a **Flutter Mobile Application** connected via **Laravel Sanctum API Authentication**.

All requirements specified in the assessment guideline PDF have been comprehensively fulfilled, featuring robust transactional integrity, soft deletes with recycle bin recovery, role-aware user management, responsive multi-platform UI/UX, and an automatic multi-URL fallback engine for mobile device connectivity.

---

## 2. Assessment Requirement Compliance Matrix

| PDF Requirement | Specified Criteria | Implementation Details | Status |
|---|---|---|:---:|
| **1. Laravel Application** | Login / Logout | Laravel Sanctum Session & Token-based auth with secure validation | ✅ **Completed** |
| | Authenticated Dashboard | Real-time metrics (Total Products, Units, Valuation, Low Stock) | ✅ **Completed** |
| | Users Management Page | Registered users list with role badges and created timestamps | ✅ **Completed** |
| | Product Management Page | Create, View/List, Edit, and Delete with Laravel validation | ✅ **Completed** |
| **2. Product Data Schema** | Product Name, SKU, Description, Price, Quantity, Status | Extended with Category, Cost Price, and Minimum Stock Alert levels | ✅ **Completed** |
| **3. Soft Delete & Recycle Bin** | Soft Deletes via `deleted_at` | Products & Movements use Laravel `SoftDeletes` trait | ✅ **Completed** |
| | Recycle Bin View | Dedicated Recycle Bin tab listing deleted records | ✅ **Completed** |
| | Restore Functionality | 1-Click instant recovery reverting state safely | ✅ **Completed** |
| | Permanent Delete | Option to permanently purge records from the database | ✅ **Completed** |
| **4. Laravel API** | Sanctum Token Auth for Mobile | Mobile login (`/api/v1/auth/login`) & logout (`/auth/logout`) | ✅ **Completed** |
| | Product CRUD API Endpoints | `/api/v1/products` (GET, POST, GET/{id}, PUT/{id}, DELETE/{id}) | ✅ **Completed** |
| | Recycle Bin APIs | `/api/v1/recycle-bin/products`, `/restore/{id}`, `/force-delete/{id}` | ✅ **Completed** |
| | API Route Protection | All mutation and data endpoints guarded by `auth:sanctum` | ✅ **Completed** |
| | Standardized JSON Responses | Consistent `{ success, data, message, errors }` format | ✅ **Completed** |
| **5. Flutter Mobile App** | Login Screen | Sanctum token authentication with error handling & persistent storage | ✅ **Completed** |
| | Dashboard Screen | KPI summary cards, inventory health counters, real-time clock | ✅ **Completed** |
| | Product CRUD Screens | Interactive Product List, Form, Details, Status pills, Category chips | ✅ **Completed** |
| | Recycle Bin Screen | Dual-tab recovery interface for both products and movements | ✅ **Completed** |
| | UI/UX & Visibility | Custom Slate/Indigo design tokens, unblocked inline subheader actions | ✅ **Completed** |
| **Bonus Features** | Stock Ledger Audit | Comprehensive IN / OUT / ADJUSTMENT / DAMAGE tracking | ⭐ **Bonus** |
| | Reporting & Exports | One-click CSV and PDF inventory export generation | ⭐ **Bonus** |
| | Mobile Auto-Fallback Engine | Zero-config automatic USB (`127.0.0.1`) & Wi-Fi LAN (`192.168.1.3`) discovery | ⭐ **Bonus** |

---

## 3. Technology Stack Breakdown

### Backend & API
- **Framework:** Laravel 12.x
- **Authentication:** Laravel Sanctum (Bearer Token / API Tokens)
- **Database:** MySQL (XAMPP) on Port 3306
- **Architecture:** Controller-Service-Resource pattern with Eloquent ORM & Form Request validation

### Web Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS + Custom Dark-Header Design Tokens
- **Icons:** Lucide React Icons
- **HTTP Client:** Axios with dynamic auth interceptors

### Mobile Application
- **Framework:** Flutter 3.x (Dart 3.x)
- **Target Platforms:** Physical Android Device (Samsung Galaxy A05s / Android 15), Emulators, iOS
- **State & Storage:** `shared_preferences` for secure local tokens & active base URL caching
- **HTTP Architecture:** Custom `ApiService` with **Multi-URL Resilient Fallback Engine**

---

## 4. Database Architecture & Schema

### Products Table (`products`)
```sql
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `sku` varchar(255) NOT NULL UNIQUE,
  `name` varchar(255) NOT NULL,
  `description` text NULL,
  `category` varchar(255) NOT NULL DEFAULT 'General',
  `cost_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `selling_price` decimal(10,2) NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `min_stock_level` int NOT NULL DEFAULT '5',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
);
```

### Stock Movements Table (`stock_movements`)
```sql
CREATE TABLE `stock_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `product_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NULL,
  `type` enum('in','out','adjustment','damage') NOT NULL,
  `quantity` int NOT NULL,
  `previous_stock` int NOT NULL,
  `new_stock` int NOT NULL,
  `reason` varchar(255) NULL,
  `reference_note` text NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);
```

---

## 5. API Endpoints Reference

All API routes are prefixed with `/api/v1/` and return standardized JSON payloads:

### Authentication
- `POST /auth/login` — Authenticate and receive Sanctum bearer token
- `POST /auth/logout` — Revoke active bearer token *(Auth Required)*
- `GET /auth/me` — Fetch current user profile *(Auth Required)*

### Dashboard & Analytics
- `GET /dashboard/summary` — KPI summary (Total items, stock count, valuation, low stock alert count)

### Product Management
- `GET /products` — List products (supports `?search=`, `?category=`, `?status=`)
- `POST /products` — Create new product (Validates unique SKU, prices, stock levels)
- `GET /products/{id}` — Retrieve single product details & recent movement history
- `PUT /products/{id}` — Update product attributes
- `DELETE /products/{id}` — Soft delete product (moves to Recycle Bin)

### Recycle Bin Management
- `GET /recycle-bin/products` — List soft-deleted products
- `POST /recycle-bin/products/{id}/restore` — Restore deleted product
- `DELETE /recycle-bin/products/{id}/force-delete` — Permanently remove product from database
- `GET /recycle-bin/stock-movements` — List voided movements
- `POST /recycle-bin/stock-movements/{id}/restore` — Restore movement & re-apply quantity balance

### Stock Ledger Audit
- `GET /stock-movements` — List stock movement audits (supports `?type=`, `?search=`, `?product_id=`)
- `POST /stock-movements` — Log IN / OUT / ADJUSTMENT / DAMAGE with automatic stock recalculation
- `DELETE /stock-movements/{id}` — Soft delete movement & safely revert product stock quantity

---

## 6. How to Run the Entire System (Step-by-Step Guide)

### Prerequisites
1. **XAMPP** (Apache & MySQL running)
2. **PHP 8.2+** & **Composer**
3. **Node.js 18+** & **npm**
4. **Flutter SDK 3.x** and Android SDK

---

### Step 1: Start MySQL Database in XAMPP
1. Open **XAMPP Control Panel**.
2. Click **Start** on **MySQL** (Port 3306).
3. Ensure the database `hardwarehub` is created.

---

### Step 2: Start Laravel Backend Server
Open **Terminal 1** and run:
```powershell
cd d:\HardwareHub\hardwarehub-backend
php artisan serve --host 0.0.0.0 --port 8000
```
> [!NOTE]
> `--host 0.0.0.0` ensures the backend listens on both Localhost (`127.0.0.1`) and Wi-Fi LAN (`192.168.1.3`) for mobile connectivity.

---

### Step 3: Start React Web Frontend
Open **Terminal 2** and run:
```powershell
cd d:\HardwareHub\hardwarehub-backend
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

**Default Login Credentials:**
- **Email:** `admin@hardwarehub.com`
- **Password:** `password`

---

### Step 4: Run Flutter Mobile Application

#### Option A: Physical Android Phone (Samsung Galaxy via USB)
1. Plug in your device via USB with USB Debugging enabled.
2. Enable port reverse tunnel:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8000 tcp:8000
   ```
3. Launch the app in **Terminal 3**:
   ```powershell
   cd d:\HardwareHub\hardwarehub_mobile
   flutter run -d R7AW903PBSM
   ```

#### Option B: Over Wi-Fi (No USB Cable Required)
1. Ensure your phone and PC are connected to the same Wi-Fi router.
2. The app's **Multi-URL Auto Fallback Engine** will automatically connect to your PC at `http://192.168.1.3:8000/api/v1`.
3. If ever needed, tap **"Configure Server Connection URL"** on the login screen and select **`[ 📶 Wi-Fi (192.168.1.3) ]`**.

---

## 7. Key Engineering Highlights & Best Practices

1. **Transactional Integrity:** Stock movement mutations utilize database transactions to ensure product balance counters and audit logs never desynchronize.
2. **Soft Deletes & Safe Recovery:** Deleting a record preserves relational integrity. Restoring a voided stock movement intelligently recalculates live warehouse inventory.
3. **Resilient Network Client:** Mobile requests never hang indefinitely. Fast timeout fallbacks sequentially probe candidate endpoints and lock the active route for subsequent calls.
4. **Unobtrusive UI Design:** Primary actions (`+ New SKU`, `+ Log Movement`) are integrated directly into the subheader summary rows, guaranteeing zero overlap with product and audit cards.
