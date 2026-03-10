import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Camera, Loader2, CheckCircle2, CreditCard, Trash2, Plus, Wallet, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePic, setProfilePic] = useState(user?.profile_pic || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({ brand: 'Visa', last4: '', type: 'card' });

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payments/methods');
      const data = await res.json();
      setPaymentMethods(data.methods);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleAddPaymentMethod = async () => {
    if (!newCard.last4) return;
    try {
      const res = await fetch('/api/payments/methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCard, is_default: paymentMethods.length === 0 })
      });
      if (res.ok) {
        fetchPaymentMethods();
        setIsAddingCard(false);
        setNewCard({ brand: 'Visa', last4: '', type: 'card' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      const res = await fetch(`/api/payments/methods/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPaymentMethods();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, profile_pic: profilePic })
      });
      if (res.ok) {
        await refreshUser();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-medium tracking-tight">Profile Settings</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-sm border border-black/5 p-10"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 bg-zinc-100 rounded-full border-4 border-white shadow-sm overflow-hidden flex items-center justify-center">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-zinc-300" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center border-4 border-white hover:scale-110 transition-transform cursor-pointer">
                <Camera size={18} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest mt-4">Profile Picture</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white rounded-2xl font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              aria-label="Save profile changes"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : success ? <CheckCircle2 size={20} /> : 'Save Changes'}
              {success ? 'Saved Successfully' : ''}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[32px] shadow-sm border border-black/5 p-10 mt-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-medium tracking-tight">Payment Methods</h2>
            <p className="text-zinc-500 text-xs mt-1">Manage your cards and digital wallets</p>
          </div>
          <button 
            onClick={() => setIsAddingCard(true)}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-all"
            aria-label="Add new payment method"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-black/5">
                  {method.type === 'card' ? <CreditCard size={20} className="text-zinc-400" /> : <Wallet size={20} className="text-zinc-400" />}
                </div>
                <div>
                  <p className="text-sm font-bold">{method.brand} •••• {method.last4}</p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
                    {method.is_default ? 'Default Method' : 'Secondary Method'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleDeletePaymentMethod(method.id)}
                className="p-2 text-zinc-300 hover:text-rose-500 transition-colors"
                aria-label={`Delete payment method ending in ${method.last4}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {paymentMethods.length === 0 && !isAddingCard && (
            <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <CreditCard size={32} className="mx-auto text-zinc-200 mb-2" />
              <p className="text-zinc-400 text-sm">No payment methods added yet.</p>
            </div>
          )}

          <AnimatePresence>
            {isAddingCard && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-zinc-900 rounded-3xl text-white space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold">Add New Card</h3>
                    <button onClick={() => setIsAddingCard(false)} className="text-zinc-500 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Brand</label>
                      <select 
                        value={newCard.brand}
                        onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })}
                        className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none"
                        aria-label="Card brand"
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="Amex">Amex</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Last 4 Digits</label>
                      <input 
                        type="text"
                        maxLength={4}
                        placeholder="1234"
                        value={newCard.last4}
                        onChange={(e) => setNewCard({ ...newCard, last4: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none"
                        aria-label="Last 4 digits of card"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleAddPaymentMethod}
                    className="w-full py-4 bg-white text-black rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-all"
                  >
                    Save Payment Method
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
