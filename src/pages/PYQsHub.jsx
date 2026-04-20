import { useState, useMemo } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites'
import { SectionHeader, EmptyState, Badge } from '../components/ui/PageLoader'
import examData from '../data/examData.json'

const generateMockPYQs = (subject, chapters) => {
  return chapters.map((ch, i) => ({
    id: `${subject}_${i}`,
    chapter: ch,
    year: 2025,
    links: [
      { name: 'PW PDF', url: 'https://www.pw.live/iit-jee/exams/jee-main-previous-year-question-papers', type: 'pw' },
      { name: 'Sathee', url: 'https://sathee.iitk.ac.in', type: 'sathee' },
      { name: 'Careers360', url: 'https://engineering.careers360.com', type: 'c360' }
    ]
  }))
}

export default function PYQsHub() {
  const { examId } = useParams()
  const exam = useMemo(() => examData.exams.find(e => e.id === examId), [examId])
  const syllabus = useMemo(() => examData.syllabus[examId] || {}, [examId])
  const subjects = useMemo(() => Object.keys(syllabus), [syllabus])
  
  const [activeSubject, setActiveSubject] = useState(subjects[0] || null)
  const [showFavorites, setShowFavorites] = useState(false)
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites(examId)

  const pyqData = useMemo(() => {
    if (!activeSubject) return []
    return generateMockPYQs(activeSubject, syllabus[activeSubject] || [])
  }, [activeSubject, syllabus])

  if (!exam) return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-3 font-body">
          <Link to={`/exams/${examId}`} className="hover:text-slate-300">{exam.icon} {exam.shortName}</Link>
          <span>›</span><span className="text-slate-300">PYQs Hub</span>
        </div>
        <SectionHeader title={`${exam.shortName} PYQs Hub`} subtitle="Chapter-wise previous year questions from top platforms" />
      </div>

      <div className="flex gap-4 mb-6 border-b border-white/[0.06] pb-4">
        <button 
          onClick={() => setShowFavorites(false)}
          className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all ${!showFavorites ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40' : 'bg-surface-700 text-slate-400'}`}
        >
          All Chapters
        </button>
        <button 
          onClick={() => setShowFavorites(true)}
          className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all flex items-center gap-2 ${showFavorites ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-surface-700 text-slate-400'}`}
        >
          ★ My Favorites <Badge label={favorites.length.toString()} color="purple" />
        </button>
      </div>

      {!showFavorites ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-3 px-2">Subjects</h3>
            {subjects.map(sub => (
              <button 
                key={sub} 
                onClick={() => setActiveSubject(sub)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-display font-medium transition-all ${activeSubject === sub ? 'bg-surface-600 text-white border border-white/[0.1]' : 'text-slate-400 hover:bg-surface-700'}`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Main List */}
          <div className="lg:col-span-3 space-y-3">
            {pyqData.length === 0 ? (
              <EmptyState icon="📄" title="No PYQs found" desc="Select a different subject" />
            ) : (
              pyqData.map(item => {
                const fav = isFavorite(item.id)
                return (
                  <div key={item.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:border-white/[0.15] transition-all">
                    <div>
                      <h4 className="font-display font-semibold text-white">{item.chapter}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-mono">Last asked: {item.year}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.links.map(link => (
                        <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="btn-ghost text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                          📄 {link.name}
                        </a>
                      ))}
                      <button 
                        onClick={() => fav ? removeFavorite(item.id) : addFavorite(item.id, { chapter: item.chapter, subject: activeSubject })}
                        className={`p-2 rounded-lg border transition-all ${fav ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' : 'bg-surface-700 border-white/[0.1] text-slate-400 hover:text-yellow-400 hover:border-yellow-400/40'}`}
                        title={fav ? "Remove from favorites" : "Save favorite"}
                      >
                        ★
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <EmptyState icon="★" title="No favorites yet" desc="Save chapters to easily access their PYQs later." />
          ) : (
            favorites.map(fav => (
              <div key={fav.id} className="card flex items-center justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge label={fav.details?.subject || 'Unknown'} color="blue" />
                    <h4 className="font-display font-semibold text-white">{fav.details?.chapter || 'Chapter'}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href="https://www.pw.live/iit-jee/exams/jee-main-previous-year-question-papers" target="_blank" rel="noreferrer" className="btn-primary text-xs px-3 py-1.5 rounded-lg">Open PDF</a>
                  <button onClick={() => removeFavorite(fav.pyq_id)} className="btn-ghost text-xs text-red-400 hover:text-red-300">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
