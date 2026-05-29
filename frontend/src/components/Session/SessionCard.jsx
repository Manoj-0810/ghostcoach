import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, Eye, Trash2 } from 'lucide-react';
import { deleteSession } from '../../services/api';

function getScoreBg(score) {
  if (score >= 7) return 'from-success-500/20 to-success-600/5 border-success-500/20';
  if (score >= 4) return 'from-warning-500/20 to-warning-600/5 border-warning-500/20';
  return 'from-danger-500/20 to-danger-600/5 border-danger-500/20';
}

function getScoreText(score) {
  if (score >= 7) return 'text-success-400';
  if (score >= 4) return 'text-warning-400';
  return 'text-danger-400';
}

export default function SessionCard({ session }) {
  const date = new Date(session.uploadedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this analysis? This action is permanent and cannot be undone.")) {
      try {
        await deleteSession(session.id);
        window.dispatchEvent(new CustomEvent('session-deleted', { detail: { id: session.id } }));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete session.');
      }
    }
  };

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="glass-card-hover p-5 block group"
    >
      <div className="flex items-start gap-4">
        {/* Image thumbnail */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
          <img
            src={session.imageUrl}
            alt="Session"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-2xl font-display font-bold ${getScoreText(session.overallScore)}`}>
              {session.overallScore}/10
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border 
                ${session.confidenceLevel === 'HIGH' ? 'text-success-400 border-success-500/30' :
                  session.confidenceLevel === 'MEDIUM' ? 'text-warning-400 border-warning-500/30' :
                  'text-danger-400 border-danger-500/30'}`}>
                {session.confidenceLevel}
              </span>
              <button
                onClick={handleDelete}
                className="p-1 rounded-lg text-gray-500 hover:text-danger-400 hover:bg-danger-500/10 transition-colors z-20 cursor-pointer"
                title="Delete analysis"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-400 truncate mb-2">{session.priorityFix}</p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {date}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {session.strengths?.length || 0} strengths
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-ghost-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <Eye className="w-3 h-3" /> View full analysis
      </div>
    </Link>
  );
}
