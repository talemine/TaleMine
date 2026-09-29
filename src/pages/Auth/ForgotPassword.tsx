import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import { supabase } from "../../services/supabase";
import { useLanguage } from "../../i18n/LanguageContext";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setSent(false);
    setErrorMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setErrorMessage(t.auth.unableToResetPassword);
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">
            {t.auth.forgotPasswordTitle}
          </h1>
          <p className="mt-4 text-gray-300">
            {t.auth.forgotPasswordDescription}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="forgot-password-email"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                {t.auth.form.email}
              </label>
              <input
                id="forgot-password-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl bg-slate-950/70 border border-cyan-500/20 px-5 py-4 text-white outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}

            {sent && (
              <p className="text-sm text-cyan-300">{t.auth.resetLinkSent}</p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? t.auth.form.pleaseWait : t.auth.sendResetLink}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          <Link
            to="/login"
            className="text-cyan-400 transition hover:text-cyan-300"
          >
            {t.auth.backToLogin}
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/" className="transition hover:text-cyan-400">
            {t.auth.backToTaleMine}
          </Link>
        </p>
      </div>
    </main>
  );
}
