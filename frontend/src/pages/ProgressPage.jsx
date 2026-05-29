import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProgress } from '../services/api';
import ProgressChart from '../components/Progress/ProgressChart';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { TrendingUp, Trophy, Target, Zap, GitCompare } from 'lucide-react';

export default function ProgressPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSessions, setSelectedSessions] = useState([]);

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    const handleSessionDeleted = (e) => {
      setData((prev) => prev.filter((s) => s.id !== e.detail.id));
      setSelectedSessions((prev) => prev.filter((id) => id !== e.detail.id));
    };
    window.addEventListener('session-deleted', handleSessionDeleted);
    return () => window.removeEventListener('session-deleted', handleSessionDeleted);
  }, []);

  const loadProgress = async () => {
    try {
      const res = await getProgress();
      setData(res.data.data || []);
    } catch (err) {
      setError('Failed to load progress data.');
    } finally {
      setLoading(false);
    }
  };

  const latestScore = data.length > 0 ? data[data.length - 1].overallScore : null;
  const bestScore = data.length > 0 ? Math.max(...data.map(d => d.overallScore)) : null;
  const avgScore = data.length > 0
    ? (data.reduce((sum, d) => sum + d.overallScore, 0) / data.length).toFixed(1)
    : null;

  const trend = data.length >= 2
    ? data[data.length - 1].overallScore - data[data.length - 2].overallScore
    : 0;

  return (
    <div className="page-container">
      <div className="mb-8 animate-fade-in">
        <h1 className="section-title flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-ghost-400" />
          Progress Tracker
        </h1>
        <p className="text-gray-500 mt-1">See how your technique has improved over time or select two sessions below to compare</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading progress data..." />
      ) : error ? (
        <div className="glass-card p-8 text-center">
          <p className="text-danger-400">{error}</p>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {/* Stats Row */}
          {data.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-ghost-500/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-ghost-400" />
                </div>
                <p className="text-2xl font-display font-bold text-white">{data.length}</p>
                <p className="text-xs text-gray-500">Total Sessions</p>
              </div>

              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-brand-400" />
                </div>
                <p className="text-2xl font-display font-bold text-white">
                  {avgScore}<span className="text-sm text-gray-500 font-normal">/10</span>
                </p>
                <p className="text-xs text-gray-500">Average Score</p>
              </div>

              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center mb-3">
                  <Trophy className="w-5 h-5 text-success-400" />
                </div>
                <p className="text-2xl font-display font-bold text-white">
                  {bestScore}<span className="text-sm text-gray-500 font-normal">/10</span>
                </p>
                <p className="text-xs text-gray-500">Best Score</p>
              </div>

              <div className="glass-card p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  trend > 0 ? 'bg-success-500/10' : trend < 0 ? 'bg-danger-500/10' : 'bg-gray-500/10'
                }`}>
                  <Zap className={`w-5 h-5 ${
                    trend > 0 ? 'text-success-400' : trend < 0 ? 'text-danger-400' : 'text-gray-400'
                  }`} />
                </div>
                <p className={`text-2xl font-display font-bold ${
                  trend > 0 ? 'text-success-400' : trend < 0 ? 'text-danger-400' : 'text-gray-400'
                }`}>
                  {trend > 0 ? '+' : ''}{trend}
                </p>
                <p className="text-xs text-gray-500">Last Trend</p>
              </div>
            </div>
          )}

          {/* Chart */}
          <div>
            <h2 className="text-lg font-display font-semibold text-white mb-4">Score Over Time</h2>
            <ProgressChart data={data} />
          </div>

          {/* Score breakdown table */}
          {data.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-gray-800/50 flex justify-between items-center">
                <h3 className="font-display font-semibold text-white">Session History</h3>
                <span className="text-xs text-gray-400">Select 2 sessions to compare</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800/50">
                      <th className="text-left p-3 text-gray-500 font-medium w-16 text-center">Compare</th>
                      <th className="text-left p-3 text-gray-500 font-medium">#</th>
                      <th className="text-left p-3 text-gray-500 font-medium">Date</th>
                      <th className="text-left p-3 text-gray-500 font-medium">Score</th>
                      <th className="text-left p-3 text-gray-500 font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, i) => {
                      const change = i > 0 ? item.overallScore - data[i - 1].overallScore : 0;
                      const isSelected = selectedSessions.includes(item.id);
                      return (
                        <tr key={i} className={`border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors ${isSelected ? 'bg-ghost-500/10' : ''}`}>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (selectedSessions.length >= 2) {
                                    setSelectedSessions([selectedSessions[1], item.id]);
                                  } else {
                                    setSelectedSessions([...selectedSessions, item.id]);
                                  }
                                } else {
                                  setSelectedSessions(selectedSessions.filter(id => id !== item.id));
                                }
                              }}
                              className="w-4 h-4 rounded bg-gray-900 border-gray-800 text-ghost-500 focus:ring-ghost-500 focus:ring-offset-gray-950 focus:ring-2 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 text-gray-500">{i + 1}</td>
                          <td className="p-3 text-gray-300">
                            {new Date(item.sessionDate).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </td>
                          <td className="p-3">
                            <span className={`font-bold ${
                              item.overallScore >= 7 ? 'text-success-400' :
                              item.overallScore >= 4 ? 'text-warning-400' : 'text-danger-400'
                            }`}>
                              {item.overallScore}/10
                            </span>
                          </td>
                          <td className="p-3">
                            {i === 0 ? (
                              <span className="text-gray-600">—</span>
                            ) : (
                              <span className={`font-semibold ${
                                change > 0 ? 'text-success-400' : change < 0 ? 'text-danger-400' : 'text-gray-500'
                              }`}>
                                {change > 0 ? '↑' : change < 0 ? '↓' : '='} {Math.abs(change)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Floating Action Banner */}
          {selectedSessions.length === 2 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
              <div className="glass-card shadow-2xl px-6 py-4 flex items-center gap-6 border border-ghost-500/30 bg-gray-950/90 backdrop-blur-md rounded-2xl">
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Compare Sessions Selected</p>
                  <p className="text-xs text-gray-400">Ready to compare side-by-side progression</p>
                </div>
                <Link
                  to={`/compare?id1=${selectedSessions[0]}&id2=${selectedSessions[1]}`}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all"
                >
                  <GitCompare className="w-4 h-4" /> Compare Stances
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
