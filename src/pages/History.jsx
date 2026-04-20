import { useState, useMemo, useCallback } from 'react'
import { useMockHistory } from '../hooks'
import { SectionHeader, Badge, EmptyState, ErrorMsg, Spinner } from '../components/ui/PageLoader'
import { formatRank, runPredictor } from '../utils/predictor'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import examData from '../data/examData.json'

function MockForm({ onSave, initial, onCancel }) {
  const [examId,   setExamId]   = useState(initial?.exam_id   || 'jee-main')
  const [score,    setScore]    = useState(initial?.score      || '')
  const [notes,    setNotes]    = useState(initial?.notes      || '')
  const [loading,  setLoading]  = useState(false)

  const exam     = examData.exams.find(e => e.id === examId)
  const maxScore = exam?.totalMarks || 300
  const { rank } = useMemo(() => score ? runPredictor(examId, score) : { rank: null }, [examId, score])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSave({
      exam_id:        examId,
      score:          Number(score),
      max_score:      maxScore,
      predicted_rank: rank,
      notes,
    })
    setLoading(false)
  }, [examId, score, maxScore, rank, notes, onSave])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Exam</label>
          <select value={examId} onChange={e => setExamId(e.target.value)} className="input bg-surface-700">
            {examData.exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Score (max {maxScore})
          </label>
          <input type="number" required min={0} max={maxScore} value={score}
            onChange={e => setScore(e.target.value)} placeholder={`0 – ${maxScore}`} className="input" />
        </div>
      </div>

      {rank && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-xs text-slate-400">Predicted Rank</p>
            <p className="font-display font-bold text-brand-300 text-lg">{formatRank(rank)}</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="e.g. 'Weak in Optics, strong in Mechanics'" rows={2}
          className="input resize-none" />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <><Spinner size="sm" /> Saving…</> : '💾 Save Mock'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        )}
      </div>
    </form>
  )
}

export default function History() {
  const { records, loading, error, add, update, remove } = useMockHistory()
  const [showForm,  setShowForm]  = useState(false)
  const [editId,    setEditId]    = useState(null)
  const [filterEx,  setFilterEx]  = useState('all')

  const filtered = useMemo(() =>
    filterEx === 'all' ? records : records.filter(r => r.exam_id === filterEx)
  , [records, filterEx])

  // Chart data: score trend over time per exam
  const chartData = useMemo(() =>
    filtered
      .slice()
      .reverse()
      .map((r, i) => ({
        attempt: `#${i + 1}`,
        score:   r.score,
        max:     r.max_score,
        pct:     r.max_score ? Math.round((r.score / r.max_score) * 100) : 0,
      }))
  , [filtered])

  const handleSave = useCallback(async (data) => {
    if (editId) {
      await update(editId, data)
      setEditId(null)
    } else {
      await add(data)
      setShowForm(false)
    }
  }, [editId, add, update])

  const editRecord = records.find(r => r.id === editId)

  return (
    <div className="space-y-8 animate-in">
      <SectionHeader title="Mock History"
        subtitle="Track your performance over time and spot improvement trends"
        action={
          !showForm && !editId && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
              + Add Mock
            </button>
          )
        }
      />

      <ErrorMsg message={error} />

      {/* Add / Edit form */}
      {(showForm || editId) && (
        <div className="card border-brand-500/20 animate-in">
          <h3 className="font-display font-bold text-white text-base mb-4">
            {editId ? 'Edit Mock Entry' : 'Log New Mock Test'}
          </h3>
          <MockForm
            initial={editRecord}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditId(null) }}
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wide">Filter:</span>
        <button onClick={() => setFilterEx('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold border transition-all
            ${filterEx === 'all' ? 'bg-brand-500/20 text-brand-300 border-brand-500/40' : 'bg-surface-700 text-slate-500 border-white/[0.07]'}`}>
          All
        </button>
        {examData.exams.map(e => (
          <button key={e.id} onClick={() => setFilterEx(e.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold border transition-all flex items-center gap-1
              ${filterEx === e.id ? 'bg-brand-500/20 text-brand-300 border-brand-500/40' : 'bg-surface-700 text-slate-500 border-white/[0.07]'}`}>
            {e.icon} {e.shortName}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📊" title="No mock attempts yet"
          desc="Add your first mock test result to start tracking performance" />
      ) : (
        <>
          {/* Score trend chart */}
          {chartData.length >= 2 && (
            <div className="card">
              <h3 className="font-display font-bold text-white text-base mb-4">Score Trend (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="attempt" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f1f5f9' }}
                    formatter={v => [`${v}%`, 'Score %']}
                  />
                  <Line type="monotone" dataKey="pct" stroke="#3b82f6" strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Records list */}
          <div className="space-y-3">
            {filtered.map(r => {
              const exam = examData.exams.find(e => e.id === r.exam_id)
              const pct  = r.max_score ? Math.round((r.score / r.max_score) * 100) : 0
              const scoreColor = pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'
              return (
                <div key={r.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{exam?.icon || '📝'}</span>
                    <div>
                      <p className="font-display font-bold text-white text-sm">{exam?.shortName || r.exam_id}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-center">
                      <p className={`font-display font-bold text-xl ${scoreColor}`}>{r.score}</p>
                      <p className="text-xs text-slate-500">/{r.max_score}</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-mono font-bold text-sm ${scoreColor}`}>{pct}%</p>
                      <p className="text-xs text-slate-500">score</p>
                    </div>
                    {r.predicted_rank && (
                      <div className="text-center">
                        <p className="font-mono font-bold text-sm text-brand-300">{formatRank(r.predicted_rank)}</p>
                        <p className="text-xs text-slate-500">est. rank</p>
                      </div>
                    )}
                  </div>

                  {r.notes && (
                    <p className="text-xs text-slate-400 bg-surface-600 px-3 py-2 rounded-lg max-w-xs">{r.notes}</p>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => setEditId(r.id)} className="btn-ghost text-xs px-3 py-1.5">Edit</button>
                    <button onClick={() => remove(r.id)} className="btn-ghost text-xs px-3 py-1.5 text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
