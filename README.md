# 🚕 CabGo - Ride-Hailing Platform

**CabGo** is a high-performance, full-stack ride-hailing solution. It bridges the gap between passengers and drivers through a streamlined interface, real-time data handling, and a robust SQLite backend.

---

## ✨ Key Features

* **Real-time Ride Dispatch:** Instant matching between available drivers and passenger requests.
* **Dynamic UI Components:** Responsive, mobile-first design built with Tailwind CSS.
* **Driver Management:** Tracking of driver status, ratings, and vehicle types.
* **Lightweight Persistence:** Optimized SQLite database for fast local storage and low-latency queries.
* **Type Safety:** End-to-end TypeScript implementation to minimize runtime errors.
* **Smart Logic:** Integration with Google Gemini AI for advanced route or location processing.

---

## 🚀 Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS (Modern Shorthand) |
| **Backend** | Node.js, Express |
| **Database** | SQLite 3 (`cabgo.db`) via `better-sqlite3` |
| **Integrations** | Stripe API, Google Gemini AI |

---

## 📊 Database Schema & Architecture

The system uses a relational structure to manage the lifecycle of a ride.



* **Users/Passengers:** Manages profile info, car models for drivers, and phone records.
* **Drivers:** Real-time tracking of coordinates (`lat`, `lng`) and availability status.
* **Rides:** Tracks state transitions (`pending`, `accepted`, `completed`, `cancelled`) and scheduling.
* **Payments:** Tracks Stripe Payment Intent IDs and transaction status.

---

## 📡 API Endpoints (Quick Reference)

* `GET /api/drivers` - Fetch list of nearby available drivers.
* `POST /api/ride-request` - Submit a new ride request to the queue.
* `GET /api/rides/share/:id` - Get public details for a specific ride.
* `POST /api/payments/create-intent` - Initialize Stripe payment process.
* `POST /api/payments/confirm` - Update payment status in the local DB.

---

## 🛠 Troubleshooting & Code Standards

### Tailwind CSS: Canonical Class Enforcement
Our project enforces the **Tailwind CSS Canonical Class** standard to ensure the codebase remains modern, consistent, and clean.

#### **Full Statement & Resolution**
If you see the linting warning: `The class 'flex-shrink-0' can be written as 'shrink-0'`, please follow the shorthand rules below. 



Modern Tailwind (v3.0+) prefers shorthand versions to improve readability and reduce the final CSS bundle footprint. You must replace verbose flex utility classes with their shorthand counterparts:

| Verbose Class (Old) | Canonical Class (New) | CSS Property |
| :--- | :--- | :--- |
| `flex-shrink-0` | **`shrink-0`** | `flex-shrink: 0;` |
| `flex-shrink` | **`shrink`** | `flex-shrink: 1;` |
| `flex-grow-0` | **`grow-0`** | `flex-grow: 0;` |
| `flex-grow` | **`grow`** | `flex-grow: 1;` |



📦 Project Structure
├── src/
│   ├── components/       # UI Elements (RideRequest, DriverCard, etc.)
│   ├── db/               # SQLite connection and initialization logic
│   ├── hooks/            # Custom React hooks for API and State
│   └── socket/           # WebSocket logic for real-time tracking
├── server.ts             # Express API, Stripe routes & Backend entry
├── cabgo.db              # SQLite Database file
├── .env.example          # Environment variables template
├── tsconfig.json         # TypeScript configuration
└── tailwind.config.js    # Styling design tokens
⚙️ Setup Instructions
Install Dependencies:

Bash
npm install
Environment Setup:

Bash
cp .env.example .env
# Add your STRIPE_SECRET_KEY and GEMINI_API_KEY to .env
Launch Development Environment:

Bash
npm run dev
Build for Production:

Bash
npm run build

🤝 Contribution Guidelines
Linting: Ensure all code passes type checks. Fix any canonical class warnings via VS Code Quick Fix (Cmd + .).

Naming: Use PascalCase for Components and camelCase for functions.

Security: Never commit your .env file; always update .env.example if new keys are added.

📝 License
Proprietary software. Internal use only for the CabGo Platform

**Example Correction in `RideRequest.tsx`:**
```tsx
// ❌ Avoid (Old Syntax)
<div className="flex-shrink-0 w-32 p-3 bg-zinc-50 ...">

// ✅ Use This (Modern Syntax)
<div className="shrink-0 w-32 p-3 bg-zinc-50 ...">
