import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TrackerProvider } from './context/TrackerContext'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import PageLoader from './components/ui/PageLoader'

/* ── Lazy pages ──────────────────────────────────────────────── */
const Landing   = lazy(() => import('./pages/Landing'))
const Login     = lazy(() => import('./pages/Login'))
const Signup    = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ExamPage  = lazy(() => import('./pages/ExamPage'))
const Colleges  = lazy(() => import('./pages/Colleges'))
const Tracker   = lazy(() => import('./pages/Tracker'))
const History      = lazy(() => import('./pages/History'))
const PYQsHub      = lazy(() => import('./pages/PYQsHub'))
const Predictor    = lazy(() => import('./pages/Predictor'))
const TestEngine   = lazy(() => import('./pages/TestEngine'))
const FormulaCards = lazy(() => import('./pages/FormulaCards'))
const QuestionHub  = lazy(() => import('./pages/QuestionHub'))

/* ── Protected route ─────────────────────────────────────────── */
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? children : <Navigate to="/login" replace />
}

/* ── Public route (redirect if logged in) ─────────────────────── */
function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return !user ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"       element={<Landing />} />
        <Route path="/login"  element={<PublicOnly><Login  /></PublicOnly>} />
        <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />

        {/* Protected — wrapped in Layout */}
        <Route element={<Protected><Layout /></Protected>}>
          <Route path="/dashboard"          element={<Dashboard />} />
          <Route path="/exams/:examId"       element={<ExamPage  />} />
          <Route path="/colleges/:examId"    element={<Colleges  />} />
          <Route path="/tracker"             element={<Tracker   />} />
          <Route path="/history"             element={<History   />} />
          <Route path="/pyqs/:examId"        element={<PYQsHub   />} />
          <Route path="/predictor"           element={<Predictor />} />
          <Route path="/test"                element={<TestEngine/>} />
          <Route path="/formulas"            element={<FormulaCards/>} />
          <Route path="/my-questions"        element={<QuestionHub/>} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TrackerProvider>
          <AppRoutes />
        </TrackerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
