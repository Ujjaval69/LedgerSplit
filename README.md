# LedgerSplit — Expense Splitter with Debt Simplification

A full-stack expense-splitting app (Splitwise-style) for groups — hostel rooms, trips,
flatmates — with one feature most clones skip: **automatic debt simplification**.
Instead of showing every individual IOU, LedgerSplit computes the *minimum number
of transactions* needed to settle a whole group using a greedy graph algorithm.

## Why this project is more than a CRUD app

Anyone can build "add expense, split equally, show balances." The interesting part —
and the part worth talking about in an interview — is `backend/utils/settleUp.js`:

- Computes each member's **net balance** across every expense in a group.
- Runs a **greedy min-cash-flow algorithm**: repeatedly matches the largest creditor
  with the largest debtor and settles as much of that pair as possible.
- Guarantees at most `n - 1` transactions for `n` group members, instead of the
  potentially dozens of pairwise IOUs a naive implementation would produce.
- O(n log n) — dominated by the sort.

Example: 5 people, net balances `{A: +400, B: -100, C: -300, D: +200, E: -200}` →
resolves to just 4 transactions instead of a tangle of individual debts.

## Tech stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios, lucide-react
- **Deploy targets:** Render/Railway (backend) + Vercel (frontend), MongoDB Atlas (DB)

## Project structure

```
expense-splitter/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/                # User, Group, Expense schemas
│   ├── middleware/auth.js     # JWT verification middleware
│   ├── utils/settleUp.js      # The core algorithm — read this first
│   ├── routes/                # auth, groups, expenses REST endpoints
│   └── server.js
└── frontend/
    └── src/
        ├── api/client.js       # Axios instance with auth interceptor
        ├── context/AuthContext.jsx
        ├── pages/              # Login, Register, Dashboard, GroupDetail
        └── App.jsx
```

## Running it locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: paste your MongoDB Atlas connection string + a random JWT_SECRET
npm run dev
```

Backend runs on `http://localhost:5000`.

**Getting a free MongoDB Atlas connection string** (takes ~5 min):
1. Sign up at mongodb.com/cloud/atlas (free tier, no card needed for M0 cluster)
2. Create a free cluster → Database Access → add a user with a password
3. Network Access → allow access from anywhere (0.0.0.0/0) for development
4. Connect → "Drivers" → copy the connection string into `MONGO_URI` in `.env`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API endpoints

| Method | Route                     | Description                              |
|--------|----------------------------|-------------------------------------------|
| POST   | /api/auth/register         | Create account                            |
| POST   | /api/auth/login            | Log in, returns JWT                       |
| GET    | /api/auth/me                | Current user (requires token)             |
| GET    | /api/groups                 | List your groups                          |
| POST   | /api/groups                 | Create a group, invite by email           |
| GET    | /api/groups/:id             | Group + expenses + balances + settlements |
| POST   | /api/groups/:id/members     | Add a member                              |
| POST   | /api/expenses                | Add an expense (equal/percentage/exact)   |
| DELETE | /api/expenses/:id            | Remove an expense                         |

## Deploying (free tier, good enough for a resume demo link)

1. **Database:** MongoDB Atlas (free M0 cluster).
2. **Backend:** push `backend/` to its own GitHub repo (or use root dir setting) →
   deploy on Render.com as a Web Service → set env vars from `.env.example`.
3. **Frontend:** deploy `frontend/` on Vercel → set `VITE_API_URL` to your Render
   backend URL + `/api`.

## Ideas to extend (good for a "future work" section on your resume/README)

- Percentage/exact splits already exist in the backend (`splitType`) — wire up the
  UI for them (currently the UI only sends equal splits).
- Recurring expenses (rent, subscriptions).
- Email/WhatsApp reminder when someone owes money for >7 days.
- Expense categories + a spending breakdown chart.
- Real payment integration (Razorpay) instead of manual "mark as settled."

## What to say about this in an interview

- **"Why not just show every IOU?"** — because with n expenses among m people you
  can end up with far more transactions than necessary; the greedy algorithm
  bounds it to at most `m-1`.
- **"Why greedy, why not an exact optimal algorithm?"** — minimizing transaction
  count exactly is a harder combinatorial problem; the greedy largest-creditor/
  largest-debtor match is the standard practical approach and is provably within
  a small bound of optimal for this problem shape — good tradeoff of simplicity
  vs. correctness for a real app.
- **"How do you keep balances consistent?"** — the `shares` map is computed and
  stored per expense at write-time, so balance calculation later is just a sum
  reduction — no re-deriving split logic across split types when reading.
# LedgerSplit
