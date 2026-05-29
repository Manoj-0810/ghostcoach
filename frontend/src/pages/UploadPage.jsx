import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUpload } from '../context/UploadContext';
import { uploadSession } from '../services/api';
import FeedbackCard from '../components/Session/FeedbackCard';
import { Upload, Image, X, Ghost, Loader2, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const {
    file,
    setFile,
    preview,
    setPreview,
    loading,
    setLoading,
    error,
    setError,
    result,
    setResult,
    dragActive,
    setDragActive,
    resetUploadState,
    executeUpload,
    cancelUpload
  } = useUpload();

  const handleFile = (selectedFile) => {
    setError('');
    setResult(null);

    if (!selectedFile) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await executeUpload(file);
    } catch (err) {
      // Handled in context
    }
  };

  const sportHints = {
    CRICKET: 'Upload a photo of your batting stance, bowling action, or fielding position',
    FOOTBALL: 'Upload a photo of your shooting stance, dribbling posture, or defensive position',
    BASKETBALL: 'Upload a photo of your shooting form, defensive stance, or dribbling posture',
    BADMINTON: 'Upload a photo of your serve stance, smash form, or ready position',
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="section-title">Analyze Your Stance</h1>
        <p className="text-gray-500 mt-1">
          {sportHints[user?.sport] || 'Upload a photo of your sports stance for AI analysis'}
        </p>
      </div>

      {!result ? (
        <div className="animate-slide-up">
          {/* Drop Zone */}
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-ghost-500/50 bg-ghost-500/5 scale-[1.01]'
                  : 'hover:border-gray-700 hover:bg-gray-900/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />
              <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${
                dragActive ? 'bg-ghost-500/20' : 'bg-gray-800/60'
              }`}>
                <Image className={`w-8 h-8 ${dragActive ? 'text-ghost-400' : 'text-gray-500'}`} />
              </div>
              <p className="text-lg font-display font-semibold text-white mb-1">
                {dragActive ? 'Drop your photo here' : 'Drag & drop your stance photo'}
              </p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <p className="text-xs text-gray-600">JPEG, PNG, WebP, GIF — Max 5MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="glass-card p-4 relative">
                <button
                  onClick={clearFile}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-all z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-[400px] object-contain rounded-xl"
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-400 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing with AI — this may take a few seconds...</span>
                  </>
                ) : (
                  <>
                    <Ghost className="w-5 h-5" /> Analyze with Ghost Coach
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
              {error}
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="mt-6 glass-card p-8 text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 rounded-full border-4 border-gray-800 border-t-ghost-500 animate-spin" />
                <Ghost className="w-8 h-8 text-ghost-400 absolute inset-0 m-auto" />
              </div>
              <p className="text-white font-display font-semibold mb-1">Analyzing your stance...</p>
              <p className="text-gray-500 text-sm">Our AI coach is reviewing your technique</p>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
                <span>🔍 Detecting posture</span>
                <span>📐 Evaluating form</span>
                <span>💡 Generating feedback</span>
              </div>
              <button
                onClick={cancelUpload}
                className="mt-6 px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700 bg-gray-900/40 hover:bg-gray-800/50 rounded-lg transition-all"
              >
                Cancel Analysis
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-slide-up">
          {/* Success Banner */}
          <div className="glass-card p-4 mb-6 flex items-center gap-3 border-success-500/20">
            <CheckCircle className="w-5 h-5 text-success-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Analysis Complete</p>
              <p className="text-xs text-gray-500">Your stance has been analyzed by Ghost Coach</p>
            </div>
            <button
              onClick={() => navigate(`/sessions/${result.id}`)}
              className="ml-auto btn-secondary text-sm py-2"
            >
              Full Details →
            </button>
          </div>

          {/* Feedback */}
          <FeedbackCard session={result} />

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setResult(null); clearFile(); }} className="btn-secondary flex-1">
              Analyze Another
            </button>
            <button onClick={() => navigate(`/sessions/${result.id}`)} className="btn-primary flex-1">
              View Session & Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
