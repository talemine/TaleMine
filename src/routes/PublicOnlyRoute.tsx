import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../components/auth/AuthProvider";

export default function PublicOnlyRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">Loading...</p>
      </main>
    );
  }

  return session ? <Navigate to="/account" replace /> : <Outlet />;
}