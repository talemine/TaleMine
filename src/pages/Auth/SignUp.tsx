import { Link } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm";
import { useLanguage } from "../../i18n/LanguageContext";

export default function SignUp() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">
            {t.auth.createAccount}
          </h1>

          <p className="mt-4 text-gray-300">
            {t.auth.signupDescription}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 md:p-8">
          <AuthForm mode="signup" />
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          {t.auth.alreadyHaveAccount}{" "}
          <Link
            to="/login"
            className="text-cyan-400 transition hover:text-cyan-300"
          >
            {t.auth.login}
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link
            to="/"
            className="transition hover:text-cyan-400"
          >
            ← {t.auth.backToTaleMine}
          </Link>
        </p>
      </div>
    </main>
  );
}