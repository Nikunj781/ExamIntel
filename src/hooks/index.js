import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTracker } from '../context/TrackerContext'
import { historyService } from '../services/firebase'
import { runPredictor } from '../utils/predictor'
import examData from '../data/examData.json'

/* ── useCountdown ────────────────────────────────────────────── */
export function useCountdown(targetDateISO) {
  const calcTime = useCallback(() => {
    const diff = new Date(targetDateISO).getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
      expired: false,
    }
  }, [targetDateISO])

  const [time, setTime] = useState(calcTime)
  const intervalRef = useRef(null)

  useEffect(() => {
    setTime(calcTime())
    intervalRef.current = setInterval(() => setTime(calcTime()), 1000)
    return () => clearInterval(intervalRef.current)
  }, [calcTime])

  return time
}

/* ── useExamTracker ──────────────────────────────────────────── */
export function useExamTracker(examId) {
  const { progress, updateChapter, syncing } = useTracker()
  const exam = useMemo(
    () => examData.exams.find(e => e.id === examId),
    [examId]
  )

  const syllabusWithStatus = useMemo(() => {
    if (!exam) return {}
    const subjectMap = examData.syllabus[examId] || {}
    const result = {}
    Object.entries(subjectMap).forEach(([subject, chapters]) => {
      result[subject] = chapters.map(ch => {
        const id = `${examId}_${subject}_${ch}`.replace(/\s+/g, '_')
        return { id, name: ch, status: progress[id] || 'not_started' }
      })
    })
    return result
  }, [exam, examId, progress])

  const stats = useMemo(() => {
    let total = 0, learned = 0, pyqDone = 0, inProgress = 0
    Object.values(syllabusWithStatus).forEach(chapters => {
      chapters.forEach(ch => {
        total++
        if (ch.status === 'learned')     learned++
        if (ch.status === 'pyq_done')    { learned++; pyqDone++ }
        if (ch.status === 'in_progress') inProgress++
      })
    })
    return { total, learned, pyqDone, inProgress, pct: total ? Math.round((learned / total) * 100) : 0 }
  }, [syllabusWithStatus])

  const toggle = useCallback((chapterId, currentStatus) => {
    const cycle = { not_started: 'in_progress', in_progress: 'learned', learned: 'pyq_done', pyq_done: 'not_started' }
    updateChapter(chapterId, examId, cycle[currentStatus] || 'in_progress')
  }, [examId, updateChapter])

  return { exam, syllabusWithStatus, stats, toggle, syncing }
}

/* ── usePredictor ────────────────────────────────────────────── */
export function usePredictor(examId) {
  const [score, setScore]     = useState('')
  const [filter, setFilter]   = useState('all') // 'all' | 'govt' | 'private'

  const result = useMemo(() => {
    if (!score) return { rank: null, matches: [] }
    return runPredictor(examId, score)
  }, [examId, score])

  const filtered = useMemo(() => {
    if (filter === 'all') return result.matches
    return result.matches.filter(c => c.type === filter)
  }, [result.matches, filter])

  return { score, setScore, filter, setFilter, rank: result.rank, colleges: filtered, allColleges: result.matches }
}

/* ── useMockHistory ──────────────────────────────────────────── */
export function useMockHistory() {
  const { user }                = useAuth()
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await historyService.getAll(user.id)
    if (error) setError(error.message)
    else       setRecords(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (row) => {
    if (!user) return
    const { data, error } = await historyService.insert({ ...row, user_id: user.id })
    if (error) { setError(error.message); return }
    setRecords(prev => [data, ...prev])
  }, [user])

  const update = useCallback(async (id, updates) => {
    const { data, error } = await historyService.update(id, updates)
    if (error) { setError(error.message); return }
    setRecords(prev => prev.map(r => r.id === id ? data : r))
  }, [])

  const remove = useCallback(async (id) => {
    await historyService.delete(id)
    setRecords(prev => prev.filter(r => r.id !== id))
  }, [])

  return { records, loading, error, add, update, remove, reload: load }
}

/* ── useProgressRadar ────────────────────────────────────────── */
export function useProgressRadar(examIds) {
  const { progress } = useTracker()

  return useMemo(() => {
    return examIds.map(examId => {
      const subjects = examData.syllabus[examId] || {}
      let total = 0, done = 0
      Object.entries(subjects).forEach(([, chapters]) => {
        chapters.forEach(ch => {
          const id = `${examId}_${ch}`.replace(/\s+/g, '_')
          total++
          const s = progress[id]
          if (s === 'learned' || s === 'pyq_done') done++
        })
      })
      const exam = examData.exams.find(e => e.id === examId)
      return { name: exam?.shortName || examId, pct: total ? Math.round((done / total) * 100) : 0 }
    })
  }, [examIds, progress])
}
