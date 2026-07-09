/**
 * Tasas de cambio simuladas (mock).
 * En producción, reemplazar con llamada a API tipo exchangerate-api.com
 */
const MOCK_RATES = {
  PEN: 1,
  USD: 0.27,  // 1 PEN ≈ 0.27 USD
  EUR: 0.25,
};

let cachedRates = { ...MOCK_RATES, _updated: Date.now() };

export const CURRENCIES = [
  { code: 'PEN', symbol: 'S/', label: 'Sol Peruano', flag: '🇵🇪', locale: 'es-PE' },
  { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro', flag: '🇪🇺', locale: 'de-DE' },
];

/**
 * Convierte un precio de PEN a otra moneda.
 * @param {number} priceInPEN - Precio en Soles
 * @param {string} targetCurrency - Código de moneda destino
 * @returns {number} Precio convertido
 */
export function convertPrice(priceInPEN, targetCurrency = 'PEN') {
  if (!priceInPEN && priceInPEN !== 0) return null;
  if (targetCurrency === 'PEN') return priceInPEN;
  const rate = cachedRates[targetCurrency];
  if (!rate) return priceInPEN;
  return Math.round(priceInPEN * rate * 100) / 100;
}

/**
 * Formatea un precio según moneda y locale.
 */
export function formatPrice(priceInPEN, currencyCode = 'PEN', locale = 'es-PE') {
  const converted = convertPrice(priceInPEN, currencyCode);
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(converted);
  } catch {
    return `${currency.symbol}${converted}`;
  }
}

/**
 * Actualiza tasas desde API externa.
 * Arquitectura preparada para conectar cualquier proveedor.
 */
export async function refreshRates() {
  try {
    // TODO: Conectar API real ej. exchangerate-api.com
    // const res = await fetch('https://api.exchangerate-api.com/v4/latest/PEN');
    // const data = await res.json();
    // cachedRates = { ...data.rates, _updated: Date.now() };

    // Por ahora, mantener tasas mock
    cachedRates = { ...MOCK_RATES, _updated: Date.now() };
    return cachedRates;
  } catch {
    // Si falla, mantener última tasa disponible (graceful degradation)
    console.warn('Currency API unavailable, using cached rates');
    return cachedRates;
  }
}
