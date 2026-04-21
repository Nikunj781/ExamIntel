import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { testService, questionActionService } from '../services/firebase'
import { SectionHeader, Badge } from '../components/ui/PageLoader'
import examData from '../data/examData.json'

import { generateRealisticQuestions } from '../utils/questionGenerator'

export default function TestEngine() {
  const { user } = useAuth()
  const location = useLocation()
  const navState = location.state || {}
  
  // States: 'config' | 'taking' | 'result'
  const [viewState, setViewState] = useState('config')
  
  // Config state
  const [selectedExam, setSelectedExam] = useState(navState.exam || examData.exams[0].id)
  const syllabus = useMemo(() => examData.syllabus[selectedExam] || {}, [selectedExam])
  const subjects = Object.keys(syllabus)
  
  const [selectedSubject, setSelectedSubject] = useState(navState.subject || subjects[0] || '')
  
  const [selectedChapter, setSelectedChapter] = useState(() => {
    if (navState.chapter) return navState.chapter
    return syllabus[navState.subject || subjects[0]]?.[0] || ''
  })
  
  const [questionCount, setQuestionCount] = useState(5)
  
  const handleExamChange = (e) => {
    const exam = e.target.value
    setSelectedExam(exam)
    const newSyllabus = examData.syllabus[exam] || {}
    const newSubs = Object.keys(newSyllabus)
    const sub = newSubs[0] || ''
    setSelectedSubject(sub)
    setSelectedChapter(newSyllabus[sub]?.[0] || '')
  }
  
  const handleSubjectChange = (e) => {
    const sub = e.target.value
    setSelectedSubject(sub)
    setSelectedChapter(syllabus[sub]?.[0] || '')
  }

  // Test state
  const [questions, setQuestions] = useState([])
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [answers, setAnswers] = useState({}) // { qId: optionIndex }
  const [timeLeft, setTimeLeft] = useState(0)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [customNote, setCustomNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Result state
  const [testScore, setTestScore] = useState(null)

  // Start Test
  const startTest = () => {
    const qs = generateRealisticQuestions(selectedExam, selectedSubject, selectedChapter, questionCount)
    setQuestions(qs)
    setAnswers({})
    setCurrentQIdx(0)
    setTimeLeft(questionCount * 60) // 1 min per question
    setViewState('taking')
    
    // Load initial bookmarks
    if (user) {
      questionActionService.getBookmarks(user.id).then(({ data }) => {
        setBookmarkedIds(new Set((data || []).map(b => b.question_id)))
      })
    }
  }

  // Timer
  useEffect(() => {
    if (viewState !== 'taking' || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [viewState, timeLeft])

  useEffect(() => {
    if (viewState === 'taking' && timeLeft === 0) submitTest()
  }, [timeLeft, viewState])

  const submitTest = async () => {
    let correct = 0, incorrect = 0, unattempted = 0
    questions.forEach(q => {
      if (answers[q.id] === undefined) unattempted++
      else if (answers[q.id] === q.correctOption) correct++
      else incorrect++
    })
    
    const marks = (correct * 4) - (incorrect * 1)
    const resultData = { exam: selectedExam, subject: selectedSubject, chapter: selectedChapter, correct, incorrect, unattempted, marks, totalMarks: questions.length * 4 }
    
    if (user) {
      await testService.insert(user.id, resultData)
    }
    
    setTestScore(resultData)
    setViewState('result')
  }

  const toggleBookmark = async () => {
    if (!user) return
    const q = questions[currentQIdx]
    const { action } = await questionActionService.toggleBookmark(user.id, q)
    setBookmarkedIds(prev => {
      const next = new Set(prev)
      if (action === 'added') next.add(q.id); else next.delete(q.id)
      return next
    })
  }

  const saveNote = async () => {
    if (!user || !customNote.trim()) return
    setSavingNote(true)
    const q = questions[currentQIdx]
    await questionActionService.saveNote(user.id, q, customNote)
    setSavingNote(false)
    setCustomNote('')
    alert('Note saved to Question Hub!')
  }

  // Render Config
  if (viewState === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in">
        <SectionHeader title="Create Custom Test" subtitle="Generate a mock test for any chapter" />
        <div className="card space-y-4">
          <div>
            <label className="text-xs font-display text-slate-400 uppercase">Exam</label>
            <select value={selectedExam} onChange={handleExamChange} className="input mt-1">
              {examData.exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-display text-slate-400 uppercase">Subject</label>
            <select value={selectedSubject} onChange={handleSubjectChange} className="input mt-1">
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-display text-slate-400 uppercase">Chapter</label>
            <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} className="input mt-1">
              {(syllabus[selectedSubject] || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-display text-slate-400 uppercase">Number of Questions</label>
            <input type="number" min={5} max={30} value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="input mt-1" />
          </div>
          <button onClick={startTest} className="btn-primary w-full py-3 text-lg">Start Test Now</button>
        </div>
      </div>
    )
  }

  // Render Taking
  if (viewState === 'taking') {
    const q = questions[currentQIdx]
    const formatTime = (secs) => `${Math.floor(secs/60)}:${(secs%60).toString().padStart(2,'0')}`
    
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-in">
        <div className="flex justify-between items-center bg-surface-800 p-4 rounded-xl border border-white/[0.05]">
          <h3 className="font-display font-bold text-white text-lg">Question {currentQIdx + 1} / {questions.length}</h3>
          <div className="flex items-center gap-4">
            <span className={`font-mono font-bold text-xl ${timeLeft < 60 ? 'text-red-400' : 'text-brand-400'}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
            <button onClick={submitTest} className="btn-primary px-4 py-1.5 text-sm bg-red-500 hover:bg-red-400 shadow-none border-red-500">End Test</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="card min-h-[300px]">
              <div className="flex justify-between items-start mb-6">
                <Badge label={q.chapter} color="blue" />
                <button onClick={toggleBookmark} className={`text-xl transition-colors ${bookmarkedIds.has(q.id) ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-slate-600 hover:text-yellow-400/50'}`}>★</button>
              </div>
              <p className="text-lg text-slate-200 mb-8">{q.text}</p>
              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => setAnswers(prev => ({...prev, [q.id]: i}))}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${answers[q.id] === i ? 'bg-brand-500/20 border-brand-500 text-white' : 'bg-surface-800 border-white/[0.05] text-slate-300 hover:border-white/[0.15]'}`}>
                    <span className="font-bold mr-3 text-slate-500">{String.fromCharCode(65+i)}</span> {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Answer Box */}
            <div className="card bg-surface-900 border-dashed border-white/[0.1]">
              <h4 className="text-sm font-display font-semibold text-slate-300 mb-2">Write Custom Answer / Note</h4>
              <textarea value={customNote} onChange={e => setCustomNote(e.target.value)} placeholder="Type your own solution or notes here..." className="input h-24 mb-3" />
              <button onClick={saveNote} disabled={savingNote || !customNote.trim()} className="btn-ghost text-sm px-4 py-2">
                {savingNote ? 'Saving...' : '💾 Save to Question Hub'}
              </button>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentQIdx(p => Math.max(0, p-1))} disabled={currentQIdx === 0} className="btn-ghost">← Prev</button>
              <button onClick={() => setCurrentQIdx(p => Math.min(questions.length-1, p+1))} disabled={currentQIdx === questions.length-1} className="btn-ghost">Next →</button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h4 className="font-display font-semibold text-slate-300 mb-4">Questions</h4>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                  const isAns = answers[q.id] !== undefined
                  const isCurr = currentQIdx === i
                  return (
                    <button key={i} onClick={() => setCurrentQIdx(i)}
                      className={`h-10 rounded-lg font-display font-bold text-sm transition-all
                        ${isCurr ? 'ring-2 ring-white scale-110' : ''}
                        ${isAns ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-surface-800 text-slate-400 border border-white/[0.05]'}`}>
                      {i+1}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Result
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <SectionHeader title="Test Result" subtitle="Analysis of your mock test" />
      <div className="card text-center space-y-6">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 border-4 border-surface-700 relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle cx="60" cy="60" r="58" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="364" strokeDashoffset={364 - (364 * testScore.marks / testScore.totalMarks)} />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-display font-bold text-white">{testScore.marks}</span>
            <span className="text-xs font-mono text-slate-500">/ {testScore.totalMarks}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-green-400">{testScore.correct}</div>
            <div className="text-xs text-slate-400 uppercase">Correct</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-red-400">{testScore.incorrect}</div>
            <div className="text-xs text-slate-400 uppercase">Incorrect</div>
          </div>
          <div className="bg-surface-800 border border-white/[0.05] p-4 rounded-xl">
            <div className="text-2xl font-bold text-slate-300">{testScore.unattempted}</div>
            <div className="text-xs text-slate-400 uppercase">Unattempted</div>
          </div>
        </div>

        <button onClick={() => setViewState('config')} className="btn-ghost w-full">Create Another Test</button>
      </div>
    </div>
  )
}
