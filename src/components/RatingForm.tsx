import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function RatingForm({ rideId, onComplete }: { rideId: string, onComplete: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await fetch('/api/rides/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId, rating, review })
      });
      onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-8">
      <h2 className="text-xl font-medium mb-2 tracking-tight">Rate your driver</h2>
      <p className="text-zinc-500 text-sm mb-8">How was your trip with Michael?</p>
      
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
            className="transition-transform active:scale-90"
          >
            <Star 
              size={40} 
              className={`transition-colors ${
                (hover || rating) >= star 
                  ? 'text-amber-400 fill-amber-400' 
                  : 'text-zinc-200'
              }`} 
            />
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Leave a review (optional)"
          className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[120px] resize-none"
        />

        <button 
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full py-4 bg-black text-white rounded-2xl font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
