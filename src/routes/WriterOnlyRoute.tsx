import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../components/auth/AuthProvider";
import { supabase } from "../services/supabase";

export default function WriterOnlyRoute() {
  const { session, loading: authLoading } = useAuth();

  const [isWriter, setIsWriter] = useState<boolean | null>(
    null
  );

  const userId = session?.user.id;

  useEffect(() => {
    let cancelled = false;

    async function checkWriterProfile() {
      if (!userId) {
        setIsWriter(false);
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
        console.error(
          "Writer access check error:",
          error
        );

        setIsWriter(false);
        return;
      }

      setIsWriter(Boolean(data));
    }

    if (!authLoading && session) {
      checkWriterProfile();
    } else if (!authLoading && !session) {
      setIsWriter(false);
    }

    return () => {
      cancelled = true;
    };
  }, [authLoading, session, userId]);

  // Authentication is still being resolved.
  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          Checking authentication...
        </p>
      </main>
    );
  }

  // User is not authenticated.
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Authentication is complete, but writer access
  // is still being checked.
  if (isWriter === null) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          Checking writer access...
        </p>
      </main>
    );
  }

  // Authenticated user is not a writer.
  if (!isWriter) {
    return <Navigate to="/account" replace />;
  }

  // Authenticated writer.
  return <Outlet />;
}