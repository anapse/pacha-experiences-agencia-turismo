import { createContext, useContext, useState, useEffect } from 'react';
import { CURRENCIES, refreshRates } from '../utils/currency';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'PEN');
  const [rates, setRates] = useState(null);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    refreshRates().then(setRates);
  }, []);

  const current = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, current, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
