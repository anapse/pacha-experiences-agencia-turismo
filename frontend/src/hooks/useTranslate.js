import { useI18n } from '../contexts/I18nContext';
import { t } from '../i18n';

/**
 * Hook que devuelve una función t() para traducir textos.
 * Uso: const { t } = useTranslate(); t('home.hero_title')
 */
export function useTranslate() {
  const { lang } = useI18n();
  return {
    t: (key) => t(key, lang),
    lang,
  };
}
