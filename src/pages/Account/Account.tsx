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
import { useLanguage } from "../../i18n/LanguageContext";

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

interface ReadingProgress {
  id: string;
  story_id: string;
  chapter_id: string;
  last_read_at: string;
  story_title: string;
  story_slug: string;
  chapter_number: number;
  chapter_title: string | null;
}

export default function Account() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const userId = session?.user.id;

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [writerProfile, setWriterProfile] =
    useState<WriterProfile | null>(null);

  const [readingProgress, setReadingProgress] =
    useState<ReadingProgress | null>(null);

  const [recentlyRead, setRecentlyRead] =
    useState<ReadingProgress[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut();

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
        setReadingProgress(null);
        setRecentlyRead([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        /*
         * Load profile and writer profile.
         */
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
          setReadingProgress(null);
          setRecentlyRead([]);
          setErrorMessage(
            "Unable to load your profile."
          );
          setLoading(false);
          return;
        }

        setProfile(profileResult.data);

        if (writerResult.error) {
          console.error(
            "Writer profile loading error:",
            writerResult.error
          );

          setWriterProfile(null);
        } else {
          setWriterProfile(
            writerResult.data ?? null
          );
        }

        /*
         * Load the five most recently read stories.
         *
         * There is one reading_progress row per
         * user/story, so updated_at determines
         * the reading order.
         */
        const {
          data: progressData,
          error: progressError,
        } = await supabase
          .from("reading_progress")
          .select(
            "id, story_id, chapter_id, last_read_at, updated_at"
          )
          .eq("user_id", userId)
          .order("updated_at", {
            ascending: false,
          })
          .limit(5);

        if (cancelled) {
          return;
        }

        if (progressError) {
          console.error(
            "Reading progress loading error:",
            progressError
          );

          setReadingProgress(null);
          setRecentlyRead([]);
        } else if (
          progressData &&
          progressData.length > 0
        ) {
          /*
           * Fetch story and chapter information
           * for each reading-progress record.
           */
          const storyIds = Array.from(
            new Set(
              progressData.map(
                (progress) => progress.story_id
              )
            )
          );

          const chapterIds = Array.from(
            new Set(
              progressData.map(
                (progress) => progress.chapter_id
              )
            )
          );

          const [
            storiesResult,
            chaptersResult,
          ] = await Promise.all([
            supabase
              .from("stories")
              .select(
                "id, title, slug"
              )
              .in("id", storyIds)
              .eq("status", "published"),

            supabase
              .from("chapters")
              .select(
                "id, chapter_number, title"
              )
              .in("id", chapterIds)
              .eq("status", "published"),
          ]);

          if (cancelled) {
            return;
          }

          if (storiesResult.error) {
            console.error(
              "Recently read stories loading error:",
              storiesResult.error
            );

            setReadingProgress(null);
            setRecentlyRead([]);
          } else if (chaptersResult.error) {
            console.error(
              "Recently read chapters loading error:",
              chaptersResult.error
            );

            setReadingProgress(null);
            setRecentlyRead([]);
          } else {
            const stories =
              storiesResult.data ?? [];

            const chapters =
              chaptersResult.data ?? [];

            const loadedProgress: ReadingProgress[] =
              [];

            for (const progress of progressData) {
              const story = stories.find(
                (item) =>
                  item.id === progress.story_id
              );

              const chapter = chapters.find(
                (item) =>
                  item.id === progress.chapter_id
              );

              if (!story || !chapter) {
                continue;
              }

              loadedProgress.push({
                id: progress.id,
                story_id: progress.story_id,
                chapter_id: progress.chapter_id,
                last_read_at:
                  progress.last_read_at,
                story_title: story.title,
                story_slug: story.slug,
                chapter_number:
                  chapter.chapter_number,
                chapter_title:
                  chapter.title,
              });
            }

            setRecentlyRead(loadedProgress);
            setReadingProgress(
              loadedProgress[0] ?? null
            );
          }
        } else {
          setReadingProgress(null);
          setRecentlyRead([]);
        }
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
        setReadingProgress(null);
        setRecentlyRead([]);
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
          {t.account.loading}
        </p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-4xl font-bold">
            {t.account.pleaseLogIn}
          </h1>

          <p className="mt-4 text-gray-300">
            {t.account.signInToView}
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() =>
                navigate("/login")
              }
            >
              {t.account.goToLogin}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-4 sm:p-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t.account.welcome}
          </h1>

          <p className="mt-4 text-gray-300">
            {t.account.signedInAs}
          </p>

          <p className="mt-2 break-all text-cyan-400">
            {session.user.email}
          </p>

          {errorMessage && (
            <p className="mt-6 text-sm text-red-400">
              {errorMessage}
            </p>
          )}

          {/* Continue Reading */}
          {readingProgress && (
            <section className="mt-8 border-t border-slate-800 pt-8">
              <p className="text-sm text-gray-400">
                {t.account.continueReading}
              </p>

              <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-slate-950/50 p-5">
                <p className="text-sm text-cyan-400">
                  {t.account.chapter}{" "}
                  {readingProgress.chapter_number}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  {readingProgress.story_title}
                </h2>

                <p className="mt-2 text-gray-300">
                  {readingProgress.chapter_title ||
                    `Chapter ${readingProgress.chapter_number}`}
                </p>

                <div className="mt-5">
                  <Button
                    onClick={() =>
                      navigate(
                        `/story/${readingProgress.story_slug}/chapter/${readingProgress.chapter_number}`
                      )
                    }
                  >
                    {t.account.continueReading}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Recently Read */}
          {recentlyRead.length > 0 && (
            <section className="mt-8 border-t border-slate-800 pt-8">
              <p className="text-sm text-gray-400">
                {t.account.readingHistory}
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {t.account.recentlyRead}
              </h2>

              <div className="mt-6 space-y-4">
                {recentlyRead.map(
                  (progress) => (
                    <article
                      key={progress.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-cyan-500/40"
                    >
                      <p className="text-sm text-cyan-400">
                        {t.account.chapter}{" "}
                        {progress.chapter_number}
                      </p>

                      <h3 className="mt-2 text-xl font-semibold">
                        {progress.story_title}
                      </h3>

                      <p className="mt-2 text-gray-300">
                        {progress.chapter_title ||
                          `Chapter ${progress.chapter_number}`}
                      </p>

                      <p className="mt-3 text-sm text-gray-500">
                        {t.account.lastRead}{" "}
                        {new Date(
                          progress.last_read_at
                        ).toLocaleDateString()}
                      </p>

                      <div className="mt-5">
                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/story/${progress.story_slug}/chapter/${progress.chapter_number}`
                            )
                          }
                        >
                          {t.account.readAgain}
                        </Button>
                      </div>
                    </article>
                  )
                )}
              </div>
            </section>
          )}

          {profile && (
            <>
              {/* Profile Summary */}
              <section className="mt-8 space-y-6 border-t border-slate-800 pt-6">
                <div>
                  <p className="text-sm text-gray-400">
                    {t.account.displayName}
                  </p>

                  <p className="mt-1 text-xl font-semibold text-white">
                    {profile.display_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    {t.account.username}
                  </p>

                  <p className="mt-1 text-cyan-400">
                    @{profile.username}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    {t.account.bio}
                  </p>

                  <p className="mt-1 text-gray-300">
                    {profile.bio ||
                      `${t.account.noBio}`}
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

              {/* Profile Editing */}
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

              {/* Writer Profile */}
              {writerProfile ? (
                <section className="mt-8 border-t border-slate-800 pt-8">
                  <p className="text-sm text-gray-400">
                    {t.account.writerProfile}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {writerProfile.pen_name ||
                      profile.display_name}
                  </h2>

                  <p className="mt-2 text-gray-300">
                    {writerProfile.author_bio ||
                      `${t.account.noAuthorBio}`}
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
                      {t.account.visitWebsite}
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
            <Button
              onClick={() => navigate("/")}
            >
              {t.account.backToTaleMine}
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
            >
              {t.account.logOut}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}