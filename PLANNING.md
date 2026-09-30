# HardwareHub — Architecture & Project Plan (Corrected)

## 1. Environment Status

| Component | Status | Location / Details |
| :--- | :--- | :--- |
| **PHP** | Installed (v8.4.22) | `C:\xampp\php\php.exe` |
| **Composer** | Installed (v2.9.5) | System PATH |
| **Node.js** | Installed (v24.16.0) | System PATH |
| **npm** | Installed (v11.13.0) | System PATH |
| **Flutter** | Installed (v3.44.4) | System PATH |
| **Dart** | Installed (v3.12.2) | System PATH |
| **MySQL / MariaDB** | Installed & Running (v10.4.32-MariaDB) | `C:\xampp\mysql\bin\mysql.exe` (Port 3306) |
| **Git** | Installed (v2.52.0) | System PATH |
| **Workspace** | Clean / Empty | `d:\HardwareHub` |

---

## 2. System Architecture

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│       React Web Frontend       │         │       Flutter Mobile App       │
└───────────────┬────────────────┘         └───────────────┬────────────────┘
                │                                          │
                │ REST / JSON API (Sanctum Tokens)         │ REST / JSON API (Sanctum Tokens)
                ▼                                          ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           Laravel Backend API                             │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Eloquent ORM
                                      ▼
                        ┌───────────────────────────┐
                        │      MySQL Database       │
                        └───────────────────────────┘
```

- **Single Main Backend**: Laravel handles all business logic, validation, authentication, and database access.
- **Frontend Clients**: React Web Admin and Flutter Mobile communicate exclusively with Laravel over HTTP/REST JSON APIs.
- **Direct Database Access**: Neither React nor Flutter connects directly to MySQL.

---

## 3. Proposed Directory Structure

```
d:\HardwareHub\
├── hardwarehub-backend/               # Laravel Web Backend & REST API Engine
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   └── Api/                   # AuthController, ProductController, RecycleBinController, UserController
│   │   └── Models/                    # User.php, Product.php
│   ├── database/
│   │   ├── migrations/                # users table, products table with SoftDeletes
│   │   └── seeders/                   # UserSeeder, ProductSeeder
│   ├── routes/
│   │   └── api.php                    # REST API routes (Laravel Sanctum)
│   └── resources/
│       └── js/                        # React Frontend & Design Tokens
└── hardwarehub_mobile/                # Flutter Mobile App
    ├── lib/
    │   ├── core/                      # API Client, Theme & Constants
    │   ├── models/                    # Data models (User, Product)
    │   ├── providers/                 # State management (AuthProvider, ProductProvider)
    │   └── screens/                   # Flutter screens (Login, Home, Product CRUD, Recycle Bin)
```

---

## 4. Database Schema Specification

### `users` table
- `id` (BIGINT, Primary Key, Auto Increment)
- `name` (VARCHAR 255)
- `email` (VARCHAR 255, Unique)
- `password` (VARCHAR 255)
- `remember_token` (VARCHAR 100, Nullable)
- `created_at`, `updated_at` (TIMESTAMP)

### `products` table
- `id` (BIGINT, Primary Key, Auto Increment)
- `name` (VARCHAR 255)
- `sku` (VARCHAR 100, Unique)
- `description` (TEXT, Nullable)
- `price` (DECIMAL 10, 2)
- `quantity` (INT)
- `status` (ENUM: `'active'`, `'inactive'`)
- `created_at`, `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, Nullable — Laravel `SoftDeletes`)

---

## 5. API Endpoints Specification

### Authentication
- `POST /api/login` — Public (returns Sanctum Bearer Token & User data)
- `POST /api/logout` — Protected (revokes current token)

### User Management (Protected)
- `GET /api/users` — List system users

### Product Management (Protected)
- `GET /api/products` — List active products
- `POST /api/products` — Create a new product (with validation)
- `GET /api/products/{id}` — Fetch single product details
- `PUT /api/products/{id}` — Update product details
- `DELETE /api/products/{id}` — Soft delete product

### Recycle Bin Management (Protected)
- `GET /api/recycle-bin` — List soft-deleted products
- `POST /api/recycle-bin/{id}/restore` — Restore soft-deleted product
- `DELETE /api/recycle-bin/{id}/force-delete` — Permanently delete product

---

## 6. Web Application Screens (React + Laravel)

1. **Login Page** — Clean auth layout with hardware branding.
2. **Dashboard** — Summary stats (Total Products, Active Products, Inactive Products) and Quick Actions.
3. **Users Page** — User listing & view.
4. **Product List** — Product table with Status badges and Action buttons.
5. **Create Product Form / Modal** — Standard input fields with real-time validation error display.
6. **View Product Modal / Page** — Detailed product details and audit timestamps.
7. **Edit Product Form / Modal** — Pre-filled editing dialog with validation.
8. **Recycle Bin Page** — Soft-deleted items table with Restore & Permanent Delete buttons.

---

## 7. Mobile Application Screens (Flutter)

1. **Login Screen** — Token auth form with loading indicator and error snackbars.
2. **Home / Dashboard Screen** — Summary stats (Total, Active, Inactive) and Quick Action shortcuts.
3. **Product List Screen** — List view showing products with status badges.
4. **Add Product Screen** — Input form with SKU validation (manual input field).
5. **View Product Details Screen** — Detailed item details view.
6. **Edit Product Screen** — Form pre-loaded with current attributes.
7. **Recycle Bin Screen** — List of soft-deleted items with Restore & Force Delete actions.

---

## 8. HardwareHub Design System

### Color Palette
- **Primary Slate**: `#0F172A` (Headers, main text)
- **Accent Amber**: `#F59E0B` (Primary buttons: Add, Save, Create)
- **Secondary Slate**: `#64748B` (Muted text, borders, secondary actions)
- **Edit Blue**: `#3B82F6` (Edit buttons)
- **Danger Rose**: `#EF4444` (Delete / Permanent Delete buttons)
- **Success Emerald**: `#10B981` (Restore buttons, Active badges)

### Component Consistency Rules
- **Primary Buttons (Add, Save, Create)**: Amber `#F59E0B`, height 44px, radius 8px, bold text, consistent hover/press state.
- **Edit Buttons**: Blue `#3B82F6` icon button style.
- **Danger / Delete Buttons**: Rose `#EF4444` icon/fill button style.
- **Restore Buttons**: Emerald `#10B981` icon/fill button style.
- **Cancel / Back Buttons**: Soft slate `#64748B` secondary style.
- **Cards**: Background `#FFFFFF`, border `#E2E8F0`, corner radius 12px, padding 16–24px.

---

## 9. Version Control & Git Strategy

1. **Initial Repository Setup**:
   - Initialize Git in `d:\HardwareHub` after Phase 1 approval.
   - Create local repository and connect to GitHub remote repository.
   - Create initial commit containing Phase 1 architecture and configuration files before starting Phase 2.
2. **Phase-by-Phase Commit Workflow**:
   - After completing each phase and receiving approval, commit all verified phase code with a clear, descriptive message (e.g., `feat(phase2): setup laravel backend, migrations and seeders`).
   - Push commit to GitHub after every approved phase.
3. **Phase 11 Scope**:
   - Perform final integration testing across Web and Mobile.
   - Finalize README documentation, verify repository integrity, and prepare demo.

---

## 10. Development Roadmap

- [x] **Phase 1**: Environment Inspection + Architecture + Project Planning (Corrected)
- [ ] **Phase 2**: Laravel Project Setup + Database + Initial Project Structure
- [ ] **Phase 3**: Authentication + Dashboard + Users Page
- [ ] **Phase 4**: Product Database + Product CRUD
- [ ] **Phase 5**: Soft Delete + Recycle Bin + Restore + Permanent Delete
- [ ] **Phase 6**: Laravel Sanctum + Complete API
- [ ] **Phase 7**: Flutter Project Setup + API Client + Authentication
- [ ] **Phase 8**: Flutter Product Management
- [ ] **Phase 9**: Flutter Recycle Bin + Complete API Integration
- [ ] **Phase 10**: UI/UX Polish + Responsive Design + Consistent Components + Animations
- [ ] **Phase 11**: Full Integration Testing + Bug Fixing + GitHub & README Completion + Demo Preparation
