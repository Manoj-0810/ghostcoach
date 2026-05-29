import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSessions } from '../services/api';
import SessionCard from '../components/Session/SessionCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { Upload, Ghost, TrendingUp, Layers, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    const handleSessionDeleted = (e) => {
      setSessions((prev) => prev.filter((s) => s.id !== e.detail.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    };
    window.addEventListener('session-deleted', handleSessionDeleted);
    return () => window.removeEventListener('session-deleted', handleSessionDeleted);
  }, []);

  const loadSessions = async () => {
    try {
      const res = await getSessions(0, 12);
      const data = res.data.data;
      setSessions(data.sessions || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const avgScore = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + s.overallScore, 0) / sessions.length).toFixed(1)
    : '—';

  const bestScore = sessions.length > 0
    ? Math.max(...sessions.map(s => s.overallScore))
    : '—';

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="section-title">
          Welcome back, <span className="gradient-text">{user?.fullName?.split(' ')[0]}</span>
        </h1>
        <p className="text-gray-500 mt-1">
          {user?.sport} · {user?.positionRole} · {user?.experienceLevel}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <StatCard icon={Layers} label="Total Sessions" value={totalCount} color="ghost" />
        <StatCard icon={TrendingUp} label="Avg Score" value={avgScore} color="brand" suffix="/10" />
        <StatCard icon={Ghost} label="Best Score" value={bestScore} color="success" suffix="/10" />
        <Link to="/upload" className="glass-card-hover p-5 flex flex-col items-center justify-center gap-2 group">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
            New Analysis
          </span>
        </Link>
      </div>

      {/* Sessions Grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold text-white">Recent Sessions</h2>
        {sessions.length > 0 && (
          <Link to="/progress" className="text-sm text-ghost-400 hover:text-ghost-300 transition-colors">
            View progress →
          </Link>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your sessions..." />
      ) : error ? (
        <div className="glass-card p-8 text-center">
          <AlertCircle className="w-10 h-10 text-danger-400 mx-auto mb-3" />
          <p className="text-gray-400">{error}</p>
          <button onClick={loadSessions} className="btn-secondary mt-4 text-sm">
            Try Again
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Ghost className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold text-white mb-2">No sessions yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Upload your first stance photo to get AI-powered coaching feedback on your technique.
          </p>
          <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload First Photo
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, suffix = '' }) {
  const colorMap = {
    ghost: 'text-ghost-400 bg-ghost-500/10',
    brand: 'text-brand-400 bg-brand-500/10',
    success: 'text-success-400 bg-success-500/10',
  };
  const style = colorMap[color] || colorMap.ghost;

  return (
    <div className="glass-card p-5">
      <div className={`w-10 h-10 rounded-xl ${style} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-display font-bold text-white">
        {value}<span className="text-sm text-gray-500 font-normal">{suffix}</span>
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
