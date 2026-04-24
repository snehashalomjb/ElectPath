# ElectPath 🗳️
**Your AI-powered guide through every step of voting**

---

## 📁 Project Structure

```
ElectPath/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/index.js     # Axios API client (all endpoints)
│   │   ├── hooks/index.js   # useFetch, useLocalStorage, useScrollBottom
│   │   ├── components/
│   │   │   └── BottomNav.jsx
│   │   └── pages/
│   │       ├── Home.jsx / .css
│   │       ├── ElectionProcess.jsx / .css
│   │       ├── Chat.jsx / .css
│   │       ├── Timeline.jsx / .css
│   │       └── Profile.jsx / .css
│   ├── index.html
│   └── vite.config.js       # Proxy: /api → localhost:5000
│
└── server/                  # Node.js + Express backend
    ├── models/
    │   ├── User.js
    │   ├── Timeline.js
    │   └── ProcessStep.js
    ├── routes/
    │   ├── user.js          # POST /api/user, GET /api/user/:id
    │   ├── process.js       # GET /api/process
    │   ├── timeline.js      # GET /api/timeline
    │   └── chat.js          # POST /api/chat (OpenAI)
    ├── index.js
    └── .env
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd server
# Copy and fill in your keys:
cp .env.example .env
npm install
npm run dev           # Starts on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev           # Starts on http://localhost:5173
```

> Open **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables (`server/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default 5000) | No |
| `MONGO_URI` | MongoDB connection string | No* |
| `OPENAI_API_KEY` | OpenAI API key | No* |
| `CLIENT_URL` | Frontend origin for CORS | No |

> \* App runs without MongoDB (in-memory store) and without OpenAI (smart fallback responses).

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| GET | `/api/process` | All 5 election process steps |
| GET | `/api/process/:step` | Single step by number |
| GET | `/api/timeline` | All timeline events |
| GET | `/api/timeline?status=active` | Filtered by status |
| POST | `/api/user` | Save user profile → recommendation |
| GET | `/api/user/:id` | Fetch user by ID |
| POST | `/api/chat` | AI chat (OpenAI / fallback) |

---

## 🤖 AI Chat

- **With API key**: Uses `gpt-4.1-mini` via OpenAI
- **Without API key**: Uses keyword-based smart fallback (covers registration, IDs, deadlines, mail-in, voting day)
- System prompt enforces non-partisan, beginner-friendly responses
- Conversation history passed for context (last 10 messages)

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | `#2D7FF9` |
| Background | `#F8FAFC` |
| Card | `#FFFFFF` |
| Text | `#0F172A` |
| Success | `#22C55E` |
| Alert | `#EF4444` |
| Font | Poppins (Google Fonts) |
| Frame | 390×844px (iPhone 14) |

---

## ✨ Features

- **Home Dashboard** — hero header, 2×2 card grid, quick facts, AI CTA
- **Election Process** — 5-step animated vertical stepper with expandable cards + progress bar
- **AI Chat** — messaging UI, typing indicator, suggestion chips, OpenAI integration
- **Timeline** — vertical event cards with status badges + filter tabs (All / Active / Upcoming / Completed)
- **Profile** — form with toggle switch, local-storage persistence, personalised recommendation, voting checklist
- **Graceful degradation** — works fully without MongoDB or OpenAI API key

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS (Poppins, CSS variables, 8px grid) |
| Backend | Node.js, Express.js |
| Database | MongoDB / Mongoose (optional — in-memory fallback) |
| AI | OpenAI API (`gpt-4.1-mini`) |
| HTTP Client | Axios |
