import BackToTop from "./components/ui/BackToTop";
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./components/auth/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <BackToTop />
    </AuthProvider>
  );
}