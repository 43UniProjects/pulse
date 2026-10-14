# Pulse - Real-Time Emergency Blood Donation Network

Pulse is a centralized web application that connects hospitals with eligible blood donors in real time during critical emergencies. Built to eliminate the delays and inefficiencies of manual communication, Pulse ensures that the right donors are contacted instantly based on location, blood group compatibility, and medical eligibility.

## 🎯 About the Project

When every minute counts, hospitals often rely on scattered, unverified, and outdated social media posts to find blood donors. Pulse bridges this gap by providing a verified channel that coordinates emergency blood requests. The system automatically filters for compatible blood types, medical eligibility (enforcing a strict 4-month waiting period between donations), and geographic proximity to alert the nearest capable donors instantly.

**Target Audience:**

- **Hospitals:** Post urgent requests, manage donor health verification, and track donor responses.
- **Donors:** Manage availability, receive nearby emergency alerts, and accept/decline requests.
- **Admins:** Verify hospitals, manage platform users, and maintain help center FAQs.

## ✨ Key Features

- **Emergency Request Broadcasting & Alerts:** Instant email/SMS alert workflows to matching donors with live fulfillment tracking on the hospital dashboard.
- **Location-Based Donor Search:** Utilizes GeoJSON `Point` coordinates and MongoDB `2dsphere` geospatial indexes to filter donors within an adjustable radius (e.g., 5–20 km), prioritizing proximity.
- **Medical Eligibility Engine:** Automatically excludes donors who have donated within the last 4 months (120 days), ensuring donor and patient safety.
- **Role-Based Access Control & Token Verification:** Session-based authentication via Better Auth with mandatory cryptographic email verification links and tailored workspaces for Hospitals, Donors, and Admins.

## 🛠 Architecture & Tech Stack

This project is built using modern full-stack tooling and optimized for high-performance execution:

- **Runtime & Package Manager:** **Bun** (`v1.x+`) for fast dependency management, script execution, and standalone production builds.
- **Framework & Frontend:** **Next.js 16** (`^16.3.6`, App Router, `cacheComponents: true`, Turbopack) with **React 19** (`^19.3.0`) and **TypeScript 5** (`^5.6.0`).
- **UI & Styling:** **Tailwind CSS v4** (`@tailwindcss/postcss`), **`@base-ui/react`** (`^1.8.0`), **`next-themes`**, **`lucide-react`**, and **`sonner`** for toast notifications.
- **Backend & Server Logic:** Next.js **Server Actions** (`actions/`) and **App Router Route Handlers** (`app/api/auth/[...all]/route.ts`).
- **Database & ODM:** **MongoDB** (`mongodb@^7.7.0`) and **Mongoose 9** (`mongoose@^9.10.3`) utilizing document schemas and `2dsphere` geospatial indexing.
- **Authentication & Mail:** **Better Auth** (`better-auth@^1.7.7` with `@better-auth/mongo-adapter` and `nextCookies()`) paired with **Nodemailer** (`nodemailer@^10.1.0`) for SMTP email verification.
- **Schema Validation:** **Zod v4** (`zod@^4.6.5`) for client and server payload validation.
- **Quality Assurance & Git Hooks:** **Husky**, **`lint-staged`**, **ESLint 9**, **Prettier**, and **Commitlint**.
- **Testing:** **Vitest 5** (Unit/Component with React Testing Library & `jsdom`) and **Playwright** (E2E).
- **Containerization:** **Docker & Docker Compose** utilizing multi-stage `oven/bun:1-alpine` builds and Docker Secrets.

## 🚀 Getting Started

### Prerequisites

- [Bun](https://www.google.com/search?q=https%3A%2F%2Fbun.sh%2F) (v1.x or higher)
- Docker & Docker Compose (optional, for containerized local development)
- MongoDB instance (local, Docker, or Atlas)

### Step 1: Clone the repository

```bash
git clone https://github.com/43UniProjects/pulse.git
cd pulse
```

### Step 2: Choose your environment

#### Option A: Local Development (Bun)

We use Bun for package management and script execution.

1. Install Bun globally (if you haven't already):

```bash
npm install -g bun
```

2. Install project dependencies:

```bash
bun install
```

3. Set up Environment Variables by creating a `.env.local` file (you can copy `example.env` as a starting point):

```env
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_super_secret_better_auth_key

# Option 1: Full MongoDB URI (overrides host/port/secrets)
MONGODB_URI=mongodb://<user>:<pass>@localhost:27018/pulse_db?authSource=admin

# Option 2: Host/Port with .secrets/db_username.txt and .secrets/db_password.txt
MONGO_DATABASE_HOST=localhost
MONGO_DATABASE_PORT=27018
MONGO_DATABASE_NAME=pulse_db

# SMTP Configuration (Nodemailer Email Verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL="Pulse Network" <your_email@gmail.com>
```

4. Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

#### Option B: Running with Docker

To run the full stack in an isolated, containerized environment:

1. Ensure **Docker** is installed and the Docker Engine is running.
2. Set up your database credentials by creating a `.secrets` folder in the root directory and adding these two files (note the underscores):

- `.secrets/db_username.txt`
- `.secrets/db_password.txt`

3. Configure your environment variables:

- Copy or rename `example.env` to `.env.local` and add your `BETTER_AUTH_SECRET` and `SMTP_*` variables.

4. Build and start the containers:

```bash
docker compose up --build
```

## 🔄 Development Workflow & Quality Control

Pulse enforces strict code quality standards using automated Git hooks and conventional commit guidelines.

### 1. Conventional Commits & Commitlint

All commit messages must follow the Conventional Commits specification (e.g., `feat(auth): add token verification`, `docs(readme): update project structure`) with body lines wrapped at 100 characters. This is enforced automatically via **Commitlint** and Husky during the `commit-msg` hook:

```bash
git commit -m "feat(auth): implement better-auth email verification"
```

### 2. Pre-Commit Verification

Before any commit is finalized, Husky blocks direct commits to `main`/`master` and triggers **`lint-staged`** and TypeScript compilation checks (`bun run typecheck`) to ensure zero errors:

- Formats staged files with **Prettier**.
- Lints code with **ESLint** (`eslint --fix`).
- Validates strict TypeScript types (`tsc --noEmit`) across the codebase.

## 🐳 Docker Configuration

The application features a production-ready, multi-stage `Dockerfile` built on top of `oven/bun:1-alpine`. It optimizes build layers, bypasses local Git hooks safely during container builds via environment configuration (`ENV HUSKY=0`), and outputs a Next.js standalone server (`CMD ["bun", "server.js"]`) for minimal image sizes.

## 🧪 Testing

Pulse uses a dual testing strategy to ensure high reliability.

- **Run Unit/Component Tests (Vitest):**

```bash
bun run test
```

- **Run End-to-End Tests (Playwright):**

```bash
bun run test:e2e
```

_(Note: Ensure your local dev server is running before executing E2E tests, or configure Playwright's `webServer` option to start it automatically)._

## 📁 Project Structure

```text
pulse/
|-- actions/                                  # Next.js Server Actions
|   |-- admin.actions.ts                      # Admin profile update server action
|   |-- donor.actions.ts                      # Donor profile & preferences server action
|   `-- hospital.actions.ts                   # Hospital facility profile server action
|
|-- app/                                      # Next.js 16 App Router application
|   |-- layout.tsx                            # Root layout, metadata, Geist fonts, ThemeProvider, Toaster
|   |-- page.tsx                              # Session-aware public landing page
|   |-- globals.css                           # Tailwind CSS v4 @theme tokens & light/dark variables
|   |-- loading.tsx                           # Global loading UI
|   |-- not-found.tsx                         # Global 404 page
|   |
|   |-- api/
|   |   `-- auth/
|   |       `-- [...all]/
|   |           `-- route.ts                  # Better Auth Next.js catch-all route handler
|   |
|   |-- contact/
|   |   |-- page.tsx                          # 24/7 contact page & session prefill wrapper
|   |   |-- contact-form.tsx                  # Client contact form with validation
|   |   |-- actions.ts                        # Server action for submitting contact tickets
|   |   |-- data.ts                           # Mongoose Contact persistence helper
|   |   `-- schema.ts                         # Zod v4 contact form schema
|   |
|   |-- support/
|   |   |-- page.tsx                          # Help center, quick guides, and admin FAQ shortcut
|   |   |-- faq-client.tsx                    # Real-time searchable FAQ client component
|   |   `-- data.ts                           # Dynamic FAQ query helper
|   |
|   |-- privacy/
|   |   `-- page.tsx                          # Privacy Policy page
|   |
|   |-- terms/
|   |   `-- page.tsx                          # Terms of Service page
|   |
|   |-- (auth)/                               # Route group for authentication workflows
|   |   |-- _validators/
|   |   |   `-- auth.schema.ts                # Zod v4 login, register, password, and username schemas
|   |   |-- login/
|   |   |   |-- page.tsx                      # Login page shell and metadata
|   |   |   `-- login-form.tsx                # Better Auth email sign-in & verified toast handler
|   |   |-- register/
|   |   |   |-- page.tsx                      # Registration page shell
|   |   |   |-- register-form.tsx             # Donor/Hospital registration synced with ?type= query
|   |   |   `-- types.ts                      # Account type constants and registration types
|   |   `-- verify-email/
|   |       |-- page.tsx                      # Email verification holding page
|   |       `-- verify-email-form.tsx         # Verification link resend handler with 60s cooldown
|   |
|   `-- (users)/                              # Route group for authenticated role workspaces
|       |-- admin/
|       |   |-- layout.tsx                    # Admin workspace layout & sidebar navigation
|       |   |-- dashboard/
|       |   |   `-- page.tsx                  # Admin metrics, quick actions, and recent activity
|       |   |-- faqs/
|       |   |   |-- page.tsx                  # Server-rendered FAQ management list
|       |   |   |-- faq-client.tsx            # Add, edit, and delete FAQ modal UI
|       |   |   `-- actions.ts                # Server actions for FAQ CRUD operations
|       |   |-- manage-users/
|       |   |   |-- layout.tsx                # Page metadata
|       |   |   `-- page.tsx                  # User search, role filtering, and status controls
|       |   |-- profile/
|       |   |   |-- page.tsx                  # Admin profile server page
|       |   |   |-- admin-profile-client.tsx  # View/edit mode toggle controller
|       |   |   |-- admin-profile-view.tsx    # Admin identity and activity overview
|       |   |   |-- admin-profile-form.tsx    # Admin profile edit form
|       |   |   `-- data.ts                   # Admin profile data fetcher
|       |   `-- verify-hospitals/
|       |       |-- layout.tsx                # Page metadata
|       |       `-- page.tsx                  # Hospital approval and rejection workflow
|       |
|       |-- donor/
|       |   |-- layout.tsx                    # Donor workspace layout & sidebar navigation
|       |   |-- dashboard/
|       |   |   `-- page.tsx                  # Clinical eligibility status and nearby emergencies
|       |   |-- profile/
|       |   |   |-- layout.tsx                # Page metadata
|       |   |   |-- page.tsx                  # Donor profile and donation stats server page
|       |   |   |-- profile-client.tsx        # View/edit mode toggle controller
|       |   |   |-- profile-view.tsx          # Donor identity, contact, and clinical status view
|       |   |   `-- profile-form.tsx          # Donor dispatch radius, alerts, and info form
|       |   `-- requests/
|       |       |-- page.tsx                  # Active requests and donation history tabs
|       |       |-- data.ts                   # Donor requests and donation history data layer
|       |       `-- [id]/
|       |           |-- page.tsx              # Suspense wrapper for dynamic request route
|       |           `-- request-details-form.tsx
|       |                                     # Request details and accept/decline controls
|       |
|       `-- hospital/
|           |-- layout.tsx                    # Hospital workspace layout & sidebar navigation
|           |-- dashboard/
|           |   `-- page.tsx                  # Hospital blood requests overview and tracking links
|           |-- donors/
|           |   |-- layout.tsx                # Page metadata
|           |   `-- page.tsx                  # Registered donor directory and verification filters
|           |-- post-request/
|           |   |-- layout.tsx                # Page metadata
|           |   `-- page.tsx                  # Emergency blood request broadcast form
|           |-- profile/
|           |   |-- page.tsx                  # Facility profile server page
|           |   |-- hospital-profile-client.tsx
|           |   |                             # View/edit mode toggle controller
|           |   |-- hospital-profile-view.tsx # Facility details, status, and coordinator view
|           |   |-- hospital-profile-form.tsx # Facility and coordinator edit form
|           |   `-- data.ts                   # Hospital profile data fetcher
|           `-- tracking/
|               |-- page.tsx                  # Multi-request live emergency tracking view
|               `-- [id]/
|                   |-- layout.tsx            # Page metadata
|                   |-- page.tsx              # Resolves tracking request ID
|                   `-- request-tracking.tsx  # Fulfillment progress bar and matched donor table
|
|-- components/                               # Reusable UI components
|   |-- header/
|   |   |-- main.tsx                          # Session-aware sticky header and theme toggle
|   |   `-- mobile-menu.tsx                   # Slide-out mobile navigation drawer
|   |-- ui/
|   |   |-- button.tsx                        # @base-ui/react Button primitive with CVA variants
|   |   `-- sheet.tsx                         # @base-ui/react Dialog/Sheet drawer primitives
|   |-- users/
|   |   `-- dashboard-sidebar.tsx             # Responsive role sidebar with Better Auth logout
|   |-- Footer.tsx                            # Global footer branding and legal links
|   `-- fallback.tsx                          # Reusable Suspense loading fallback
|
|-- lib/                                      # Core infrastructure, auth, database, and models
|   |-- auth/
|   |   |-- config.ts                         # Better Auth server instance & MongoDB adapter
|   |   `-- client.ts                         # Better Auth React client with inferred user fields
|   |-- db/
|   |   |-- config.ts                         # MongoDB URI builder with Docker Secrets support
|   |   `-- connect.ts                        # Cached Mongoose connection singleton
|   |-- models/
|   |   |-- admin.model.ts                    # Admin Mongoose schema
|   |   |-- common.models.ts                  # Shared GeoJSON PointSchema
|   |   |-- contact.model.ts                  # Contact ticket Mongoose schema
|   |   |-- donation-request.model.ts         # DonationRequest schema with 2dsphere index
|   |   |-- donation.model.ts                 # Donation & ScreeningResults Mongoose schema
|   |   |-- donor.model.ts                    # Donor schema with 2dsphere & eligibility indexes
|   |   |-- faq.model.ts                      # FAQ Mongoose schema
|   |   |-- hospital.model.ts                 # Hospital & Coordinator schema with 2dsphere index
|   |   `-- user.model.ts                     # Base User Mongoose schema
|   |-- mail.ts                               # Nodemailer transporter & HTML verification email
|   `-- utils.ts                              # Class name merging helper
|
|-- types/                                    # Shared TypeScript interfaces and literal enums
|   |-- admin.type.ts                         # AdminEntity, ADMIN_ROLES, ADMIN_STATUS
|   |-- common.type.ts                        # IGeoPoint, BLOOD_GROUPS, NAV_LINKS
|   |-- contact.type.ts                       # ContactEntity, CONTACT_STATUS, CONTACT_TARGET
|   |-- donation.type.ts                      # DonationEntity, DONATION_STATUS, SCREENING_STATUS
|   |-- donor-request.type.ts                 # DonationRequestEntity, urgency & status enums
|   |-- donor.type.ts                         # DonorEntity interface
|   |-- hospital.type.ts                      # HospitalEntity, HOSPITAL_TYPE, VERIFICATION_STATUS
|   `-- user.type.ts                          # UserEntity, USER_ROLE
|
|-- public/                                   # Static assets
|   |-- brand/
|   |   |-- logo-with-radar.svg               # Animated blood-drop/radar landing-page logo
|   |   `-- logo-with-lightning.svg           # Animated blood-drop/lightning logo asset
|   `-- logo/
|       `-- favicon.ico                       # Browser favicon
|
|-- tests/                                    # Unit/component test directory
|   `-- example.spec.ts
|
|-- e2e/                                      # Playwright end-to-end test directory
|   `-- example.spec.ts
|
|-- .github/
|   `-- workflows/
|       `-- playwright.yml                    # CI workflow for Bun and Playwright tests
|
|-- .husky/                                   # Git hook scripts
|   |-- commit-msg                            # Enforces Conventional Commit messages via commitlint
|   `-- pre-commit                            # Blocks main/master commits, runs lint-staged & typecheck
|
|-- AGENTS.md                                 # Architectural rules, conventions, and agent boundaries
|-- CLAUDE.md                                 # Pointer to AGENTS.md
|-- GEMINI.md                                 # Pointer to AGENTS.md
|-- Dockerfile                                # Multi-stage oven/bun:1-alpine standalone image
|-- docker-compose.yml                        # Pulse app and MongoDB container orchestration
|-- .dockerignore                             # Docker build exclusions
|-- components.json                           # UI component & alias configuration
|-- package.json                              # Scripts, dependencies, lint-staged, commitlint config
|-- bun.lock                                  # Locked Bun dependency graph
|-- next.config.ts                            # Next.js 16 caching, image, Turbopack, standalone config
|-- tsconfig.json                             # Strict TypeScript and @/* path alias configuration
|-- eslint.config.mjs                         # Next.js ESLint 9 and Prettier configuration
|-- vitest.config.ts                          # Vitest 5 + React plugin + jsdom configuration
|-- playwright.config.ts                      # Playwright E2E configuration
|-- example.env                               # Template environment variables
|-- .gitignore                                # Git exclusions for dependencies, builds, secrets, tests
|-- README.md                                 # Project documentation
|
|-- .secrets/                                 # Local Docker credentials; ignored and not committed
|-- .next/                                    # Generated Next.js build/cache output; ignored by git
|-- node_modules/                             # Installed dependencies; ignored by git
`-- .git/                                     # Git repository metadata
```

## 👥 Contributors

- [M.B. Subhasinghe](https://www.google.com/search?q=https%3A%2F%2Fgithub.com%2Fbanuka20431) - ICT/24/934
- [J.J. Malshan](https://www.google.com/search?q=https%3A%2F%2Fgithub.com%2Fimjanindu) - ICT/24/883
- [K.M.M.I. Karunarathna](https://www.google.com/search?q=https%3A%2F%2Fgithub.com%2F) - ICT/24/868
- [R.M.U.A. Harshana](https://www.google.com/search?q=https%3A%2F%2Fgithub.com%2F) - ICT/24/851
- [Y.M.R. Shehan](https://www.google.com/search?q=https%3A%2F%2Fgithub.com%2F) - ICT/24/931
