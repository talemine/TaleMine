import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../components/auth/AuthProvider";
import { supabase } from "../services/supabase";

export default function WriterOnlyRoute() {
  const { session, loading: authLoading } = useAuth();

  const [isWriter, setIsWriter] = useState<boolean | null>(null);

  const userId = session?.user.id;

  useEffect(() => {
    let cancelled = false;

    async function checkWriterProfile() {
      if (!userId) {
        setIsWriter(null);
        return;
      }

      setIsWriter(null);

      const { data, error } = await supabase
        .from("writer_profiles")
        .select("profile_id")
        .eq("profile_id", userId)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error("Writer access check error:", error);
        setIsWriter(false);
        return;
      }

      setIsWriter(Boolean(data));
    }

    checkWriterProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (authLoading || isWriter === null) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          Checking writer access...
        </p>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isWriter) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}