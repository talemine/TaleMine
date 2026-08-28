import en from "./en";
import hi from "./hi";

export const languages = {
  en,
  hi,
};

export type LanguageCode = keyof typeof languages;

export function getTranslations(language: LanguageCode) {
  return languages[language];
}