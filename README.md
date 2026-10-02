# Pulse - Real-Time Emergency Blood Donation Network

Pulse is a centralized web application that connects hospitals with eligible blood donors in real time during critical emergencies. Built to eliminate the delays and inefficiencies of manual communication, Pulse ensures that the right donors are contacted instantly based on location, blood group compatibility, and medical eligibility.

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture-tech-stack)
- [Getting Started](#getting-started)
- [Development Workflow & Quality Control](#development-workflow-quality-control)
- [Docker Configuration](#docker-configuration)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributors](#contributors)

## <a id="about-the-project"></a>🎯 About the Project

When every minute counts, hospitals often rely on scattered, unverified, and outdated social media posts to find blood donors. Pulse bridges this gap by providing a verified channel that coordinates emergency blood requests. The system automatically filters for compatible blood types, medical eligibility (enforcing a strict 4-month waiting period between donations), and geographic proximity to alert the nearest capable donors instantly.

**Target Audience:**

- **Hospitals:** Post urgent requests and track real-time donor responses.
- **Donors:** Manage availability, receive nearby emergency alerts, and accept/decline requests.
- **Admins:** Verify hospitals and monitor platform activity.

## <a id="key-features"></a>✨ Key Features

- **Real-Time Emergency Notifications:** Instant push alerts to matching donors via Socket.io, with live status updates on the hospital dashboard.
- **Location-Based Donor Search:** Utilizes GeoJSON and MongoDB `$near` queries (2dsphere index) to filter donors within an adjustable radius (e.g., 5–20 km), prioritizing proximity.
- **Medical Eligibility Engine:** Automatically excludes donors who have donated within the last 4 months, ensuring donor and patient safety.
- **Role-Based Access Control:** Secure JWT authentication providing tailored interfaces for Hospitals, Donors, and Admins.

## <a id="architecture-tech-stack"></a>🛠 Architecture & Tech Stack

This project is built using modern full-stack tooling and optimized for high-performance execution:

- **Runtime & Package Manager:** **Bun** for lightning-fast dependency management and script execution.
- **Frontend:** Next.js (App Router) with React for a responsive, role-based UI.
- **Backend API:** Node.js and Express.js handling business logic and RESTful endpoints.
- **Real-Time Events:** Socket.io for live communication without page refreshes.
- **Database:** MongoDB utilizing a document structure and geospatial indexing (`2dsphere`).
- **Authentication:** JSON Web Tokens (JWT) for stateless security.
- **Quality Assurance & Git Hooks:** Husky, `lint-staged`, ESLint, Prettier, and Commitlint.
- **Testing:** Vitest (Unit/Component) and Playwright (E2E).
- **Containerization:** Docker & Docker Compose utilizing multi-stage Bun builds.

## <a id="getting-started"></a>🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.x or higher)
- Docker & Docker Compose (optional, for containerized local development)
- MongoDB instance (local or Atlas)

### Step 1: Clone the repository

```bash
git clone [https://github.com/43UniProjects/pulse.git](https://github.com/43UniProjects/pulse.git)
cd pulse

```

### Step 2: Choose your environment

#### Option A: Local Development (Bun)

We use Bun for ultra-fast package management and execution.

1. Install Bun globally (if you haven't already):

```bash
npm install -g bun

```

2. Install project dependencies:

```bash
bun install

```

3. Set up Environment Variables by creating a `.env.local` file (you can rename `example.env`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

```

4. Start the development server:

```bash
bun run dev

```

The application will be available at `http://localhost:3000`.

#### Option B: Running with Docker

To run the full stack in an isolated, containerized environment:

1. Ensure **Docker** is installed and the Docker Engine is running.
2. Set up your secure database credentials by creating a `.secrets` folder in the root directory and adding these two files:

- `.secrets/db-username.txt`
- `.secrets/db-password.txt`

3. Configure your environment variables:

- Rename `example.env` to `.env.local`

4. Build and start the containers:

```bash
docker compose up --build

```

## 🔄 Development Workflow & Quality Control

Pulse enforces strict code quality standards using automated Git hooks and conventional commit guidelines.

### 1. Conventional Commits & Commitlint

All commit messages must follow the Conventional Commits specification (e.g., `feat: add geo-radius filter`, `fix: resolve socket timeout`). This is enforced automatically via **Commitlint** and Husky during the `commit-msg` hook:

```bash
git commit -m "feat: implement real-time donor socket notification"

```

### 2. Pre-Commit Verification

Before any commit is finalized, Husky triggers **`lint-staged`** and TypeScript compilation checks (`tsc --noEmit`) to ensure zero errors:

- Formats staged files with **Prettier**.
- Lints code with **ESLint** (fixing auto-fixable issues).
- Validates strict TypeScript types across the codebase.

## 🐳 Docker Configuration

The application features a production-ready, multi-stage `Dockerfile` built on top of `oven/bun:1-alpine`. It optimizes build layers, bypasses local Git hooks safely via environment configuration (`ENV HUSKY=0`), and leverages Next.js standalone output for minimal image sizes.

_(See **Getting Started > Option B** for instructions on spinning up the containers)._

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
|-- app/                                      # Next.js App Router application
|   |-- layout.tsx                            # Root layout, metadata, fonts, theme provider
|   |-- page.tsx                              # Public landing page
|   |-- globals.css                           # Tailwind CSS, theme tokens, light/dark variables
|   |-- loading.tsx                           # Global loading UI
|   |-- not-found.tsx                         # Global 404 page
|   |
|   |-- contact/
|   |   `-- page.tsx                          # Contact page and support form UI
|   |
|   |-- support/
|   |   `-- page.tsx                          # Help center, categories, FAQs
|   |
|   |-- (auth)/                               # Route group for authentication pages
|   |   |-- login/
|   |   |   |-- page.tsx                      # Login page shell and metadata
|   |   |   |-- login-form.tsx                # Client login form and role selector
|   |   |   |-- actions.ts                    # Login server action and redirects
|   |   |   `-- data.ts                       # Mock user records and credential lookup
|   |   |
|   |   `-- register/
|   |       |-- page.tsx                      # Registration page shell and Suspense boundary
|   |       |-- register-form.tsx             # Donor/hospital registration form
|   |       |-- actions.ts                    # Registration server action and validation
|   |       `-- data.ts                       # Mock donor/hospital stores and account creation
|   |
|   |-- (users)/                              # Route group for authenticated role workspaces
|       |
|       |-- admin/
|       |   |-- layout.tsx                    # Admin header, sidebar, footer, navigation
|       |   |-- dashboard/
|       |   |   `-- page.tsx                  # Admin metrics, actions, recent activity
|       |   |
|       |   |-- manage-users/
|       |   |   |-- layout.tsx                # Page metadata
|       |   |   `-- page.tsx                  # User search, role filtering, suspension controls
|       |   |
|       |   `-- verify-hospitals/
|       |       |-- layout.tsx                # Page metadata
|       |       `-- page.tsx                  # Hospital approval and rejection workflow
|       |
|       |-- donor/
|       |   |-- layout.tsx                    # Donor header, sidebar, footer, navigation
|       |   |-- dashboard/
|       |   |   `-- page.tsx                  # Nearby blood requests and eligibility summary
|       |   |
|       |   |-- profile/
|       |   |   |-- layout.tsx                # Page metadata
|       |   |   `-- page.tsx                  # Donor profile and availability settings
|       |   |
|       |   `-- requests/
|       |       `-- [id]/                     # Dynamic donor request route
|       |           |-- layout.tsx            # Minimal request-detail layout
|       |           |-- page.tsx              # Resolves request ID and loads client view
|       |           `-- request-details-client.tsx
|       |                                     # Request information, status, accept/decline UI
|       |
|       `-- hospital/
|           |-- layout.tsx                    # Hospital header, sidebar, footer, navigation
|           |-- dashboard/
|           |   `-- page.tsx                  # Blood request list and tracking links
|           |
|           |-- post-request/
|           |   |-- layout.tsx                # Page metadata
|           |   `-- page.tsx                  # Blood group, quantity, radius, urgency form
|           |
|           |-- donors/
|           |   |-- layout.tsx                # Page metadata
|           |   `-- page.tsx                  # Registered donor list and verification filters
|           |
|           `-- tracking/
|               `-- [id]/                     # Dynamic hospital request-tracking route
|                   |-- layout.tsx            # Page metadata
|                   |-- page.tsx              # Resolves tracking request ID
|                   `-- request-tracking-client.tsx
|                                             # Fulfilment progress and matched donors
|
|-- components/                               # Reusable UI components
|   |-- Header.tsx                            # Sticky navigation, theme toggle, public links
|   |-- Footer.tsx                            # Footer branding and legal links
|   `-- users/
|       `-- DashboardSidebar.tsx              # Role navigation and active-route highlighting
|
|-- public/                                   # Static files served from the site root
|   |-- brand/
|   |   |-- logo-with-radar.svg               # Animated blood-drop/radar landing-page logo
|   |   `-- logo-with-lightning.svg           # Animated blood-drop/lightning logo asset
|   `-- logo/
|       `-- favicon.ico                       # Browser favicon
|
|-- tests/                                    # Test files currently present
|   `-- example.spec.ts
|
|-- e2e/                                      # Intended end-to-end test directory
|   `-- example.spec.ts
|
|-- .github/
|   `-- workflows/
|       `-- playwright.yml                    # CI workflow for Bun and Playwright tests
|
|-- .husky/                                   # Git hook scripts
|   |-- commit-msg                            # Enforces Conventional Commit messages
|   `-- pre-commit                            # Blocks main commits, runs lint-staged and typecheck
|
|-- Dockerfile                                # Multi-stage Bun/Next.js production image (container stages: dependency installer,  project builder, project runner)
|-- docker-compose.yml                        # Pulse app and MongoDB container
|-- .dockerignore                             # Docker build exclusions
|-- package.json                              # Scripts, dependencies, lint-staged, commitlint config
|-- bun.lock                                  # Locked Bun dependency graph
|-- next.config.ts                            # Next.js caching, image, Turbopack, standalone settings
|-- tsconfig.json                             # Strict TypeScript and @/* path alias configuration
|-- eslint.config.mjs                         # Next.js ESLint and Prettier configuration
|-- vitest.config.ts                          # Vitest + React plugin + jsdom configuration
|-- playwright.config.ts                      # Currently empty Playwright configuration
|-- example.env                               # Example telemetry environment setting
|-- .gitignore                                # Git exclusions for dependencies, builds, secrets, tests
|-- README.md                                 # Project overview
|
|-- .secrets/                                 # Local Docker credentials; ignored and not committed
|-- .next/                                    # Generated Next.js build/cache output; ignored by git
|-- node_modules/                             # Installed dependencies; ignored bu git
`-- .git/                                     # Git repository metadata

```

## 👥 Contributors

- [M.B. Subhasinghe](https://github.com/banuka20431) - ICT/24/934
- [J.J. Malshan](https://github.com/imjanindu) - ICT/24/883
- [K.M.M.I. Karunarathna](https://github.com/) - ICT/24/868
- [R.M.U.A. Harshana](https://github.com/) - ICT/24/851
- [Y.M.R. Shehan](https://github.com/) - ICT/24/931
