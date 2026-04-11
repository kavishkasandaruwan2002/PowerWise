# ⚡ PowerWise

![Project Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **A Smart Domestic Electricity Management System**  
> track usage · predict bills · save money · reduce carbon footprint

---

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Architecture](#-project-architecture)
- [API Endpoint Documentation](#-api-endpoint-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Team Members](#-team-members)

---

## 💡 About the Project

**PowerWise** is a comprehensive web application designed to help households manage their electricity consumption efficiently. Unlike standard trackers, PowerWise uses **Block Tariff Calculation** to accurately predict monthly bills and provides **AI-driven smart tips** to reduce costs.

This system is built to support families, shared households (boarding houses), and administrators/NGOs focusing on **SDG 7 (Affordable and Clean Energy)**.

---

## 🚀 Key Features

### 🏡 1. User & Household Management
- **Role-Based Access:** Secure login for Admins and Family members.
- **Household Profiles:** Manage family size, location, and income brackets.
- **Shared Housing:** Support for multiple users under one roof (Boarding/Apartments).

### 🔌 2. Appliance & Usage Tracking
- **Inventory:** Add/Remove appliances (Cooling, Lighting, Cooking).
- **Consumption Calc:** Estimate daily and monthly kWh based on usage hours.
- **Meter Reading:** Manual entry of meter readings to track actual vs. estimated usage.

### 💰 3. Bill Prediction & Budgeting
- **Smart Prediction:** Uses **CEB Block Tariff logic** to simulate accurate bills.
- **Budget Alerts:** Get notified when you hit **80%** or **100%** of your budget.
- **Weather Adjustment:** Predicts higher usage on hot days (AC/Fans) or rainy days (Lights).

### 🏆 4. Smart Tips & Gamification
- **Recommendation Engine:** Suggests tips based on your specific appliances and usage.
- **Goal Tracking:** Set savings goals (e.g., "Reduce bill by Rs. 500") and earn badges.
- **Community Stats:** Compare your usage anonymously with regional averages.

### 📊 5. Admin Dashboard
- **Aggregate Analytics:** View total kWh and money saved across all users.
- **High Consumption Detection:** Identify wasteful appliance types regionally.
- **Reports:** Export data for NGO or Policy Maker analysis.

---

## 💻 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (NoSQL) |
| **Authentication** | JWT (JSON Web Tokens) |
| **API Docs** | Swagger UI |
| **Testing** | Jest, Supertest, Artillery |
| **Version Control** | Git & GitHub |

---

## 🛠 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB Atlas account or local MongoDB instance
- Git

### Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/kavishkasandaruwan2002/PowerWise.git
    cd PowerWise
    ```

2. **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3. **Configure Backend Environment Variables**

    Create a `.env` file in the `backend/` folder (see [Environment Variables](#environment-variables) section):
    ```bash
    cp .env.example .env
    # then edit .env with your values
    ```

4. **Install Frontend Dependencies**
    ```bash
    cd ../frontend
    npm install
    ```

5. **Configure Frontend Environment Variables**

    Create a `.env` file in the `frontend/` folder:
    ```env
    VITE_API_URL=http://localhost:5000
    ```

6. **Run the Project**
    ```bash
    # Terminal 1 — Backend
    cd backend
    npm run dev

    # Terminal 2 — Frontend
    cd frontend
    npm run dev
    ```

7. **Access the Application**
    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:5000`
    - Swagger Docs: `http://localhost:5000/api-docs`

### Environment Variables

The following environment variables are required for the backend. Create a `.env` file in `backend/` and populate with your own values. **Never commit this file.**

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `PORT` | Port for the Express server (default: 5000) |
| `NODE_ENV` | Environment (`development` / `production`) |
| `FRONTEND_URL` | URL of the frontend app (for CORS) |
| `JWT_ACCESS_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRE` | JWT expiry duration (e.g. `7d`) |
| `ADMIN_SECRET_KEY` | Secret key required to register admin accounts |

---

## 📂 Project Architecture

```
PowerWise/
├── backend/                  # Express & Node.js Server
│   ├── config/               # DB connection
│   ├── controllers/          # Route handlers / business logic
│   ├── middleware/           # Auth, admin, validation middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── services/             # Service layer (CalculationService etc.)
│   ├── tests/                # Jest unit & integration tests
│   │   ├── calculation.test.js
│   │   └── integration.test.js
│   ├── artillery.config.yml  # Artillery performance test config
│   └── server.js             # Entry point
│
├── frontend/                 # React client
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Dashboard, Login, Profile, etc.
│   │   └── context/          # State management (Context API)
│   └── public/
│
└── README.md
```

---

## 📡 API Endpoint Documentation

- **Swagger UI** (interactive): `http://localhost:5000/api-docs` (or the deployed backend URL)
- **Detailed reference**: See `docs/PowerWise_API_Endpoint_Documentation.docx` in the repository

### Module Summary

| Module | Base Path | Endpoints |
| :--- | :--- | :--- |
| Authentication | `/api/auth` | 7 |
| Household Management | `/api/households` | 11 |
| Admin Management | `/api/admin` | 6 |
| Appliances | `/api/appliances` | 8 |
| Meter Readings | `/api/readings` | 5 |
| Tariffs | `/api/v1/tariffs` | 12 |
| Budgets | `/api/v1/budgets` | 15 |
| Consumption | `/api/v1/consumption` | 17 |
| Bill Predictions | `/api/v1/predictions` | 12 |
| Alerts | `/api/v1/alerts` | 13 |
| Usage Spike Detection | `/api/v1/usage` | 6 |
| Energy Tips | `/api/v1/tips` | 7 |
| Admin Tips | `/api/v1/admin-tips` | 4 |

**Base URL:** `http://localhost:5000`  
**Auth:** All protected routes require `Authorization: Bearer <JWT_TOKEN>`  
**Token:** Obtained from `POST /api/auth/login`

---

## 1. Health Check

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| GET | /api/health | Public | Check API health and service status |

---

## 2. Authentication

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| POST | /api/auth/register | Public | Register a new user |
| POST | /api/auth/register-admin | Public | Register a new admin (requires secret key) |
| POST | /api/auth/login | Public | Login and receive JWT token |
| GET | /api/auth/me | Protected | Get current user profile |
| POST | /api/auth/logout | Protected | Logout current user |
| PUT | /api/auth/update-password | Protected | Update password |
| PUT | /api/auth/me | Protected | Update current user profile |

---

## 3. Household Management

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| POST | /api/households | Public | Create a new household |
| GET | /api/households/my | Public | Get my household profile |
| PUT | /api/households/:id | Protected | Update household profile |
| DELETE | /api/households/:id | Protected | Delete a household |
| POST | /api/households/:id/members | Protected | Add a member to household |
| DELETE | /api/households/:id/members/:memberId | Protected | Remove a member from household |
| PUT | /api/households/:id/transfer-owner | Protected | Transfer household ownership |
| POST | /api/households/:id/budgets | Protected | Set or update monthly electricity budget |
| GET | /api/households/:id/budgets | Protected | Get full budget history |
| PUT | /api/households/:id/budgets/:budgetId | Protected | Update a specific budget entry |
| DELETE | /api/households/:id/budgets/:budgetId | Protected | Delete a budget entry |

---

## 4. Admin Management

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| GET | /api/admin/stats | Admin | Get admin dashboard statistics |
| GET | /api/admin/users | Admin | Get all users (with filters & pagination) |
| PUT | /api/admin/users/:id/toggle-active | Admin | Activate or deactivate a user |
| PUT | /api/admin/users/:id/role | Admin | Change a user's role |
| GET | /api/admin/households | Admin | Get all households (with filters) |
| GET | /api/admin/households/:id | Admin | Get a household by ID |

---

## 5. Household Weather & Prediction

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| GET | /api/prediction/:householdId/weather | Protected | Get current weather and 5-day forecast for household |
| GET | /api/prediction/:householdId/predict | Protected | Predict next month's electricity consumption |

---

## 6. Appliances

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| GET | /api/appliances | Protected | Get all appliances for the authenticated user |
| POST | /api/appliances | Protected | Create a new appliance |
| GET | /api/appliances/efficiency | Protected | Get efficiency comparison across all appliances |
| GET | /api/appliances/carbon | Protected | Get carbon footprint for all appliances |
| GET | /api/appliances/:id | Protected | Get a single appliance by ID |
| PUT | /api/appliances/:id | Protected | Update an existing appliance |
| DELETE | /api/appliances/:id | Protected | Delete an appliance |
| GET | /api/appliances/:id/suggestions | Protected | Get energy-saving replacement suggestions |

---

## 7. Meter Readings

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| POST | /api/readings | Protected | Submit a new meter reading |
| GET | /api/readings | Protected | Get reading history with pagination |
| GET | /api/readings/compare | Protected | Compare estimated vs actual consumption |
| GET | /api/readings/anomalies | Protected | Detect usage anomalies in reading history |
| DELETE | /api/readings/:id | Protected | Delete a meter reading |

---

## 8. Tariffs

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| GET | /api/v1/tariffs | Protected | Get all tariff plans |
| GET | /api/v1/tariffs/active | Protected | Get the active tariff plan |
| GET | /api/v1/tariffs/:id | Protected | Get a tariff plan by ID |
| POST | /api/v1/tariffs/calculate-bill | Protected | Calculate a bill using the active tariff |
| POST | /api/v1/tariffs/compare | Protected | Compare tariff scenarios for multiple consumption levels |
| GET | /api/v1/tariffs/search/:searchTerm | Protected | Search tariff plans |
| POST | /api/v1/tariffs | Admin | Create a tariff plan |
| PUT | /api/v1/tariffs/:id | Admin | Update a tariff plan |
| DELETE | /api/v1/tariffs/:id | Admin | Deactivate a tariff plan |
| POST | /api/v1/tariffs/:id/calculate-bill | Protected | Calculate a bill with a specific tariff |
| GET | /api/v1/tariffs/:id/history | Protected | Get tariff version history |
| GET | /api/v1/tariffs/:id/export | Admin | Export a tariff as JSON |

---

## 9. Budgets

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| POST | /api/v1/budgets | Protected (Owner) | Create a budget |
| GET | /api/v1/budgets | Protected | Get budgets |
| GET | /api/v1/budgets/:id | Protected | Get a budget by ID |
| GET | /api/v1/budgets/household/:householdId/active | Protected | Get the active budget for a household |
| GET | /api/v1/budgets/household/:householdId/current | Protected | Get the current month budget for a household |
| PUT | /api/v1/budgets/:id | Protected (Owner) | Update a budget |
| POST | /api/v1/budgets/:id/consumption | Protected | Update budget consumption |
| GET | /api/v1/budgets/:id/progress | Protected | Get budget progress |
| GET | /api/v1/budgets/:id/compare | Protected | Compare budget versus actual usage |
| GET | /api/v1/budgets/:id/alerts | Protected | Get alerts attached to a budget |
| PUT | /api/v1/budgets/:id/alerts/:alertIndex/read | Protected | Mark a budget alert as read |
| GET | /api/v1/budgets/household/:householdId/range | Protected | Get budgets in a date range |
| GET | /api/v1/budgets/:id/forecast | Protected | Forecast the next month budget |
| DELETE | /api/v1/budgets/:id | Protected (Owner) | Deactivate a budget |
| GET | /api/v1/budgets/admin/exceeded | Admin | Get budgets that exceeded their limits |

---

## 10. Consumption

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| POST | /api/v1/consumption | Public | Record household consumption |
| GET | /api/v1/consumption | Public | Get consumption records for a household |
| GET | /api/v1/consumption/range | Public | Get consumption records in a date range |
| GET | /api/v1/consumption/daily/:householdId/:date | Public | Get daily consumption for a date |
| GET | /api/v1/consumption/last-days/:householdId | Public | Get consumption for the last N days |
| GET | /api/v1/consumption/anomalies/:householdId | Public | Get consumption anomalies |
| GET | /api/v1/consumption/analytics/:householdId | Public | Get consumption analytics |
| GET | /api/v1/consumption/average | Public | Get average consumption for a period |
| GET | /api/v1/consumption/trend/:householdId | Public | Get the consumption trend |
| GET | /api/v1/consumption/weekly-summary/:householdId | Public | Get weekly consumption summaries |
| GET | /api/v1/consumption/monthly-summary/:householdId | Public | Get monthly consumption summaries |
| POST | /api/v1/consumption/compare | Public | Compare two consumption periods |
| POST | /api/v1/consumption/check-anomaly | Public | Check whether a new value is anomalous |
| POST | /api/v1/consumption/bulk-import | Public | Bulk import consumption records |
| PUT | /api/v1/consumption/:id | Public | Update a consumption record |
| PUT | /api/v1/consumption/:id/verify | Public | Verify or flag a consumption record |
| DELETE | /api/v1/consumption/:id | Public | Delete a consumption record |

---

## 11. Bill Predictions

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| POST | /api/v1/predictions | Protected | Create a bill prediction |
| GET | /api/v1/predictions/latest/:householdId | Protected | Get the latest prediction for a household |
| GET | /api/v1/predictions/:householdId/month-end | Protected | Get the month-end forecast |
| POST | /api/v1/predictions/:householdId/forecast | Protected | Get a detailed forecast |
| GET | /api/v1/predictions/period/:householdId | Protected | Get prediction for a specific period |
| GET | /api/v1/predictions/history/:householdId | Protected | Get prediction history |
| GET | /api/v1/predictions/:id | Protected | Get a prediction by ID |
| GET | /api/v1/predictions/:id/summary | Public | Get a user-friendly prediction summary |
| POST | /api/v1/predictions/:id/compare | Public | Compare a prediction with actual results |
| PUT | /api/v1/predictions/:id/status | Public | Update a prediction status |
| DELETE | /api/v1/predictions/:householdId/old | Public | Delete old predictions for a household |
| GET | /api/v1/predictions/admin/at-risk | Public | Get households at risk of exceeding budget |

---

## 12. Alerts

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| GET | /api/v1/alerts | Protected | Get alerts for the authenticated user |
| GET | /api/v1/alerts/unread-count | Protected | Get the unread alert count |
| GET | /api/v1/alerts/unread | Protected | Get unread alerts |
| GET | /api/v1/alerts/critical | Protected | Get critical alerts |
| GET | /api/v1/alerts/household/:householdId | Protected | Get alerts for a household |
| GET | /api/v1/alerts/type/:type | Protected | Get alerts by type |
| GET | /api/v1/alerts/range | Protected | Get alerts within a date range |
| GET | /api/v1/alerts/:id | Protected | Get an alert by ID |
| PUT | /api/v1/alerts/:id/read | Protected | Mark an alert as read |
| PUT | /api/v1/alerts/mark-all-read | Protected | Mark all alerts as read |
| PUT | /api/v1/alerts/:id/dismiss | Protected | Dismiss an alert |
| PUT | /api/v1/alerts/:id/resolve | Protected | Resolve an alert |
| DELETE | /api/v1/alerts/:id | Protected | Delete an alert |

---

## 13. Usage Spike Detection

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| POST | /api/v1/usage/check-spike | Protected | Check whether current usage is a spike |
| GET | /api/v1/usage/anomalies/:householdId | Protected | Detect spike-related anomalies |
| GET | /api/v1/usage/spike-history/:householdId | Protected | Get spike history |
| POST | /api/v1/usage/analyze-spike | Protected | Analyze a specific spike in detail |
| GET | /api/v1/usage/compare/:householdId/:date | Protected | Compare a day against the average |
| GET | /api/v1/usage/spike-causes/:householdId/:date | Protected | Identify possible causes for a spike |

---

## 14. Energy Tips

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| GET | /api/v1/tips/recommendations | Protected | Get personalized energy tips |
| GET | /api/v1/tips/all | Protected | Get all active tips (excluding dismissed) |
| GET | /api/v1/tips/interactions | Protected | Get my tip interactions |
| POST | /api/v1/tips/:tipId/bookmark | Protected | Bookmark a tip |
| POST | /api/v1/tips/:tipId/implement | Protected | Mark a tip as implemented |
| POST | /api/v1/tips/:tipId/feedback | Protected | Submit feedback for a tip |
| POST | /api/v1/tips/:tipId/dismiss | Protected | Dismiss a tip for a number of days |

---

## 15. Admin Tips

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| GET | /api/v1/admin-tips | Admin | Get all energy tips for admin management |
| POST | /api/v1/admin-tips | Admin | Create a new energy tip |
| PATCH | /api/v1/admin-tips/:tipId | Admin | Update an existing energy tip |
| DELETE | /api/v1/admin-tips/:tipId | Admin | Deactivate an energy tip |

### Authentication

All protected routes require a JWT token in the request header:
```
Authorization: Bearer <JWT_TOKEN>
```
Obtain a token by calling `POST /api/auth/login`.

### Example Requests

**Register a new user**
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Kasun Perera", "email": "kasun@example.com", "password": "password123", "incomeBracket": "middle"}'
```

**Login**
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "kasun@example.com", "password": "password123"}'
```

**Add an appliance**
```bash
curl -X POST "http://localhost:5000/api/appliances" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "AC Unit", "wattage": 1500, "dailyUsageHours": 8, "category": "Cooling", "efficiencyRating": "Standard"}'
```

---

## 🧪 Testing

Full testing instructions are available in `docs/PowerWise_Testing_Instruction_Report.docx`.

### Unit Tests

Validates individual service functions in isolation using Jest.

```bash
cd backend
npx jest tests/calculation.test.js --verbose
```

### Integration Tests

Tests full HTTP request/response cycles against a live database using Supertest.

```bash
cd backend
npm test -- --forceExit --verbose
```

### Performance Tests

Evaluates API behaviour under concurrent load using Artillery.

```bash
# Install Artillery (one-time)
npm install -g artillery

# Start the server first
npm run dev

# Run performance tests (in a separate terminal)
cd backend
artillery run artillery.config.yml
```

To generate an HTML report:
```bash
artillery run artillery.config.yml --output results.json
artillery report results.json
```

### Test Results Summary

| Test Type | Tool | Tests | Status |
| :--- | :--- | :--- | :--- |
| Unit | Jest | 24 | ✅ All passing |
| Integration | Jest + Supertest | 22 | ✅ All passing |
| Performance | Artillery | 4 scenarios | ✅ Configured |

---

## 🌐 Deployment

### Backend — Render

**Platform:** [Render](https://render.com)

**Setup Steps:**
1. Push the repository to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repository
4. Configure the service:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add all environment variables listed in the [Environment Variables](#environment-variables) section
6. Click **Deploy**

**Environment Variables set on Render:**

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `PORT` | Set automatically by Render |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Deployed Vercel frontend URL |
| `JWT_ACCESS_SECRET` | JWT signing secret |
| `JWT_EXPIRE` | `7d` |
| `ADMIN_SECRET_KEY` | Admin registration secret |

> ⚠️ Actual secret values are not shown here. Set them directly in the Render dashboard.

**Live Backend URL:** `https://YOUR-APP-NAME.onrender.com`

---

### Frontend — Vercel

**Platform:** [Vercel](https://vercel.com)

**Setup Steps:**
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Configure the project:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables:
   - `VITE_API_URL` = your deployed Render backend URL
5. Click **Deploy**

**Environment Variables set on Vercel:**

| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | Deployed backend API base URL |

**Live Frontend URL:** `https://YOUR-APP-NAME.vercel.app`

---

### Deployment Screenshots

> *(Add screenshots of the Render and Vercel dashboards showing successful deployment here)*

---

## 👥 Team Members

| Registration No. | Name | Component | GitHub |
| :--- | :--- | :--- | :--- |
| IT23565012 | Dissanayaka L I S | Budget Management & Bill Prediction | @ImeshaDissa |
| IT23690516 | Ahamed A S S | Personalized Energy Tips & Goal Tracking | @theShihamAhamed |
| IT23633322 | Sandaruwan H M K | Appliance & Usage Tracking | @kavishkasandaruwan2002 |
| IT23608740 | Nadeeshan R M K | Household Profile Management | @nadeeshan1 |
