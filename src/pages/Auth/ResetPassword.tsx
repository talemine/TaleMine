import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import Button from "../../components/ui/Button";
import { supabase } from "../../services/supabase";
import { useLanguage } from "../../i18n/LanguageContext";

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const [recoverySession, setRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoverySession(true);
        setCheckingRecovery(false);
      } else if (event === "SIGNED_OUT") {
        setRecoverySession(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      if (data.session) {
        setRecoverySession(true);
      }
      setCheckingRecovery(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");

    if (!recoverySession) {
      setErrorMessage(t.auth.invalidResetLink);
      return;
    }

    if (password.length < 8) {
      setErrorMessage(t.auth.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t.auth.passwordMismatch);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setErrorMessage(error.message || t.auth.unableToResetPassword);
      setLoading(false);
      return;
    }

    setMessage(t.auth.passwordUpdated);
    await supabase.auth.signOut();
    setLoading(false);
    navigate("/login", { replace: true });
  }

  if (checkingRecovery) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-md text-center">
          <p className="text-gray-300">{t.auth.form.pleaseWait}</p>
        </div>
      </main>
    );
  }

  if (!recoverySession) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold">{t.auth.resetPasswordTitle}</h1>
          <p className="mt-4 text-red-400">{t.auth.invalidResetLink}</p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-block text-cyan-400 transition hover:text-cyan-300"
          >
            {t.auth.forgotPasswordTitle}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">{t.auth.resetPasswordTitle}</h1>
          <p className="mt-4 text-gray-300">{t.auth.resetPasswordDescription}</p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                {t.auth.newPassword}
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-xl bg-slate-950/70 border border-cyan-500/20 px-5 py-4 pr-14 text-white outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword
                      ? t.auth.hidePassword
                      : t.auth.showPassword
                  }
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 transition hover:text-cyan-400"
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-xl bg-slate-950/70 border border-cyan-500/20 px-5 py-4 pr-14 text-white outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? t.auth.hidePassword
                      : t.auth.showPassword
                  }
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 transition hover:text-cyan-400"
                >
                  {showConfirmPassword ? (
                    <HiOutlineEyeSlash className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {passwordsMatch && (
                <p className="mt-2 text-sm text-emerald-400">
                  ✓ {t.auth.passwordsMatch}
                </p>
              )}

              {passwordsMismatch && (
                <p className="mt-2 text-sm text-red-400">
                  {t.auth.passwordMismatch}
                </p>
              )}
            </div>


            {errorMessage && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}

            {message && (
              <p className="text-sm text-cyan-300">{message}</p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? t.auth.form.pleaseWait : t.auth.updatePassword}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
