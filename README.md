# MiniLedger 💸

MiniLedger is a full-stack mobile application designed to seamlessly track money lent to friends, manage pending repayments, and highlight overdue balances in real time.
 
---
 
## 📑 Table of Contents
 
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [Notes](#-notes)
---
 
## 🚀 Features
 
- **Phone Number Authentication:** Passwordless login using a phone number and a mock OTP (printed in the backend server logs).
- **Dashboard Overview:** Summary card showing **Total Lent**, **Total Repaid**, and **Overdue Amount**.
- **Loan Management:** Add loan entries with the friend's name, loan amount, and due date.
- **Overdue Highlighting:** Visual badges and highlighted cards for loans past their due date.
- **One-Tap Repayment:** Mark a loan as repaid instantly and see dashboard totals recalculate.
---
 
## 🛠 Tech Stack
 
| Layer | Technologies |
| --- | --- |
| **Backend** | Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, JWT, Zod |
| **Frontend** | React Native (Expo), TypeScript, Axios, React Native Async Storage |
| **Tooling** | Nodemon, Dotenv, CORS |
 
---
 
## 📂 Project Structure
 
```text
miniledger/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # PostgreSQL database schema
│   ├── src/
│   │   ├── controllers/       # Auth & loan controllers
│   │   ├── middleware/        # JWT authentication middleware
│   │   └── index.ts           # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── App.tsx                # Main app layout & logic
    ├── app.json
    └── package.json
```
 
---
 
## ⚡ Getting Started
 
### Prerequisites
 
- [Node.js](https://nodejs.org/) v18 or higher
- PostgreSQL installed locally, **or** a PostgreSQL connection string (e.g., from [Supabase](https://supabase.com/) or [Neon](https://neon.tech/))
- [Expo Go](https://expo.dev/go) installed on your physical mobile device
### 1. Backend Setup
 
1. **Navigate to the backend directory:**
```bash
   cd backend
```
 
2. **Install dependencies:**
```bash
   npm install
```
 
3. **Configure environment variables:**
   Copy the example file and fill in your values (see [Environment Variables](#-environment-variables)):
```bash
   cp .env.example .env
```
 
4. **Run database migrations:**
```bash
   npx prisma migrate dev --name init
```
 
5. **Start the development server:**
```bash
   npm run dev
```
 
   The server runs at `http://localhost:5000`.
 
### 2. Frontend Setup
 
1. **Navigate to the frontend directory:**
```bash
   cd frontend
```
 
2. **Install dependencies:**
```bash
   npm install
```
 
3. **Configure the API URL:**
   In `App.tsx`, set `API_URL` to your machine's local IPv4 address. Your phone and laptop must be on the same Wi-Fi or hotspot network.
```typescript
   const API_URL = 'http://<YOUR_LOCAL_IP>:5000/api';
```
 
4. **Start the Expo development server:**
```bash
   npx expo start -c
```
 
5. **Run on your device:**
   Scan the QR code with the Expo Go app.
---
 
## 🔐 Environment Variables
 
Create a `.env` file in the `backend/` directory:
 
```env
DATABASE_URL="postgresql://user:password@localhost:5432/miniledger?schema=public"
PORT=5000
JWT_SECRET="replace_with_a_long_random_secret"
```
 
| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `PORT` | Port the Express server listens on (default `5000`) |
| `JWT_SECRET` | Secret used to sign JSON Web Tokens. Use a long, random value and never commit it. |
 
> ⚠️ Make sure `.env` is listed in your `.gitignore` so secrets are not pushed to GitHub.
 
---
 
## 📝 Notes
 
- **Mock OTP:** No SMS provider is integrated. When you request an OTP, check the backend terminal for the code.
- **Local networking:** `localhost` will not work from a physical device. Always use your computer's local IP in `API_URL`.
