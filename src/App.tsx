import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Map from './components/Map';
import RideRequest from './components/RideRequest';
import DriverDashboard from './components/DriverDashboard';
import PaymentFlow from './components/PaymentFlow';
import RatingForm from './components/RatingForm';
import RideHistory from './components/RideHistory';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import ContentPage from './components/ContentPage';
import { motion, AnimatePresence } from 'motion/react';
import { Car, MapPin, Loader2, CheckCircle2, AlertTriangle, Star, Share2 } from 'lucide-react';

import { CurrencyProvider, useCurrency } from './contexts/CurrencyContext';
import ShareRide from './components/ShareRide';

import { DEFAULT_PROFILE_PIC } from './constants';

function Dashboard({ initialView = 'home', prefilledSearch: initialPrefilledSearch }: { initialView?: 'dashboard' | 'history' | 'profile' | 'home' | 'favorites', prefilledSearch?: any }) {
  const { user } = useAuth();
  const { messages } = useSocket(user?.id);
  const { formatPrice } = useCurrency();
  const [rideStatus, setRideStatus] = useState<'idle' | 'requesting' | 'accepted' | 'completed' | 'paid'>('idle');
  const [activeRide, setActiveRide] = useState<any>(null);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [view, setView] = useState<'dashboard' | 'history' | 'profile' | 'home' | 'favorites'>(initialView);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRequestConfirmation, setShowRequestConfirmation] = useState(false);
  const [driverCancelled, setDriverCancelled] = useState<{ reason: string } | null>(null);
  const [prefilledSearch, setPrefilledSearch] = useState(initialPrefilledSearch);
  const [rideType, setRideType] = useState(initialPrefilledSearch?.carType?.toLowerCase() || 'standard');
  const [favorites, setFavorites] = useState<any[]>([]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/drivers/favorites');
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchNearbyDrivers();
    const interval = setInterval(fetchNearbyDrivers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNearbyDrivers = async () => {
    try {
      const res = await fetch('/api/drivers/nearby');
      const data = await res.json();
      setNearbyDrivers(data.drivers || []);
    } catch (e) {
      console.error('Failed to fetch nearby drivers:', e);
    }
  };

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

  const handleLandingSearch = (data?: any) => {
    if (data) {
      setPrefilledSearch(data);
      if (data.carType) setRideType(data.carType.toLowerCase());
    }
    setView('dashboard');
  };

  // Helper to calculate ETA based on distance
  const calculateETA = (driverLoc: { lat: number, lng: number }, pickupLoc: { lat: number, lng: number }) => {
    const dist = Math.sqrt(Math.pow(driverLoc.lat - pickupLoc.lat, 2) + Math.pow(driverLoc.lng - pickupLoc.lng, 2));
    const mins = Math.max(1, Math.round(dist * 500)); 
    return mins;
  };

  useEffect(() => {
    const acceptedMsg = messages.find(m => m.type === 'RIDE_ACCEPTED');
    if (acceptedMsg && rideStatus === 'requesting') {
      setRideStatus('accepted');
      const initialLoc = { lat: 37.7760, lng: -122.4180 };
      setDriverLocation(initialLoc);
      
      if (activeRide) {
        setEta(calculateETA(initialLoc, { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng }));
      } else {
        setEta(5);
      }

      // Fetch driver info
      fetch(`/api/driver/info/${acceptedMsg.driverId}`).then(res => res.json()).then(data => {
        if (data.error) throw new Error(data.error);
        setDriverInfo({
          name: data.name,
          car: data.car || "Toyota Camry",
          rating: data.rating || 4.9,
          image: data.image || DEFAULT_PROFILE_PIC,
          id: acceptedMsg.driverId
        });
      }).catch(err => {
        console.error('Failed to fetch driver info:', err);
        // Fallback
        setDriverInfo({
          name: "Michael Chen",
          car: "Toyota Camry",
          rating: 4.9,
          image: DEFAULT_PROFILE_PIC,
          id: acceptedMsg.driverId
        });
      });
    }

    const completedMsg = messages.find(m => m.type === 'RIDE_COMPLETED');
    if (completedMsg && rideStatus === 'accepted') {
      setRideStatus('completed');
      setEta(null);
      setDriverLocation(null);
    }

    const driverCancelledMsg = messages.find(m => m.type === 'RIDE_CANCELLED_BY_DRIVER');
    if (driverCancelledMsg && (rideStatus === 'accepted' || rideStatus === 'requesting')) {
      setDriverCancelled({ reason: driverCancelledMsg.reason || 'No reason provided' });
      setRideStatus('idle');
      setActiveRide(null);
      setEta(null);
      setDriverLocation(null);
    }

    // Handle real-time location updates from socket
    const latestLocationMsg = [...messages].reverse().find(m => m.type === 'DRIVER_LOCATION_UPDATE');
    if (latestLocationMsg && rideStatus === 'accepted') {
      const newLoc = { lat: latestLocationMsg.lat, lng: latestLocationMsg.lng };
      setDriverLocation(newLoc);
      if (activeRide) {
        setEta(calculateETA(newLoc, { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng }));
      }
    }
  }, [messages, rideStatus, activeRide]);

  // Simulated movement and ETA refinement
  useEffect(() => {
    if (rideStatus !== 'accepted' || !activeRide) return;
    
    const timer = setInterval(() => {
      // Simulate slight movement towards pickup if no real updates are happening
      setDriverLocation(prev => {
        if (!prev) return prev;
        const targetLat = activeRide.pickup_lat;
        const targetLng = activeRide.pickup_lng;
        
        const newLat = prev.lat + (targetLat - prev.lat) * 0.05;
        const newLng = prev.lng + (targetLng - prev.lng) * 0.05;
        
        const newLoc = { lat: newLat, lng: newLng };
        setEta(calculateETA(newLoc, { lat: targetLat, lng: targetLng }));
        
        return newLoc;
      });
    }, 5000); // Update every 5 seconds for smoother visual feedback

    return () => clearInterval(timer);
  }, [rideStatus, activeRide]);

  const handleRideRequest = async (details: any) => {
    setRideStatus('requesting');
    try {
      const res = await fetch('/api/rides/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });
      if (!res.ok) throw new Error('Failed to request ride');
      const data = await res.json();
      setActiveRide({ ...details, id: data.rideId });
      setShowRequestConfirmation(true);
    } catch (err) {
      console.error('Ride request error:', err);
      setRideStatus('idle');
      alert('Failed to request ride. Please try again.');
    }
  };

  const handleCancelRequest = async (reason?: string) => {
    if (!activeRide) return;
    try {
      const res = await fetch('/api/rides/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: activeRide.id, reason })
      });
      if (res.ok) {
        setRideStatus('idle');
        setActiveRide(null);
        setShowCancelConfirm(false);
      } else {
        throw new Error('Failed to cancel ride');
      }
    } catch (err) {
      console.error('Cancel ride error:', err);
      alert('Failed to cancel ride. Please try again.');
    }
  };

  const handleShareRide = () => {
    if (!activeRide) return;
    const shareUrl = `${window.location.origin}/share/${activeRide.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'CabGo Ride Status',
        text: `Track my CabGo ride! ETA: ${eta} mins.`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Shareable link copied to clipboard!');
    }
  };

  if (user?.role === 'driver') {
    return (
      <Layout onNavigate={(v: any) => setView(v)}>
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {view === 'dashboard' ? (
            <DriverDashboard messages={messages} />
          ) : view === 'profile' ? (
            <Profile />
          ) : view === 'history' ? (
            <RideHistory />
          ) : ['about', 'gallery', 'blog', 'packages', 'cars', 'testimonials', 'contact', 'support', 'policy', 'deals', 'terms', 'privacy', 'faq', 'sitemap', 'disclaimer', 'security', 'one-way', 'round-trip', 'local-full-day', 'luxury-rental', 'wedding-rental', 'business-rental', 'bus-hire', 'cancel-booking', 'pay-direct', 'feedback', 'register', 'services'].includes(view) ? (
            <ContentPage type={view as any} />
          ) : (
            <LandingPage onSearch={handleLandingSearch} onBook={handleLandingSearch} />
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout onNavigate={(v: any) => setView(v)}>
      {view === 'history' ? (
        <div className="max-w-7xl mx-auto p-6 md:p-8"><RideHistory initialView="history" /></div>
      ) : view === 'favorites' ? (
        <div className="max-w-7xl mx-auto p-6 md:p-8"><RideHistory initialView="favorites" /></div>
      ) : view === 'profile' ? (
        <div className="max-w-7xl mx-auto p-6 md:p-8"><Profile /></div>
      ) : ['about', 'gallery', 'blog', 'packages', 'cars', 'testimonials', 'contact', 'support', 'policy', 'deals', 'terms', 'privacy', 'faq', 'sitemap', 'disclaimer', 'security', 'one-way', 'round-trip', 'local-full-day', 'luxury-rental', 'wedding-rental', 'business-rental', 'bus-hire', 'cancel-booking', 'pay-direct', 'feedback', 'register', 'services'].includes(view) ? (
        <ContentPage type={view as any} />
      ) : view === 'dashboard' ? (
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]">
            <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2">
              <AnimatePresence mode="wait">
                {rideStatus === 'idle' && (
                  <motion.div
                    key="request"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <RideRequest 
                      onRequest={handleRideRequest} 
                      onTypeSelect={(type) => setRideType(type)}
                      initialData={prefilledSearch ? {
                        pickup: prefilledSearch.location,
                        rideType: prefilledSearch.carType?.toLowerCase(),
                        returnDate: prefilledSearch.returnDate
                      } : undefined}
                    />
                  </motion.div>
                )}
                
                {rideStatus === 'requesting' && (
                  <motion.div
                    key="requesting"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[32px] shadow-sm border border-black/5 p-10 flex flex-col items-center justify-center text-center h-full relative"
                  >
                    <div className="relative mb-8">
                      <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center">
                        <Car size={40} className="text-zinc-200" />
                      </div>
                      <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Finding your ride</h3>
                    <p className="text-zinc-500 text-sm">We're matching you with the nearest driver...</p>
                    
                    <div className="mt-10 w-full space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-left">
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
                  </motion.div>
                )}

                {rideStatus === 'accepted' && (
                  <motion.div
                    key="accepted"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[32px] shadow-sm border border-black/5 p-8 h-full flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                      <CheckCircle2 size={20} />
                      <p className="text-sm font-medium">Driver is on the way!</p>
                    </div>

                    <div className="space-y-8 flex-1">
                      <div className="flex items-center gap-5">
                        <div className="w-24 h-24 bg-zinc-100 rounded-3xl flex items-center justify-center overflow-hidden border border-black/5 shadow-md">
                          <img 
                            src={driverInfo?.image || DEFAULT_PROFILE_PIC} 
                            alt="Driver" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Your Driver</p>
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-2xl text-zinc-900">{driverInfo?.name || "Michael Chen"}</h3>
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
                          <div className="flex items-center gap-3 text-zinc-500 text-sm mt-2">
                            <span className="bg-zinc-100 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-tight text-zinc-600 border border-black/5">
                              {driverInfo?.car || "Toyota Camry"}
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                              <Star size={14} fill="currentColor" className="animate-pulse" />
                              <span className="font-black text-lg">{driverInfo?.rating || "4.9"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Arrival</p>
                          <p className="font-bold text-lg">{eta ? `${eta} mins` : 'Arriving...'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Est. Fare</p>
                          <p className="font-mono font-bold text-lg text-emerald-600">
                            {formatPrice(activeRide?.fare || 0)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 mt-auto">
                        <button 
                          onClick={handleShareRide}
                          className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                          <Share2 size={18} />
                          Share Ride Status
                        </button>
                        <div className="flex gap-3">
                          <button className="flex-1 py-4 bg-zinc-100 text-black rounded-2xl font-bold hover:bg-zinc-200 transition-all">
                            Message
                          </button>
                          <button 
                            onClick={() => setShowCancelConfirm(true)}
                            className="flex-1 py-4 bg-rose-50 text-rose-500 rounded-2xl font-bold hover:bg-rose-100 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {rideStatus === 'completed' && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full"
                  >
                    <PaymentFlow 
                      rideId={activeRide.id} 
                      amount={activeRide.fare} 
                      onPaid={() => setRideStatus('paid')} 
                    />
                  </motion.div>
                )}

                {rideStatus === 'paid' && (
                  <motion.div
                    key="paid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full"
                  >
                    <RatingForm 
                      rideId={activeRide.id} 
                      onComplete={() => {
                        setRideStatus('idle');
                        setActiveRide(null);
                      }} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showCancelConfirm && (
                  <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowCancelConfirm(false)}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-sm bg-white rounded-[40px] overflow-hidden shadow-2xl border border-black/5 p-8 text-center"
                    >
                      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={32} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Cancel Ride?</h3>
                      <p className="text-zinc-500 text-sm mb-6">Please select a reason for cancelling:</p>
                      <div className="w-full space-y-2 mb-8">
                        {['Wait time too long', 'Driver too far', 'Changed my mind', 'Found another ride', 'Other'].map(reason => (
                          <button 
                            key={reason}
                            onClick={() => handleCancelRequest(reason)}
                            className="w-full p-4 text-left text-sm bg-zinc-50 hover:bg-zinc-100 rounded-2xl border border-zinc-100 transition-all font-medium"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setShowCancelConfirm(false)}
                        className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                      >
                        Keep Waiting
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-8 h-full">
              <Map 
                pickup={activeRide ? { lat: activeRide.pickup_lat, lng: activeRide.pickup_lng } : undefined}
                dropoff={activeRide ? { lat: activeRide.dropoff_lat, lng: activeRide.dropoff_lng } : undefined}
                driverLocation={
                  rideStatus === 'accepted' 
                    ? (driverLocation || { lat: 37.7760, lng: -122.4180 })
                    : undefined
                }
                nearbyDrivers={rideStatus === 'idle' ? nearbyDrivers : []}
                showRoute={!!activeRide}
              />
            </div>
          </div>
        </div>
      ) : (
        <LandingPage onSearch={handleLandingSearch} onBook={handleLandingSearch} />
      )}
      <AnimatePresence>
        {driverCancelled && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDriverCancelled(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] overflow-hidden shadow-2xl border border-black/5 p-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 mb-2">Ride Cancelled</h2>
              <p className="text-zinc-500 text-sm mb-4">The driver has cancelled your ride.</p>
              <div className="bg-rose-50 rounded-2xl p-4 mb-8 border border-rose-100">
                <p className="text-[10px] uppercase tracking-widest text-rose-400 font-mono mb-1">Reason</p>
                <p className="font-medium text-rose-700">{driverCancelled.reason}</p>
              </div>
              <button 
                onClick={() => setDriverCancelled(null)}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
              >
                Request New Ride
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRequestConfirmation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRequestConfirmation(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] overflow-hidden shadow-2xl border border-black/5 p-8 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 mb-2">Request Sent!</h2>
              <p className="text-zinc-500 text-sm mb-4">We're finding the best driver for you.</p>
              <div className="bg-zinc-50 rounded-2xl p-4 mb-8">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Ride ID</p>
                <p className="font-mono font-bold text-zinc-900">#{activeRide?.id?.slice(-8).toUpperCase() || 'SEARCHING'}</p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowRequestConfirmation(false)}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
                >
                  Got it
                </button>
                <button 
                  onClick={() => {
                    setShowRequestConfirmation(false);
                    setShowCancelConfirm(true);
                  }}
                  className="w-full py-4 bg-zinc-100 text-rose-500 rounded-2xl font-bold hover:bg-rose-50 transition-all"
                >
                  Cancel Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [view, setView] = useState('home');
  const [intendedView, setIntendedView] = useState<'dashboard' | 'history' | 'profile' | 'home'>('home');
  const [prefilledSearch, setPrefilledSearch] = useState<any>(null);

  // Check for share link
  const path = window.location.pathname;
  const shareMatch = path.match(/\/share\/([a-z0-9]+)/);
  const shareRideId = shareMatch ? shareMatch[1] : null;

  if (shareRideId) {
    return <ShareRide rideId={shareRideId} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  if (!user) {
    const handleNavigate = (v: string) => {
      if (v === 'login' || v === 'register') {
        setIntendedView('dashboard');
        setShowAuth(true);
      } else {
        setView(v);
      }
    };

    const handleLandingAction = (data?: any) => {
      if (data) setPrefilledSearch(data);
      setIntendedView('dashboard');
      setShowAuth(true);
    };

    return (
      <Layout onNavigate={handleNavigate}>
        {['about', 'gallery', 'blog', 'packages', 'cars', 'testimonials', 'contact', 'support', 'policy', 'deals', 'terms', 'privacy', 'faq', 'sitemap', 'disclaimer', 'security', 'one-way', 'round-trip', 'local-full-day', 'luxury-rental', 'wedding-rental', 'business-rental', 'bus-hire', 'cancel-booking', 'pay-direct', 'feedback', 'register', 'services'].includes(view) ? (
          <ContentPage type={view as any} />
        ) : (
          <LandingPage onSearch={handleLandingAction} onBook={handleLandingAction} />
        )}
        <AnimatePresence>
          {showAuth && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAuth(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                <Auth />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Layout>
    );
  }

  return <Dashboard initialView={intendedView} prefilledSearch={prefilledSearch} />;
}
