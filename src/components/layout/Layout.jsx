import { useState, useCallback } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTracker } from '../../context/TrackerContext'
import examData from '../../data/examData.json'

const NAV = [
  { to: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { to: '/test',      icon: '📝', label: 'Create Test' },
  { to: '/formulas',  icon: '🧮', label: 'Formulas' },
  { to: '/tracker',   icon: '📊', label: 'Progress'  },
  { to: '/predictor', icon: '🎯', label: 'Predictor' },
  { to: '/my-questions',icon: '⭐', label: 'My Questions'},
  { to: '/history',   icon: '🗂️',  label: 'History'   },
]

export default function Layout() {
  const { user, signOut, signInGoogle }       = useAuth()
  const { syncing }             = useTracker()
  const navigate                = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = useCallback(async () => {
    await signOut()
    navigate('/login')
  }, [signOut, navigate])

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'EH'

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-800 border-r border-white/[0.06] sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-lg font-display font-bold glow-brand">
              E
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg">ExamIntel</span>
              {syncing && <span className="block text-xs text-brand-400 font-mono">syncing…</span>}
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-display font-medium text-sm transition-all duration-150
                 ${isActive
                   ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                   : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}`
              }
            >
              <span>{icon}</span>{label}
            </NavLink>
          ))}

          {/* Exam sub-nav */}
          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-display font-semibold text-slate-600 uppercase tracking-widest mb-2">Exams</p>
            {examData.exams.map(e => (
              <NavLink
                key={e.id}
                to={`/exams/${e.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-body transition-all duration-150
                   ${isActive
                     ? 'bg-white/[0.08] text-white'
                     : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'}`
                }
              >
                <span>{e.icon}</span>
                <span className="truncate">{e.shortName}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/[0.06] flex flex-col gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04]">
                <div className="w-8 h-8 rounded-full bg-brand-500/30 border border-brand-500/50 flex items-center justify-center text-xs font-display font-bold text-brand-300">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-display font-semibold text-slate-300 truncate">
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-600 truncate">{user.email}</p>
                </div>
                <button onClick={handleSignOut} title="Sign out"
                  className="text-slate-600 hover:text-red-400 transition-colors text-base">
                  ⏻
                </button>
              </div>
            </>
          ) : (
            <Link to="/login"
              className="btn-primary w-full text-center text-sm py-2 px-4">
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-800/95 backdrop-blur border-b border-white/[0.06] flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center font-display font-bold text-sm">E</div>
          <span className="font-display font-bold text-white">ExamIntel</span>
        </div>
        <button onClick={() => setMenuOpen(v => !v)} className="text-slate-400 hover:text-white text-xl p-1">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-surface-900/95 backdrop-blur pt-14">
          <nav className="p-4 space-y-1">
            {NAV.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-display font-medium text-base
                   ${isActive ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400'}`
                }
              >
                <span>{icon}</span>{label}
              </NavLink>
            ))}
            <div className="pt-4">
              {examData.exams.map(e => (
                <NavLink key={e.id} to={`/exams/${e.id}`} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-slate-400 font-body">
                  <span>{e.icon}</span>{e.shortName}
                </NavLink>
              ))}
            </div>
            {user ? (
              <button onClick={handleSignOut} className="w-full mt-4 btn-ghost text-red-400 hover:text-red-300">
                Sign Out
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="w-full mt-4 btn-primary text-center text-sm py-2.5 block">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:mt-0 mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
