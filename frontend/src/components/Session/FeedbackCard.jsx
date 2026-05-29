import { CheckCircle, AlertTriangle, Zap, Target, Shield, Activity } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 7) return { badge: 'score-green', text: 'text-success-400', bg: 'bg-success-500/10' };
  if (score >= 4) return { badge: 'score-yellow', text: 'text-warning-400', bg: 'bg-warning-500/10' };
  return { badge: 'score-red', text: 'text-danger-400', bg: 'bg-danger-500/10' };
}

function getConfidenceStyle(level) {
  switch (level) {
    case 'HIGH': return 'bg-success-500/15 text-success-400 border-success-500/30';
    case 'MEDIUM': return 'bg-warning-500/15 text-warning-400 border-warning-500/30';
    case 'LOW': return 'bg-danger-500/15 text-danger-400 border-danger-500/30';
    default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  }
}

export default function FeedbackCard({ session }) {
  const scoreStyle = getScoreColor(session.overallScore);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Score + Confidence Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={scoreStyle.badge}>
            {session.overallScore}
          </div>
          <div>
            <p className="text-lg font-display font-bold text-white">Overall Score</p>
            <p className="text-sm text-gray-400">out of 10</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getConfidenceStyle(session.confidenceLevel)}`}>
          {session.confidenceLevel} CONFIDENCE
        </span>
      </div>

      {/* Strengths */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-success-400" />
          <h3 className="font-display font-semibold text-white">Strengths</h3>
        </div>
        <ul className="space-y-2">
          {session.strengths?.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas to Improve */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-warning-400" />
          <h3 className="font-display font-semibold text-white">Areas to Improve</h3>
        </div>
        <div className="space-y-3">
          {session.areasToImprove?.map((area, i) => (
            <div key={i} className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30">
              <p className="text-sm font-semibold text-warning-400 mb-1">{area.issue}</p>
              <p className="text-sm text-gray-400">{area.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Fix */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-ghost-600/20 to-brand-600/20 border border-ghost-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-ghost-400" />
          <h3 className="font-display font-semibold text-white">Priority Fix</h3>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{session.priorityFix}</p>
      </div>

      {/* Drill Suggestion */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-brand-400" />
          <h3 className="font-display font-semibold text-white">Recommended Drill</h3>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{session.drillSuggestion}</p>
      </div>

      {/* Body Annotations */}
      {session.bodyAnnotations && session.bodyAnnotations.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-ghost-400" />
            <h3 className="font-display font-semibold text-white">Body Annotations</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {session.bodyAnnotations.map((ann, i) => {
              const importanceColor = ann.importance === 'HIGH' ? 'text-danger-400 bg-danger-500/10 border-danger-500/20'
                : ann.importance === 'MEDIUM' ? 'text-warning-400 bg-warning-500/10 border-warning-500/20'
                : 'text-gray-400 bg-gray-500/10 border-gray-500/20';
              return (
                <div key={i} className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-ghost-500/20 text-ghost-400 text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      {ann.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${importanceColor}`}>
                      {ann.importance}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 pl-6">{ann.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
