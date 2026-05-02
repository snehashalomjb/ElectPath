# ElectPath 🗳️
**Your AI-powered guide through every step of voting**

🌍 **Live Application:** [https://electpath-62772444399.us-central1.run.app](https://electpath-62772444399.us-central1.run.app)

---

## ✨ Features

### 🏠 Home Dashboard
- Hero header with Election 2026 badge, animated stats strip
- 3×2 card grid linking to all major sections
- Quick Facts panel and Indian Voter ID shortcut banner

### 📰 Real-Time Election News
- **Live RSS feed** from NDTV, The Hindu, and Times of India via CORS proxy
- Skeleton loading animation while fetching, auto-refreshes every 5 minutes
- **Counting Day alert banner** — Results declared from 8 AM on May 4
- Category filter pills: All, Live, Elections, West Bengal, Tamil Nadu, Kerala, Assam, ECI Update
- Live scrolling ticker with latest headlines
- Expandable article cards with full summary + direct source links + share button
- Graceful fallback to 8 curated articles if RSS fetch fails

### 📊 Election Results 2026 Tracker
- **Official ECI Schedule** — Assam, Kerala, Puducherry, Tamil Nadu, West Bengal with exact polling dates and phases
- **Live countdown timer** (days · hours · minutes · seconds) to May 4 counting day
- Progress tracker: Polling ✅ → Counting ⏳ → Results 📊
- Summary stats: 5 States Voted · 824 Total Seats · 4 Phases · ~29 Crore Votes Cast
- State-wise voter **turnout progress bars** per phase
- **Exit poll projections** per state (expandable cards)
- Results Day guide — how to follow live counting at results.eci.gov.in

### 🗳️ Ballot Demo — How to Vote
- **6-step interactive voting guide** — Polling Station → Identity Check → Booth → Find Party → Press EVM Button → VVPAT
- **EVM Simulator** — press a button to cast a vote for BJP 🪷, INC ✋, AAP 🧹, SP 🚲, BSP 🐘, or NOTA ✖️
- Green screen confirmation, confetti animation, vote success card, reset to try again
- **Party Symbols Reference** — all major parties with full name, symbol emoji, symbol name, color-coded cards
- NOTA explanation and "Why Symbols Matter" info card
- VVPAT (Voter Verifiable Paper Audit Trail) explanation

### 🤖 AI Chat Assistant
- Streaming responses with typing indicator and suggestion chips
- Voice input (Web Speech API) with interim results
- OpenAI `gpt-4.1-mini` integration with smart keyword-based fallback
- Personalised responses based on user profile (name, location, voter ID status)
- Chat history persistence in localStorage (capped at 60 messages)

### 🇮🇳 Voter ID India Flow
- Interactive 5-step application guide (Eligibility → Documents → Apply → Track → Complete)
- Advanced state selector with direct links to all 28 States and 8 UTs CEO portals
- Real-time eligibility check, document checklist, reference ID tracker

### 📅 Election Timeline
- Vertical event cards with status badges
- Filter tabs: All / Active / Upcoming / Completed

### 👤 Profile
- Local-storage persistence, personalised voting recommendations
- Voting readiness checklist

### 🌐 Multi-Language Support
- Fully translated in **English, Hindi, Tamil, Telugu, Bengali, Marathi**
- Via dedicated `LangContext` with instant switching

### 🔔 In-App Notifications
- Automated alerts for election deadlines with urgency scoring
- Toast notification stack, slide-down notification panel

### 🛡️ Graceful Degradation
- Runs fully without MongoDB (in-memory fallbacks)
- Runs fully without OpenAI API key (smart rule-based fallback responses)
- News page falls back to curated articles if RSS feeds are unavailable

---

## 📁 Project Structure

```
ElectPath/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── api/index.js
│   │   ├── context/            # LangContext.jsx, NotifContext.jsx
│   │   ├── data/               # indiaStates.js
│   │   ├── hooks/index.js
│   │   ├── components/
│   │   │   ├── BottomNav.jsx        # Home · News · Results · Chat nav
│   │   │   ├── LanguagePicker.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   └── ToastContainer.jsx
│   │   └── pages/
│   │       ├── Home.jsx             # Dashboard
│   │       ├── News.jsx             # Real-time RSS news
│   │       ├── ElectionResults.jsx  # 2026 election schedule & countdown
│   │       ├── BallotDemo.jsx       # EVM simulator & how-to-vote guide
│   │       ├── ElectionProcess.jsx  # 5-step election process
│   │       ├── Chat.jsx             # AI chat assistant
│   │       ├── Timeline.jsx         # Election timeline
│   │       ├── Profile.jsx          # User profile
│   │       ├── VoterIdIndia.jsx     # Voter ID application flow
│   │       └── Splash.jsx           # Splash screen
│   ├── index.html
│   └── vite.config.js
│
└── server/                     # Node.js + Express backend
    ├── models/
    ├── routes/
    │   ├── chat.js             # Streaming AI chat (OpenAI + fallback)
    │   ├── process.js          # Election process steps
    │   ├── timeline.js         # Timeline events
    │   ├── user.js             # User profile & recommendations
    │   └── voter.js            # Voter ID eligibility & status
    ├── index.js
    └── .env
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd server
cp .env.example .env      # Fill in your keys
npm install
node index.js             # Starts on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev               # Starts on http://localhost:5173
```

> Open **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables (`server/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default 5000) | No |
| `MONGO_URI` | MongoDB connection string | No* |
| `OPENAI_API_KEY` | OpenAI API key for AI chat | No* |
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
| POST | `/api/chat` | AI chat (non-streaming) |
| POST | `/api/chat/stream` | AI chat (streaming SSE) |
| POST | `/api/voter/eligibility-check` | Check age/citizen eligibility |
| POST | `/api/voter/apply-status` | Track application reference ID |

---

## 🗺️ Page Routes

| Route | Page | Description |
|---|---|---|
| `/` | Home | Dashboard with all section cards |
| `/news` | Election News | Live RSS news + curated articles |
| `/results` | Election Results | 2026 schedule, countdown, state cards |
| `/ballot` | Ballot Demo | EVM simulator + how-to-vote guide |
| `/process` | Election Process | 5-step animated stepper |
| `/chat` | AI Chat | Streaming AI assistant |
| `/timeline` | Timeline | Key election dates |
| `/profile` | Profile | User settings & checklist |
| `/voter-india` | Voter ID India | Step-by-step EPIC application |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS (Poppins, CSS variables, Glassmorphism) |
| Backend | Node.js, Express.js |
| Database | MongoDB / Mongoose (optional — in-memory fallback) |
| AI | OpenAI API (`gpt-4.1-mini`) with keyword-based fallback |
| News Feed | Public RSS feeds via allorigins.win CORS proxy |
| Deployment | Google Cloud Run / Docker |

---

## 📸 Key Screens

| Screen | Highlights |
|---|---|
| 🏠 Home | 6-card grid, Election 2026 badge, India Voter ID banner |
| 📰 News | Live RSS ticker, skeleton loader, category filters, counting day alert |
| 📊 Results | Live countdown, ECI schedule table, turnout bars, exit polls |
| 🗳️ Ballot Demo | EVM simulator with vote animation, party symbol guide |
| 🤖 AI Chat | Streaming responses, voice input, follow-up suggestions |
| 🇮🇳 Voter ID | 5-step flow, state CEO portals, eligibility checker |

---

*Built with ❤️ for civic education — non-partisan, accessible, and free.*
