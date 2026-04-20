import { useState, useMemo } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useExamTracker } from '../hooks'
import { SectionHeader, Badge, ProgressBar, EmptyState } from '../components/ui/PageLoader'
import { Spinner } from '../components/ui/PageLoader'
import examData from '../data/examData.json'

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', icon: '○',  next: 'in_progress',  cls: 'text-slate-500' },
  in_progress:  { label: 'In Progress', icon: '◑',  next: 'learned',      cls: 'text-yellow-400' },
  learned:      { label: 'Learned',     icon: '●',  next: 'pyq_done',     cls: 'text-green-400' },
  pyq_done:     { label: 'PYQ Done',    icon: '★',  next: 'not_started',  cls: 'text-blue-400' },
}

const SOURCE_ICONS = { course: '🎓', pyq: '📄', video: '▶️', official: '🏛️' }

export default function ExamPage() {
  const { examId } = useParams()
  const { exam, syllabusWithStatus, stats, toggle, syncing } = useExamTracker(examId)
  const [activeSubject, setActiveSubject]   = useState(null)
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState('all')

  const subjects = useMemo(() => Object.keys(syllabusWithStatus), [syllabusWithStatus])
  const current  = activeSubject || subjects[0]

  const filteredChapters = useMemo(() => {
    const chapters = syllabusWithStatus[current] || []
    return chapters.filter(ch => {
      const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || ch.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [syllabusWithStatus, current, search, statusFilter])

  const pyqs = useMemo(
    () => examData.pyqs.filter(p => p.examId === examId),
    [examId]
  )

  if (!exam) return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="card border-white/[0.08]" style={{ borderColor: `${exam.color}25` }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{exam.icon}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-white text-2xl">{exam.name}</h1>
                {syncing && <Spinner size="sm" />}
              </div>
              <p className="text-slate-400 text-sm mt-0.5">{exam.conductedBy} · {exam.mode}</p>
              <a
                href={exam.officialSite}
                target="_blank"
                rel="noreferrer"
                title="Visit official website"
                className="text-slate-500 text-sm mt-1 hover:text-brand-400 transition-colors cursor-pointer inline-flex items-center gap-1 group"
              >
                {exam.description}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">↗</span>
              </a>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to={`/pyqs/${examId}`} className="btn-primary text-sm px-4 py-2">📄 View PYQs</Link>
            <Link to={`/colleges/${examId}`} className="btn-ghost text-sm">🏛️ Colleges</Link>
            <a href={exam.officialSite} target="_blank" rel="noreferrer" className="btn-ghost text-sm">🔗 Official Site</a>
          </div>
        </div>

        {/* Exam sessions */}
        <div className="mt-4 flex flex-wrap gap-3">
          {exam.sessions.map(s => (
            <div key={s.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-600 border border-white/[0.07]">
              <span className="text-xs font-display font-semibold text-slate-400">{s.name}</span>
              <span className="text-xs font-mono text-slate-300">{s.dates}</span>
            </div>
          ))}
          <div className="px-3 py-1.5 rounded-lg bg-surface-600 border border-white/[0.07]">
            <span className="text-xs font-mono text-slate-400">Marks: {exam.totalMarks} · {exam.duration}</span>
          </div>
        </div>

        {/* Registration Deadline */}
        {exam.registrationDeadline && (() => {
          const now = new Date()
          const deadline = new Date(exam.registrationDeadlineIso)
          const daysLeft = Math.ceil((deadline - now) / 86400000)
          const isPast   = daysLeft < 0
          const isUrgent = !isPast && daysLeft <= 7
          const isSoon   = !isPast && daysLeft <= 30

          return (
            <div className={`mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border
              ${isPast
                ? 'bg-slate-800/50 border-slate-700/50'
                : isUrgent
                  ? 'bg-red-500/10 border-red-500/30'
                  : isSoon
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-green-500/10 border-green-500/20'}`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{isPast ? '🔒' : isUrgent ? '🚨' : isSoon ? '⏰' : '📝'}</span>
                <div>
                  <p className={`text-xs font-display font-semibold uppercase tracking-wide
                    ${isPast ? 'text-slate-500' : isUrgent ? 'text-red-400' : isSoon ? 'text-yellow-400' : 'text-green-400'}`}>
                    Registration Deadline
                  </p>
                  <p className="text-sm font-mono text-white">{exam.registrationDeadline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isPast && (
                  <span className={`text-sm font-display font-bold tabular-nums
                    ${isUrgent ? 'text-red-400 animate-pulse' : isSoon ? 'text-yellow-400' : 'text-green-400'}`}>
                    {daysLeft === 0 ? 'Today!' : `${daysLeft} days left`}
                  </span>
                )}
                {isPast && <span className="text-xs text-slate-500 font-display">Closed</span>}
                <a href={exam.officialSite} target="_blank" rel="noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg font-display font-semibold transition-all
                    bg-brand-500/20 text-brand-300 border border-brand-500/40 hover:bg-brand-500/30">
                  Register ↗
                </a>
              </div>
            </div>
          )
        })()}

        {/* Overall progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-display font-semibold text-slate-300">Overall Progress</span>
            <span className="text-sm font-mono text-brand-400">{stats.learned}/{stats.total} chapters</span>
          </div>
          <ProgressBar pct={stats.pct} height="h-2.5" />
          <div className="flex gap-4 mt-2 text-xs font-body text-slate-500">
            <span>🟡 {stats.inProgress} in progress</span>
            <span>🟢 {stats.learned} learned</span>
            <span>🔵 {stats.pyqDone} PYQ done</span>
          </div>
        </div>
      </div>

      {/* Syllabus */}
      <div>
        <SectionHeader title="Syllabus Tracker"
          subtitle="Click a chapter icon to cycle: Not Started → In Progress → Learned → PYQ Done" />

        {/* Subject tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {subjects.map(sub => (
            <button key={sub} onClick={() => setActiveSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-sm font-display font-semibold transition-all duration-150 border
                ${(activeSubject || subjects[0]) === sub
                  ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                  : 'bg-surface-700 text-slate-500 border-white/[0.07] hover:text-slate-300'}`}>
              {sub}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search chapters…" className="input max-w-xs text-sm" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="input max-w-[160px] text-sm bg-surface-700">
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="learned">Learned</option>
            <option value="pyq_done">PYQ Done</option>
          </select>
        </div>

        {/* Chapter grid */}
        {filteredChapters.length === 0
          ? <EmptyState icon="🔍" title="No chapters found" desc="Try adjusting your search or filter" />
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {filteredChapters.map((ch, i) => {
                const cfg = STATUS_CONFIG[ch.status] || STATUS_CONFIG.not_started
                return (
                  <button key={ch.id} onClick={() => toggle(ch.id, ch.status)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-700 border border-white/[0.05]
                               hover:border-white/[0.12] transition-all duration-150 text-left group"
                    style={{ animationDelay: `${i * 20}ms` }}>
                    <span className={`text-xl transition-transform group-hover:scale-110 ${cfg.cls}`}>{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body text-slate-200 truncate">{ch.name}</p>
                      <p className={`text-xs font-display ${cfg.cls}`}>{cfg.label}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        }
      </div>

      {/* Resources */}
      {exam.sources?.length > 0 && (
        <div>
          <SectionHeader title="Best Sources" subtitle="Curated resources for this exam" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {exam.sources.map(src => (
            <a key={src.name} href={src.url} target="_blank" rel="noreferrer"
              className="card hover:border-white/[0.15] transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-3">
              <span className="text-2xl">{SOURCE_ICONS[src.type] || '🔗'}</span>
              <div>
                <p className="font-display font-semibold text-white text-sm">{src.name}</p>
                <Badge label={src.type} color={src.type === 'pyq' ? 'blue' : src.type === 'course' ? 'green' : 'yellow'} />
              </div>
            </a>
          ))}
          </div>
        </div>
      )}

      {/* PYQs */}
      {pyqs.length > 0 && (
        <div>
          <SectionHeader title="Previous Year Questions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pyqs.map(p => (
              <a key={p.id} href={p.url} target="_blank" rel="noreferrer"
                className="card flex items-center gap-3 hover:border-blue-500/30 transition-all duration-200">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-display font-semibold text-white text-sm">{p.title}</p>
                  <p className="text-xs text-slate-500 font-mono">{p.year}</p>
                </div>
                <span className="ml-auto text-blue-400 text-sm">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
