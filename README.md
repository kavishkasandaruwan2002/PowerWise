#PowerWise

Here is a professional, modern, and comprehensive **README.md** file tailored exactly to your PRD.

You can copy and paste this code directly into your `README.md` file on GitHub.

***

```markdown
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
- [Team Members](#-team-members)

---

## 💡 About the Project

**PowerWise** is a comprehensive web application designed to help households manage their electricity consumption efficiently. Unlike standard trackers, WattWise uses **Block Tariff Calculation** to accurately predict monthly bills and provides **AI-driven smart tips** to reduce costs.

This system is built to support families, shared households (boarding houses), and administrators/NGOs focusing on **SDG 7 (Affordable and Clean Energy)**.

---

## 🚀 Key Features

### 🏡 1. User & Household Management
*   **Role-Based Access:** Secure login for Admins and Family members.
*   **Household Profiles:** Manage family size, location, and income brackets.
*   **Shared Housing:** Support for multiple users under one roof (Boarding/Apartments).

### 🔌 2. Appliance & Usage Tracking
*   **Inventory:** Add/Remove appliances (Cooling, Lighting, Cooking).
*   **Consumption Calc:** Estimate daily and monthly kWh based on usage hours.
*   **Meter Reading:** Manual entry of meter readings to track actual vs. estimated usage.

### 💰 3. Bill Prediction & Budgeting (High Value Core)
*   **Smart Prediction:** Uses **CEB Block Tariff logic** to simulate accurate bills.
*   **Budget Alerts:** Get notified when you hit **80%** or **100%** of your budget.
*   **Weather Adjustment:** Predicts higher usage on hot days (AC/Fans) or rainy days (Lights).

### 🏆 4. Smart Tips & Gamification
*   **Recommendation Engine:** Suggests tips based on your specific appliances and usage.
*   **Goal Tracking:** Set savings goals (e.g., "Reduce bill by Rs. 500") and earn badges.
*   **Community Stats:** Compare your usage anonymously with regional averages.

### 📊 5. Admin Dashboard (Social Impact)
*   **Aggregate Analytics:** View total kWh and money saved across all users.
*   **High Consumption Detection:** Identify wasteful appliance types regionally.
*   **Reports:** Export data for NGO or Policy Maker analysis.

---

## 💻 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS / Bootstrap |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (NoSQL) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Version Control** | Git & GitHub |

---

## 🛠 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js (v14 or higher)
*   MongoDB (Local or Atlas URL)
*   Git

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/WattWise-Energy-Manager.git
    cd WattWise-Energy-Manager
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the `backend` folder:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    ```

4.  **Install Frontend Dependencies** (Open a new terminal)
    ```bash
    cd frontend
    npm install
    ```

5.  **Run the Project**
    *   **Backend:** `npm run dev` (in backend folder)
    *   **Frontend:** `npm start` (in frontend folder)

---

## 📂 Project Architecture

```bash
PowerWise-Energy-Manager/
├── backend/                # Express & Node.js Server
│   ├── config/             # DB Connection
│   ├── controllers/        # Logic for User, Appliance, Budget
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Endpoints
│   └── server.js           # Entry Point
│
├── frontend/               # React Client
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Dashboard, Login, Profile
│   │   └── context/        # State Management
│   └── public/
│
├──docs/
│   ├── API.md              # API Documentation
│   ├── TESTING.md          # Testing Instructions
│
└── README.md               # Documentation
```

---

## 👥 Team Members

| Name | Role / Component | GitHub |
| :--- | :--- | :--- |
| **Member 1** | Appliance & Usage Tracking | [@kavishkasandaruwan2002]https://github.com/kavishkasandaruwan2002/ |
| **Member 2** | User & Household Management | [@nadeeshan1](https://github.com/nadeeshan1) |
| **Member 3** | Bill Prediction & Budget Management | [@ImeshaDissa](https://github.com/ImeshaDissa) |
| **Member 4** | Personalized Energy tips & Goal Tracking | [@theShihamAhamed](https://github.com/theShihamAhamed) |

---

<p align="center">
  Built with ❤️ for the Year 3 Project
</p>
```
