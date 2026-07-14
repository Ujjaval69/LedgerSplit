# LedgerSplit — Expense Splitter with Debt Simplification

A full-stack expense-splitting app (Splitwise-style) for groups — hostel rooms, trips, flatmates — with automatic debt simplification.

## 🌐 Live Demo

**Frontend:** https://ledgersplit-frontend.vercel.app

**Backend API:** https://ledgersplit.onrender.com

---

## Why this project?

Most expense splitters calculate who owes whom.

LedgerSplit goes one step further by simplifying debts. Instead of showing every individual IOU, it computes the minimum number of transactions required to settle an entire group using a greedy **Min Cash Flow** algorithm.

For example, instead of:

```
A → B
A → C
C → D
D → B
```

LedgerSplit simplifies it to only the transactions that are actually needed.

---

## Features

- JWT Authentication
- Create and manage groups
- Add members by email
- Add shared expenses
- Automatic balance calculation
- Debt simplification (minimum settlements)
- Responsive UI
- Dark mode

---

## Tech Stack

### Frontend

- React (Vite)
- React Router
- Tailwind CSS
- Axios
- lucide-react

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

### Deployment

- Vercel
- Render
- MongoDB Atlas

---

## Project Structure

```text
expense-splitter/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   │   └── settleUp.js
│   └── server.js
│
└── frontend/
    └── src/
```

---

## Debt Simplification Algorithm

The core logic lives in:

```
backend/utils/settleUp.js
```

It works by:

1. Calculating each member's net balance.
2. Separating creditors and debtors.
3. Repeatedly matching the largest creditor with the largest debtor.
4. Settling the maximum possible amount each time.

Time Complexity:

```
O(n log n)
```

This guarantees at most **n − 1** settlement transactions.

---

## Running Locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint |
|---------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/me |
| GET | /api/groups |
| POST | /api/groups |
| GET | /api/groups/:id |
| POST | /api/groups/:id/members |
| POST | /api/expenses |
| DELETE | /api/expenses/:id |

---

## Future Improvements

- Expense categories
- Dashboard analytics
- Activity history
- Forgot password (OTP)
- Email verification
- Google Sign-In
- Charts

---

## Interview Talking Point

The interesting part of LedgerSplit isn't the CRUD functionality.

The project focuses on minimizing settlement transactions using a greedy debt simplification algorithm, making group payments significantly easier than a naïve pairwise debt calculation.
