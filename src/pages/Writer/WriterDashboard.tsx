import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StoryForm from "../../components/story/StoryForm";
import { useAuth } from "../../components/auth/AuthProvider";
import Button from "../../components/ui/Button";
import { supabase } from "../../services/supabase";

interface WriterProfile {
  profile_id: string;
  pen_name: string | null;
  author_bio: string | null;
  website_url: string | null;
}

interface Story {
  id: string;
  writer_profile_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function WriterDashboard() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const userId = session?.user.id;

  const [writerProfile, setWriterProfile] =
    useState<WriterProfile | null>(null);

  const [stories, setStories] = useState<Story[]>([]);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWriterDashboard() {
      if (!userId) {
        setWriterProfile(null);
        setStories([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const [writerResult, storiesResult] = await Promise.all([
          supabase
            .from("writer_profiles")
            .select(
              "profile_id, pen_name, author_bio, website_url"
            )
            .eq("profile_id", userId)
            .maybeSingle(),

          supabase
            .from("stories")
            .select(
              "id, writer_profile_id, category_id, title, slug, excerpt, cover_image_url, status, published_at, created_at, updated_at"
            )
            .eq("writer_profile_id", userId)
            .order("created_at", {
              ascending: false,
            }),
        ]);

        if (cancelled) {
          return;
        }

        if (writerResult.error) {
          console.error(
            "Writer profile loading error:",
            writerResult.error
          );

          setWriterProfile(null);
          setErrorMessage(
            "Unable to load your writer profile."
          );
        } else {
          setWriterProfile(writerResult.data ?? null);
        }

        if (storiesResult.error) {
          console.error(
            "Stories loading error:",
            storiesResult.error
          );

          setStories([]);
          setErrorMessage(
            "Unable to load your stories."
          );
        } else {
          setStories(storiesResult.data ?? []);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Writer dashboard loading error:",
          error
        );

        setWriterProfile(null);
        setStories([]);
        setErrorMessage(
          "Unable to load your writer dashboard."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWriterDashboard();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          Loading your writer dashboard...
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
            You need to be signed in to access the writer dashboard.
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

  if (!writerProfile) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-4xl font-bold">
            Become a Writer
          </h1>

          <p className="mt-4 text-gray-300">
            You need a writer profile before you can access the writer dashboard.
          </p>

          <div className="mt-8 flex justify-center">
            <Button onClick={() => navigate("/account")}>
              Go to Account
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-8">
          {/* Dashboard Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Writer Dashboard
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                {writerProfile.pen_name ||
                  "Your Writer Profile"}
              </h1>

              <p className="mt-3 max-w-2xl text-gray-300">
                {writerProfile.author_bio ||
                  "Your stories will appear here."}
              </p>

              {writerProfile.website_url && (
                <a
                  href={writerProfile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-cyan-400 transition hover:text-cyan-300"
                >
                  Visit Website
                </a>
              )}
            </div>

            <Button onClick={() => navigate("/account")}>
              Account
            </Button>
          </div>

          {errorMessage && (
            <p className="mt-6 text-sm text-red-400">
              {errorMessage}
            </p>
          )}

          {/* Create Story */}
          <div className="mt-8">
            <Button
              onClick={() =>
                setShowStoryForm((current) => !current)
              }
            >
              {showStoryForm
                ? "Cancel"
                : "Create Story"}
            </Button>

            {showStoryForm && (
              <StoryForm
                writerProfileId={writerProfile.profile_id}
                onCreated={(createdStory) => {
                  setStories((currentStories) => [
                    createdStory,
                    ...currentStories,
                  ]);

                  setShowStoryForm(false);
                }}
              />
            )}
          </div>

          {/* Stories */}
          <section className="mt-10 border-t border-slate-800 pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Stories
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  My Stories
                </h2>
              </div>

              <span className="w-fit rounded-full border border-cyan-500/20 px-4 py-2 text-sm text-cyan-300">
                {stories.length}{" "}
                {stories.length === 1
                  ? "story"
                  : "stories"}
              </span>
            </div>

            {stories.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
                <h3 className="text-xl font-semibold">
                  No stories yet
                </h3>

                <p className="mt-3 text-gray-400">
                  Your first story will appear here once you create it.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {stories.map((story) => (
                  <article
                    key={story.id}
                    onClick={() =>
                      navigate(`/writer/stories/${story.id}`)
                    }
                    className="
                      cursor-pointer
                      rounded-2xl
                      border
                      border-slate-800
                      bg-slate-950/50
                      p-6
                      transition
                      hover:border-cyan-500/40
                      hover:bg-slate-900
                    "
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {story.title}
                        </h3>

                        {story.excerpt && (
                          <p className="mt-2 text-gray-400">
                            {story.excerpt}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-gray-500">
                          /{story.slug}
                        </p>
                      </div>

                      <span className="w-fit rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
                        {story.status}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}