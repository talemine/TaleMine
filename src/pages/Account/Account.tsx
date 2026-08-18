import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/auth/AuthProvider";
import Button from "../../components/ui/Button";

export default function Account() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    navigate("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">Loading your account...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-4xl font-bold">
            Please Log In
          </h1>

          <p className="mt-4 text-gray-300">
            You need to be signed in to view your account.
          </p>

          <div className="mt-8 flex justify-center">
            <Button onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-8">
          <h1 className="text-4xl font-bold">
            Welcome to TaleMine
          </h1>

          <p className="mt-4 text-gray-300">
            You are signed in as:
          </p>

          <p className="mt-2 text-cyan-400 break-all">
            {session.user.email}
          </p>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Button onClick={() => navigate("/")}>
              Back to TaleMine
            </Button>

            <Button variant="outline" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}