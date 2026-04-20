import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import examData from '../data/examData.json'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-bg-primary font-body text-slate-100 selection:bg-brand-500/30">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-500/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/[0.06] bg-surface-800/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-display font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">E</div>
            <span className="font-display font-bold text-xl tracking-tight text-white">ExamIntel</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary py-2 px-4 text-sm">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-display font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                <Link to="/signup" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center lg:pt-32 lg:pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm font-display mb-8">
          <span className="flex w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-slate-300">Tracking 10+ Indian Entrance Exams</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-white mb-6">
          Stop Searching. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
            Start Preparing.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
          The only unified portal for 20M+ Indian aspirants. Track syllabus, solve chapter-wise PYQs, predict college cutoffs, and stay ahead—all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={user ? "/dashboard" : "/signup"} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            {user ? 'Go to Dashboard' : 'Create Free Account'}
          </Link>
          {!user && (
            <p className="text-sm text-slate-500 font-display">No credit card required</p>
          )}
        </div>
      </div>

      {/* Exams Grid */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-2xl text-white">Supported Exams</h2>
          <p className="text-slate-500 mt-2">Engineering, Medical, and Science entrances covered.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {examData.exams.slice(0, 8).map(e => (
            <Link to={`/dashboard`} key={e.id} className="card bg-surface-800 hover:bg-surface-700 hover:border-brand-500/30 transition-all duration-300 flex flex-col items-center justify-center text-center p-6 group cursor-pointer">
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{e.icon}</span>
              <h3 className="font-display font-bold text-slate-200">{e.shortName}</h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">{e.totalMarks} Marks</p>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-surface-900/50 py-12">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
           Built for the Class of 2029 End-Term Project • React & Supabase
         </div>
      </footer>
    </div>
  )
}
