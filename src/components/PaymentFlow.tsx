import React, { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Use a public test key. In production, this would be an environment variable.
const stripePromise = loadStripe('pk_test_51P1m87P9V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8');

function CheckoutForm({ rideId, amount, onPaid }: { rideId: string, amount: number, onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'initial' | 'processing' | 'success'>('initial');

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (paymentMethod === 'card' && (!stripe || !elements)) {
      return;
    }

    setLoading(true);
    setStep('processing');
    setError(null);

    try {
      if (paymentMethod === 'card') {
        // 1. Create Payment Intent on the server
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rideId, amount }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const { clientSecret } = await response.json();

        // 2. Confirm the payment with Stripe
        const result = await stripe!.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements!.getElement(CardElement) as any,
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.paymentIntent.status === 'succeeded') {
          // 3. Confirm on our backend
          await fetch('/api/payments/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId: result.paymentIntent.id }),
          });
        }
      } else {
        // Simulate PayPal/Apple Pay delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Mock success
      }

      setStep('success');
      setTimeout(onPaid, 2000);
    } catch (err: any) {
      setError(err.message);
      setStep('initial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {step === 'initial' && (
        <>
          <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest mb-1">Final Fare</p>
            <p className="text-3xl font-medium font-mono">${amount.toFixed(2)}</p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono ml-1">Payment Method</p>
            <div className="grid grid-cols-3 gap-3">
              <button 
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}
              >
                <CreditCard size={20} />
                <span className="text-[10px] font-bold uppercase mt-2">Card</span>
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'paypal' ? 'bg-[#003087] text-white border-[#003087]' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}
              >
                <div className="font-black italic text-sm">PayPal</div>
                <span className="text-[10px] font-bold uppercase mt-2">PayPal</span>
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('apple')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'apple' ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}
              >
                <div className="font-bold text-sm flex items-center gap-1"> Pay</div>
                <span className="text-[10px] font-bold uppercase mt-2">Apple</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {paymentMethod === 'card' ? (
              <div className="p-4 bg-white border border-black/5 rounded-2xl">
                <CardElement 
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="p-8 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-center">
                <p className="text-sm text-zinc-500">
                  You will be redirected to {paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'} to complete your purchase.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-50 p-3 rounded-xl border border-rose-100">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || (paymentMethod === 'card' && !stripe)}
            className={`w-full py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              paymentMethod === 'paypal' ? 'bg-[#0070ba] text-white hover:bg-[#005ea6]' :
              paymentMethod === 'apple' ? 'bg-black text-white hover:bg-zinc-800' :
              'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {paymentMethod === 'paypal' ? 'Pay with PayPal' : 
                 paymentMethod === 'apple' ? 'Pay with Apple Pay' : 
                 `Pay $${amount.toFixed(2)}`}
              </>
            )}
          </button>
        </>
      )}

      {step === 'processing' && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-zinc-400 mb-4" size={40} />
          <h3 className="text-lg font-medium">Processing Payment</h3>
          <p className="text-sm text-zinc-500">Please wait while we secure your transaction...</p>
        </div>
      )}

      {step === 'success' && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle2 size={32} />
          </motion.div>
          <h3 className="text-lg font-medium">Payment Successful</h3>
          <p className="text-sm text-zinc-500">Thank you for riding with CabGo!</p>
        </div>
      )}
    </form>
  );
}

export default function PaymentFlow({ rideId, amount, onPaid }: { rideId: string, amount: number, onPaid: () => void }) {
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-8">
      <h2 className="text-xl font-medium mb-6 tracking-tight">Payment</h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm rideId={rideId} amount={amount} onPaid={onPaid} />
      </Elements>
    </div>
  );
}
