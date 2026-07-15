import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthSuccess, setLoading, setAuthError } from '../store/authSlice';
import { Heart, Sparkles, Send, KeyRound, Lock, User, Mail, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Login() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('login'); // login, signup
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  // OTP Verification modal state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Forgot password state
  const [forgotFlow, setForgotFlow] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSentForReset, setOtpSentForReset] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setAuthError(null));

    const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = activeTab === 'login' 
      ? { email, password }
      : { username, email, password, inviteCode: inviteCode || undefined };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (activeTab === 'login') {
        dispatch(setAuthSuccess(data));
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FFC1CC', '#FFB8C7', '#FF7693'] });
      } else {
        // Signup completed -> redirect to OTP verification step
        setOtpEmail(email);
        setShowOtpModal(true);
      }
    } catch (err) {
      dispatch(setAuthError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setAuthError(null));

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: otpCode })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      dispatch(setAuthSuccess(data));
      setShowOtpModal(false);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      dispatch(setAuthError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setAuthError(null));

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOtpSentForReset(true);
    } catch (err) {
      dispatch(setAuthError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setAuthError(null));

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: resetOtp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForgotFlow(false);
      setOtpSentForReset(false);
      setActiveTab('login');
      alert('Password reset successful! You can now log in.');
    } catch (err) {
      dispatch(setAuthError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative select-none">
      {/* Floating background clouds */}
      <div className="absolute top-10 left-10 w-24 h-12 bg-white/20 dark:bg-white/5 rounded-full blur-sm animate-pulse-soft" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-20 right-10 w-32 h-16 bg-white/20 dark:bg-white/5 rounded-full blur-sm animate-pulse-soft" style={{ animationDuration: '9s' }} />

      <div className="w-full max-w-md z-10">
        {/* Logo and header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-4 bg-sakura-100 dark:bg-sakura-900/30 rounded-3xl mb-3 shadow-inner">
            🌸
          </div>
          <h1 className="font-kosugi text-3xl font-extrabold text-sakura-600 dark:text-sakura-400">Shinoraa</h1>
          <p className="text-sm text-slate-500 mt-1 font-kosugi">Our Little Sakura World 🌸</p>
        </div>

        {/* Auth card container */}
        <div className="glass-panel p-6 border-pink-200/50 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-2 text-xs text-red-500 font-semibold animate-shake">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {!forgotFlow ? (
            <>
              {/* Tab toggles */}
              <div className="flex bg-pink-100/50 dark:bg-slate-900/40 p-1 rounded-2xl mb-6">
                <button
                  onClick={() => { setActiveTab('login'); dispatch(setAuthError(null)); }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'login'
                      ? 'bg-sakura-500 text-white shadow'
                      : 'text-slate-500 hover:text-sakura-500'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => { setActiveTab('signup'); dispatch(setAuthError(null)); }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'signup'
                      ? 'bg-sakura-500 text-white shadow'
                      : 'text-slate-500 hover:text-sakura-500'
                  }`}
                >
                  Create World
                </button>
              </div>

              {/* Form content */}
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                {activeTab === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <User size={12} /> Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. blossom_couple"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="glass-input"
                      required
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Mail size={12} /> Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. cherry@sakura.world"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Lock size={12} /> Password
                    </label>
                    {activeTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => setForgotFlow(true)}
                        className="text-xs text-sakura-500 hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input"
                    required
                  />
                </div>

                {activeTab === 'signup' && (
                  <div className="flex flex-col gap-1.5 border-t border-pink-100 dark:border-slate-800 pt-3">
                    <label className="text-xs font-bold text-sakura-500 flex items-center gap-1">
                      <KeyRound size={12} /> Partner's Invite Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="SAKURA-XXXXXX"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="glass-input border-sakura-200 dark:border-sakura-900/50"
                    />
                    <span className="text-[10px] text-slate-400">
                      Leave empty to create a new code. Paste code to join an existing partner.
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-sakura mt-2 flex items-center justify-center gap-2 group"
                >
                  <span>{loading ? 'Starting...' : activeTab === 'login' ? 'Welcome Home' : 'Plant Sakura Seed'}</span>
                  <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                </button>
              </form>
            </>
          ) : (
            /* Forgot Password Flow */
            <form onSubmit={!otpSentForReset ? handleForgotPassword : handleResetPassword} className="flex flex-col gap-4">
              <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1">
                🔒 Reset Account Password
              </h3>

              {!otpSentForReset ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Mail size={12} /> Registered Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter account email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => setForgotFlow(false)} className="btn-cozy flex-1">Back</button>
                    <button type="submit" disabled={loading} className="btn-sakura flex-1">Send OTP</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">6-Digit OTP Code</label>
                    <input
                      type="text"
                      placeholder="Code (sent to email)"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      className="glass-input"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="glass-input"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => setOtpSentForReset(false)} className="btn-cozy flex-1">Back</button>
                    <button type="submit" disabled={loading} className="btn-sakura flex-1">Reset Password</button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 w-full max-w-sm border-pink-200 dark:border-slate-800 shadow-2xl relative">
            <h3 className="font-kosugi font-bold text-lg text-sakura-600 dark:text-sakura-400 mb-2 flex items-center gap-1.5">
              🌸 Verify OTP Code
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              We sent a 6-digit verification code to <span className="font-semibold text-slate-700 dark:text-slate-300">{otpEmail}</span>. (Check the terminal console log for local development).
            </p>

            <form onSubmit={handleOtpVerify} className="flex flex-col gap-4">
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-Digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="glass-input text-center text-xl tracking-widest font-mono"
                required
              />
              
              <button
                type="submit"
                disabled={loading}
                className="btn-sakura py-3 rounded-2xl flex items-center justify-center gap-2"
              >
                <span>Verify & Enter 🌸</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
