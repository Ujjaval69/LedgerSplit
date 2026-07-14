# 💰 LedgerSplit

<div align="center">

### A modern full-stack expense splitting platform with intelligent debt simplification.

Built with **React • Node.js • Express • MongoDB**

Automatically minimizes the number of transactions required to settle shared expenses using a greedy **Min Cash Flow** algorithm.

---

🌐 **Live Demo**

**Frontend:** https://ledgersplit-frontend.vercel.app

**Backend API:** https://ledgersplit.onrender.com

</div>

---

# ✨ Features

## 🔐 Authentication

- JWT Authentication
- Secure Password Hashing (bcrypt)
- Protected Routes
- Persistent Login
- Logout
- Environment Variable Support

> Upcoming
- Google Login
- Forgot Password (OTP)
- Email Verification

---

## 👥 Group Management

- Create Groups
- Invite Members
- Add Members by Email
- View All Groups
- Group Dashboard

---

## 💸 Expense Management

- Add Shared Expenses
- Equal Expense Split
- Percentage Split (Backend Ready)
- Exact Amount Split (Backend Ready)
- Delete Expenses
- Automatic Balance Calculation

---

## 💳 Settlement Engine

The core feature of LedgerSplit.

Instead of displaying dozens of unnecessary IOUs, LedgerSplit computes the minimum number of transactions required to settle an entire group.

Example

Before

Alice owes Bob ₹200

Alice owes Charlie ₹300

Bob owes Charlie ₹100

Charlie owes David ₹400

David owes Alice ₹100

↓

After Debt Simplification

Alice → Charlie ₹400

Bob → Charlie ₹100

David → Charlie ₹300

Much fewer transactions.

---

# 🚀 Why LedgerSplit?

Many expense splitter projects stop after implementing CRUD operations.

LedgerSplit goes further.

It includes a **Debt Simplification Engine** that transforms multiple overlapping debts into the smallest possible set of settlements.

This makes the application closer to how production apps like Splitwise optimize settlements.

---

# 🧠 Debt Simplification Algorithm

Located in

```
backend/utils/settleUp.js
```

Algorithm

1. Compute every user's net balance.
2. Positive balance → creditor.
3. Negative balance → debtor.
4. Match the largest creditor with the largest debtor.
5. Settle as much debt as possible.
6. Repeat until everyone reaches zero.

Example

```
Net Balances

Alice    +400
Bob      -100
Charlie  -300
David    +200
Emma     -200
```

↓

```
Transactions

Bob → Alice ₹100

Charlie → Alice ₹300

Emma → David ₹200
```

Complexity

```
O(n log n)
```

Sorting dominates the runtime.

The algorithm guarantees at most **n − 1** settlement transactions.

---

# 🏗️ System Architecture

```
                React (Vite)

                       │

                    Axios

                       │

             Express REST API

                       │

          JWT Authentication

                       │

            Business Logic

                       │

         Debt Simplification

                       │

             MongoDB Atlas
```

---

# 🗂 Project Structure

```
expense-splitter/

├── backend/
│
├── config/
│   └── db.js
│
├── middleware/
│   └── auth.js
│
├── models/
│   ├── User.js
│   ├── Group.js
│   └── Expense.js
│
├── routes/
│   ├── auth.js
│   ├── groups.js
│   └── expenses.js
│
├── utils/
│   └── settleUp.js
│
└── server.js

------------------------------------------------

frontend/

├── src/
│
├── api/
│
├── components/
│
├── context/
│
├── pages/
│
├── hooks/
│
└── App.jsx
```

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Lucide React

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

## Deployment

- Vercel
- Render
- MongoDB Atlas

---

# 📡 REST APIs

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/me |

---

## Groups

| Method | Endpoint |
|---------|----------|
| GET | /api/groups |
| POST | /api/groups |
| GET | /api/groups/:id |
| POST | /api/groups/:id/members |

---

## Expenses

| Method | Endpoint |
|---------|----------|
| POST | /api/expenses |
| DELETE | /api/expenses/:id |

---

# 🔒 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected APIs
- Environment Variables
- CORS Configuration
- Authentication Middleware

---

# ⚙️ Local Setup

## Clone Repository

```bash
git clone <repo-url>
```

---

## Backend

```bash
cd backend
npm install
cp .env.example .env
```

Update

```
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
```

Run

```bash
npm run dev
```

Backend

```
http://localhost:5000
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend

```
http://localhost:5173
```

---

# 📸 Screenshots

> Add screenshots here.

- Login Page
- Dashboard
- Group Details
- Add Expense
- Dark Mode
- Mobile View

---

# 🛣 Roadmap

## Completed

- JWT Authentication
- Expense Splitting
- Group Management
- Debt Simplification
- Settlements
- Responsive UI
- Dark Mode

## In Progress

- Dashboard Analytics
- Activity History
- Expense Categories

## Planned

- Google Authentication
- Forgot Password
- Email Verification
- Charts
- Notifications
- Recurring Expenses

---

# 💡 Interview Highlights

This project demonstrates

- REST API Design
- Authentication & Authorization
- MongoDB Schema Design
- State Management
- Deployment
- Algorithm Design
- Time Complexity Analysis
- Production Environment Configuration
- Secure Password Storage
- Responsive Frontend Development

Interview Question

> Why not simply show every IOU?

Because that creates unnecessary transactions.

LedgerSplit computes each member's net balance and minimizes settlements using a greedy Min Cash Flow algorithm, reducing the transaction count to at most **n − 1**, making settlements significantly easier for users.

---

# 👨‍💻 Author

**Ujjaval Goyal**

B.E. Computer Science Engineering

Built to demonstrate full-stack development, REST API design, authentication, deployment, and algorithmic problem solving.

---

## ⭐ If you found this project interesting, consider giving it a star.
