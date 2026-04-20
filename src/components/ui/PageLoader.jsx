/* PageLoader ─────────────────────────────────────────────────── */
export default function PageLoader({ message = 'Loading…' }) {
  return (
    <div className="fixed inset-0 bg-surface-900 flex flex-col items-center justify-center gap-4 z-50">
      <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center font-display font-bold text-xl animate-pulse-slow">
        E
      </div>
      <p className="text-slate-400 font-mono text-sm">{message}</p>
    </div>
  )
}

/* ── Spinner ─────────────────────────────────────────────────── */
export function Spinner({ size = 'md' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div className={`${sz} border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin`} />
  )
}

/* ── ErrorMsg ────────────────────────────────────────────────── */
export function ErrorMsg({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm font-body">
      ⚠ {message}
    </div>
  )
}

/* ── EmptyState ──────────────────────────────────────────────── */
export function EmptyState({ icon = '📭', title, desc }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-display font-semibold text-slate-300 text-lg mb-2">{title}</h3>
      {desc && <p className="text-slate-500 text-sm">{desc}</p>}
    </div>
  )
}

/* ── SectionHeader ───────────────────────────────────────────── */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display font-bold text-white text-2xl">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

/* ── ProgressBar ─────────────────────────────────────────────── */
export function ProgressBar({ pct, color = 'bg-brand-500', label, height = 'h-2' }) {
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
          <span>{label}</span><span>{pct}%</span>
        </div>
      )}
      <div className={`${height} bg-surface-600 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ── StatCard ────────────────────────────────────────────────── */
export function StatCard({ label, value, icon, color = 'text-brand-400', sub }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`text-3xl ${color}`}>{icon}</div>
      <div>
        <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
        <p className="text-slate-400 text-xs font-body">{label}</p>
        {sub && <p className="text-slate-600 text-xs font-mono mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ── Badge ───────────────────────────────────────────────────── */
export function Badge({ label, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
    green:  'bg-green-500/15 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    red:    'bg-red-500/15 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    cyan:   'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  }
  return (
    <span className={`badge border ${colors[color] || colors.blue}`}>{label}</span>
  )
}
