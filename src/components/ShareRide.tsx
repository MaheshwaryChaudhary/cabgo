import React, { useState, useEffect } from 'react';
import { Loader2, MapPin, Car, Star, Clock } from 'lucide-react';
import Map from './Map';
import { motion } from 'motion/react';

interface ShareRideProps {
  rideId: string;
}

const ShareRide: React.FC<ShareRideProps> = ({ rideId }) => {
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await fetch(`/api/rides/share/${rideId}`);
        if (!res.ok) throw new Error('Ride not found');
        const data = await res.json();
        setRide(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
    const interval = setInterval(fetchRide, 10000); // Poll for updates
    return () => clearInterval(interval);
  }, [rideId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
          <Car size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Ride Not Found</h1>
        <p className="text-zinc-500 max-w-xs">This ride link may have expired or is invalid.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-8 px-6 py-3 bg-black text-white rounded-xl font-medium"
        >
          Go to CabGo
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'completed': return 'bg-zinc-50 text-zinc-700 border-zinc-100';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Driver is on the way';
      case 'in_progress': return 'Trip in progress';
      case 'completed': return 'Trip completed';
      case 'cancelled': return 'Trip cancelled';
      default: return 'Finding driver';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-black/5 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Car size={18} className="text-white" />
          </div>
          <span className="font-bold tracking-tight">CabGo Live</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(ride.status)}`}>
          {getStatusText(ride.status)}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="lg:w-96 bg-white border-r border-black/5 p-6 overflow-y-auto order-2 lg:order-1">
          <div className="space-y-8">
            {/* Driver Info */}
            {ride.driver_name && (
              <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-black/5">
                  <img 
                    src={ride.driver_image || `https://picsum.photos/seed/${ride.driver_id}/200`} 
                    alt="Driver" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{ride.driver_name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                    <span className="font-medium">{ride.car_model || 'Toyota Camry'}</span>
                    <span className="text-orange-500 font-bold flex items-center gap-0.5">
                      <Star size={10} fill="currentColor" />
                      {ride.driver_rating?.toFixed(1) || '4.9'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Trip Details */}
            <div className="space-y-6">
              <div className="relative pl-6 space-y-8">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-zinc-100" />
                
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Pickup</p>
                  <p className="text-sm font-medium leading-tight">{ride.pickup_address}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-black border-2 border-white shadow-sm" />
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Drop-off</p>
                  <p className="text-sm font-medium leading-tight">{ride.dropoff_address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Clock size={12} />
                    <span className="text-[10px] uppercase tracking-widest font-mono">Started</span>
                  </div>
                  <p className="text-sm font-bold">
                    {new Date(ride.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-400 mb-1">
                    <Car size={12} />
                    <span className="text-[10px] uppercase tracking-widest font-mono">Type</span>
                  </div>
                  <p className="text-sm font-bold capitalize">{ride.type}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/5">
              <p className="text-xs text-zinc-400 text-center">
                Sharing live location for safety and coordination.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 relative order-1 lg:order-2 h-[40vh] lg:h-auto">
          <Map 
            pickup={{ lat: ride.pickup_lat, lng: ride.pickup_lng }}
            dropoff={{ lat: ride.dropoff_lat, lng: ride.dropoff_lng }}
            showRoute={true}
          />
        </div>
      </main>
    </div>
  );
};

export default ShareRide;
