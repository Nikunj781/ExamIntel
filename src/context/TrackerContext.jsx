import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { progressService } from '../services/firebase'

const TrackerContext = createContext(null)

// ── Per-user localStorage helpers ─────────────────────────────
function progressKey(uid)  { return uid ? `examhub_progress_${uid}` : 'examhub_progress_guest' }
function examsKey(uid)     { return uid ? `examhub_exams_${uid}`    : 'examhub_exams_guest' }

function loadProgress(uid) {
  try { return JSON.parse(localStorage.getItem(progressKey(uid)) || '{}') } catch { return {} }
}
function loadSelectedExams(uid) {
  try {
    const saved = localStorage.getItem(examsKey(uid))
    if (saved) return JSON.parse(saved)
  } catch { }
  return ['jee-main']
}

// ── Initial state: empty — gets populated once auth is known ──
const blankState = {
  progress:       {},
  selectedExams:  ['jee-main'],
  streak:         0,
  lastActiveDate: null,
  syncing:        false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return { ...blankState }

    case 'HYDRATE':
      return { ...state, progress: action.progress, selectedExams: action.selectedExams }

    case 'SET_PROGRESS':
      return { ...state, progress: action.payload }

    case 'UPDATE_CHAPTER': {
      const updated = { ...state.progress, [action.chapterId]: action.status }
      return { ...state, progress: updated }
    }

    case 'TOGGLE_EXAM': {
      const already = state.selectedExams.includes(action.examId)
      const selectedExams = already
        ? state.selectedExams.filter(e => e !== action.examId)
        : [...state.selectedExams, action.examId]
      return { ...state, selectedExams }
    }

    case 'SET_STREAK':
      return { ...state, streak: action.payload, lastActiveDate: new Date().toDateString() }

    case 'SET_SYNCING':
      return { ...state, syncing: action.payload }

    default:
      return state
  }
}

export function TrackerProvider({ children }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, blankState)

  // ── Hydrate or reset whenever auth user changes ───────────
  useEffect(() => {
    if (!user) {
      // Logged out → reset all tracking state in memory (keep nothing from previous user)
      dispatch({ type: 'RESET' })
      return
    }

    const uid = user.uid || user.id

    // Logged in → load this user's data from localStorage / firebase
    const localProgress     = loadProgress(uid)
    const localSelectedExams = loadSelectedExams(uid)
    dispatch({ type: 'HYDRATE', progress: localProgress, selectedExams: localSelectedExams })

    // Also pull from Firebase/backend if available
    progressService.getAll(uid).then(({ data }) => {
      if (!data || data.length === 0) return
      const map = {}
      data.forEach(row => { map[row.chapter_id] = row.status })
      // Merge server data over local data
      const merged = { ...localProgress, ...map }
      dispatch({ type: 'SET_PROGRESS', payload: merged })
      localStorage.setItem(progressKey(uid), JSON.stringify(merged))
    })
  }, [user])  // Re-runs every time user changes (login / logout)

  // ── Streak (per user) ─────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const uid = user.uid || user.id
    const today = new Date().toDateString()
    const last  = localStorage.getItem(`examhub_last_active_${uid}`)
    const streak = parseInt(localStorage.getItem(`examhub_streak_${uid}`) || '0', 10)
    if (last === today) {
      dispatch({ type: 'SET_STREAK', payload: streak })
    } else {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const newStreak = last === yesterday ? streak + 1 : 1
      localStorage.setItem(`examhub_streak_${uid}`, String(newStreak))
      localStorage.setItem(`examhub_last_active_${uid}`, today)
      dispatch({ type: 'SET_STREAK', payload: newStreak })
    }
  }, [user])

  // ── updateChapter ─────────────────────────────────────────
  const updateChapter = useCallback(async (chapterId, examId, status) => {
    dispatch({ type: 'UPDATE_CHAPTER', chapterId, status })

    const uid = user?.uid || user?.id
    if (!uid) return

    // Save per-user to localStorage
    const current = loadProgress(uid)
    const updated = { ...current, [chapterId]: status }
    localStorage.setItem(progressKey(uid), JSON.stringify(updated))

    // Sync to backend
    dispatch({ type: 'SET_SYNCING', payload: true })
    await progressService.upsert({ user_id: uid, chapter_id: chapterId, exam_id: examId, status })
    dispatch({ type: 'SET_SYNCING', payload: false })
  }, [user])

  // ── toggleExam ────────────────────────────────────────────
  const toggleExam = useCallback((examId) => {
    dispatch({ type: 'TOGGLE_EXAM', examId })

    const uid = user?.uid || user?.id
    if (!uid) return

    const current = loadSelectedExams(uid)
    const updated = current.includes(examId)
      ? current.filter(e => e !== examId)
      : [...current, examId]
    localStorage.setItem(examsKey(uid), JSON.stringify(updated))
  }, [user])

  return (
    <TrackerContext.Provider value={{ ...state, updateChapter, toggleExam }}>
      {children}
    </TrackerContext.Provider>
  )
}

export function useTracker() {
  const ctx = useContext(TrackerContext)
  if (!ctx) throw new Error('useTracker must be used within TrackerProvider')
  return ctx
}
