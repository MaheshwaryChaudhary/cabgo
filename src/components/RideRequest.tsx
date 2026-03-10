import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, CreditCard, Clock, ChevronRight, Star, Loader2, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import LocationInput from './LocationInput';
import DateInput from './DateInput';
import { useCurrency } from '../contexts/CurrencyContext';

interface RideRequestProps {
  onRequest: (details: any) => void;
  onTypeSelect?: (type: string) => void;
  initialData?: {
    pickup?: string;
    rideType?: string;
    returnDate?: string;
  };
}

export default function RideRequest({ onRequest, onTypeSelect, initialData }: RideRequestProps) {
  const { formatPrice } = useCurrency();
  const [pickup, setPickup] = useState(initialData?.pickup || '');
  const [dropoff, setDropoff] = useState('');
  const [returnDate, setReturnDate] = useState(initialData?.returnDate || '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [rideType, setRideType] = useState(initialData?.rideType || 'standard');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [favoriteDrivers, setFavoriteDrivers] = useState<any[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch('/api/drivers/favorites');
        const data = await res.json();
        setFavoriteDrivers(data.favorites || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchSurge = async () => {
      try {
        const res = await fetch('/api/rides/surge');
        const data = await res.json();
        setSurgeMultiplier(data.multiplier);
      } catch (e) {
        console.error('Failed to fetch surge:', e);
      }
    };
    fetchSurge();
    const interval = setInterval(fetchSurge, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setIsValidatingPromo(true);
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode })
      });
      const data = await res.json();
      if (res.ok) {
        setDiscount(data.discount_percent);
        alert(`Promo code applied! ${data.discount_percent}% discount.`);
      } else {
        alert(data.error || 'Invalid promo code');
        setDiscount(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleTypeSelect = (type: string) => {
    setRideType(type);
    onTypeSelect?.(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fares = {
      standard: 15.00,
      premium: 25.50,
      luxury: 45.00
    };
    const baseFare = fares[rideType as keyof typeof fares];
    const finalFare = baseFare * surgeMultiplier * (1 - discount / 100);
    
    onRequest({
      pickup_address: pickup,
      dropoff_address: dropoff,
      return_date: returnDate,
      pickup_lat: 37.7749,
      pickup_lng: -122.4194,
      dropoff_lat: 37.7833,
      dropoff_lng: -122.4167,
      type: rideType,
      fare: finalFare,
      promo_code: promoCode,
      scheduled_at: scheduledAt || null
    });
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-8 h-full flex flex-col overflow-y-auto">
      <h2 className="text-2xl font-medium mb-6 tracking-tight">Where to?</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 flex-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <label id="pickup-label" className="inline-block bg-blue-700 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Location</label>
            <LocationInput 
              value={pickup}
              onChange={setPickup}
              placeholder="Enter pickup location"
              icon={<MapPin size={18} className="text-zinc-400" />}
              aria-labelledby="pickup-label"
            />
          </div>

          <div className="space-y-2">
            <label id="destination-label" className="inline-block text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Destination</label>
            <LocationInput 
              value={dropoff}
              onChange={setDropoff}
              placeholder="Enter destination"
              icon={<Navigation size={18} className="text-zinc-400" />}
              aria-labelledby="destination-label"
            />
          </div>

          <div className="space-y-2">
            <label id="schedule-label" className="inline-block text-orange-500 text-[10px] font-bold uppercase tracking-wider">Schedule for Later (Optional)</label>
            <div className="flex gap-2">
              <input 
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                aria-labelledby="schedule-label"
              />
              {scheduledAt && (
                <button 
                  type="button"
                  onClick={() => setScheduledAt('')}
                  className="px-4 py-3 bg-zinc-100 text-zinc-400 rounded-2xl hover:bg-zinc-200 transition-all"
                  aria-label="Clear scheduled time"
                >
                  <Clock size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label id="promo-label" className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono ml-1">Promo Code</label>
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              aria-labelledby="promo-label"
            />
            <button 
              type="button"
              onClick={handleApplyPromo}
              disabled={isValidatingPromo || !promoCode}
              className="px-6 py-3 bg-zinc-100 text-black rounded-2xl text-sm font-bold hover:bg-zinc-200 transition-all disabled:opacity-50"
              aria-label="Apply promo code"
            >
              {isValidatingPromo ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
            </button>
          </div>
          {discount > 0 && (
            <p className="text-xs text-emerald-600 font-bold ml-1" role="status">✓ {discount}% discount applied</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between ml-1">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Select Ride Type</p>
            {surgeMultiplier > 1 && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider border border-amber-100 shadow-sm animate-pulse" role="status">
                <Zap size={12} fill="currentColor" />
                Surge Pricing Active: x{surgeMultiplier}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-labelledby="ride-type-label">
            <span id="ride-type-label" className="sr-only">Ride Type Selection</span>
            {[
              { id: 'standard', label: 'Standard', price: 15.00, eta: '4 min', icon: <Clock size={18} /> },
              { id: 'premium', label: 'Premium', price: 25.50, eta: '2 min', icon: <CreditCard size={18} /> },
              { id: 'luxury', label: 'Luxury', price: 45.00, eta: '1 min', icon: <Star size={18} /> }
            ].map((type) => {
              const discountedPrice = type.price * surgeMultiplier * (1 - discount / 100);
              return (
                <button 
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeSelect(type.id)}
                  aria-checked={rideType === type.id}
                  role="radio"
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${rideType === type.id ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${rideType === type.id ? 'bg-white/10' : 'bg-zinc-100'}`}>
                      {type.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className={`text-[10px] ${rideType === type.id ? 'text-white/60' : 'text-zinc-400'}`}>{type.eta} away</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {discount > 0 && (
                      <p className={`text-[10px] line-through ${rideType === type.id ? 'text-white/40' : 'text-zinc-400'}`}>{formatPrice(type.price)}</p>
                    )}
                    <p className="font-mono font-medium text-sm">{formatPrice(discountedPrice)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-black text-white rounded-2xl font-medium mt-auto hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group"
        >
          {scheduledAt ? 'Schedule Ride' : 'Request Ride'}
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {favoriteDrivers.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Favorite Drivers</p>
              <Star size={14} className="text-amber-500 fill-amber-500" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {favoriteDrivers.map(driver => (
                <div key={driver.id} className="flex-shrink-0 w-32 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                  <div className="w-12 h-12 bg-zinc-200 rounded-xl mx-auto mb-2 overflow-hidden border border-black/5">
                    <img src={driver.profile_pic || 'https://picsum.photos/seed/driver/100/100'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <p className="text-[10px] font-bold truncate">{driver.name}</p>
                  <div className="flex items-center justify-center gap-1 text-amber-500 text-[8px] font-bold mt-1">
                    <Star size={8} fill="currentColor" />
                    {driver.rating?.toFixed(1) || '4.9'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
