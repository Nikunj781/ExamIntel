import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTracker } from '../context/TrackerContext'
import CountdownCard from '../components/ui/CountdownCard'
import { StatCard, SectionHeader, ProgressBar } from '../components/ui/PageLoader'
import { useProgressRadar } from '../hooks'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import examData from '../data/examData.json'

// IDs that must always be pinned to the top
const PINNED_IDS = ['jee-main', 'jee-advanced', 'neet']

// Reorder exams so pinned ones come first
const sortedExams = [
  ...PINNED_IDS.map(id => examData.exams.find(e => e.id === id)).filter(Boolean),
  ...examData.exams.filter(e => !PINNED_IDS.includes(e.id))
]

export default function Dashboard() {
  const { user }                   = useAuth()
  const { selectedExams, toggleExam, streak, progress } = useTracker()
  const radarData                  = useProgressRadar(selectedExams.length ? selectedExams : ['jee-main'])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const totalDone = useMemo(
    () => Object.values(progress).filter(s => s === 'learned' || s === 'pyq_done').length,
    [progress]
  )

  const upcomingExams = useMemo(() => {
    // Always pin the 3 key exams, then fill from upcoming list
    const pinnedExams = PINNED_IDS
      .map(id => examData.exams.find(e => e.id === id))
      .filter(Boolean)
    const others = examData.exams
      .filter(e => !PINNED_IDS.includes(e.id) && new Date(e.nextDate) > new Date())
      .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate))
    return [...pinnedExams, ...others].slice(0, 4)
  }, [])

  const name = user?.email?.split('@')[0] || 'Student'

  return (
    <div className="space-y-8 animate-in">
      {/* Hero greeting */}
      <div className="relative overflow-hidden card border-brand-500/20 bg-gradient-to-br from-surface-700 to-surface-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative">
          <p className="text-slate-400 text-sm font-body">{greeting} 👋</p>
          <h1 className="font-display font-bold text-white text-3xl mt-1 capitalize">{name}</h1>
          <p className="text-slate-400 text-sm mt-2">
            {streak > 0 ? `🔥 ${streak} day streak — keep it going!` : 'Start studying to build your streak!'}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📚" label="Chapters Done"  value={totalDone}        color="text-brand-400" />
        <StatCard icon="🔥" label="Day Streak"     value={streak}           color="text-orange-400" />
        <StatCard icon="🎯" label="Exams Tracking" value={selectedExams.length} color="text-purple-400" />
        <StatCard icon="📅" label="Days to JEE Adv"
          value={Math.max(0, Math.ceil((new Date('2026-05-24') - new Date()) / 86400000))}
          color="text-green-400" sub="JEE Advanced · May 24, 2026" />
      </div>

      {/* Exam selector */}
      <div>
        <SectionHeader title="My Exams" subtitle="Select the exams you're preparing for" />
        <div className="flex flex-wrap gap-2">
          {sortedExams.map(e => {
            const active = selectedExams.includes(e.id)
            const isMHT = e.id === 'mht-cet'
            return (
              <button key={e.id} onClick={() => {
                toggleExam(e.id)
                if (isMHT) window.open(e.officialSite, '_blank', 'noreferrer')
              }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-display font-semibold transition-all duration-150
                  ${active
                    ? 'border-brand-500/60 bg-brand-500/15 text-brand-300'
                    : 'border-white/[0.08] bg-surface-700 text-slate-500 hover:text-slate-300 hover:border-white/[0.15]'}`}
              >
                <span>{e.icon}</span>{e.shortName}
                {active && <span className="text-brand-400 text-xs">✓</span>}
                {isMHT && <span className="text-xs text-slate-500">↗</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Countdowns */}
      <div>
        <SectionHeader title="Upcoming Exams"
          action={<Link to="/exams/jee-main" className="text-sm text-brand-400 hover:text-brand-300 font-display">View all →</Link>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {upcomingExams.map(e => <CountdownCard key={e.id} exam={e} />)}
        </div>
      </div>

      {/* Progress radar + quick nav */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="card">
          <h3 className="font-display font-bold text-white text-lg mb-1">Progress Overview</h3>
          <p className="text-slate-500 text-xs mb-4">% chapters completed per exam</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'DM Sans' }} />
              <Radar dataKey="pct" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f1f5f9' }}
                formatter={v => [`${v}%`, 'Progress']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick links */}
        <div className="card space-y-3">
          <h3 className="font-display font-bold text-white text-lg mb-3">Quick Actions</h3>
          {sortedExams.slice(0, 5).map(e => {
            const radarItem = radarData.find(r => r.name === e.shortName)
            const pct = radarItem?.pct || 0
            return (
              <div key={e.id}>
                <div className="flex items-center justify-between mb-1">
                  <a
                    href={e.id === 'mht-cet' ? e.officialSite : undefined}
                    onClick={e.id === 'mht-cet' ? (ev) => { ev.preventDefault(); window.open(e.officialSite, '_blank', 'noreferrer') } : undefined}
                    className="flex items-center gap-2 text-sm font-display font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {e.id !== 'mht-cet' ? (
                      <Link to={`/exams/${e.id}`} className="flex items-center gap-2 text-sm font-display font-medium text-slate-300 hover:text-white transition-colors">
                        <span>{e.icon}</span>{e.shortName}
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2"><span>{e.icon}</span>{e.shortName} <span className="text-xs text-brand-400">↗</span></span>
                    )}
                  </a>
                  <div className="flex gap-2">
                    <Link to={`/pyqs/${e.id}`} className="text-xs text-blue-400 hover:text-blue-300">PYQs</Link>
                    <span className="text-slate-600">·</span>
                    <Link to={`/exams/${e.id}`} className="text-xs text-brand-400 hover:text-brand-300">Syllabus</Link>
                    <span className="text-slate-600">·</span>
                    <Link to={`/colleges/${e.id}`} className="text-xs text-purple-400 hover:text-purple-300">Colleges</Link>
                  </div>
                </div>
                <ProgressBar pct={pct} label="" height="h-1.5" />
              </div>
            )
          })}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Link to="/predictor" className="btn-primary py-2 px-0 text-center text-sm w-full">🎯 Predictor</Link>
            <Link to="/tracker" className="btn-ghost py-2 px-0 text-center text-sm w-full">Progress →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
