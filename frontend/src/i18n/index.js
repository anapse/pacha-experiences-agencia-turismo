import es from './es';
import en from './en';

const translations = { es, en };

export function t(key, lang = 'es') {
  const keys = key.split('.');
  let value = translations[lang];
  for (const k of keys) {
    if (!value) return key;
    value = value[k];
  }
  return value || key;
}

export const LANGS = [
  { code: 'es', label: 'Español', flag: '🇵🇪' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

export default translations;
