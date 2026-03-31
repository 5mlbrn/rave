import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiMusic } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    if (isLogin) {
      const result = login(form.email, form.password);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`);
        navigate('/');
      } else {
        toast.error(result.error);
      }
    } else {
      if (!form.name.trim()) {
        toast.error('Please enter your name');
        setLoading(false);
        return;
      }
      if (!form.email.includes('@')) {
        toast.error('Please enter a valid email');
        setLoading(false);
        return;
      }
      if (form.password.length < 4) {
        toast.error('Password must be at least 4 characters');
        setLoading(false);
        return;
      }
      const result = signup(form.name, form.email, form.password);
      if (result.success) {
        toast.success(`Welcome to Yve, ${result.user.name}!`);
        navigate('/');
      } else {
        toast.error(result.error);
      }
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <motion.div
      className="page auth-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="auth-container">
        {/* Left: Branding */}
        <motion.div
          className="auth-branding"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <FiMusic />
            </div>
            <span className="auth-logo-text">Yve</span>
          </div>
          <h1 className="auth-headline">
            Your music,<br />
            <span className="text-pink">your way.</span>
          </h1>
          <p className="auth-tagline">
            Discover millions of songs, create playlists, and enjoy
            a premium listening experience — completely free.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-dot" />
              <span>Stream millions of tracks</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-dot" />
              <span>Create unlimited playlists</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-dot" />
              <span>Personalized recommendations</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-dot" />
              <span>Beautiful, ad-free experience</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          className="auth-form-wrapper"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="auth-card glass-strong">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, rotateY: -10 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="auth-card-title">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="auth-card-subtitle">
                  {isLogin
                    ? 'Sign in to continue your music journey'
                    : 'Join Yve and start listening today'}
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <motion.div
                      className="auth-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <FiUser className="auth-field-icon" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full name"
                        value={form.name}
                        onChange={handleChange}
                        className="auth-input"
                        id="auth-name"
                        autoComplete="name"
                      />
                    </motion.div>
                  )}

                  <div className="auth-field">
                    <FiMail className="auth-field-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={handleChange}
                      className="auth-input"
                      id="auth-email"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <FiLock className="auth-field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      className="auth-input"
                      id="auth-password"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  {isLogin && (
                    <div className="auth-forgot">
                      <button type="button" className="auth-forgot-btn">Forgot password?</button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`btn btn-primary auth-submit ${loading ? 'loading' : ''}`}
                    disabled={loading}
                    id="auth-submit"
                  >
                    {loading ? (
                      <div className="auth-spinner" />
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </form>

                <div className="auth-divider">
                  <span>or</span>
                </div>

                <button className="btn btn-secondary auth-guest-btn" onClick={() => navigate('/')}>
                  Continue as Guest
                </button>
              </motion.div>
            </AnimatePresence>

            <div className="auth-toggle">
              <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
              <button className="auth-toggle-btn" onClick={toggleMode}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative bg elements */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />
    </motion.div>
  );
}
