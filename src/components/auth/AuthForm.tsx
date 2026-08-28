import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: username.trim(),
            display_name: displayName.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.user && !data.session) {
        setMessage(
          t.auth.form.accountCreatedVerify
        );
      } else {
        setMessage(t.auth.form.accountCreated);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setMessage(t.auth.form.signedIn);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isSignUp && (
        <>
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              {t.auth.form.username}
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
              className="
                w-full
                rounded-xl
                bg-slate-950/70
                border border-cyan-500/20
                px-5 py-4
                text-white
                outline-none
                transition
                focus:border-cyan-400
                focus:ring-1
                focus:ring-cyan-400
              "
            />
          </div>

          <div>
            <label
              htmlFor="displayName"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              {t.auth.form.displayName}
            </label>

            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              autoComplete="name"
              className="
                w-full
                rounded-xl
                bg-slate-950/70
                border border-cyan-500/20
                px-5 py-4
                text-white
                outline-none
                transition
                focus:border-cyan-400
                focus:ring-1
                focus:ring-cyan-400
              "
            />
          </div>
        </>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.auth.form.email}
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="
            w-full
            rounded-xl
            bg-slate-950/70
            border border-cyan-500/20
            px-5 py-4
            text-white
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-1
            focus:ring-cyan-400
          "
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.auth.form.password}
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className="
            w-full
            rounded-xl
            bg-slate-950/70
            border border-cyan-500/20
            px-5 py-4
            text-white
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-1
            focus:ring-cyan-400
          "
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="text-sm text-cyan-300">
          {message}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading
          ? t.auth.form.pleaseWait
          : isSignUp
            ? t.auth.form.createAccount
            : t.auth.form.logIn}
      </Button>
    </form>
  );
}