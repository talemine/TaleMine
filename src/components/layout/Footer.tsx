import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800 py-10 text-center">
      <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
        <Link to="/privacy-policy" className="transition hover:text-cyan-400">
          Privacy Policy
        </Link>

        <span className="text-gray-700">•</span>

        <Link to="/terms" className="transition hover:text-cyan-400">
          Terms of Service
        </Link>
      </nav>

      <p className="mt-4">{t.footer.copyright}</p>
    </footer>
  );
}
