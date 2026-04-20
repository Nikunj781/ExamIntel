import { useState, useMemo, useCallback, useRef } from 'react'
import { useExamTracker } from '../hooks'
import { SectionHeader, ProgressBar, EmptyState } from '../components/ui/PageLoader'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import examData from '../data/examData.json'

const STATUS_CONFIG = {
  not_started: { label: '○ Not Started', cls: 'text-slate-500',  bg: 'bg-slate-500/10' },
  in_progress:  { label: '◑ In Progress',  cls: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  learned:      { label: '● Learned',      cls: 'text-green-400',  bg: 'bg-green-400/10' },
  pyq_done:     { label: '★ PYQ Done',     cls: 'text-blue-400',   bg: 'bg-blue-400/10' },
}

function ExamTrackerPanel({ examId }) {
  const { exam, syllabusWithStatus, stats, toggle } = useExamTracker(examId)
  const [openSubject, setOpenSubject] = useState(null)

  const radarData = useMemo(() => {
    return Object.entries(syllabusWithStatus).map(([subject, chapters]) => {
      const done = chapters.filter(c => c.status === 'learned' || c.status === 'pyq_done').length
      return { subject: subject.slice(0, 4), pct: chapters.length ? Math.round((done / chapters.length) * 100) : 0 }
    })
  }, [syllabusWithStatus])

  if (!exam) return null

  return (
    <div className="card space-y-4">
      {/* Exam header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{exam.icon}</span>
          <div>
            <h3 className="font-display font-bold text-white text-lg">{exam.shortName}</h3>
            <p className="text-xs text-slate-500 font-mono">{stats.learned}/{stats.total} chapters done</p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-display font-bold text-2xl" style={{ color: exam.color }}>{stats.pct}%</span>
          <p className="text-xs text-slate-500">complete</p>
        </div>
      </div>

      <ProgressBar pct={stats.pct} height="h-2" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subject accordion */}
        <div className="space-y-2">
          {Object.entries(syllabusWithStatus).map(([subject, chapters]) => {
            const done = chapters.filter(c => c.status === 'learned' || c.status === 'pyq_done').length
            const pct  = chapters.length ? Math.round((done / chapters.length) * 100) : 0
            const open = openSubject === subject

            return (
              <div key={subject} className="rounded-xl border border-white/[0.06] overflow-hidden">
                <button onClick={() => setOpenSubject(open ? null : subject)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-surface-600 hover:bg-surface-500 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-display font-semibold text-slate-300">{subject}</span>
                    <span className="text-xs font-mono text-slate-500">{done}/{chapters.length}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-surface-700 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
                  </div>
                </button>

                {open && (
                  <div className="grid grid-cols-1 gap-1 p-2 bg-surface-700/50">
                    {chapters.map(ch => {
                      const cfg = STATUS_CONFIG[ch.status] || STATUS_CONFIG.not_started
                      return (
                        <button key={ch.id} onClick={() => toggle(ch.id, ch.status)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg ${cfg.bg}
                                      hover:opacity-80 transition-opacity text-left`}>
                          <span className="text-xs font-body text-slate-300">{ch.name}</span>
                          <span className={`text-xs font-display font-semibold ${cfg.cls} whitespace-nowrap ml-2`}>
                            {cfg.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Radar chart */}
        <div>
          <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wide mb-2">Subject Progress</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar dataKey="pct" stroke={exam.color} fill={exam.color} fillOpacity={0.15} strokeWidth={2} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f1f5f9' }}
                formatter={v => [`${v}%`, 'Progress']}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`text-xs ${cfg.cls}`}>{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Tracker() {
  const [selectedExam, setSelectedExam] = useState('jee-main')
  const [todoText, setTodoText]         = useState('')
  const [todos, setTodos]               = useState(() => {
    try { return JSON.parse(localStorage.getItem('examhub_todos') || '[]') } catch { return [] }
  })
  const inputRef = useRef(null)

  const addTodo = useCallback(() => {
    if (!todoText.trim()) return
    const next = [...todos, { id: Date.now(), text: todoText.trim(), done: false }]
    setTodos(next)
    localStorage.setItem('examhub_todos', JSON.stringify(next))
    setTodoText('')
    inputRef.current?.focus()
  }, [todoText, todos])

  const toggleTodo = useCallback((id) => {
    const next = todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
    setTodos(next)
    localStorage.setItem('examhub_todos', JSON.stringify(next))
  }, [todos])

  const deleteTodo = useCallback((id) => {
    const next = todos.filter(t => t.id !== id)
    setTodos(next)
    localStorage.setItem('examhub_todos', JSON.stringify(next))
  }, [todos])

  return (
    <div className="space-y-8 animate-in">
      <SectionHeader title="Chapter Tracker"
        subtitle="Track your syllabus progress and PYQ completion across all exams" />

      {/* Exam selector */}
      <div className="flex flex-wrap gap-2">
        {examData.exams.map(e => (
          <button key={e.id} onClick={() => setSelectedExam(e.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-display font-semibold transition-all
              ${selectedExam === e.id
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                : 'bg-surface-700 text-slate-500 border-white/[0.07] hover:text-slate-300'}`}>
            <span>{e.icon}</span>{e.shortName}
          </button>
        ))}
      </div>

      {/* Tracker panel */}
      <ExamTrackerPanel examId={selectedExam} />

      {/* Todo / Study Planner */}
      <div className="card">
        <h3 className="font-display font-bold text-white text-lg mb-4">📝 Today's Study Tasks</h3>
        <div className="flex gap-2 mb-4">
          <input ref={inputRef} value={todoText} onChange={e => setTodoText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="Add a task (e.g. 'Revise Optics, attempt 20 PYQs')"
            className="input text-sm flex-1" />
          <button onClick={addTodo} className="btn-primary px-4 text-sm">Add</button>
        </div>

        {todos.length === 0
          ? <EmptyState icon="✅" title="All clear!" desc="Add tasks to plan your study session" />
          : (
            <ul className="space-y-2">
              {todos.map(t => (
                <li key={t.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-600 border border-white/[0.06] group">
                  <button onClick={() => toggleTodo(t.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${t.done ? 'bg-brand-500 border-brand-500' : 'border-slate-600 hover:border-brand-500'}`}>
                    {t.done && <span className="text-white text-xs">✓</span>}
                  </button>
                  <span className={`text-sm font-body flex-1 ${t.done ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                    {t.text}
                  </span>
                  <button onClick={() => deleteTodo(t.id)}
                    className="text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )
        }

        {todos.filter(t => t.done).length > 0 && (
          <button onClick={() => {
            const next = todos.filter(t => !t.done)
            setTodos(next)
            localStorage.setItem('examhub_todos', JSON.stringify(next))
          }} className="mt-3 text-xs text-slate-600 hover:text-red-400 transition-colors">
            Clear completed ({todos.filter(t => t.done).length})
          </button>
        )}
      </div>
    </div>
  )
}
