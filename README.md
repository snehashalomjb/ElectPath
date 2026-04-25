# ElectPath 🗳️
**Your AI-powered guide through every step of voting**

🌍 **Live Application:** [https://electpath-uaxkdit2xq-uc.a.run.app](https://electpath-uaxkdit2xq-uc.a.run.app)

---

## ✨ Features

- **Multi-Language Support** — fully translated in English, Hindi, Tamil, Telugu, Bengali, and Marathi via a dedicated `LangContext`.
- **In-App Notifications** — automated push alerts for election deadlines (e.g. registration, early voting) with urgency scoring and toast notifications.
- **Voter ID India Flow** — interactive 5-step application guide including an advanced state selector with direct links to all 28 States and 8 UTs CEO portals.
- **AI Chat** — messaging UI with voice input, streaming responses, typing indicator, suggestion chips, and OpenAI integration (with smart fallback).
- **Home Dashboard** — hero header, 2×2 card grid, quick facts, dynamic AI CTA.
- **Election Process** — 5-step animated vertical stepper with expandable cards + progress bar.
- **Timeline** — vertical event cards with status badges + filter tabs (All / Active / Upcoming / Completed).
- **Profile** — local-storage persistence, personalised recommendations, voting checklist.
- **Graceful Degradation** — works fully without MongoDB or OpenAI API key.

---

## 📁 Project Structure

```
ElectPath/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/index.js     
│   │   ├── context/         # LangContext.jsx, NotifContext.jsx
│   │   ├── data/            # indiaStates.js
│   │   ├── hooks/index.js   
│   │   ├── components/
│   │   │   ├── BottomNav.jsx
│   │   │   ├── LanguagePicker.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   └── ToastContainer.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── ElectionProcess.jsx
│   │       ├── Chat.jsx
│   │       ├── Timeline.jsx
│   │       ├── Profile.jsx
│   │       └── VoterIdIndia.jsx
│   ├── index.html
│   └── vite.config.js       
│
└── server/                  # Node.js + Express backend
    ├── models/
    ├── routes/
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
| GET | `/api/timeline` | All timeline events |
| POST | `/api/user` | Save user profile → recommendation |
| POST | `/api/chat` | AI chat (OpenAI / fallback) |
| POST | `/api/voter/eligibility-check` | Check age/citizen eligibility |
| POST | `/api/voter/apply-status` | Track application reference |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS (Poppins, CSS variables, Glassmorphism) |
| Backend | Node.js, Express.js |
| Database | MongoDB / Mongoose (optional — in-memory fallback) |
| AI | OpenAI API (`gpt-4.1-mini`) |
| Deployment| Google Cloud Run / Docker |
