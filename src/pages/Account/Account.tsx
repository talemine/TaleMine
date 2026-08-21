import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AvatarUpload from "../../components/profile/AvatarUpload";
import ProfileForm from "../../components/profile/ProfileForm";
import WriterProfileForm from "../../components/profile/WriterProfileForm";
import Notifications from "../../components/notifications/Notifications";
import MyBookmarks from "../../components/story/MyBookmarks";
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

interface WriterProfile {
  profile_id: string;
  pen_name: string | null;
  author_bio: string | null;
  website_url: string | null;
}

export default function Account() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const userId = session?.user.id;

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [writerProfile, setWriterProfile] =
    useState<WriterProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setErrorMessage(
        "Unable to log out. Please try again."
      );
      return;
    }

    navigate("/login");
  }

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      if (!userId) {
        setProfile(null);
        setWriterProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const [
          profileResult,
          writerResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, username, display_name, bio, avatar_url, created_at, updated_at"
            )
            .eq("id", userId)
            .single(),

          supabase
            .from("writer_profiles")
            .select(
              "profile_id, pen_name, author_bio, website_url"
            )
            .eq("profile_id", userId)
            .maybeSingle(),
        ]);

        if (cancelled) {
          return;
        }

        if (profileResult.error) {
          console.error(
            "Profile loading error:",
            profileResult.error
          );

          setProfile(null);
          setWriterProfile(null);
          setErrorMessage(
            "Unable to load your profile."
          );
          return;
        }

        if (writerResult.error) {
          console.error(
            "Writer profile loading error:",
            writerResult.error
          );

          setWriterProfile(null);
          setErrorMessage(
            "Your profile loaded, but your writer profile could not be loaded."
          );
        } else {
          setWriterProfile(
            writerResult.data ?? null
          );
        }

        setProfile(profileResult.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Account loading error:",
          error
        );

        setProfile(null);
        setWriterProfile(null);
        setErrorMessage(
          "Unable to load your account. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          Loading your account...
        </p>
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
            <Button
              onClick={() => navigate("/login")}
            >
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

          <p className="mt-2 break-all text-cyan-400">
            {session.user.email}
          </p>

          {errorMessage && (
            <p className="mt-6 text-sm text-red-400">
              {errorMessage}
            </p>
          )}

          {profile && (
            <>
              {/* Profile summary */}
              <section className="mt-8 space-y-6 border-t border-slate-800 pt-6">
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
                    {profile.bio ||
                      "No bio added yet."}
                  </p>
                </div>
              </section>

              {/* Avatar */}
              <AvatarUpload
                userId={profile.id}
                currentAvatarUrl={
                  profile.avatar_url
                }
                onUploaded={(avatarUrl) => {
                  setProfile(
                    (currentProfile) =>
                      currentProfile
                        ? {
                            ...currentProfile,
                            avatar_url: avatarUrl,
                          }
                        : currentProfile
                  );
                }}
              />

              {/* Profile editing */}
              <ProfileForm
                profileId={profile.id}
                initialUsername={
                  profile.username
                }
                initialDisplayName={
                  profile.display_name
                }
                initialBio={profile.bio}
                onSaved={(updatedProfile) => {
                  setProfile(
                    (currentProfile) =>
                      currentProfile
                        ? {
                            ...currentProfile,
                            ...updatedProfile,
                          }
                        : currentProfile
                  );
                }}
              />

              {/* Writer profile */}
              {writerProfile ? (
                <section className="mt-8 border-t border-slate-800 pt-8">
                  <p className="text-sm text-gray-400">
                    Writer Profile
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {writerProfile.pen_name ||
                      profile.display_name}
                  </h2>

                  <p className="mt-2 text-gray-300">
                    {writerProfile.author_bio ||
                      "No author bio added yet."}
                  </p>

                  {writerProfile.website_url && (
                    <a
                      href={
                        writerProfile.website_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-cyan-400 transition hover:text-cyan-300"
                    >
                      Visit Website
                    </a>
                  )}
                </section>
              ) : (
                <WriterProfileForm
                  profileId={profile.id}
                  onCreated={(
                    createdWriterProfile
                  ) => {
                    setWriterProfile(
                      createdWriterProfile
                    );
                  }}
                />
              )}

              {/* My Bookmarks */}
              <MyBookmarks />
            </>
          )}
         
          {/* Notifications */}
          <div className="mt-8">
            <Notifications />
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
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