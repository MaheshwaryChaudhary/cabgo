import * as React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import Layout from './Layout';
import DriverDashboard from './DriverDashboard';
import RideRequest from './RideRequest';
import RideHistory from './RideHistory';
import PaymentFlow from './PaymentFlow';
import RatingForm from './RatingForm';
import Map from './Map';
import { motion, AnimatePresence } from 'motion/react';
import { Car, MapPin, CheckCircle2, Moon, Sun, Gift, MessageSquare, Send, Megaphone, Info, History, LayoutDashboard, Star } from 'lucide-react';
import { DEFAULT_PROFILE_PIC } from '../constants';

import { requestNotificationPermission, sendNotification } from '../utils/notifications';

export default function Dashboard() {
  const { user } = useAuth();
  const { messages } = useSocket(user?.id);
  const [rideStatus, setRideStatus] = React.useState<'idle' | 'requesting' | 'accepted' | 'in_progress' | 'payment' | 'rating'>('idle');
  const [activeRide, setActiveRide] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'history' | 'favorites'>('dashboard');
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [driverInfo, setDriverInfo] = React.useState<any>(null);
  const [driverLocation, setDriverLocation] = React.useState<{ lat: number, lng: number } | null>(null);
  const [eta, setEta] = React.useState<number | null>(null);
  const [darkMode, setDarkMode] = React.useState(false);
  const [feedback, setFeedback] = React.useState({ name: '', email: '', message: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);
  const [favorites, setFavorites] = React.useState<any[]>([]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/drivers/favorites');
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (driverId: string, isFavorite: boolean) => {
    try {
      await fetch('/api/drivers/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, isFavorite })
      });
      fetchFavorites();
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    // Sync feedback with user data if available
    if (user) {
      setFeedback(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    // Mock submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Thank you for your feedback!');
    setFeedback(prev => ({ ...prev, message: '' }));
    setIsSubmittingFeedback(false);
  };

  React.useEffect(() => {
    requestNotificationPermission();
  }, []);

  React.useEffect(() => {
    const acceptedMsg = messages.find(m => m.type === 'RIDE_ACCEPTED');
    if (acceptedMsg) {
      setRideStatus('accepted');
      sendNotification('Ride Accepted', { body: 'Your driver is on the way!' });
      // Fetch driver info
      fetch(`/api/driver/info/${acceptedMsg.driverId}`)
        .then(res => res.json())
        .then(data => setDriverInfo(data));
    }

    const startedMsg = messages.find(m => m.type === 'RIDE_STARTED');
    if (startedMsg) {
      setRideStatus('in_progress');
      sendNotification('Ride Started', { body: 'Your trip has begun.' });
    }

    const completedMsg = messages.find(m => m.type === 'RIDE_COMPLETED');
    if (completedMsg) {
      setRideStatus('payment');
      sendNotification('Ride Completed', { body: 'Please complete the payment.' });
    }

    const arrivedMsg = messages.find(m => m.type === 'DRIVER_ARRIVED');
    if (arrivedMsg) {
      sendNotification('Driver Arrived', { body: 'Your driver has arrived at the pickup location!' });
    }

    const locationMsg = messages.find(m => m.type === 'DRIVER_LOCATION_UPDATE');
    if (locationMsg && driverInfo && locationMsg.driverId === driverInfo.id) {
      setDriverLocation({ lat: locationMsg.lat, lng: locationMsg.lng });
      
      // Calculate ETA
      if (activeRide) {
        const targetLat = rideStatus === 'accepted' ? activeRide.pickup_lat : activeRide.dropoff_lat;
        const targetLng = rideStatus === 'accepted' ? activeRide.pickup_lng : activeRide.dropoff_lng;
        const dist = Math.sqrt(Math.pow(targetLat - locationMsg.lat, 2) + Math.pow(targetLng - locationMsg.lng, 2)) * 111;
        setEta(Math.ceil((dist / 50) * 60));
      }
    }
  }, [messages, driverInfo, activeRide, rideStatus]);

  const handleRideRequest = async (details: any) => {
    setRideStatus('requesting');
    const res = await fetch('/api/rides/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    });
    const data = await res.json();
    setActiveRide({ ...details, id: data.rideId });
  };

  const handleCancelRequest = async () => {
    if (!activeRide) return;
    try {
      const res = await fetch('/api/rides/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: activeRide.id })
      });
      if (res.ok) {
        setRideStatus('idle');
        setActiveRide(null);
        setShowCancelConfirm(false);
      }
    } catch (err) {
      console.error('Cancel ride error:', err);
    }
  };

  if (user?.role === 'driver') {
    return (
      <Layout>
        <div className={`space-y-8 p-8 -m-8 transition-colors duration-300 ${darkMode ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-800'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-medium tracking-tight">Driver Dashboard</h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-zinc-800 text-amber-400' : 'bg-white text-zinc-400 border border-zinc-200'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Online
              </div>
            </div>
          </div>
          <DriverDashboard messages={messages} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`transition-colors duration-300 min-h-[calc(100vh-160px)] p-8 -m-8 ${darkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-800'}`}>
        {/* Promotional Banner */}
        <div className="mb-8 overflow-hidden rounded-[32px] bg-gradient-to-r from-[#ff9800] to-orange-600 p-6 text-white shadow-lg shadow-orange-500/20 relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Megaphone size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Special Weekend Offer!</h2>
                <p className="text-white/80 text-sm">Get 20% off on all luxury rides this weekend. Use code: <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">WEEKEND20</span></p>
              </div>
            </div>
            <button className="bg-white text-orange-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors">Claim Now</button>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-medium tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full mr-4">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'history' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}
              >
                <History size={16} />
                History
              </button>
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'favorites' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}
              >
                <Star size={16} />
                Favorites
              </button>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${darkMode ? 'bg-zinc-800 text-amber-400' : 'bg-white text-zinc-500 border border-zinc-200'}`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {activeTab === 'history' && <RideHistory initialView="history" />}
        {activeTab === 'favorites' && <RideHistory initialView="favorites" />}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-8 h-full overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="wait">
                {rideStatus === 'idle' && (
                  <motion.div
                    key="request"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <RideRequest onRequest={handleRideRequest} />
                  </motion.div>
                )}
                
                {rideStatus === 'requesting' && (
                  <motion.div
                    key="requesting"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'} rounded-[32px] shadow-sm border p-10 flex flex-col items-center justify-center text-center`}
                  >
                    <div className="relative mb-8">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center ${darkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                        <Car size={40} className={darkMode ? 'text-zinc-600' : 'text-zinc-200'} />
                      </div>
                      <div className={`absolute inset-0 border-4 rounded-full animate-spin ${darkMode ? 'border-amber-400 border-t-transparent' : 'border-black border-t-transparent'}`} />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Finding your ride</h3>
                    <p className="text-zinc-500 text-sm">We're matching you with the nearest driver...</p>
                    
                    <div className="mt-10 w-full space-y-4">
                      <div className={`flex items-center gap-3 p-4 rounded-2xl border text-left ${darkMode ? 'bg-zinc-800/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                        <MapPin size={18} className="text-emerald-500" />
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Pickup</p>
                          <p className="text-sm font-medium truncate max-w-[200px]">{activeRide?.pickup_address}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full py-4 text-rose-500 font-medium text-sm hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        Cancel Request
                      </button>
                    </div>

                    <AnimatePresence>
                      {showCancelConfirm && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`absolute inset-0 backdrop-blur-sm rounded-[32px] p-10 flex flex-col items-center justify-center z-10 ${darkMode ? 'bg-zinc-900/95' : 'bg-white/95'}`}
                        >
                          <h3 className="text-xl font-medium mb-2">Cancel Request?</h3>
                          <p className="text-zinc-500 text-sm mb-8">Are you sure you want to cancel your ride request?</p>
                          <div className="flex gap-3 w-full">
                            <button 
                              onClick={handleCancelRequest}
                              className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-medium hover:bg-rose-600 transition-all"
                            >
                              Yes, Cancel
                            </button>
                            <button 
                              onClick={() => setShowCancelConfirm(false)}
                              className={`flex-1 py-4 rounded-2xl font-medium transition-all ${darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-100 text-black hover:bg-zinc-200'}`}
                            >
                              Keep Waiting
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {rideStatus === 'accepted' && (
                  <motion.div
                    key="accepted"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'} rounded-[32px] shadow-sm border p-8`}
                  >
                    <div className="flex items-center gap-3 mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                      <CheckCircle2 size={20} />
                      <p className="text-sm font-medium">Driver is on the way!</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-black/5'}`}>
                            <img src={driverInfo?.image || DEFAULT_PROFILE_PIC} alt="Driver" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{driverInfo?.name || "Michael Chen"}</h3>
                            <div className="flex items-center gap-1 text-zinc-500 text-sm">
                              <span>{driverInfo?.car || "Toyota Camry"}</span>
                              <span className="mx-1">•</span>
                              <span className="font-mono">{driverInfo?.rating || "4.9"} ★</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleToggleFavorite(driverInfo?.id, !favorites.some(f => f.id === driverInfo?.id))}
                          className={`p-3 rounded-2xl border transition-all ${
                            favorites.some(f => f.id === driverInfo?.id) 
                            ? 'bg-rose-50 border-rose-100 text-rose-500' 
                            : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-rose-500'
                          }`}
                        >
                          <Star size={20} fill={favorites.some(f => f.id === driverInfo?.id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className={`space-y-4 pt-4 border-t ${darkMode ? 'border-zinc-800' : 'border-black/5'}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500 text-sm">Estimated Arrival</span>
                          <span className="font-medium">{eta !== null ? `${eta} mins` : 'Calculating...'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500 text-sm">Ride Fare</span>
                          <span className="font-mono font-medium">${activeRide?.fare?.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button className={`flex-1 py-4 rounded-2xl font-medium transition-all ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
                          Message
                        </button>
                        <button 
                          onClick={() => setShowCancelConfirm(true)}
                          className={`flex-1 py-4 rounded-2xl font-medium transition-all ${darkMode ? 'bg-zinc-800 text-rose-400 hover:bg-zinc-700' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showCancelConfirm && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`absolute inset-0 backdrop-blur-sm rounded-[32px] p-10 flex flex-col items-center justify-center z-10 ${darkMode ? 'bg-zinc-900/95' : 'bg-white/95'}`}
                        >
                          <h3 className="text-xl font-medium mb-2">Cancel Ride?</h3>
                          <p className="text-zinc-500 text-sm mb-8">A cancellation fee may apply if you cancel now.</p>
                          <div className="flex gap-3 w-full">
                            <button 
                              onClick={handleCancelRequest}
                              className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-medium hover:bg-rose-600 transition-all"
                            >
                              Yes, Cancel
                            </button>
                            <button 
                              onClick={() => setShowCancelConfirm(false)}
                              className={`flex-1 py-4 rounded-2xl font-medium transition-all ${darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-100 text-black hover:bg-zinc-200'}`}
                            >
                              Keep Ride
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {rideStatus === 'in_progress' && (
                  <motion.div
                    key="in_progress"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'} rounded-[32px] shadow-sm border p-8`}
                  >
                    <div className="flex items-center gap-3 mb-8 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
                      <Car size={20} className="animate-pulse" />
                      <p className="text-sm font-medium">Trip in progress...</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-black/5'}`}>
                          <img src={driverInfo?.image || DEFAULT_PROFILE_PIC} alt="Driver" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{driverInfo?.name || "Michael Chen"}</h3>
                          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{driverInfo?.car || "Toyota Camry"}</p>
                        </div>
                      </div>

                      <div className={`space-y-4 pt-4 border-t ${darkMode ? 'border-zinc-800' : 'border-black/5'}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500 text-xs uppercase tracking-widest font-mono">Destination</span>
                          <span className="font-medium text-sm truncate max-w-[150px]">{activeRide?.dropoff_address}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500 text-xs uppercase tracking-widest font-mono">ETA to Dropoff</span>
                          <span className="font-medium text-sm">{eta !== null ? `${eta} mins` : 'Calculating...'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {rideStatus === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <PaymentFlow 
                      rideId={activeRide.id} 
                      amount={activeRide.fare} 
                      onPaid={() => {
                        setRideStatus('rating');
                        sendNotification('Payment Successful', { body: 'Thank you for your payment!' });
                      }} 
                    />
                  </motion.div>
                )}

                {rideStatus === 'rating' && (
                  <motion.div
                    key="rating"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <RatingForm 
                      rideId={activeRide.id} 
                      onComplete={() => {
                        setRideStatus('idle');
                        setActiveRide(null);
                        setActiveTab('history');
                      }} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>

            {/* Referral Program Section */}
            <div className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'} rounded-[32px] shadow-sm border p-8`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Gift size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Refer & Earn</h3>
                  <p className="text-xs text-zinc-500">Share the love, get rewards!</p>
                </div>
              </div>
              <div className={`p-4 rounded-2xl border border-dashed mb-6 ${darkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-2">Your Referral Code</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black tracking-widest font-mono">CABGO-50OFF</span>
                  <button className="text-[#ff9800] text-xs font-bold hover:underline">Copy Code</button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={12} />
                  </div>
                  <p className="text-xs text-zinc-500"><span className="font-bold text-zinc-700 dark:text-zinc-300">Friends get $10 off</span> their first ride using your code.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={12} />
                  </div>
                  <p className="text-xs text-zinc-500"><span className="font-bold text-zinc-700 dark:text-zinc-300">You get $5 credit</span> for every successful referral.</p>
                </div>
              </div>
            </div>

            {/* Feedback Form Section */}
            <div className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'} rounded-[32px] shadow-sm border p-8`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Feedback</h3>
                  <p className="text-xs text-zinc-500">Help us improve your experience</p>
                </div>
              </div>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={feedback.name}
                    onChange={e => setFeedback(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#ff9800]/20 transition-all ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-800'}`}
                    required
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    value={feedback.email}
                    onChange={e => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#ff9800]/20 transition-all ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-800'}`}
                    required
                  />
                </div>
                <div>
                  <textarea 
                    placeholder="Tell us what you think..." 
                    rows={3}
                    value={feedback.message}
                    onChange={e => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#ff9800]/20 transition-all resize-none ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-800'}`}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full py-3 bg-[#ff9800] text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingFeedback ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 h-full min-h-[500px]">
            <div className="h-full rounded-[32px] overflow-hidden border border-black/5 shadow-sm relative">
              <Map 
                pickup={activeRide ? { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng } : undefined}
                dropoff={rideStatus === 'in_progress' ? { lat: activeRide.dropoff_lat, lng: activeRide.dropoff_lng } : undefined}
                driverLocation={driverLocation || undefined}
                showRoute={rideStatus === 'in_progress' || rideStatus === 'accepted'}
              />
              {/* Map Overlay Info */}
              <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
                <div className={`px-4 py-2 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-2 pointer-events-auto ${darkMode ? 'bg-zinc-900/80 border-zinc-800 text-white' : 'bg-white/80 border-white/20 text-zinc-800'}`}>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-wider">Live Traffic Active</span>
                </div>
                <button className={`p-2 rounded-full backdrop-blur-md border shadow-lg pointer-events-auto transition-all hover:scale-110 ${darkMode ? 'bg-zinc-900/80 border-zinc-800 text-white' : 'bg-white/80 border-white/20 text-zinc-800'}`}>
                  <Info size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}
