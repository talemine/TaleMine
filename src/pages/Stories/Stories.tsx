import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import { useAuth } from "../../components/auth/AuthProvider";
import { supabase } from "../../services/supabase";

interface Story {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  writer_profile_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface StoryProgress {
  chapter_id: string;
  chapter_number: number;
  chapter_title: string | null;
}

interface StoryCard {
  story: Story;
  category: Category | null;
  authorName: string;
  progress: StoryProgress | null;
}

export default function Stories() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [stories, setStories] =
    useState<StoryCard[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStories() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: storyData,
          error: storyError,
        } = await supabase
          .from("stories")
          .select(
            "id, category_id, title, slug, excerpt, cover_image_url, published_at, writer_profile_id"
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
          setErrorMessage(
            "Unable to load published stories."
          );
          setLoading(false);
          return;
        }

        const rawStories = storyData ?? [];

        if (rawStories.length === 0) {
          setStories([]);
          setLoading(false);
          return;
        }

        /*
         * Load the current user's reading progress.
         *
         * Reading progress is optional, so a signed-out
         * visitor can still browse all published stories.
         */
        const progressByStory = new Map<
          string,
          StoryProgress
        >();

        if (session?.user.id) {
          const {
            data: progressData,
            error: progressError,
          } = await supabase
            .from("reading_progress")
            .select(
              "story_id, chapter_id, last_read_at, updated_at"
            )
            .eq(
              "user_id",
              session.user.id
            )
            .order("updated_at", {
              ascending: false,
            });

          if (cancelled) {
            return;
          }

          if (progressError) {
            console.error(
              "Stories reading progress loading error:",
              progressError
            );
          } else if (
            progressData &&
            progressData.length > 0
          ) {
            const chapterIds = Array.from(
              new Set(
                progressData.map(
                  (progress) =>
                    progress.chapter_id
                )
              )
            );

            const {
              data: chapterData,
              error: chapterError,
            } = await supabase
              .from("chapters")
              .select(
                "id, chapter_number, title"
              )
              .in("id", chapterIds)
              .eq(
                "status",
                "published"
              );

            if (cancelled) {
              return;
            }

            if (chapterError) {
              console.error(
                "Stories progress chapters loading error:",
                chapterError
              );
            } else {
              const chapters =
                chapterData ?? [];

              for (const progress of progressData) {
                const chapter =
                  chapters.find(
                    (item) =>
                      item.id ===
                      progress.chapter_id
                  );

                if (!chapter) {
                  continue;
                }

                /*
                 * Because progressData is ordered by
                 * updated_at descending, the first
                 * progress row for a story is the
                 * latest one.
                 */
                if (
                  progressByStory.has(
                    progress.story_id
                  )
                ) {
                  continue;
                }

                progressByStory.set(
                  progress.story_id,
                  {
                    chapter_id:
                      progress.chapter_id,
                    chapter_number:
                      chapter.chapter_number,
                    chapter_title:
                      chapter.title,
                  }
                );
              }
            }
          }
        }

        const categoryIds = Array.from(
          new Set(
            rawStories
              .map(
                (story) =>
                  story.category_id
              )
              .filter(
                (
                  categoryId
                ): categoryId is string =>
                  Boolean(categoryId)
              )
          )
        );

        const writerProfileIds =
          Array.from(
            new Set(
              rawStories.map(
                (story) =>
                  story.writer_profile_id
              )
            )
          );

        const [
          categoriesResult,
          writerProfilesResult,
          profilesResult,
        ] = await Promise.all([
          categoryIds.length > 0
            ? supabase
                .from("categories")
                .select("id, name")
                .in("id", categoryIds)
            : Promise.resolve({
                data: [],
                error: null,
              }),

          supabase
            .from("writer_profiles")
            .select(
              "profile_id, pen_name"
            )
            .in(
              "profile_id",
              writerProfileIds
            ),

          supabase
            .from("profiles")
            .select(
              "id, display_name"
            )
            .in(
              "id",
              writerProfileIds
            ),
        ]);

        if (cancelled) {
          return;
        }

        if (categoriesResult.error) {
          console.error(
            "Story categories loading error:",
            categoriesResult.error
          );
        }

        if (writerProfilesResult.error) {
          console.error(
            "Writer profiles loading error:",
            writerProfilesResult.error
          );
        }

        if (profilesResult.error) {
          console.error(
            "Story author profiles loading error:",
            profilesResult.error
          );
        }

        const categories =
          categoriesResult.data ?? [];

        const writerProfiles =
          writerProfilesResult.data ?? [];

        const profiles =
          profilesResult.data ?? [];

        const loadedStories: StoryCard[] =
          rawStories.map((story) => {
            const category =
              categories.find(
                (item) =>
                  item.id ===
                  story.category_id
              ) ?? null;

            const writerProfile =
              writerProfiles.find(
                (item) =>
                  item.profile_id ===
                  story.writer_profile_id
              );

            const profile =
              profiles.find(
                (item) =>
                  item.id ===
                  story.writer_profile_id
              );

            const authorName =
              writerProfile?.pen_name?.trim() ||
              profile?.display_name?.trim() ||
              "TaleMine Writer";

            return {
              story,
              category,
              authorName,
              progress:
                progressByStory.get(
                  story.id
                ) ?? null,
            };
          });

        setStories(loadedStories);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Stories page loading error:",
          error
        );

        setStories([]);
        setErrorMessage(
          "Unable to load stories."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStories();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  const categories = useMemo(() => {
    const uniqueCategories =
      new Map<string, string>();

    for (const item of stories) {
      if (item.category) {
        uniqueCategories.set(
          item.category.id,
          item.category.name
        );
      }
    }

    return Array.from(
      uniqueCategories.entries()
    ).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [stories]);

  const filteredStories = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return stories.filter((item) => {
      const matchesSearch =
        !query ||
        item.story.title
          .toLowerCase()
          .includes(query) ||
        item.story.excerpt
          ?.toLowerCase()
          .includes(query) ||
        item.authorName
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        selectedCategory === "all" ||
        item.category?.id ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    stories,
    searchQuery,
    selectedCategory,
  ]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          Loading stories...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm uppercase tracking-wide text-cyan-400">
            Discover
          </p>

          <h1 className="mt-2 text-4xl font-bold md:text-6xl">
            Stories
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-300">
            Discover published stories from
            TaleMine writers and find your next
            read.
          </p>
        </div>

        {/* Search and Filters */}
        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label
                htmlFor="story-search"
                className="sr-only"
              >
                Search stories
              </label>

              <input
                id="story-search"
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search stories, authors, or descriptions..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="story-category"
                className="sr-only"
              >
                Filter by category
              </label>

              <select
                id="story-category"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 md:min-w-52"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map(
                  ([categoryId, name]) => (
                    <option
                      key={categoryId}
                      value={categoryId}
                    >
                      {name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              {filteredStories.length}{" "}
              {filteredStories.length === 1
                ? "story"
                : "stories"}{" "}
              found
            </p>

            {(searchQuery ||
              selectedCategory !==
                "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(
                    "all"
                  );
                }}
                className="text-sm text-cyan-400 transition hover:text-cyan-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-slate-900/60 p-8 text-center">
            <p className="text-red-400">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Story Grid */}
        {!errorMessage &&
          filteredStories.length > 0 && (
            <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredStories.map(
                ({
                  story,
                  category,
                  authorName,
                  progress,
                }) => (
                  <article
                    key={story.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:border-cyan-500/40"
                  >
                    {/* Cover */}
                    {story.cover_image_url ? (
                      <div className="aspect-[16/10] overflow-hidden bg-slate-950">
                        <img
                          src={
                            story.cover_image_url
                          }
                          alt={`${story.title} cover`}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center bg-slate-950">
                        <span className="text-sm text-slate-600">
                          TaleMine
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap gap-2">
                        {category && (
                          <span className="rounded-full border border-cyan-500/20 px-3 py-1 text-xs uppercase tracking-wide text-cyan-300">
                            {category.name}
                          </span>
                        )}

                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-400">
                          Published
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl font-bold">
                        {story.title}
                      </h2>

                      {story.excerpt && (
                        <p className="mt-3 line-clamp-3 text-gray-300">
                          {story.excerpt}
                        </p>
                      )}

                      <div className="mt-5 text-sm text-gray-400">
                        By{" "}
                        <span className="text-cyan-400">
                          {authorName}
                        </span>
                      </div>

                      {story.published_at && (
                        <p className="mt-2 text-xs text-gray-500">
                          Published{" "}
                          {new Date(
                            story.published_at
                          ).toLocaleDateString()}
                        </p>
                      )}

                      {/* Reading State */}
                      <div className="mt-auto pt-6">
                        {progress ? (
                          <>
                            <p className="mb-3 text-sm text-gray-400">
                              Last read: Chapter{" "}
                              {
                                progress.chapter_number
                              }

                              {progress.chapter_title
                                ? ` — ${progress.chapter_title}`
                                : ""}
                            </p>

                            <Button
                              onClick={() =>
                                navigate(
                                  `/story/${story.slug}/chapter/${progress.chapter_number}`
                                )
                              }
                            >
                              Continue Reading
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() =>
                              navigate(
                                `/story/${story.slug}`
                              )
                            }
                          >
                            Start Reading
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </section>
          )}

        {/* Empty State */}
        {!errorMessage &&
          filteredStories.length === 0 && (
            <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
              <h2 className="text-2xl font-bold">
                No Stories Found
              </h2>

              <p className="mt-3 text-gray-400">
                {stories.length === 0
                  ? "There are no published stories available yet."
                  : "Try a different search or category."}
              </p>

              {(searchQuery ||
                selectedCategory !==
                  "all") && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(
                        "all"
                      );
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </section>
          )}

        {/* Back */}
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
          >
            Back to TaleMine
          </Button>
        </div>
      </div>
    </main>
  );
}