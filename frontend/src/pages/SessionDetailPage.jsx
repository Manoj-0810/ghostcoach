import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSession, deleteSession } from '../services/api';
import FeedbackCard from '../components/Session/FeedbackCard';
import ChatWindow from '../components/Chat/ChatWindow';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { ArrowLeft, Calendar, Image, AlertCircle, Activity, Trash2 } from 'lucide-react';

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this analysis? This action is permanent and cannot be undone.")) {
      try {
        await deleteSession(id);
        // Dispatch session-deleted custom event
        window.dispatchEvent(new CustomEvent('session-deleted', { detail: { id } }));
        // Navigate back to dashboard
        navigate('/dashboard');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete session.');
      }
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      const res = await getSession(id);
      setSession(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load session.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading session..." />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-12 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-danger-400 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Session Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(session.uploadedAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const time = new Date(session.uploadedAt).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="page-container">
      {/* Back Button + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in border-b border-gray-800/40 pb-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{date} at {time}</span>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-danger-400 hover:text-white border border-danger-500/20 hover:border-danger-500 hover:bg-danger-500/10 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image + Annotations Legend */}
        <div className="lg:col-span-1 space-y-4 animate-slide-up">
          {/* Uploaded Image */}
          <div className="glass-card overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Image className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-400">Uploaded Photo</span>
              </div>
              <img
                src={session.imageUrl}
                alt="Session stance"
                className="w-full rounded-xl object-contain max-h-[400px] bg-gray-800/50"
              />
            </div>
          </div>

          {/* Body Annotations Legend */}
          {session.bodyAnnotations && session.bodyAnnotations.length > 0 && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-ghost-400" />
                <span className="text-sm font-medium text-white">Annotation Legend</span>
              </div>
              <div className="space-y-2">
                {session.bodyAnnotations.map((ann, i) => {
                  const importanceColor =
                    ann.importance === 'HIGH' ? 'bg-danger-500 border-danger-400' :
                    ann.importance === 'MEDIUM' ? 'bg-warning-500 border-warning-400' :
                    'bg-gray-500 border-gray-400';
                  return (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-gray-800/30">
                      <div className={`w-6 h-6 rounded-full ${importanceColor} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{ann.label}</p>
                        <p className="text-xs text-gray-400">{ann.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Feedback + Chat */}
        <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <FeedbackCard session={session} />
          <ChatWindow sessionId={session.id} />
        </div>
      </div>
    </div>
  );
}
