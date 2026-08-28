import BackToTop from "./components/ui/BackToTop";
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./components/auth/AuthProvider";
import { LanguageProvider } from "./i18n/LanguageContext";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppRouter />
        <BackToTop />
      </LanguageProvider>
    </AuthProvider>
  );
}