import { useState, useEffect } from 'react';
import { getProgress } from '../services/api';
import ProgressChart from '../components/Progress/ProgressChart';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { TrendingUp, Trophy, Target, Zap } from 'lucide-react';

export default function ProgressPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    const handleSessionDeleted = (e) => {
      setData((prev) => prev.filter((s) => s.id !== e.detail.id));
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
        <p className="text-gray-500 mt-1">See how your technique has improved over time</p>
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
              <div className="p-4 border-b border-gray-800/50">
                <h3 className="font-display font-semibold text-white">Session History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800/50">
                      <th className="text-left p-3 text-gray-500 font-medium">#</th>
                      <th className="text-left p-3 text-gray-500 font-medium">Date</th>
                      <th className="text-left p-3 text-gray-500 font-medium">Score</th>
                      <th className="text-left p-3 text-gray-500 font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, i) => {
                      const change = i > 0 ? item.overallScore - data[i - 1].overallScore : 0;
                      return (
                        <tr key={i} className="border-b border-gray-800/30 hover:bg-gray-800/20">
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
        </div>
      )}
    </div>
  );
}
