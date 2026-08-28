import { useLanguage } from "../../i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800 py-10 text-center">
      <p>{t.footer.copyright}</p>
    </footer>
  );
}