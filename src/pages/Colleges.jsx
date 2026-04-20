import { useState, useMemo } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { usePredictor } from '../hooks'
import { SectionHeader, Badge, EmptyState } from '../components/ui/PageLoader'
import { formatRank } from '../utils/predictor'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import examData from '../data/examData.json'

export default function Colleges() {
  const { examId }              = useParams()
  const { score, setScore, filter, setFilter, rank, colleges, allColleges } = usePredictor(examId)
  const [sortBy, setSortBy]     = useState('cutoffRank')
  const [search, setSearch]     = useState('')

  const exam = useMemo(() => examData.exams.find(e => e.id === examId), [examId])

  const displayList = useMemo(() => {
    const base = score ? colleges : (examData.colleges[examId] || [])
    return base
      .filter(c => {
        const matchType   = filter === 'all' || c.type === filter
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                           c.city.toLowerCase().includes(search.toLowerCase())
        return matchType && matchSearch
      })
      .sort((a, b) => {
        if (sortBy === 'cutoffRank') return a.cutoffRank - b.cutoffRank
        if (sortBy === 'fees')       return a.fees - b.fees
        if (sortBy === 'nirf')       return (a.nirf || 999) - (b.nirf || 999)
        return 0
      })
  }, [score, colleges, examId, filter, search, sortBy])

  const chartData = useMemo(() =>
    (examData.colleges[examId] || []).slice(0, 8).map(c => ({
      name: c.name.split(' ').slice(0, 2).join(' '),
      cutoff: c.cutoffRank,
      fees: Math.round(c.fees / 1000),
    }))
  , [examId])

  if (!exam) return <Navigate to="/dashboard" replace />

  const maxScore = exam.totalMarks

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-3 font-body">
          <Link to={`/exams/${examId}`} className="hover:text-slate-300">{exam.icon} {exam.shortName}</Link>
          <span>›</span><span className="text-slate-300">Colleges</span>
        </div>
        <SectionHeader title={`Colleges for ${exam.shortName}`}
          subtitle={`${(examData.colleges[examId] || []).length} colleges in database`} />
      </div>

      {/* Rank Predictor */}
      <div className="card border-brand-500/20 bg-gradient-to-br from-surface-700 to-surface-800">
        <h3 className="font-display font-bold text-white text-lg mb-1">🎯 Rank Predictor</h3>
        <p className="text-slate-400 text-sm mb-4">
          Enter your mock score to predict your rank and see matching colleges.
          {examId === 'kcet' || examId === 'pgcet'
            ? ' (Predictor optimised for JEE/NEET/BITSAT)'
            : ''}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wide mb-1.5 block">
              Your Score (out of {maxScore})
            </label>
            <input type="number" min={0} max={maxScore} value={score}
              onChange={e => setScore(e.target.value)}
              placeholder={`0 – ${maxScore}`} className="input" />
          </div>
          {rank && (
            <div className="card flex-1 bg-brand-500/10 border-brand-500/30 text-center py-3">
              <p className="text-xs text-slate-400 font-body">Predicted Rank</p>
              <p className="font-display font-bold text-brand-300 text-3xl">{formatRank(rank)}</p>
              <p className="text-xs text-slate-500 font-mono">{colleges.length} colleges match</p>
            </div>
          )}
        </div>

        {score && rank && (
          <div className="mt-3 p-3 rounded-xl bg-surface-600 border border-white/[0.06]">
            <p className="text-xs text-slate-400 font-body">
              <span className="text-white font-display font-semibold">Score {score}/{maxScore}</span>
              {' '}→ Est. rank{' '}
              <span className="text-brand-300 font-mono font-semibold">{rank?.toLocaleString('en-IN')}</span>
              {' '}· {colleges.length} of {allColleges.length} colleges reachable
            </p>
          </div>
        )}
      </div>

      {/* Cutoff chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h3 className="font-display font-bold text-white text-base mb-4">Cutoff Rank Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 40 }}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f1f5f9' }}
                formatter={v => [v.toLocaleString('en-IN'), 'Cutoff Rank']}
              />
              <Bar dataKey="cutoff" radius={[4,4,0,0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={rank && chartData[i]?.cutoff >= rank ? '#22c55e' : '#3b82f6'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {rank && <p className="text-xs text-slate-500 text-center mt-1">🟢 Reachable with your rank · 🔵 Above your rank</p>}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search college or city…" className="input max-w-xs text-sm" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input max-w-[140px] text-sm bg-surface-700">
          <option value="all">All Types</option>
          <option value="govt">Govt Only</option>
          <option value="private">Private Only</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input max-w-[160px] text-sm bg-surface-700">
          <option value="cutoffRank">Sort: Cutoff Rank</option>
          <option value="fees">Sort: Fees</option>
          <option value="nirf">Sort: NIRF Rank</option>
        </select>
      </div>

      {/* College table */}
      {displayList.length === 0
        ? <EmptyState icon="🏫" title="No colleges found"
            desc={score ? 'Your rank may be below the cutoff for listed colleges' : 'Try adjusting filters'} />
        : (
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-700 border-b border-white/[0.06]">
                  {['College','Type','City','Cutoff Rank','Fees / yr','NIRF','Placement'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-display font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayList.map((c, i) => {
                  const reachable = rank && c.cutoffRank >= rank
                  return (
                    <tr key={c.id}
                      className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]
                        ${reachable ? 'bg-green-500/[0.03]' : ''}`}>
                      <td className="px-4 py-3 font-display font-semibold text-white whitespace-nowrap">
                        {reachable && <span className="text-green-400 mr-1.5" title="Reachable">✓</span>}
                        {c.name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={c.type} color={c.type === 'govt' ? 'green' : 'purple'} />
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{c.city}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{c.cutoffRank.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        ₹{(c.fees / 100000).toFixed(1)}L
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">#{c.nirf || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{c.placement || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}
