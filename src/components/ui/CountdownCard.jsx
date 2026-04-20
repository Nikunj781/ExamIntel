import { useCountdown } from '../../hooks'
import { Link } from 'react-router-dom'

function Block({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono font-bold text-white text-2xl sm:text-3xl leading-none tabular-nums w-14 sm:w-16 text-center
                       bg-surface-700 border border-white/[0.08] rounded-xl py-2 px-1">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-slate-600 text-xs mt-1 font-body">{label}</span>
    </div>
  )
}

function RegBadge({ exam }) {
  if (!exam.registrationDeadline) return null
  const now = new Date()
  const deadline = new Date(exam.registrationDeadlineIso)
  const daysLeft = Math.ceil((deadline - now) / 86400000)

  if (daysLeft < 0) {
    return (
      <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center gap-1.5">
        <span className="text-xs text-slate-600">🔒</span>
        <span className="text-xs text-slate-600 font-body">Registration closed</span>
      </div>
    )
  }

  const urgent = daysLeft <= 7
  const soon   = daysLeft <= 30

  return (
    <div className={`mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2`}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs">{urgent ? '🚨' : soon ? '⏰' : '📝'}</span>
        <span className="text-xs text-slate-400 font-body">Reg. deadline:</span>
        <span className={`text-xs font-display font-semibold ${urgent ? 'text-red-400' : soon ? 'text-yellow-400' : 'text-slate-300'}`}>
          {exam.registrationDeadline}
        </span>
      </div>
      {urgent && (
        <span className="text-xs font-mono font-bold text-red-400 animate-pulse">
          {daysLeft}d left!
        </span>
      )}
      {!urgent && soon && (
        <span className="text-xs font-mono text-yellow-500">
          {daysLeft}d left
        </span>
      )}
    </div>
  )
}

export default function CountdownCard({ exam }) {
  const time = useCountdown(exam.nextDate)

  return (
    <Link to={`/exams/${exam.id}`}
      className="card hover:border-white/[0.15] transition-all duration-200 hover:-translate-y-0.5 group block"
      style={{ borderColor: `${exam.color}30` }}
    >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{exam.icon}</span>
            <div>
              <h3 className="font-display font-bold text-white text-base group-hover:text-brand-300 transition-colors">
                {exam.shortName}
              </h3>
              <p className="text-xs text-slate-500 font-body">{exam.conductedBy}</p>
              <a
                href={exam.officialSite}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-slate-600 hover:text-brand-400 transition-colors mt-0.5 inline-flex items-center gap-0.5 group/link"
                title="Visit official website"
              >
                <span className="line-clamp-1 max-w-[160px]">{exam.description}</span>
                <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">↗</span>
              </a>
            </div>
          </div>
        <span className="text-xs font-mono px-2 py-1 rounded-lg border"
          style={{ color: exam.color, borderColor: `${exam.color}40`, background: `${exam.color}15` }}>
          {exam.sessions[0].name}
        </span>
      </div>

      {/* Countdown */}
      {time.expired ? (
        <div className="text-center py-3">
          <span className="font-display font-bold text-red-400 text-lg">Exam Passed</span>
        </div>
      ) : (
        <div className="flex justify-around">
          <Block value={time.days}    label="Days"    />
          <Block value={time.hours}   label="Hours"   />
          <Block value={time.minutes} label="Mins"    />
          <Block value={time.seconds} label="Secs"    />
        </div>
      )}

      {/* Date footer */}
      <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
        <span className="text-xs text-slate-500 font-body">📅 {exam.sessions[0].dates}</span>
        <span className="text-xs font-display font-semibold" style={{ color: exam.color }}>
          View Details →
        </span>
      </div>

      {/* Registration deadline */}
      <RegBadge exam={exam} />
    </Link>
  )
}
