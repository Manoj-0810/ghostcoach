import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { compareSessions } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { ArrowLeft, GitCompare, Calendar, Trophy, AlertCircle, Target, Activity } from 'lucide-react';

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const id1 = searchParams.get('id1');
  const id2 = searchParams.get('id2');

  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id1 && id2) {
      loadComparison();
    } else {
      setError('Please select exactly two sessions to compare.');
      setLoading(false);
    }
  }, [id1, id2]);

  const loadComparison = async () => {
    try {
      const res = await compareSessions(id1, id2);
      setCompareData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load comparison data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Analyzing technical delta..." />;

  if (error || !compareData) {
    return (
      <div className="page-container">
        <div className="glass-card p-12 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-danger-400 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Comparison Failed</h2>
          <p className="text-gray-400 mb-6">{error || 'Could not load sessions comparison.'}</p>
          <Link to="/progress" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Progress
          </Link>
        </div>
      </div>
    );
  }

  const { session1, session2, delta } = compareData;
  const scoreDiff = delta.scoreDifference || 0;
  const isImproved = scoreDiff > 0;

  const date1 = new Date(session1.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const date2 = new Date(session2.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 animate-fade-in border-b border-gray-800/40 pb-4">
        <Link to="/progress" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Progress Tracker
        </Link>
        <div className="flex items-center gap-2 ml-4">
          <GitCompare className="w-5 h-5 text-ghost-400" />
          <span className="text-sm font-semibold text-white">Technique Comparison</span>
        </div>
      </div>

      {/* Score Improvement Banner */}
      <div className="mb-8 animate-slide-up">
        <div className={`glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 ${
          scoreDiff > 0 ? 'border-l-success-500 bg-success-950/10' :
          scoreDiff < 0 ? 'border-l-danger-500 bg-danger-950/10' :
          'border-l-gray-500 bg-gray-900/10'
        }`}>
          <div>
            <h2 className="text-xl font-display font-bold text-white">
              {scoreDiff > 0 ? 'Technique Improvement Detected!' :
               scoreDiff < 0 ? 'Score Delta Check' :
               'Consistent Stance Performance'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Comparing session from {date1} (Score: {session1.overallScore}) with session from {date2} (Score: {session2.overallScore})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-display font-extrabold px-6 py-3 rounded-2xl border ${
              scoreDiff > 0 ? 'text-success-400 border-success-500/20 bg-success-500/5' :
              scoreDiff < 0 ? 'text-danger-400 border-danger-500/20 bg-danger-500/5' :
              'text-gray-400 border-gray-500/20 bg-gray-500/5'
            }`}>
              {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
            </div>
            <div className="text-left">
              <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Overall Delta</span>
              <span className={`text-sm font-bold ${
                scoreDiff > 0 ? 'text-success-400' :
                scoreDiff < 0 ? 'text-danger-400' : 'text-gray-400'
              }`}>
                {scoreDiff > 0 ? 'IMPROVED' : scoreDiff < 0 ? 'DECLINED' : 'UNCHANGED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stance Images Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {/* Session 1 Image Overlay */}
        <div className="glass-card p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Session 1: {date1}
            </span>
            <span className="text-sm font-bold text-gray-300 bg-gray-800 px-2 py-0.5 rounded">
              Score: {session1.overallScore}/10
            </span>
          </div>
          <div className="relative inline-block w-full overflow-hidden rounded-xl bg-gray-800/50">
            <img src={session1.imageUrl} alt="Session 1 stance" className="w-full object-contain max-h-[350px] block" />
            {session1.bodyAnnotations && session1.bodyAnnotations.map((ann, i) => {
              const x = parseFloat(ann.x);
              const y = parseFloat(ann.y);
              if (isNaN(x) || isNaN(y) || x < 0 || x > 100 || y < 0 || y > 100) return null;
              const color = ann.importance === 'HIGH' ? 'bg-danger-500 border-danger-300' :
                            ann.importance === 'MEDIUM' ? 'bg-warning-500 border-warning-300' :
                            'bg-ghost-500 border-ghost-300';
              return (
                <div
                  key={i}
                  className={`absolute w-6 h-6 rounded-full ${color} border flex items-center justify-center text-[10px] font-bold text-white shadow-lg`}
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  title={`${ann.label}: ${ann.description}`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Session 2 Image Overlay */}
        <div className="glass-card p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Session 2: {date2}
            </span>
            <span className="text-sm font-bold text-gray-300 bg-gray-800 px-2 py-0.5 rounded">
              Score: {session2.overallScore}/10
            </span>
          </div>
          <div className="relative inline-block w-full overflow-hidden rounded-xl bg-gray-800/50">
            <img src={session2.imageUrl} alt="Session 2 stance" className="w-full object-contain max-h-[350px] block" />
            {session2.bodyAnnotations && session2.bodyAnnotations.map((ann, i) => {
              const x = parseFloat(ann.x);
              const y = parseFloat(ann.y);
              if (isNaN(x) || isNaN(y) || x < 0 || x > 100 || y < 0 || y > 100) return null;
              const color = ann.importance === 'HIGH' ? 'bg-danger-500 border-danger-300' :
                            ann.importance === 'MEDIUM' ? 'bg-warning-500 border-warning-300' :
                            'bg-ghost-500 border-ghost-300';
              return (
                <div
                  key={i}
                  className={`absolute w-6 h-6 rounded-full ${color} border flex items-center justify-center text-[10px] font-bold text-white shadow-lg`}
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  title={`${ann.label}: ${ann.description}`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparative Technical Feedback */}
      <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-display font-semibold text-white mb-2">Technical Breakdown</h3>

        {/* Priority Fix comparison */}
        <div className="glass-card p-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-ghost-400" />
            Priority Coaching Action
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/30">
              <span className="text-xs text-gray-500 block uppercase font-bold mb-1">Session 1</span>
              <p className="text-sm font-semibold text-white">{session1.priorityFix}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/30">
              <span className="text-xs text-gray-500 block uppercase font-bold mb-1">Session 2</span>
              <p className="text-sm font-semibold text-white">{session2.priorityFix}</p>
            </div>
          </div>
        </div>

        {/* Strengths and Areas side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session 1 detailed list */}
          <div className="glass-card p-6">
            <h4 className="font-display font-semibold text-white mb-4 border-b border-gray-800/40 pb-2">Session 1 Technique Summary</h4>
            
            <div className="mb-6">
              <span className="text-xs text-success-400 font-bold uppercase tracking-wider block mb-2">Key Strengths</span>
              <ul className="space-y-2">
                {session1.strengths && session1.strengths.map((str, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-success-400 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs text-danger-400 font-bold uppercase tracking-wider block mb-2">Areas to Improve</span>
              <div className="space-y-3">
                {session1.areasToImprove && session1.areasToImprove.map((area, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-semibold text-white block">{area.issue}</span>
                    <span className="text-xs text-gray-400 mt-0.5 block">{area.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Session 2 detailed list */}
          <div className="glass-card p-6">
            <h4 className="font-display font-semibold text-white mb-4 border-b border-gray-800/40 pb-2">Session 2 Technique Summary</h4>

            <div className="mb-6">
              <span className="text-xs text-success-400 font-bold uppercase tracking-wider block mb-2">Key Strengths</span>
              <ul className="space-y-2">
                {session2.strengths && session2.strengths.map((str, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-success-400 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs text-danger-400 font-bold uppercase tracking-wider block mb-2">Areas to Improve</span>
              <div className="space-y-3">
                {session2.areasToImprove && session2.areasToImprove.map((area, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-semibold text-white block">{area.issue}</span>
                    <span className="text-xs text-gray-400 mt-0.5 block">{area.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Drill suggestions side-by-side */}
        <div className="glass-card p-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-ghost-400" />
            Recommended Practice Drills
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/30">
              <span className="text-xs text-gray-500 block uppercase font-bold mb-1">Session 1 Drill</span>
              <p className="text-sm text-gray-300">{session1.drillSuggestion}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/30">
              <span className="text-xs text-gray-500 block uppercase font-bold mb-1">Session 2 Drill</span>
              <p className="text-sm text-gray-300">{session2.drillSuggestion}</p>
            </div>
          </div>
        </div>

        {/* Body annotations annotations side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Annotations 1 */}
          <div className="glass-card p-6">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-ghost-400" />
              Session 1 Annotation Details
            </h4>
            <div className="space-y-2">
              {session1.bodyAnnotations && session1.bodyAnnotations.length > 0 ? (
                session1.bodyAnnotations.map((ann, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-gray-900/30 border border-gray-800/30">
                    <div className="w-5 h-5 rounded-full bg-ghost-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{ann.label}</p>
                      <p className="text-xs text-gray-400">{ann.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No body annotations found for this session.</p>
              )}
            </div>
          </div>

          {/* Annotations 2 */}
          <div className="glass-card p-6">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-ghost-400" />
              Session 2 Annotation Details
            </h4>
            <div className="space-y-2">
              {session2.bodyAnnotations && session2.bodyAnnotations.length > 0 ? (
                session2.bodyAnnotations.map((ann, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-gray-900/30 border border-gray-800/30">
                    <div className="w-5 h-5 rounded-full bg-ghost-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{ann.label}</p>
                      <p className="text-xs text-gray-400">{ann.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No body annotations found for this session.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
