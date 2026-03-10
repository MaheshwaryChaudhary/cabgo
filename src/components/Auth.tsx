import * as React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, UserPlus, Car, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<'rider' | 'driver'>('rider');
  const { login, signup } = useAuth();

  const [showForgotModal, setShowForgotModal] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetSent, setResetSent] = React.useState(false);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    // Simulate API call
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSent(false);
      setResetEmail('');
      alert('Password reset link sent to your email!');
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login({ email, password });
    } else {
      const res = await signup({ name, email, password, role });
      if (!res.error) {
        setIsLogin(true);
        alert('Account created successfully! Please sign in with your credentials.');
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-sm border border-black/5 p-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white">
            <Car size={32} />
          </div>
        </div>

        <h1 className="text-3xl font-medium text-center mb-2 tracking-tight">CabGo</h1>
        <p className="text-zinc-500 text-center mb-8 text-sm">Your premium ride-hailing experience</p>

        <div className="flex bg-zinc-100 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${isLogin ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-zinc-800'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${!isLogin ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-zinc-800'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5 ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setRole('rider')}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${role === 'rider' ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                  >
                    Rider
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('driver')}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${role === 'driver' ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                  >
                    Driver
                  </button>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Password</label>
              {isLogin && (
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-black font-mono transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-black text-white rounded-2xl font-medium mt-4 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
          >
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </motion.div>

      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-xl p-10"
            >
              <h2 className="text-2xl font-medium mb-2 tracking-tight">Reset Password</h2>
              <p className="text-zinc-500 text-sm mb-8">Enter your email and we'll send you a reset link.</p>
              
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={resetEmail} 
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-4 bg-zinc-100 text-black rounded-2xl font-medium hover:bg-zinc-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={resetSent}
                    className="flex-1 py-4 bg-black text-white rounded-2xl font-medium hover:bg-zinc-800 transition-all disabled:opacity-50"
                  >
                    {resetSent ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
