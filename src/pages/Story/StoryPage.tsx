import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/ui/Button";
import PublicChapterList from "../../components/story/PublicChapterList";
import { supabase } from "../../services/supabase";

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
}

interface WriterProfile {
  profile_id: string;
  pen_name: string | null;
}

interface Profile {
  id: string;
  display_name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function StoryPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [story, setStory] = useState<Story | null>(null);
  const [writerProfile, setWriterProfile] =
    useState<WriterProfile | null>(null);
  const [profile, setProfile] =
    useState<Profile | null>(null);
  const [category, setCategory] =
    useState<Category | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPublishedStory() {
      if (!slug) {
        setStory(null);
        setWriterProfile(null);
        setProfile(null);
        setCategory(null);
        setLoading(false);
        setErrorMessage("Story not found.");
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: storyData,
          error: storyError,
        } = await supabase
          .from("stories")
          .select(
            "id, writer_profile_id, category_id, title, slug, excerpt, cover_image_url, status, published_at"
          )
          .eq("slug", slug)
          .eq("status", "published")
          .single();

        if (cancelled) {
          return;
        }

        if (storyError) {
          console.error(
            "Published story loading error:",
            storyError
          );

          setStory(null);
          setWriterProfile(null);
          setProfile(null);
          setCategory(null);
          setErrorMessage(
            "This story could not be found."
          );
          setLoading(false);
          return;
        }

        setStory(storyData);

        const writerPromise = supabase
          .from("writer_profiles")
          .select("profile_id, pen_name")
          .eq(
            "profile_id",
            storyData.writer_profile_id
          )
          .maybeSingle();

        const profilePromise = supabase
          .from("profiles")
          .select("id, display_name")
          .eq(
            "id",
            storyData.writer_profile_id
          )
          .maybeSingle();

        const categoryPromise =
          storyData.category_id
            ? supabase
                .from("categories")
                .select("id, name")
                .eq(
                  "id",
                  storyData.category_id
                )
                .maybeSingle()
            : Promise.resolve({
                data: null,
                error: null,
              });

        const [
          writerResult,
          profileResult,
          categoryResult,
        ] = await Promise.all([
          writerPromise,
          profilePromise,
          categoryPromise,
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
        } else {
          setWriterProfile(
            writerResult.data ?? null
          );
        }

        if (profileResult.error) {
          console.error(
            "Profile loading error:",
            profileResult.error
          );

          setProfile(null);
        } else {
          setProfile(
            profileResult.data ?? null
          );
        }

        if (categoryResult.error) {
          console.error(
            "Category loading error:",
            categoryResult.error
          );

          setCategory(null);
        } else {
          setCategory(
            categoryResult.data ?? null
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Published story page error:",
          error
        );

        setStory(null);
        setWriterProfile(null);
        setProfile(null);
        setCategory(null);
        setErrorMessage(
          "Unable to load this story."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPublishedStory();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  function getAuthorName() {
    return (
      writerProfile?.pen_name?.trim() ||
      profile?.display_name?.trim() ||
      "TaleMine Writer"
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          Loading story...
        </p>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold">
            Story Not Found
          </h1>

          <p className="mt-4 text-gray-300">
            {errorMessage ||
              "This story is not available."}
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => navigate("/")}
            >
              Back to TaleMine
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <article className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/60">
          {/* Cover */}
          {story.cover_image_url && (
            <div className="max-h-[520px] overflow-hidden border-b border-slate-800">
              <img
                src={story.cover_image_url}
                alt={`${story.title} cover`}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Story Header */}
            <div>
              <div className="flex flex-wrap gap-3">
                {category && (
                  <span className="rounded-full border border-cyan-500/20 px-3 py-1 text-xs uppercase tracking-wide text-cyan-300">
                    {category.name}
                  </span>
                )}

                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
                  Published
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold md:text-6xl">
                {story.title}
              </h1>

              {story.excerpt && (
                <p className="mt-6 text-xl leading-8 text-gray-300">
                  {story.excerpt}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                <span>
                  By{" "}
                  <span className="text-cyan-400">
                    {getAuthorName()}
                  </span>
                </span>

                {story.published_at && (
                  <>
                    <span>•</span>

                    <span>
                      Published{" "}
                      {new Date(
                        story.published_at
                      ).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Chapters */}
            <section className="mt-12 border-t border-slate-800 pt-10">
              <p className="text-sm text-gray-400">
                Story
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Chapters
              </h2>

              <PublicChapterList
                storyId={story.id}
                storySlug={story.slug}
              />
            </section>

            <div className="mt-10">
              <Button
                onClick={() => navigate("/")}
              >
                Back to TaleMine
              </Button>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}