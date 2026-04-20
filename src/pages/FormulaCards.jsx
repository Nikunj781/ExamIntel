import { useState, useMemo } from 'react'
import { SectionHeader } from '../components/ui/PageLoader'
import formulaData from '../data/formulaData.json'

const subjectColors = {
  Physics:     { bg: 'bg-orange-500/20',  text: 'text-orange-400',  border: 'border-orange-500/30',  icon: '⚛️'  },
  Chemistry:   { bg: 'bg-green-500/20',   text: 'text-green-400',   border: 'border-green-500/30',   icon: '🧪'  },
  Mathematics: { bg: 'bg-blue-500/20',    text: 'text-blue-400',    border: 'border-blue-500/30',    icon: '📐'  },
  Biology:     { bg: 'bg-pink-500/20',    text: 'text-pink-400',    border: 'border-pink-500/30',    icon: '🧬'  },
}

const cardPalette = [
  'from-blue-600 to-blue-800',
  'from-green-600 to-green-800',
  'from-red-600 to-red-800',
  'from-purple-600 to-purple-800',
  'from-orange-500 to-orange-700',
  'from-pink-600 to-pink-800',
  'from-teal-600 to-teal-800',
  'from-indigo-600 to-indigo-800',
]

export default function FormulaCards() {
  const subjects = Object.keys(formulaData)
  const [activeSub, setActiveSub]       = useState(subjects[0])
  const [activeChapter, setActiveChapter] = useState(null)
  const [search, setSearch]             = useState('')

  const chapters = useMemo(() => formulaData[activeSub] || [], [activeSub])

  const filteredChapters = useMemo(() =>
    search.trim()
      ? chapters.filter(c => c.chapter.toLowerCase().includes(search.toLowerCase()))
      : chapters
  , [chapters, search])

  const filteredFormulas = useMemo(() => {
    if (!activeChapter) return []
    if (!search.trim()) return activeChapter.formulas
    return activeChapter.formulas.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.equation.toLowerCase().includes(search.toLowerCase()) ||
      f.desc.toLowerCase().includes(search.toLowerCase())
    )
  }, [activeChapter, search])

  return (
    <div className="space-y-8 animate-in">
      <SectionHeader
        title="Formula Cards"
        subtitle={`${subjects.reduce((acc, s) => acc + (formulaData[s]?.reduce((a, c) => a + c.formulas.length, 0) || 0), 0)} formulas across ${subjects.reduce((a, s) => a + (formulaData[s]?.length || 0), 0)} chapters`}
      />

      {/* Subject Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-white/[0.06] pb-4">
        {subjects.map(sub => {
          const isActive = activeSub === sub
          const colors   = subjectColors[sub] || subjectColors.Physics
          return (
            <button key={sub} onClick={() => { setActiveSub(sub); setActiveChapter(null); setSearch('') }}
              className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all flex items-center gap-2
                ${isActive
                  ? `${colors.bg} ${colors.text} border ${colors.border}`
                  : 'bg-surface-700 text-slate-400 border border-transparent hover:text-slate-200'}`}>
              {colors.icon} {sub}
              <span className="text-xs opacity-60 font-mono">({formulaData[sub]?.length})</span>
            </button>
          )
        })}
      </div>

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        <input
          type="text"
          placeholder={activeChapter ? `Search formulas in ${activeChapter.chapter}…` : `Search chapters in ${activeSub}…`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-9 w-full"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-lg">
            ×
          </button>
        )}
      </div>

      {/* Chapter Grid */}
      {!activeChapter ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-semibold text-slate-300">
              {filteredChapters.length} chapter{filteredChapters.length !== 1 ? 's' : ''}
            </h3>
          </div>

          {filteredChapters.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No chapters match your search.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredChapters.map((chap, i) => (
                <button key={chap.chapter} onClick={() => { setActiveChapter(chap); setSearch('') }}
                  className={`bg-gradient-to-br ${cardPalette[i % cardPalette.length]} p-5 h-36 rounded-2xl flex flex-col justify-between text-left hover:scale-105 hover:shadow-xl transition-all shadow-lg shadow-black/20 group`}>
                  <span className="font-display font-bold text-white text-sm leading-tight">{chap.chapter}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-xs font-mono">📖 {chap.formulas.length} formulas</span>
                    <span className="text-white/50 group-hover:text-white/90 transition-colors text-lg">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Back button + title */}
          <div className="flex items-center gap-3">
            <button onClick={() => { setActiveChapter(null); setSearch('') }}
              className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
              ← Back
            </button>
            <span className="text-slate-600">|</span>
            <h2 className="text-xl font-display font-bold text-white">{activeChapter.chapter}</h2>
            <span className="text-xs text-slate-500 font-mono ml-auto">{filteredFormulas.length} formulas</span>
          </div>

          {filteredFormulas.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No formulas match your search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFormulas.map((f, i) => (
                <div key={i} className="card bg-surface-700 hover:border-brand-500/40 transition-colors group">
                  <h4 className="font-display font-semibold text-brand-300 mb-3 text-sm">{f.name}</h4>
                  <div className="bg-surface-900 p-4 rounded-xl mb-3 flex items-center justify-center min-h-[60px]">
                    <code className="text-base font-mono text-white text-center leading-relaxed">{f.equation}</code>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
