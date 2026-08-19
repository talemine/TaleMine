import AvatarUpload from "../../components/profile/AvatarUpload";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileForm from "../../components/profile/ProfileForm";
import { useAuth } from "../../components/auth/AuthProvider";
import Button from "../../components/ui/Button";
import { supabase } from "../../services/supabase";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function Account() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    navigate("/login");
  }

  useEffect(() => {
    if (!session?.user.id) {
      setProfileLoading(false);
      return;
    }

    async function loadProfile() {
      setProfileLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, bio, avatar_url, created_at, updated_at"
        )
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Profile loading error:", error);
        setErrorMessage("Unable to load your profile.");
        setProfileLoading(false);
        return;
      }

      setProfile(data);
      setProfileLoading(false);
    }

    loadProfile();
  }, [session]);

  if (authLoading || profileLoading) {
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

          {errorMessage && (
            <p className="mt-6 text-red-400">
              {errorMessage}
            </p>
          )}

          {profile && (
            <>
              <div className="mt-8 space-y-6 border-t border-slate-800 pt-6">
                <div>
                  <p className="text-sm text-gray-400">
                    Display Name
                  </p>

                  <p className="mt-1 text-xl font-semibold text-white">
                    {profile.display_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Username
                  </p>

                  <p className="mt-1 text-cyan-400">
                    @{profile.username}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Bio
                  </p>

                  <p className="mt-1 text-gray-300">
                    {profile.bio || "No bio added yet."}
                  </p>
                </div>
              </div>

              <AvatarUpload
                userId={profile.id}
                currentAvatarUrl={profile.avatar_url}
                onUploaded={(avatarUrl) => {
                  setProfile((currentProfile) =>
                    currentProfile
                      ? {
                          ...currentProfile,
                          avatar_url: avatarUrl,
                        }
                      : currentProfile
                  );
                }}
              />

              <ProfileForm
                profileId={profile.id}
                initialUsername={profile.username}
                initialDisplayName={profile.display_name}
                initialBio={profile.bio}
                onSaved={(updatedProfile) => {
                  setProfile((currentProfile) =>
                    currentProfile
                      ? {
                          ...currentProfile,
                          ...updatedProfile,
                        }
                      : currentProfile
                  );
                }}
              />
            </>
          )}

          <div className="mt-8 flex gap-4 flex-wrap">
            <Button onClick={() => navigate("/")}>
              Back to TaleMine
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}