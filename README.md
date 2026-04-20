# ExamIntel 🎯
### All-in-One Indian College Entrance Exam Intel Provider

> Built as an end-term React project — a production-grade app that solves a **real problem**: students hunting scattered exam dates, college cutoffs, PYQs, and progress tracking across JEE, NEET, KCET, BITSAT & more.

---

## 📸 Features

| Feature | Description |
|---|---|
| **Exam Countdowns** | Live timers for JEE Main/Adv, NEET, KCET, BITSAT, PGCET |
| **Syllabus Tracker** | Chapter-by-chapter status: Not Started → In Progress → Learned → PYQ Done |
| **Rank Predictor** | Enter mock score → get estimated rank + matching colleges |
| **College Explorer** | Filter govt/private, sort by cutoff/fees/NIRF, searchable table |
| **Mock History CRUD** | Log, edit, delete mock attempts with score trend chart |
| **Progress Charts** | Radar charts per exam/subject (Recharts) |
| **Study Todo** | Daily task planner with local persistence |
| **Auth** | Email/password + Google OAuth via Firebase |
| **PWA** | Installable on mobile/desktop |
| **Local + Cloud Sync** | Works offline (localStorage), syncs to Firebase when logged in |

---

## 🛠 Tech Stack

- **React 18** — Functional components, hooks, Context API, lazy/Suspense
- **React Router v6** — Protected routes, nested layouts
- **Firebase** — Auth (email + Google OAuth), Firestore DB, Storage
- **Recharts** — RadarChart, LineChart, BarChart
- **Tailwind CSS** — Mobile-first responsive design
- **Vite + PWA** — Fast dev, PWA manifest, Netlify-ready

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Nikunj781/examhub.git
cd examhub
npm install
```

### 2. Set Up Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Go to **Project Settings → General** and copy your Firebase config values
3. Enable **Firestore Database** in Build → Firestore Database (start in test mode, then apply security rules)
4. Enable **Google Sign-In** in Build → Authentication → Sign-in method (optional)

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env and fill in your Firebase project config
```

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Run Dev Server
```bash
npm run dev
# Open http://localhost:5173
```

> **No Firebase?** The app still runs in demo mode — auth is disabled and progress is stored in localStorage only.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/       # Layout.jsx (sidebar + mobile nav)
│   └── ui/           # PageLoader, CountdownCard, shared UI
├── context/
│   ├── AuthContext.jsx    # Auth state + signIn/signOut
│   └── TrackerContext.jsx # Global chapter progress + streaks
├── data/
│   └── examData.json      # All exam/college/syllabus/PYQ seed data
├── hooks/
│   └── index.js           # useCountdown, useExamTracker, usePredictor, useMockHistory
├── pages/
│   ├── Login.jsx / Signup.jsx
│   ├── Dashboard.jsx      # Countdowns, radar, quick nav
│   ├── ExamPage.jsx       # Syllabus checklist + sources + PYQs
│   ├── Colleges.jsx       # Rank predictor + college table
│   ├── Tracker.jsx        # Full chapter tracker + todo
│   └── History.jsx        # Mock CRUD + trend chart
├── services/
│   └── firebase.js        # Firebase client + auth/Firestore/storage helpers
└── utils/
    └── predictor.js       # Rank prediction formulas
```

---

## 🗃 Firestore Data Model

Firestore uses NoSQL collections. The app uses the following structure:

```
users/ (collection)
  └── {uid}/ (document)
        ├── email, displayName, createdAt
        └── (profile fields)

chapter_progress/ (collection)
  └── {uid}_{chapterId}/ (document)
        ├── userId     : string
        ├── chapterId  : string
        ├── examId     : string
        ├── status     : 'not_started' | 'in_progress' | 'learned' | 'pyq_done'
        └── updatedAt  : timestamp

mock_history/ (collection)
  └── {auto-id}/ (document)
        ├── userId        : string
        ├── examId        : string
        ├── score         : number
        ├── maxScore      : number
        ├── predictedRank : number
        ├── notes         : string
        └── createdAt     : timestamp
```

**Firestore Security Rules** (paste in Firebase Console → Firestore → Rules):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chapter_progress/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /mock_history/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 🌐 Deploy to Netlify

```bash
npm run build
# Then deploy /dist to Netlify, or:
netlify deploy --prod
```

Add your env vars in Netlify → Site settings → Environment variables.

---

## 🎓 React Concepts Used (Viva Reference)

| Concept | Where Used |
|---|---|
| `useState` | All pages — form state, filters, UI toggles |
| `useEffect` | Auth session, countdown timer, data loading |
| `useMemo` | Filtered lists, predictor calc, radar data, stats |
| `useCallback` | Event handlers in context, CRUD operations |
| `useRef` | Countdown interval, todo input focus |
| `useReducer` | TrackerContext — complex progress state |
| `Context API` | AuthContext + TrackerContext (global state) |
| `React Router v6` | Protected routes, nested layout, useParams |
| `lazy + Suspense` | All pages lazy-loaded for code splitting |
| `Functional Components` | 100% — no class components |
| `Custom Hooks` | useCountdown, useExamTracker, usePredictor, useMockHistory |
| `Controlled Components` | All form inputs |
| `Conditional Rendering` | Loading/error/empty states throughout |
| `Lists & Keys` | Exam lists, chapter grids, college table |
| `Lifting State Up` | TrackerContext lifts progress above exam components |

---

## ⚙️ Architecture Decisions (Viva Points)

**Why Firebase?**
Firebase provides a tightly integrated Auth + Firestore + Storage suite with a generous free tier (Spark plan). Real-time listeners make live progress sync trivial, and Google Sign-In integration is first-class.

**Why Context + useReducer over Redux?**
App state is moderate complexity. useReducer gives predictable state transitions without Redux boilerplate.

**Why Recharts over Chart.js?**
Recharts is React-native (component-based), no imperative API, easier to theme with Tailwind.

**Why JSON seed data?**
Keeps the app fully functional without a database for demo mode. In production, this would move to a Firestore collection with admin CRUD.

**Why localStorage fallback?**
Students may not want to sign up. App is fully functional offline; Firebase syncs when they log in.

---

## 📄 License
MIT — free to use, modify, and submit for academic projects.
