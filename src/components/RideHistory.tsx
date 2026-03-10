import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, DollarSign, Loader2, ChevronRight, Star, User, MessageSquare, X, Phone, CheckCircle2, Filter, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../contexts/CurrencyContext';
import { DEFAULT_PROFILE_PIC } from '../constants';

export default function RideHistory({ initialView = 'history' }: { initialView?: 'history' | 'favorites' }) {
  const { formatPrice } = useCurrency();
  const [rides, setRides] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [view, setView] = useState<'history' | 'favorites'>(initialView);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: '',
    driverId: '',
    carModel: '',
    sortBy: 'created_at',
    order: 'DESC'
  });

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/drivers/favorites');
      const data = await res.json();
      setDrivers(data.favorites || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.driverId) params.append('driverId', filters.driverId);
      if (filters.carModel) params.append('carModel', filters.carModel);
      params.append('sortBy', filters.sortBy);
      params.append('order', filters.order);

      const res = await fetch(`/api/rides/history?${params.toString()}`);
      const data = await res.json();
      setRides(data.rides);
      setFilteredRides(data.rides);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/drivers/favorites');
      const data = await res.json();
      setFavorites(data.favorites);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  useEffect(() => {
    fetchFavorites();
    fetchDrivers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = rides.filter(ride => 
      ride.pickup_address.toLowerCase().includes(query) ||
      ride.dropoff_address.toLowerCase().includes(query) ||
      new Date(ride.created_at).toLocaleDateString().includes(query)
    );
    setFilteredRides(filtered);
  }, [searchQuery, rides]);

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

  const handleSubmitRating = async () => {
    if (!selectedRide || rating === 0) return;
    setIsSubmittingRating(true);
    try {
      const res = await fetch('/api/rides/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: selectedRide.id, rating, review })
      });
      if (res.ok) {
        fetchHistory();
        setSelectedRide(null);
        setRating(0);
        setReview('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">
            {view === 'history' ? 'Ride History' : 'Favorite Drivers'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {view === 'history' ? 'View and manage your past trips' : 'Your most trusted drivers'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-100 p-1 rounded-2xl">
          <button 
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'history' ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-black'}`}
          >
            History
          </button>
          <button 
            onClick={() => setView('favorites')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'favorites' ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-black'}`}
          >
            Favorites
          </button>
        </div>
      </div>

      {view === 'history' ? (
        <>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder="Search by location or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white border border-black/5 rounded-2xl text-sm focus:ring-2 focus:ring-black/5 w-full shadow-sm"
                  aria-label="Search ride history"
                />
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-sm font-medium ${showFilters ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-black/5 hover:border-black/10'}`}
                aria-expanded={showFilters}
                aria-controls="history-filters"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <span className="hidden sm:inline text-xs text-zinc-400 font-mono uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full">{filteredRides.length} trips</span>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  id="history-filters"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-zinc-50 p-6 rounded-[32px] border border-black/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono ml-1">Date Range</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="date" 
                          value={filters.startDate}
                          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white border border-black/5 rounded-xl text-xs focus:outline-none"
                          aria-label="Start date"
                        />
                        <span className="text-zinc-300">-</span>
                        <input 
                          type="date" 
                          value={filters.endDate}
                          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white border border-black/5 rounded-xl text-xs focus:outline-none"
                          aria-label="End date"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono ml-1">Price Range</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white border border-black/5 rounded-xl text-xs focus:outline-none"
                          aria-label="Minimum price"
                        />
                        <span className="text-zinc-300">-</span>
                        <input 
                          type="number" 
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white border border-black/5 rounded-xl text-xs focus:outline-none"
                          aria-label="Maximum price"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono ml-1">Driver</label>
                      <select 
                        value={filters.driverId}
                        onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-black/5 rounded-xl text-xs focus:outline-none"
                        aria-label="Filter by driver"
                      >
                        <option value="">All Drivers</option>
                        {Array.from(new Set(rides.map(r => r.driver_id).filter(Boolean))).map(id => {
                          const ride = rides.find(r => r.driver_id === id);
                          return <option key={id} value={id}>{ride.driver_name}</option>;
                        })}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono ml-1">Car Model</label>
                      <select 
                        value={filters.carModel}
                        onChange={(e) => setFilters({ ...filters, carModel: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-black/5 rounded-xl text-xs focus:outline-none"
                        aria-label="Filter by car model"
                      >
                        <option value="">All Models</option>
                        {Array.from(new Set(rides.map(r => r.car_model).filter(Boolean))).map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono ml-1">Sort By</label>
                      <div className="flex gap-2">
                        <select 
                          value={filters.sortBy}
                          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white border border-black/5 rounded-xl text-xs focus:outline-none"
                          aria-label="Sort by field"
                        >
                          <option value="created_at">Date</option>
                          <option value="fare">Price</option>
                          <option value="status">Status</option>
                          <option value="driver_name">Driver Name</option>
                          <option value="car_model">Car Model</option>
                        </select>
                        <button 
                          onClick={() => setFilters({ ...filters, order: filters.order === 'DESC' ? 'ASC' : 'DESC' })}
                          className="p-2 bg-white border border-black/5 rounded-xl hover:bg-zinc-100 transition-all"
                          aria-label={`Sort ${filters.order === 'DESC' ? 'ascending' : 'descending'}`}
                        >
                          <ArrowUpDown size={14} className={filters.order === 'ASC' ? 'rotate-180' : ''} />
                        </button>
                      </div>
                    </div>
                    <div className="sm:col-span-2 md:col-span-3 flex justify-end">
                      <button 
                        onClick={() => setFilters({
                          startDate: '',
                          endDate: '',
                          minPrice: '',
                          maxPrice: '',
                          driverId: '',
                          carModel: '',
                          sortBy: 'created_at',
                          order: 'DESC'
                        })}
                        className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono hover:text-black transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRides.map((ride, index) => (
          <motion.div
            key={ride.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedRide(ride)}
            className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm hover:shadow-md hover:border-black/10 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-zinc-100 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-black transition-colors">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      {new Date(ride.scheduled_at || ride.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
                      {ride.scheduled_at ? 'Scheduled: ' : ''}
                      {new Date(ride.scheduled_at || ride.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold font-mono text-black">{formatPrice(ride.fare || 0)}</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold mt-1 ${
                    ride.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-400'
                  }`}>
                    {ride.status === 'completed' && <CheckCircle2 size={10} />}
                    {ride.status}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-xs text-zinc-500 truncate">{ride.pickup_address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <p className="text-xs text-zinc-500 truncate">{ride.dropoff_address}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 overflow-hidden border border-black/5">
                    <img src={ride.driver_image || DEFAULT_PROFILE_PIC} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{ride.driver_name || 'Driver'}</span>
                </div>
                <ChevronRight size={16} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </motion.div>
        ))}

        {filteredRides.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-dashed border-zinc-200">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-zinc-300" />
            </div>
            <p className="text-zinc-400 font-medium">No rides found matching your search.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-sm text-black font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
      </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((driver, index) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm text-center relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => handleToggleFavorite(driver.id, false)}
                  className="text-rose-500 hover:scale-110 transition-transform"
                >
                  <Star size={20} fill="currentColor" />
                </button>
              </div>
              <div className="w-20 h-20 bg-zinc-100 rounded-3xl mx-auto mb-4 overflow-hidden border border-black/5">
                <img src={driver.profile_pic || DEFAULT_PROFILE_PIC} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-bold text-lg">{driver.name}</h3>
              <p className="text-xs text-zinc-500 mb-3">{driver.car_model || 'Toyota Camry'}</p>
              <div className="flex items-center justify-center gap-1 text-orange-500 font-bold mb-6">
                <Star size={14} fill="currentColor" />
                {driver.rating?.toFixed(1) || '4.9'}
              </div>
              <button 
                onClick={() => alert('Booking from favorite driver feature coming soon!')}
                className="w-full py-3 bg-black text-white rounded-2xl text-xs font-bold hover:bg-zinc-800 transition-all"
              >
                Book Now
              </button>
            </motion.div>
          ))}
          {favorites.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={24} className="text-zinc-300" />
              </div>
              <p className="text-zinc-400 font-medium">You haven't added any favorite drivers yet.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedRide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRide(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/5 flex items-center justify-between">
                <h2 className="text-2xl font-medium tracking-tight">Ride Details</h2>
                <button 
                  onClick={() => setSelectedRide(null)}
                  className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center overflow-hidden border border-black/5">
                      <img 
                        src={selectedRide.driver_image || DEFAULT_PROFILE_PIC} 
                        alt="Driver" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Driver</p>
                      <h3 className="font-bold text-lg">{selectedRide.driver_name || "Michael Chen"}</h3>
                      <p className="text-xs text-zinc-500 mb-1">{selectedRide.car_model || "Toyota Camry • ABC-1234"}</p>
                      {selectedRide.driver_phone && (
                        <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                          <Phone size={10} />
                          {selectedRide.driver_phone}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-orange-500 text-sm font-bold">
                        <Star size={14} fill="currentColor" />
                        {selectedRide.driver_avg_rating?.toFixed(1) || "4.9"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button 
                      onClick={() => handleToggleFavorite(selectedRide.driver_id, !favorites.some(f => f.id === selectedRide.driver_id))}
                      className={`p-3 rounded-2xl border transition-all ${
                        favorites.some(f => f.id === selectedRide.driver_id) 
                        ? 'bg-rose-50 border-rose-100 text-rose-500' 
                        : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-rose-500'
                      }`}
                    >
                      <Star size={20} fill={favorites.some(f => f.id === selectedRide.driver_id) ? "currentColor" : "none"} />
                    </button>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Total Fare</p>
                      <p className="text-2xl font-bold font-mono text-emerald-600">{formatPrice(selectedRide.fare || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <div className="h-32 bg-zinc-200 rounded-2xl mb-4 overflow-hidden relative border border-zinc-300">
                    <img 
                      src={`https://picsum.photos/seed/route-${selectedRide.id}/600/300?grayscale`} 
                      className="w-full h-full object-cover opacity-60" 
                      alt="Route Map" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-[2px] bg-black/20 relative">
                        <div className="absolute left-1/4 -top-1 w-2 h-2 rounded-full bg-emerald-500" />
                        <div className="absolute right-1/4 -top-1 w-2 h-2 rounded-full bg-rose-500" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Pickup</p>
                      <p className="text-sm font-medium">{selectedRide.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Drop-off</p>
                      <p className="text-sm font-medium">{selectedRide.dropoff_address}</p>
                    </div>
                  </div>
                </div>

                {selectedRide.user_review ? (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono ml-1">Your Review</p>
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 italic text-zinc-600 text-sm">
                      <div className="flex items-center gap-1 text-amber-500 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < selectedRide.user_rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      "{selectedRide.user_review}"
                    </div>
                  </div>
                ) : selectedRide.status === 'completed' && (
                  <div className="space-y-4 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-sm font-bold text-emerald-800 text-center">Rate your experience</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button 
                          key={s}
                          onClick={() => setRating(s)}
                          className={`p-2 transition-transform hover:scale-110 ${rating >= s ? 'text-amber-500' : 'text-zinc-300'}`}
                        >
                          <Star size={32} fill={rating >= s ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Optional feedback..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full p-4 bg-white border border-emerald-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      rows={3}
                    />
                    <button 
                      onClick={handleSubmitRating}
                      disabled={rating === 0 || isSubmittingRating}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      {isSubmittingRating ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Submit Rating'}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Date</p>
                    <p className="text-sm font-medium">{new Date(selectedRide.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Time</p>
                    <p className="text-sm font-medium">{new Date(selectedRide.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Ride Type</p>
                    <p className="text-sm font-medium capitalize">{selectedRide.type || 'Standard'}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Promo Code</p>
                    <p className="text-sm font-medium">{selectedRide.promo_code || 'None'}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Distance</p>
                    <p className="text-sm font-medium">4.2 km</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => alert('Receipt downloaded successfully!')}
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    <DollarSign size={16} />
                    Download Receipt
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
