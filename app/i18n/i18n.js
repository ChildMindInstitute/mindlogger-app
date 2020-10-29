/* MODULES */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/* CUSTOM MODULES */
import fr from './translations/fr.json';
import en from './translations/en.json';

i18n
  .use(initReactI18next) // bind react-i18next to the instance
  .init({
    lng: 'en',
    fallbackLng: 'fr',
    resources: {
      fr,
      en,
    },
    debug: false,
    react: {
      wait: true,
    },
  });

/**
 * Set language
 *
 * @param {_t_languageChoice} lang - language to set
 */
export function setApplicationLanguage(lang) {
  // @Note: check that given language is one of available languages
  if (!['en', 'fr'].includes(lang)) {
    return;
  }

  // @Note: use this to change language after init
  i18n.changeLanguage(lang);
}

export default i18n;
