# 🐄 DoodhWala App

> Local milk delivery platform — connecting doodhwalas with customers

## Tech Stack

- **Frontend:** React.js + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB + Mongoose
- **Auth:** JWT
- **Validation:** Zod

---

## Project Structure

```
doodhwala/
├── backend/          # Express API
│   └── src/
│       ├── config/   # DB connection
│       ├── controllers/
│       ├── middleware/ # Auth middleware
│       ├── models/   # Mongoose schemas
│       ├── routes/
│       └── types/
└── frontend/         # React app
    └── src/
        ├── components/
        ├── context/  # Auth context
        ├── pages/    # Login, Register, Dashboards
        ├── types/
        └── utils/    # Axios instance
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

---

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — add your MONGODB_URI and change JWT_SECRET

npm install
npm run dev
# Server runs on http://localhost:5000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/v1/auth/register | Public |
| POST | /api/v1/auth/login | Public |
| GET | /api/v1/auth/me | Authenticated |

### Schedules
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/v1/schedules | Doodhwala |
| GET | /api/v1/schedules/today | Doodhwala |
| GET | /api/v1/schedules/my | Doodhwala |
| GET | /api/v1/schedules/active | Customer |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/v1/orders | Customer |
| GET | /api/v1/orders/my | Customer |
| PATCH | /api/v1/orders/:id/cancel | Customer |
| GET | /api/v1/orders/doodhwala | Doodhwala |
| PATCH | /api/v1/orders/:id/status | Doodhwala |

### Subscriptions
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/v1/subscriptions | Customer |
| GET | /api/v1/subscriptions/my | Customer |
| PATCH | /api/v1/subscriptions/:id/pause | Customer |
| PATCH | /api/v1/subscriptions/:id/cancel | Customer |

---

## Features

### Customer
- Register / Login
- See all available doodhwalas with today's schedule
- Order milk (quantity + price shown)
- View order history + status
- Cancel pending orders

### Doodhwala
- Register / Login
- Set daily schedule (arrival time, quantity, price)
- View today's orders with customer details
- Confirm / Cancel / Mark delivered
- See daily revenue stats

---

## Git Upload

```bash
git init
git add .
git commit -m "feat: initial DoodhWala app - full MERN + TypeScript"
git branch -M main
git remote add origin https://github.com/yourusername/doodhwala.git
git push -u origin main
```

---

## Deployment

### Backend — Railway / Render
1. Connect GitHub repo
2. Set environment variables (MONGODB_URI, JWT_SECRET, CLIENT_URL)
3. Build command: `npm run build`
4. Start command: `npm start`

### Frontend — Vercel / Netlify
1. Connect GitHub repo, set root to `frontend`
2. Set `REACT_APP_API_URL` = your deployed backend URL
3. Deploy!

---

## Next Features to Build
- [ ] Push notifications (arrival alert)
- [ ] Razorpay payment integration
- [ ] Monthly subscription billing
- [ ] Admin dashboard
- [ ] React Native mobile app
- [ ] WhatsApp bot integration
