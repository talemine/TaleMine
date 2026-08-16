import { Link } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm";

export default function SignUp() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">
            Create Your TaleMine Account
          </h1>

          <p className="mt-4 text-gray-300">
            Join TaleMine and start discovering stories worth digging for.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 md:p-8">
          <AuthForm mode="signup" />
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyan-400 transition hover:text-cyan-300"
          >
            Log in
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link
            to="/"
            className="transition hover:text-cyan-400"
          >
            ← Back to TaleMine
          </Link>
        </p>
      </div>
    </main>
  );
}