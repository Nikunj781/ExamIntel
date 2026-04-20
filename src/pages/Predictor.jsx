import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePredictor } from '../hooks'
import { SectionHeader, Badge, EmptyState } from '../components/ui/PageLoader'
import { formatRank } from '../utils/predictor'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { predictionsService } from '../services/firebase'
import examData from '../data/examData.json'

export default function Predictor() {
  const { user } = useAuth()
  const [selectedExam, setSelectedExam] = useState('jee-main')
  const [inputRank, setInputRank] = useState('')
  const [savedPredictions, setSavedPredictions] = useState([])
  
  // Reuse existing usePredictor logic but adapted for direct rank input
  const allColleges = useMemo(() => examData.colleges[selectedExam] || [], [selectedExam])
  const rank = inputRank ? parseInt(inputRank, 10) : null
  const colleges = useMemo(() => rank ? allColleges.filter(c => c.cutoffRank >= rank) : [], [rank, allColleges])

  // Load saved predictions
  useEffect(() => {
    if (user) {
      predictionsService.getAll(user.id).then(({ data }) => setSavedPredictions(data || []))
    }
  }, [user])

  const handleSave = async () => {
    if (!user || !rank) return
    const { data } = await predictionsService.add(user.id, selectedExam, rank, colleges.slice(0, 10)) // save top 10
    if (data) setSavedPredictions(prev => [data, ...prev])
  }

  const handleDelete = async (id) => {
    if (!user) return
    await predictionsService.remove(id)
    setSavedPredictions(prev => prev.filter(p => p.id !== id))
  }

  const chartData = useMemo(() => 
    allColleges.slice(0, 8).map(c => ({
      name: c.name.split(' ').slice(0, 2).join(' '),
      cutoff: c.cutoffRank,
      reachable: rank && c.cutoffRank >= rank
    }))
  , [allColleges, rank])

  return (
    <div className="space-y-8 animate-in">
      <SectionHeader title="College Predictor" subtitle="Enter your expected rank to see reachable colleges" />

      {/* Exam selector */}
      <div className="flex flex-wrap gap-2">
        {['jee-main', 'jee-advanced', 'neet', 'bitsat', 'kcet'].map(id => {
          const e = examData.exams.find(x => x.id === id)
          if (!e) return null
          return (
            <button key={id} onClick={() => setSelectedExam(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-display font-semibold transition-all
                ${selectedExam === id ? 'bg-brand-500/20 text-brand-300 border-brand-500/40' : 'bg-surface-700 text-slate-500 border-white/[0.07] hover:text-slate-300'}`}>
              <span>{e.icon}</span>{e.shortName}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Input & Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card border-brand-500/20 bg-gradient-to-br from-surface-700 to-surface-800">
            <h3 className="font-display font-bold text-white text-lg mb-4">Your Predictor</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wide mb-1.5 block">
                  Expected Rank (AIR)
                </label>
                <input type="number" min={1} value={inputRank}
                  onChange={e => setInputRank(e.target.value)}
                  placeholder="e.g. 5000" className="input" />
              </div>
              <button onClick={handleSave} disabled={!rank} className="btn-primary w-full sm:w-auto flex items-center gap-2">
                💾 Save Prediction
              </button>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="card">
              <h3 className="font-display font-bold text-white text-base mb-4">Cutoff vs Your Rank</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f1f5f9' }} />
                  {rank && <ReferenceLine y={rank} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Your Rank', fill: '#ef4444', fontSize: 10 }} />}
                  <Bar dataKey="cutoff" radius={[4,4,0,0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.reachable ? '#22c55e' : '#3b82f6'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-500 text-center mt-2">🟢 Reachable · 🔵 Above your rank · 🔴 Your Rank</p>
            </div>
          )}

          {/* Results Table */}
          <div className="card">
            <h3 className="font-display font-bold text-white text-base mb-4">Reachable Colleges ({colleges.length})</h3>
            {!rank ? (
              <EmptyState icon="🎯" title="Enter your rank" desc="See which colleges you can get into." />
            ) : colleges.length === 0 ? (
              <EmptyState icon="🏫" title="No matches found" desc="Try adjusting your expected rank." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-surface-800">
                    <tr><th className="px-4 py-3 rounded-tl-lg">College</th><th className="px-4 py-3">Cutoff</th><th className="px-4 py-3 rounded-tr-lg">Type</th></tr>
                  </thead>
                  <tbody>
                    {colleges.slice(0, 15).map(c => (
                      <tr key={c.id} className="border-b border-white/[0.04]">
                        <td className="px-4 py-3 font-display font-medium text-slate-200">{c.name}</td>
                        <td className="px-4 py-3 font-mono text-brand-400">{c.cutoffRank.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3"><Badge label={c.type} color={c.type === 'govt' ? 'green' : 'purple'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Saved Predictions */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-display font-bold text-white text-base mb-4 flex items-center gap-2">
              <span>🗂️</span> Saved Predictions
            </h3>
            {savedPredictions.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">No saved predictions yet.</div>
            ) : (
              <div className="space-y-3">
                {savedPredictions.map(p => {
                  const e = examData.exams.find(x => x.id === p.exam_id)
                  const parsed = typeof p.colleges_json === 'string' ? JSON.parse(p.colleges_json) : p.colleges_json
                  return (
                    <div key={p.id} className="p-3 rounded-xl bg-surface-600 border border-white/[0.06] group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-display font-semibold text-slate-400">{e?.shortName}</p>
                          <p className="font-mono text-white">Rank: {p.rank.toLocaleString('en-IN')}</p>
                        </div>
                        <button onClick={() => handleDelete(p.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      </div>
                      <p className="text-xs text-brand-400">{parsed?.length || 0} colleges matched</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
