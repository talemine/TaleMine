import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";

interface PublicStory {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category_id: string | null;
  published_at: string | null;
}

interface Category {
  id: string;
  name: string;
}

export default function PublicStoryList() {
  const navigate = useNavigate();

  const [stories, setStories] = useState<PublicStory[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPublishedStories() {
      setLoading(true);
      setErrorMessage("");

      try {
        const { data: storyData, error: storyError } =
          await supabase
            .from("stories")
            .select(
              "id, title, slug, excerpt, category_id, published_at"
            )
            .eq("status", "published")
            .order("published_at", {
              ascending: false,
            });

        if (cancelled) {
          return;
        }

        if (storyError) {
          console.error(
            "Published stories loading error:",
            storyError
          );

          setStories([]);
          setCategories([]);
          setErrorMessage(
            "Unable to load published stories."
          );
          return;
        }

        const loadedStories = storyData ?? [];

        setStories(loadedStories);

        const categoryIds = Array.from(
          new Set(
            loadedStories
              .map((story) => story.category_id)
              .filter(
                (id): id is string => Boolean(id)
              )
          )
        );

        if (categoryIds.length === 0) {
          setCategories([]);
          return;
        }

        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", categoryIds);

        if (cancelled) {
          return;
        }

        if (categoryError) {
          console.error(
            "Story categories loading error:",
            categoryError
          );

          setCategories([]);
        } else {
          setCategories(categoryData ?? []);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Public story list loading error:",
          error
        );

        setStories([]);
        setCategories([]);
        setErrorMessage(
          "Unable to load published stories."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPublishedStories();

    return () => {
      cancelled = true;
    };
  }, []);

  function getCategoryName(
    categoryId: string | null
  ) {
    if (!categoryId) {
      return null;
    }

    return (
      categories.find(
        (category) => category.id === categoryId
      )?.name ?? null
    );
  }

  if (loading) {
    return (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
            <p className="text-gray-400">
              Loading stories...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-500/20 bg-slate-950/50 p-8 text-center">
            <p className="text-red-400">
              {errorMessage}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Discover
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            Published Stories
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Explore stories currently available to read
            on TaleMine.
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
            <h3 className="text-xl font-semibold">
              No published stories yet
            </h3>

            <p className="mt-3 text-gray-400">
              Check back soon for new stories.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {stories.map((story) => {
              const categoryName =
                getCategoryName(
                  story.category_id
                );

              return (
                <article
                  key={story.id}
                  className="
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-950/50
                    p-6
                    transition
                    duration-200
                    hover:border-cyan-500/40
                  "
                >
                  <div className="flex flex-wrap gap-3">
                    {categoryName && (
                      <span className="rounded-full border border-cyan-500/20 px-3 py-1 text-xs uppercase tracking-wide text-cyan-300">
                        {categoryName}
                      </span>
                    )}

                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
                      Published
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold text-white">
                    {story.title}
                  </h3>

                  {story.excerpt && (
                    <p className="mt-3 leading-7 text-gray-400">
                      {story.excerpt}
                    </p>
                  )}

                  {story.published_at && (
                    <p className="mt-4 text-sm text-gray-500">
                      Published{" "}
                      {new Date(
                        story.published_at
                      ).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/story/${story.slug}`
                        )
                      }
                      className="
                        rounded-full
                        bg-cyan-500
                        px-5
                        py-3
                        font-medium
                        text-slate-950
                        transition
                        hover:bg-cyan-400
                      "
                    >
                      Read Story
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}