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

## 🎯 About the Project

When every minute counts, hospitals often rely on scattered, unverified, and outdated social media posts to find blood donors. Pulse bridges this gap by providing a verified channel that coordinates emergency blood requests. The system automatically filters for compatible blood types, medical eligibility (enforcing a strict 4-month waiting period between donations), and geographic proximity to alert the nearest capable donors instantly.

**Target Audience:**

- **Hospitals:** Post urgent requests and track real-time donor responses.
- **Donors:** Manage availability, receive nearby emergency alerts, and accept/decline requests.
- **Admins:** Verify hospitals and monitor platform activity.

## ✨ Key Features

- **Real-Time Emergency Notifications:** Instant push alerts to matching donors via Socket.io, with live status updates on the hospital dashboard.
- **Location-Based Donor Search:** Utilizes GeoJSON and MongoDB `$near` queries (2dsphere index) to filter donors within an adjustable radius (e.g., 5–20 km), prioritizing proximity.
- **Medical Eligibility Engine:** Automatically excludes donors who have donated within the last 4 months, ensuring donor and patient safety.
- **Role-Based Access Control:** Secure JWT authentication providing tailored interfaces for Hospitals, Donors, and Admins.

## 🛠 Architecture & Tech Stack

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

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.x or higher)
- Docker & Docker Compose (optional, for containerized local development)
- MongoDB instance (local or Atlas)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/43UniProjects/pulse.git
   cd pulse
   ```

2. **Install dependencies using Bun:**

   ```bash
   bun install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add the necessary configuration:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret

   ```

4. **Run the Development Server:**
   ```bash
   bun run dev

   ```

The application will be available at `http://localhost:3000`.

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

To spin up the full stack (App container + Database container) using Docker Compose:

```bash
docker-compose up --build

```

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

- `app/` - Next.js application routes, layout, and global styles.
- `public/` - Static assets served by the application.
- `tests/` - Unit and component tests.
- `e2e/` - End-to-end Playwright tests.
- `Dockerfile` and `docker-compose.yml` - Container configuration.

## 👥 Contributors

- [M.B. Subhasinghe](https://github.com/banuka20431) - ICT/24/934

- [J.J. Malshan](https://github.com/imjanindu) - ICT/24/883

- [K.M.M.I. Karunarathna](https://github.com/) - ICT/24/868

- [R.M.U.A. Harshana](https://github.com/) - ICT/24/851

- [Y.M.R. Shehan](https://github.com/) - ICT/24/931
