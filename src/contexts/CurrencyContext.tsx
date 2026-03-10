import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  exchangeRates: Record<Currency, number>;
}

const exchangeRates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 82.5,
  JPY: 150.2,
};

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('cabgo_currency');
    return (saved as Currency) || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('cabgo_currency', currency);
  }, [currency]);

  const formatPrice = (price: number) => {
    const converted = price * exchangeRates[currency];
    return `${currencySymbols[currency]}${converted.toLocaleString(undefined, {
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, exchangeRates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
