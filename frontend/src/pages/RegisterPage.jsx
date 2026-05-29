import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import { Ghost, User, Mail, Lock, Eye, EyeOff, ArrowRight, Dumbbell, Target, Award } from 'lucide-react';

const SPORTS = ['CRICKET', 'FOOTBALL', 'BASKETBALL', 'BADMINTON'];
const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const SPORT_POSITIONS = {
  CRICKET: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'],
  FOOTBALL: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
  BASKETBALL: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  BADMINTON: ['Singles Player', 'Doubles Player'],
};

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    sport: '', positionRole: '', experienceLevel: '', age: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'sport') updated.positionRole = '';
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);
    try {
      const payload = { ...form, age: parseInt(form.age, 10) };
      const res = await registerUser(payload);
      const { token, user } = res.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.data && typeof data.data === 'object') {
        setErrors(data.data);
      } else {
        const msg = data?.message || 'Registration failed. Please try again.';
        if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('already exists')) {
          setErrors({ email: msg });
        } else {
          setError(msg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const positions = SPORT_POSITIONS[form.sport] || [];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ghost-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ghost-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto shadow-2xl shadow-ghost-500/30 mb-4">
            <Ghost className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text">Join Ghost Coach</h1>
          <p className="text-gray-500 mt-2">Create your athlete profile</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="reg-name" className="label-text">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input id="reg-name" name="fullName" value={form.fullName} onChange={handleChange}
                className="input-field pl-10" placeholder="John Doe" required />
            </div>
            {errors.fullName && <p className="text-danger-400 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="label-text">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange}
                className="input-field pl-10" placeholder="you@example.com" required />
            </div>
            {errors.email && <p className="text-danger-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="label-text">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                className="input-field pl-10 pr-10" placeholder="Min 8 characters" required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-danger-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Sport + Experience Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-sport" className="label-text flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5" /> Sport
              </label>
              <select id="reg-sport" name="sport" value={form.sport} onChange={handleChange}
                className="input-field" required>
                <option value="">Select sport</option>
                {SPORTS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                ))}
              </select>
              {errors.sport && <p className="text-danger-400 text-xs mt-1">{errors.sport}</p>}
            </div>
            <div>
              <label htmlFor="reg-level" className="label-text flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Level
              </label>
              <select id="reg-level" name="experienceLevel" value={form.experienceLevel}
                onChange={handleChange} className="input-field" required>
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
                ))}
              </select>
              {errors.experienceLevel && <p className="text-danger-400 text-xs mt-1">{errors.experienceLevel}</p>}
            </div>
          </div>

          {/* Position + Age Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-position" className="label-text flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Position
              </label>
              {positions.length > 0 ? (
                <select id="reg-position" name="positionRole" value={form.positionRole}
                  onChange={handleChange} className="input-field" required>
                  <option value="">Select position</option>
                  {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <input id="reg-position" name="positionRole" value={form.positionRole}
                  onChange={handleChange} className="input-field" placeholder="e.g. Batsman" required />
              )}
              {errors.positionRole && <p className="text-danger-400 text-xs mt-1">{errors.positionRole}</p>}
            </div>
            <div>
              <label htmlFor="reg-age" className="label-text">Age</label>
              <input id="reg-age" name="age" type="number" min={5} max={120} value={form.age}
                onChange={handleChange} className="input-field" placeholder="18" required />
              {errors.age && <p className="text-danger-400 text-xs mt-1">{errors.age}</p>}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Create Account <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-ghost-400 hover:text-ghost-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
