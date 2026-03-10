import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Car, MapPin, Navigation, Check, Star, DollarSign, X, Loader2, Clock, ArrowUpDown, Settings, Phone, Camera, Save, Globe, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../contexts/CurrencyContext';
import { DEFAULT_PROFILE_PIC } from '../constants';

import { requestNotificationPermission, sendNotification } from '../utils/notifications';

export default function DriverDashboard({ messages }: { messages: any[] }) {
  const { user, refreshUser } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeRide, setActiveRide] = useState<any>(null);
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(user?.is_online === 1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [filter, setFilter] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [minDriverRating, setMinDriverRating] = useState(0);
  const [carModelFilter, setCarModelFilter] = useState('all');
  const [maxDistance, setMaxDistance] = useState(100); // New proximity filter
  const [sortBy, setSortBy] = useState<'distance' | 'fare' | 'rating' | 'type' | 'driverRating' | 'carModel'>('distance');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    car_model: user?.car_model || '',
    phone: user?.phone || '',
    profile_pic: user?.profile_pic || ''
  });

  const [earnings, setEarnings] = useState({
    day: 0,
    week: 0,
    month: 0
  });
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  const fetchEarnings = async () => {
    setLoadingEarnings(true);
    try {
      const res = await fetch('/api/driver/earnings');
      if (res.ok) {
        const data = await res.json();
        setEarnings(data);
      }
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    } finally {
      setLoadingEarnings(false);
    }
  };

  const fetchFavoriteStatus = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/drivers/favorites');
      const data = await res.json();
      const isFav = data.favorites?.some((f: any) => f.id === user.id);
      setIsFavorite(!!isFav);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEarnings();
    fetchFavoriteStatus();
  }, []);

  useEffect(() => {
    if (user) {
      setIsOnline(user.is_online === 1);
      const profilePic = user.profile_pic || DEFAULT_PROFILE_PIC;
      setProfileForm({
        car_model: user.car_model || '',
        phone: user.phone || '',
        profile_pic: profilePic
      });
    }
  }, [user]);

  useEffect(() => {
    // Add some initial mock rides for demonstration if none exist
    if (availableRides.length === 0 && isOnline) {
      const mockRides = [
        { id: '1', pickup_address: '123 Market St', dropoff_address: '456 Castro St', fare: 25.50, pickup_lat: 37.7749, pickup_lng: -122.4194, type: 'Premium', car_model: 'Tesla Model S', rider_rating: 4.9 },
        { id: '2', pickup_address: '789 Mission St', dropoff_address: '101 Haight St', fare: 15.20, pickup_lat: 37.7849, pickup_lng: -122.4094, type: 'Standard', car_model: 'Toyota Camry', rider_rating: 4.2 },
        { id: '3', pickup_address: '202 Embarcadero', dropoff_address: '303 Union St', fare: 45.00, pickup_lat: 37.7949, pickup_lng: -122.3994, type: 'Luxury', car_model: 'Mercedes S-Class', rider_rating: 5.0 },
        { id: '4', pickup_address: '505 Valencia St', dropoff_address: '606 Dolores St', fare: 12.00, pickup_lat: 37.7649, pickup_lng: -122.4294, type: 'Economy', car_model: 'Honda Civic', rider_rating: 3.8 },
      ];
      setAvailableRides(mockRides);
    }
  }, [isOnline]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const newRide = messages.find(m => m.type === 'NEW_RIDE_REQUEST');
    if (newRide) {
      sendNotification('New Ride Request', { body: `Pickup: ${newRide.ride.pickup_address}` });
      setAvailableRides(prev => {
        if (prev.find(r => r.id === newRide.ride.id)) return prev;
        return [...prev, newRide.ride];
      });
    }

    const cancelledRide = messages.find(m => m.type === 'RIDE_CANCELLED');
    if (cancelledRide) {
      sendNotification('Ride Cancelled', { body: 'A ride has been cancelled by the rider.' });
      setAvailableRides(prev => prev.filter(r => r.id !== cancelledRide.rideId));
      if (activeRide?.id === cancelledRide.rideId) {
        setActiveRide(null);
        alert('The rider has cancelled the request.');
      }
    }
  }, [messages, isOnline, activeRide]);

  const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number }>({ lat: 37.7749, lng: -122.4194 });
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [eta, setEta] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let interval: any;
    if (activeRide && activeRide.status === 'accepted') {
      // Simulate moving towards pickup
      interval = setInterval(() => {
        setDriverLocation(prev => {
          const latDiff = activeRide.pickup_lat - prev.lat;
          const lngDiff = activeRide.pickup_lng - prev.lng;
          
          // Move 10% of the remaining distance each step
          const stepSize = 0.05;
          const newLat = prev.lat + latDiff * stepSize;
          const newLng = prev.lng + lngDiff * stepSize;
          
          // Calculate distance in km (approximate)
          const dist = Math.sqrt(Math.pow(latDiff, 2) + Math.pow(lngDiff, 2)) * 111;
          // ETA: assume 50km/h
          setEta(Math.ceil((dist / 50) * 60));

          // Update server
          updateLocation(newLat, newLng);
          
          return { lat: newLat, lng: newLng };
        });
      }, 3000);
    } else if (activeRide && activeRide.status === 'in_progress') {
      // Simulate moving towards dropoff
      interval = setInterval(() => {
        setDriverLocation(prev => {
          const latDiff = activeRide.dropoff_lat - prev.lat;
          const lngDiff = activeRide.dropoff_lng - prev.lng;
          
          const stepSize = 0.03;
          const newLat = prev.lat + latDiff * stepSize;
          const newLng = prev.lng + lngDiff * stepSize;
          
          const dist = Math.sqrt(Math.pow(latDiff, 2) + Math.pow(lngDiff, 2)) * 111;
          setEta(Math.ceil((dist / 50) * 60));

          updateLocation(newLat, newLng);
          
          return { lat: newLat, lng: newLng };
        });
      }, 3000);
    } else {
      setEta(null);
    }
    return () => clearInterval(interval);
  }, [activeRide]);

  const updateLocation = async (lat: number, lng: number) => {
    setUpdatingLocation(true);
    try {
      const res = await fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });
      if (res.ok) {
        setDriverLocation({ lat, lng });
      }
    } catch (err) {
      console.error('Location update error:', err);
    } finally {
      setUpdatingLocation(false);
    }
  };

  const handleManualUpdate = () => {
    // In a real app, this might use navigator.geolocation
    // For this mock, we'll just re-trigger the update with current state
    updateLocation(driverLocation.lat, driverLocation.lng);
  };

  const toggleStatus = async () => {
    const newStatus = !isOnline;
    try {
      const res = await fetch('/api/driver/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_online: newStatus })
      });
      if (res.ok) {
        setIsOnline(newStatus);
        await refreshUser();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update online status.');
    }
  };

  const handleAccept = async (rideId: string) => {
    try {
      const res = await fetch('/api/rides/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId })
      });
      if (res.ok) {
        const ride = availableRides.find(r => r.id === rideId);
        setActiveRide({ ...ride, status: 'accepted' });
        setAvailableRides(prev => prev.filter(r => r.id !== rideId));
      } else {
        throw new Error('Failed to accept ride');
      }
    } catch (err) {
      console.error('Accept ride error:', err);
      alert('Failed to accept ride. It may have been taken or cancelled.');
    }
  };

  const handleArrive = async () => {
    if (!activeRide) return;
    try {
      const res = await fetch('/api/rides/arrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: activeRide.id })
      });
      if (res.ok) {
        setActiveRide(prev => ({ ...prev, arrived: true }));
        alert('Rider has been notified of your arrival.');
      } else {
        throw new Error('Failed to mark arrival');
      }
    } catch (err) {
      console.error('Arrive error:', err);
      alert('Failed to mark arrival.');
    }
  };

  const handleStart = async () => {
    if (!activeRide) return;
    try {
      const res = await fetch('/api/rides/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: activeRide.id })
      });
      if (res.ok) {
        setActiveRide(prev => ({ ...prev, status: 'in_progress' }));
      } else {
        throw new Error('Failed to start ride');
      }
    } catch (err) {
      console.error('Start ride error:', err);
      alert('Failed to start ride.');
    }
  };

  const handleComplete = async () => {
    if (!activeRide) return;
    try {
      const res = await fetch('/api/rides/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: activeRide.id })
      });
      if (res.ok) {
        setActiveRide(null);
        fetchEarnings();
      } else {
        throw new Error('Failed to complete ride');
      }
    } catch (err) {
      console.error('Complete ride error:', err);
      alert('Failed to complete ride.');
    }
  };

  const handleDriverCancel = async () => {
    if (!activeRide || !cancelReason) return;
    setIsCancelling(true);
    try {
      const res = await fetch('/api/rides/driver-cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: activeRide.id, reason: cancelReason })
      });
      if (res.ok) {
        setActiveRide(null);
        setShowCancelModal(false);
        setCancelReason('');
      } else {
        throw new Error('Failed to cancel ride');
      }
    } catch (err) {
      console.error('Cancel ride error:', err);
      alert('Failed to cancel ride.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) return;
    const newStatus = !isFavorite;
    try {
      const res = await fetch('/api/drivers/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: user.id, isFavorite: newStatus })
      });
      if (res.ok) {
        setIsFavorite(newStatus);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileForm,
          name: user?.name,
          email: user?.email
        })
      });
      if (res.ok) {
        await refreshUser();
        setShowProfileModal(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Failed to update profile.');
    }
  };

  const workflowSteps = [
    { title: 'Go Online', desc: 'Toggle your status to start receiving ride requests.', icon: <Check size={20} className="text-emerald-500" /> },
    { title: 'Accept Ride', desc: 'Review available requests and accept the ones that suit you.', icon: <Navigation size={20} className="text-blue-500" /> },
    { title: 'Pickup Rider', desc: 'Navigate to the pickup location and notify the rider.', icon: <MapPin size={20} className="text-orange-500" /> },
    { title: 'Complete & Earn', desc: 'Drop off the rider and receive your fare instantly.', icon: <DollarSign size={20} className="text-emerald-500" /> },
  ];

  return (
    <div className="space-y-6 bg-zinc-950 p-6 -m-6 min-h-screen text-white">
      <div className="flex items-center justify-between bg-zinc-900 p-6 rounded-[32px] border border-white/10 shadow-xl">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white">Driver Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your rides and earnings</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowProfileModal(true)}
            className="p-3 bg-zinc-800 text-zinc-400 rounded-2xl hover:bg-zinc-700 transition-all border border-white/5"
            title="Profile Settings"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={toggleStatus}
            aria-pressed={isOnline}
            aria-label={`Toggle online status. Currently ${isOnline ? 'Online' : 'Offline'}`}
            className={`flex items-center gap-4 px-10 py-5 rounded-[32px] font-bold transition-all shadow-2xl group relative overflow-hidden border-2 ${
              isOnline 
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-400'
            }`}
          >
            <div className={`w-4 h-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] ${isOnline ? 'bg-white animate-pulse' : 'bg-zinc-700'}`} />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1 font-mono">System Status</span>
              <div className="flex items-center gap-2">
                <span className="text-xl tracking-tight font-black">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                {isOnline && (
                  <span className="px-2 py-0.5 bg-white/20 rounded text-[8px] font-bold uppercase tracking-widest animate-pulse">
                    Active
                  </span>
                )}
              </div>
            </div>
            {isOnline && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.2, scale: 1 }}
                className="absolute -right-4 -bottom-4"
              >
                <Check size={140} strokeWidth={3} />
              </motion.div>
            )}
            {isOnline && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            )}
            {!isOnline && (
              <div className="absolute inset-0 bg-zinc-950/20 pointer-events-none" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 p-6 rounded-[24px] border border-white/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={48} />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Today</p>
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-500" />
            {loadingEarnings ? (
              <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
            ) : (
              <h3 className="text-2xl font-medium tracking-tight text-white">{formatPrice(earnings.day)}</h3>
            )}
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[8px] uppercase tracking-widest text-zinc-500 font-mono mb-1">
              <span>Daily Goal</span>
              <span>{Math.round((earnings.day / 200) * 100)}%</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (earnings.day / 200) * 100)}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-[24px] border border-white/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={48} />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">This Week</p>
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-blue-400" />
            {loadingEarnings ? (
              <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded" />
            ) : (
              <h3 className="text-2xl font-medium tracking-tight text-white">{formatPrice(earnings.week)}</h3>
            )}
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-[24px] border border-white/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={48} />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">This Month</p>
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-amber-500" />
            {loadingEarnings ? (
              <div className="h-8 w-28 bg-zinc-800 animate-pulse rounded" />
            ) : (
              <h3 className="text-2xl font-medium tracking-tight text-white">{formatPrice(earnings.month)}</h3>
            )}
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-[24px] border border-white/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Star size={48} />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Rating</p>
          <div className="flex items-center gap-2">
            <Star size={20} className="text-amber-500 fill-amber-500" />
            <h3 className="text-2xl font-medium tracking-tight text-white">{user?.rating?.toFixed(1) || '5.0'}</h3>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-[32px] border border-white/10 shadow-lg p-8">
        <h2 className="text-xl font-medium tracking-tight text-white mb-6">Your Workflow Process</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="relative p-6 bg-zinc-800/30 rounded-2xl border border-white/5 group hover:bg-zinc-800/50 transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-zinc-900 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                0{idx + 1}
              </div>
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 rounded-[32px] border border-white/10 shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium tracking-tight text-white">Your Location</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                <MapPin size={12} />
                <span aria-label="Current latitude">{driverLocation.lat.toFixed(4)}</span>, 
                <span aria-label="Current longitude">{driverLocation.lng.toFixed(4)}</span>
              </div>
              <button 
                onClick={handleManualUpdate}
                disabled={updatingLocation}
                className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-lg"
                aria-label="Update current location"
              >
                {updatingLocation ? 'Updating...' : 'Update Location'}
              </button>
            </div>
          </div>
          <div className="relative h-64 bg-zinc-800 rounded-2xl overflow-hidden border border-white/5 group">
            {/* Mock Map Interface */}
            <div 
              className="absolute inset-0 cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                // Map click to mock coordinates around SF
                const newLat = 37.7749 + (0.5 - y) * 0.05;
                const newLng = -122.4194 + (x - 0.5) * 0.05;
                updateLocation(newLat, newLng);
              }}
            >
              <img 
                src="https://picsum.photos/seed/sf-map/800/600?grayscale" 
                className="w-full h-full object-cover opacity-30 invert" 
                alt="Map" 
              />
              <motion.div 
                animate={{ 
                  x: `calc(${(driverLocation.lng - (-122.4194 - 0.025)) / 0.05 * 100}% - 12px)`,
                  y: `calc(${(37.7749 + 0.025 - driverLocation.lat) / 0.05 * 100}% - 12px)`
                }}
                className="absolute w-6 h-6 bg-white rounded-full border-2 border-zinc-900 shadow-xl flex items-center justify-center text-zinc-900 z-10"
              >
                <Car size={12} />
              </motion.div>
              {updatingLocation && (
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-zinc-900/90 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[10px] font-medium text-zinc-400 text-center">
              Click anywhere on the map to update your current location
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-[32px] border border-white/10 shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium tracking-tight text-white">Your Profile</h2>
            <button 
              onClick={() => setShowProfileModal(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Edit Profile
            </button>
          </div>
          <div className="flex items-center gap-6 p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl overflow-hidden border border-white/10">
              <img 
                src={user?.profile_pic || DEFAULT_PROFILE_PIC} 
                alt="Profile" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white truncate">{user?.name || 'Driver Name'}</h3>
                <button 
                  onClick={handleToggleFavorite}
                  className={`transition-transform hover:scale-110 ${isFavorite ? 'text-amber-500' : 'text-zinc-600'}`}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Car size={12} className="text-zinc-500" />
                  <span className="truncate">{user?.car_model || 'No car model set'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Phone size={12} className="text-zinc-500" />
                  <span>{user?.phone || 'No phone set'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-[32px] border border-white/10 shadow-lg p-8">
          <h2 className="text-xl font-medium mb-6 tracking-tight text-white">Active Ride</h2>
          {activeRide ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 border border-white/5">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Rider</p>
                  <h4 className="font-bold text-white">{activeRide.rider_name || 'Rider'}</h4>
                  <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                    <Star size={10} fill="currentColor" />
                    {activeRide.rider_rating || '4.8'}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-900 shrink-0">
                  <Navigation size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-1">Destination</p>
                  <p className="font-medium text-white">{activeRide.dropoff_address}</p>
                  <p className="text-sm text-zinc-400 mt-1">Pickup: {activeRide.pickup_address}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Clock size={14} className="text-[#ff9800]" />
                    <p className="text-xs font-bold text-[#ff9800] uppercase tracking-wider">
                      {activeRide.status === 'accepted' ? 'ETA to Pickup: ' : 'ETA to Dropoff: '}
                      {eta !== null ? `${eta} mins` : 'Calculating...'}
                    </p>
                  </div>
                </div>
              </div>
                  <div className="flex gap-3">
                    {activeRide.status === 'accepted' ? (
                      <>
                        {!activeRide.arrived ? (
                          <button 
                            onClick={handleArrive}
                            className="flex-1 py-4 bg-[#ff9800] text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                          >
                            <MapPin size={18} />
                            I've Arrived
                          </button>
                        ) : (
                          <button 
                            onClick={handleStart}
                            className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            Start Ride
                          </button>
                        )}
                      </>
                    ) : (
                      <button 
                        onClick={handleComplete}
                        className="flex-1 py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-200 transition-all shadow-lg"
                      >
                        Complete Ride
                      </button>
                    )}
                    <button 
                      onClick={() => setShowCancelModal(true)}
                      className="px-6 py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-medium hover:bg-rose-500/20 transition-all border border-rose-500/20"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
            <div className="h-40 flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-2xl">
              <Car size={32} className="mb-2 opacity-20" />
              <p className="text-sm">No active ride</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-zinc-900 rounded-[32px] border border-white/10 shadow-lg p-8">
          <div className="flex flex-col gap-8 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <h2 className="text-2xl font-medium tracking-tight text-white">Available Requests</h2>
              <div className="flex items-center gap-4 flex-wrap">
                {/* Clear Filters */}
                {(filter !== 'all' || minRating !== 0 || minDriverRating !== 0 || carModelFilter !== 'all' || maxDistance !== 100 || sortBy !== 'distance') && (
                  <button 
                    onClick={() => {
                      setFilter('all');
                      setMinRating(0);
                      setMinDriverRating(0);
                      setCarModelFilter('all');
                      setMaxDistance(100);
                      setSortBy('distance');
                    }}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-2"
                  >
                    <X size={14} />
                    Clear Filters
                  </button>
                )}

                {/* Distance Filter */}
                <div className="flex items-center gap-3 bg-zinc-800/80 px-5 py-3 rounded-2xl border border-white/10 focus-within:border-emerald-500 transition-all shadow-inner">
                  <Navigation size={18} className="text-emerald-500" />
                  <div className="flex flex-col">
                    <label htmlFor="distance-filter" className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Distance Filter</label>
                    <select 
                      id="distance-filter"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer appearance-none pr-6"
                    >
                      <option value="5" className="bg-zinc-900">Within 5 km</option>
                      <option value="10" className="bg-zinc-900">Within 10 km</option>
                      <option value="25" className="bg-zinc-900">Within 25 km</option>
                      <option value="50" className="bg-zinc-900">Within 50 km</option>
                      <option value="100" className="bg-zinc-900">Any Distance</option>
                    </select>
                  </div>
                </div>

                {/* Ride Type Filter */}
                <div className="flex items-center gap-3 bg-zinc-800/80 px-5 py-3 rounded-2xl border border-white/10 focus-within:border-emerald-500 transition-all shadow-inner">
                  <Car size={18} className="text-blue-500" />
                  <div className="flex flex-col">
                    <label htmlFor="ride-type-filter" className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Ride Type</label>
                    <select 
                      id="ride-type-filter"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer appearance-none pr-6"
                    >
                      <option value="all" className="bg-zinc-900">All Categories</option>
                      <option value="standard" className="bg-zinc-900">Standard</option>
                      <option value="premium" className="bg-zinc-900">Premium</option>
                      <option value="luxury" className="bg-zinc-900">Luxury</option>
                      <option value="economy" className="bg-zinc-900">Economy</option>
                    </select>
                  </div>
                </div>

                {/* Car Model Filter */}
                <div className="flex items-center gap-3 bg-zinc-800/80 px-5 py-3 rounded-2xl border border-white/10 focus-within:border-emerald-500 transition-all shadow-inner">
                  <Settings size={18} className="text-zinc-400" />
                  <div className="flex flex-col">
                    <label htmlFor="car-model-filter" className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Car Model</label>
                    <select 
                      id="car-model-filter"
                      value={carModelFilter}
                      onChange={(e) => setCarModelFilter(e.target.value)}
                      className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer appearance-none pr-6"
                    >
                      <option value="all" className="bg-zinc-900">All Models</option>
                      {Array.from(new Set(availableRides.map(r => r.car_model).filter(Boolean))).map(model => (
                        <option key={model} value={model} className="bg-zinc-900">{model}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-3 bg-zinc-800/80 px-5 py-3 rounded-2xl border border-white/10 focus-within:border-emerald-500 transition-all shadow-inner">
                  <ArrowUpDown size={18} className="text-amber-500" />
                  <div className="flex flex-col">
                    <label htmlFor="sort-filter" className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Sort Order</label>
                    <select 
                      id="sort-filter"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer appearance-none pr-6"
                    >
                      <option value="distance" className="bg-zinc-900">By Distance</option>
                      <option value="fare" className="bg-zinc-900">By Highest Fare</option>
                      <option value="rating" className="bg-zinc-900">By Rider Rating</option>
                      <option value="driverRating" className="bg-zinc-900">By Driver Rating</option>
                      <option value="carModel" className="bg-zinc-900">By Car Model</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full bg-zinc-800/30 p-6 rounded-[24px] border border-white/5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-amber-500" />
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Min Rider Rating:</p>
                  </div>
                  <span className="text-amber-500 font-bold text-xs">{minRating === 0 ? 'Any' : `${minRating}+ ⭐`}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.5" 
                  value={minRating} 
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[8px] text-zinc-600 font-mono px-1">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-emerald-500" />
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Min Driver Rating:</p>
                  </div>
                  <span className="text-emerald-500 font-bold text-xs">{minDriverRating === 0 ? 'Any' : `${minDriverRating}+ ⭐`}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.5" 
                  value={minDriverRating} 
                  onChange={(e) => setMinDriverRating(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[8px] text-zinc-600 font-mono px-1">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {availableRides
                .filter(r => {
                  const distance = Math.sqrt(Math.pow(r.pickup_lat - driverLocation.lat, 2) + Math.pow(r.pickup_lng - driverLocation.lng, 2)) * 111;
                  return (filter === 'all' || (r.type || '').toLowerCase() === filter.toLowerCase()) && 
                         (r.rider_rating || 5) >= minRating &&
                         (user?.rating || 5) >= minDriverRating &&
                         (carModelFilter === 'all' || r.car_model === carModelFilter) &&
                         distance <= maxDistance;
                })
                .sort((a, b) => {
                  if (sortBy === 'distance') {
                    const distA = Math.sqrt(Math.pow(a.pickup_lat - driverLocation.lat, 2) + Math.pow(a.pickup_lng - driverLocation.lng, 2));
                    const distB = Math.sqrt(Math.pow(b.pickup_lat - driverLocation.lat, 2) + Math.pow(b.pickup_lng - driverLocation.lng, 2));
                    return distA - distB;
                  }
                  if (sortBy === 'fare') return b.fare - a.fare;
                  if (sortBy === 'rating') return (b.rider_rating || 5) - (a.rider_rating || 5);
                  if (sortBy === 'driverRating') return (user?.rating || 0) - (user?.rating || 0); // Placeholder as it's the same driver
                  if (sortBy === 'carModel') return (a.car_model || '').localeCompare(b.car_model || '');
                  if (sortBy === 'type') return (a.type || '').localeCompare(b.type || '');
                  return 0;
                })
                .map((ride) => {
                  const distance = Math.sqrt(Math.pow(ride.pickup_lat - driverLocation.lat, 2) + Math.pow(ride.pickup_lng - driverLocation.lng, 2));
                  const distanceInKm = (distance * 111).toFixed(1);

                  return (
                    <motion.div 
                      key={ride.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-zinc-800 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                          <MapPin size={14} className="text-emerald-400" />
                          {ride.pickup_address}
                          <span className="px-2 py-0.5 bg-zinc-700/50 text-[10px] font-bold uppercase tracking-widest text-zinc-300 rounded border border-white/5">
                            {ride.type || 'Standard'}
                          </span>
                          <div className="flex items-center gap-1 ml-auto px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold border border-amber-500/20">
                            <Star size={10} fill="currentColor" />
                            {ride.rider_rating || "4.8"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Navigation size={14} className="text-rose-400" />
                          {ride.dropoff_address}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs font-mono text-zinc-500">Est. Fare: {formatPrice(ride.fare)}</p>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{distanceInKm} km away</p>
                          {ride.car_model && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {ride.car_model}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAccept(ride.id)}
                        className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Check size={20} />
                      </button>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
            {availableRides.filter(r => {
              const distance = Math.sqrt(Math.pow(r.pickup_lat - driverLocation.lat, 2) + Math.pow(r.pickup_lng - driverLocation.lng, 2)) * 111;
              return (filter === 'all' || (r.type || '').toLowerCase() === filter.toLowerCase()) && 
                     (r.rider_rating || 5) >= minRating &&
                     distance <= maxDistance;
            }).length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-zinc-600 bg-zinc-800/20 rounded-[24px] border border-dashed border-zinc-800"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
                  <Car size={32} className="opacity-20" />
                </div>
                <p className="text-sm font-medium">No requests match your current filters</p>
                <p className="text-xs mt-1 opacity-50">Try expanding your search radius or changing ride types</p>
                <button 
                  onClick={() => {
                    setFilter('all');
                    setMinRating(0);
                    setMaxDistance(100);
                  }}
                  className="mt-6 px-6 py-2 bg-zinc-800 text-white text-xs font-bold rounded-xl hover:bg-zinc-700 transition-all border border-white/5"
                >
                  Reset Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 rounded-[40px] overflow-hidden shadow-2xl border border-white/10 p-8"
            >
              <h2 className="text-2xl font-black text-white mb-2">Cancel Ride?</h2>
              <p className="text-zinc-500 text-sm mb-6">Please provide a reason for cancelling this ride.</p>
              
              <div className="space-y-3 mb-8">
                {['Vehicle issues', 'Emergency', 'Too far away', 'Rider not found', 'Other'].map(reason => (
                  <label 
                    key={reason}
                    className={`w-full p-4 flex items-center gap-3 cursor-pointer rounded-2xl border transition-all ${
                      cancelReason === reason 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-500 font-bold' 
                        : 'bg-zinc-800 border-white/5 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <input 
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-4 h-4 accent-rose-500"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleDriverCancel}
                  disabled={!cancelReason || isCancelling}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all disabled:opacity-50"
                >
                  {isCancelling ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Cancel'}
                </button>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-bold hover:bg-zinc-700 transition-all"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Update Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 rounded-[40px] overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-white">Profile Settings</h2>
                  <button 
                    onClick={() => setShowProfileModal(false)}
                    className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors text-zinc-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-zinc-800 rounded-3xl overflow-hidden border-2 border-white/10 group-hover:border-emerald-500 transition-all">
                        <img 
                          src={profileForm.profile_pic || DEFAULT_PROFILE_PIC} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-emerald-600 transition-all shadow-lg">
                        <Camera size={14} />
                        <input 
                          type="text" 
                          className="hidden" 
                          placeholder="Image URL"
                          value={profileForm.profile_pic}
                          onChange={(e) => setProfileForm({ ...profileForm, profile_pic: e.target.value })}
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-4 uppercase tracking-widest font-mono">Profile Picture URL</p>
                    <input 
                      type="text"
                      value={profileForm.profile_pic}
                      onChange={(e) => setProfileForm({ ...profileForm, profile_pic: e.target.value })}
                      className="w-full mt-2 bg-zinc-800 border border-white/5 rounded-xl px-4 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-2">Car Model</label>
                      <div className="relative">
                        <Car size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="text"
                          value={profileForm.car_model}
                          onChange={(e) => setProfileForm({ ...profileForm, car_model: e.target.value })}
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="e.g. Toyota Camry 2024"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-2">Contact Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full bg-zinc-800 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-8"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
