# Pulse - Real-Time Emergency Blood Donation Network

Pulse is a centralized web application that connects hospitals with eligible blood donors in real time during critical emergencies. Built to eliminate the delays and inefficiencies of manual communication, Pulse ensures that the right donors are contacted instantly based on location, blood group compatibility, and medical eligibility.

## 📖 Table of Contents
- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Getting Started](#getting-started)
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
- **Location-Based Donor Search:** Utilizes GeoJSON and MongoDB `$near` queries (2dsphere index) to filter donors within an adjustable radius (e.g., 5-20km), prioritizing proximity.
- **Medical Eligibility Engine:** Automatically excludes donors who have donated within the last 4 months, ensuring donor and patient safety.
- **Role-Based Access Control:** Secure JWT authentication providing tailored interfaces for Hospitals, Donors, and Admins.

## 🛠 Architecture & Tech Stack

This project is built using the MERN stack alongside modern testing frameworks:

- **Frontend:** React (Next.js App Router) for a responsive, role-based UI.
- **Backend API:** Node.js and Express.js handling business logic and RESTful endpoints.
- **Real-Time Events:** Socket.io for live communication without page refreshes.
- **Database:** MongoDB utilizing a document structure and geospatial indexing.
- **Authentication:** JSON Web Tokens (JWT) for stateless security.
- **Testing:** Vitest (Unit/Component) and Playwright (E2E).
- **Containerization:** Docker.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker (optional, for containerized local development)
- MongoDB instance (local or Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/pulse.git](https://github.com/yourusername/pulse.git)
   cd pulse

```

2. **Install dependencies:**
```bash
npm install

```


3. **Set up Environment Variables:**
Create a `.env.local` file in the root directory and add the necessary configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

```


4. **Run the Development Server:**
```bash
npm run dev

```


The application will be available at `http://localhost:3000`.

### Running with Docker

To run the application using the initialized Docker setup:

```bash
docker-compose up --build

```

## 🧪 Testing

Pulse uses a dual testing strategy to ensure high reliability.

* **Run Unit/Component Tests (Vitest):**
```bash
npm run test

```


* **Run End-to-End Tests (Playwright):**
```bash
npm run test:e2e

```



*(Note: Ensure your local dev server is running before executing E2E tests, or configure Playwright's `webServer` option to start it automatically).*

## 👥 Contributors


* K.M.M.I. Karunarathna (ICT/24/868)

* R.M.U.A Harshana (ICT/24/851)

* Y.M.R. Shehan (ICT/24/931)

* M.B. Subhasinghe (ICT/24/934)

* J.J. Malshan (ICT/24/883)
