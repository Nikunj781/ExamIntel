import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { questionActionService } from '../services/firebase'
import { SectionHeader, EmptyState, Badge } from '../components/ui/PageLoader'

export default function QuestionHub() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('bookmarks') // 'bookmarks' | 'notes'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // For creating a new standalone note (not linked to a question)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [savingNew, setSavingNew] = useState(false)

  const loadItems = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      if (activeTab === 'bookmarks') {
        const { data } = await questionActionService.getBookmarks(user.uid || user.id)
        setItems(data || [])
      } else {
        const { data } = await questionActionService.getNotes(user.uid || user.id)
        setItems(data || [])
      }
    } finally {
      setLoading(false)
    }
  }, [user, activeTab])

  useEffect(() => { loadItems() }, [loadItems])

  const handleRemoveBookmark = async (qId) => {
    if (!user) return
    await questionActionService.toggleBookmark(user.uid || user.id, { id: qId })
    setItems(prev => prev.filter(i => i.question_id !== qId))
  }

  const handleDeleteNote = async (noteId) => {
    const userId = user.uid || user.id
    // Remove from localStorage
    const stored = JSON.parse(localStorage.getItem(`notes_${userId}`) || '[]')
    const updated = stored.filter(n => n.id !== noteId)
    localStorage.setItem(`notes_${userId}`, JSON.stringify(updated))
    setItems(prev => prev.filter(i => i.id !== noteId))
  }

  const handleCreateNote = async (e) => {
    e.preventDefault()
    if (!newNoteText.trim()) return
    setSavingNew(true)
    const userId = user.uid || user.id
    const stored = JSON.parse(localStorage.getItem(`notes_${userId}`) || '[]')
    const newNote = {
      id: crypto.randomUUID(),
      user_id: userId,
      question_id: `custom_${Date.now()}`,
      question_data: {
        text: newNoteTitle || 'Custom Note',
        subject: 'General',
        chapter: 'My Notes'
      },
      text: newNoteText,
      updated_at: new Date().toISOString()
    }
    stored.unshift(newNote)
    localStorage.setItem(`notes_${userId}`, JSON.stringify(stored))
    setItems(prev => [newNote, ...prev])
    setNewNoteText('')
    setNewNoteTitle('')
    setShowNoteForm(false)
    setSavingNew(false)
  }

  return (
    <div className="space-y-8 animate-in">
      <SectionHeader
        title="My Questions Hub"
        subtitle="Review your bookmarked questions and custom notes"
        action={
          activeTab === 'notes' && !showNoteForm && (
            <button onClick={() => setShowNoteForm(true)} className="btn-primary text-sm">
              + New Note
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/[0.06] pb-4">
        <button onClick={() => { setActiveTab('bookmarks'); setShowNoteForm(false) }}
          className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all
            ${activeTab === 'bookmarks' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'bg-surface-700 text-slate-400'}`}>
          ★ Bookmarks
        </button>
        <button onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all
            ${activeTab === 'notes' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-surface-700 text-slate-400'}`}>
          📝 Custom Notes
        </button>
      </div>

      {/* New Note Form */}
      {activeTab === 'notes' && showNoteForm && (
        <form onSubmit={handleCreateNote} className="card border-blue-500/20 animate-in space-y-3">
          <h3 className="font-display font-bold text-white text-base">📝 Create New Note</h3>
          <div>
            <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Title (optional)
            </label>
            <input
              type="text"
              value={newNoteTitle}
              onChange={e => setNewNoteTitle(e.target.value)}
              placeholder="e.g. Optics Key Formulas"
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Note Content *
            </label>
            <textarea
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              placeholder="Write your note, solution, or revision points here..."
              rows={4}
              required
              className="input resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={savingNew || !newNoteText.trim()} className="btn-primary text-sm">
              {savingNew ? 'Saving…' : '💾 Save Note'}
            </button>
            <button type="button" onClick={() => { setShowNoteForm(false); setNewNoteText(''); setNewNoteTitle('') }}
              className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-500 text-sm">Loading…</span>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={activeTab === 'bookmarks' ? '★' : '📝'}
            title={`No ${activeTab} yet`}
            desc={activeTab === 'bookmarks'
              ? 'Go to the Test Engine, take a quiz, and star questions to bookmark them here.'
              : 'Click "+ New Note" above to create your first note, or write notes inside a test.'}
          />
        ) : (
          items.map(item => (
            <div key={item.id} className="card bg-surface-800 border-white/[0.05] animate-in">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge label={item.question_data?.subject || 'General'} color="purple" />
                  <span className="text-xs text-slate-500 mt-1">{item.question_data?.chapter}</span>
                </div>
                {activeTab === 'bookmarks' ? (
                  <button onClick={() => handleRemoveBookmark(item.question_id)}
                    className="text-yellow-500 hover:text-yellow-400 transition-colors" title="Remove bookmark">
                    ★
                  </button>
                ) : (
                  <button onClick={() => handleDeleteNote(item.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors text-sm" title="Delete note">
                    🗑️
                  </button>
                )}
              </div>

              {/* Question text (title for standalone notes) */}
              <div className="bg-surface-900 p-4 rounded-xl mb-3">
                <p className="text-slate-200 text-sm">{item.question_data?.text || 'Question text not found.'}</p>
              </div>

              {/* Note content */}
              {activeTab === 'notes' && item.text && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                  <h4 className="text-xs font-display font-semibold text-blue-400 uppercase mb-2">My Note</h4>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{item.text}</p>
                </div>
              )}

              {item.updated_at && (
                <p className="text-xs text-slate-600 mt-2 font-mono">
                  {new Date(item.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
