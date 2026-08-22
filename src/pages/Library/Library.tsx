import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MyBookmarks from "../../components/story/MyBookmarks";
import { useAuth } from "../../components/auth/AuthProvider";
import Button from "../../components/ui/Button";
import { supabase } from "../../services/supabase";

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

type LibraryFilter =
  | "all"
  | "recent"
  | "bookmarks";

export default function Library() {
  const { session, loading: authLoading } =
    useAuth();
  const navigate = useNavigate();

  const [recentlyRead, setRecentlyRead] =
    useState<ReadingProgress[]>([]);

  const [filter, setFilter] =
    useState<LibraryFilter>("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRecentlyRead() {
      if (!session?.user.id) {
        setRecentlyRead([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: progressData,
          error: progressError,
        } = await supabase
          .from("reading_progress")
          .select(
            "id, story_id, chapter_id, last_read_at, updated_at"
          )
          .eq("user_id", session.user.id)
          .order("updated_at", {
            ascending: false,
          })
          .limit(5);

        if (cancelled) {
          return;
        }

        if (progressError) {
          console.error(
            "Library reading progress error:",
            progressError
          );

          setRecentlyRead([]);
          setErrorMessage(
            "Unable to load your reading history."
          );
          setLoading(false);
          return;
        }

        const progressRows =
          progressData ?? [];

        if (progressRows.length === 0) {
          setRecentlyRead([]);
          setLoading(false);
          return;
        }

        const storyIds = Array.from(
          new Set(
            progressRows.map(
              (progress) =>
                progress.story_id
            )
          )
        );

        const chapterIds = Array.from(
          new Set(
            progressRows.map(
              (progress) =>
                progress.chapter_id
            )
          )
        );

        const [
          storiesResult,
          chaptersResult,
        ] = await Promise.all([
          supabase
            .from("stories")
            .select("id, title, slug")
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
            "Library stories error:",
            storiesResult.error
          );

          setRecentlyRead([]);
          setErrorMessage(
            "Unable to load your reading history."
          );
          setLoading(false);
          return;
        }

        if (chaptersResult.error) {
          console.error(
            "Library chapters error:",
            chaptersResult.error
          );

          setRecentlyRead([]);
          setErrorMessage(
            "Unable to load your reading history."
          );
          setLoading(false);
          return;
        }

        const stories =
          storiesResult.data ?? [];

        const chapters =
          chaptersResult.data ?? [];

        const loadedProgress: ReadingProgress[] =
          [];

        for (const progress of progressRows) {
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
            chapter_title: chapter.title,
          });
        }

        setRecentlyRead(loadedProgress);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Library loading error:",
          error
        );

        setRecentlyRead([]);
        setErrorMessage(
          "Unable to load your library."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRecentlyRead();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  const filteredRecentlyRead =
    useMemo(() => {
      const query =
        searchQuery.trim().toLowerCase();

      if (!query) {
        return recentlyRead;
      }

      return recentlyRead.filter(
        (progress) => {
          const storyTitle =
            progress.story_title.toLowerCase();

          const chapterTitle =
            progress.chapter_title
              ?.toLowerCase() ?? "";

          return (
            storyTitle.includes(query) ||
            chapterTitle.includes(query)
          );
        }
      );
    }, [recentlyRead, searchQuery]);

  const latestReading =
    recentlyRead[0] ?? null;

  const showContinueReading =
    filter !== "bookmarks" &&
    latestReading !== null &&
    !searchQuery.trim();

  const showRecentlyRead =
    filter !== "bookmarks";

  const showBookmarks =
    filter !== "recent";

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          Loading your library...
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
            You need to be signed in to view
            your library.
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() =>
                navigate("/login")
              }
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
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Reader
              </p>

              <h1 className="mt-1 text-4xl font-bold">
                My Library
              </h1>

              <p className="mt-3 text-gray-300">
                Pick up where you left off or
                revisit something you've read.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                navigate("/account")
              }
            >
              Account
            </Button>
          </div>

          {/* Library Controls */}
          <section className="mt-8 border-t border-slate-800 pt-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All"],
                    ["recent", "Recently Read"],
                    ["bookmarks", "Bookmarks"],
                  ] as const
                ).map(([value, label]) => {
                  const active =
                    filter === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFilter(value)
                      }
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-cyan-500 text-slate-950"
                          : "border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-400"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div>
                <label
                  htmlFor="library-search"
                  className="sr-only"
                >
                  Search your library
                </label>

                <input
                  id="library-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search stories or chapters..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>
            </div>
          </section>

          {errorMessage && (
            <p className="mt-8 text-sm text-red-400">
              {errorMessage}
            </p>
          )}

          {/* Continue Reading */}
          {showContinueReading && (
            <section className="mt-10 border-t border-slate-800 pt-8">
              <p className="text-sm text-gray-400">
                Continue Reading
              </p>

              <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-slate-950/50 p-6">
                <p className="text-sm text-cyan-400">
                  Chapter{" "}
                  {latestReading.chapter_number}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {latestReading.story_title}
                </h2>

                <p className="mt-2 text-gray-300">
                  {latestReading.chapter_title ||
                    `Chapter ${latestReading.chapter_number}`}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  Last read{" "}
                  {new Date(
                    latestReading.last_read_at
                  ).toLocaleDateString()}
                </p>

                <div className="mt-5">
                  <Button
                    onClick={() =>
                      navigate(
                        `/story/${latestReading.story_slug}/chapter/${latestReading.chapter_number}`
                      )
                    }
                  >
                    Continue Reading
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Recently Read */}
          {showRecentlyRead && (
            <section className="mt-10 border-t border-slate-800 pt-8">
              <p className="text-sm text-gray-400">
                Reading Activity
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                Recently Read
              </h2>

              {filteredRecentlyRead.length ===
              0 ? (
                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
                  <p className="text-gray-400">
                    {searchQuery.trim()
                      ? "No recently read stories or chapters match your search."
                      : "You haven't started reading anything yet."}
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {filteredRecentlyRead.map(
                    (progress) => (
                      <article
                        key={progress.id}
                        className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-cyan-500/40"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-cyan-400">
                            Chapter{" "}
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
                            Last read{" "}
                            {new Date(
                              progress.last_read_at
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="mt-5">
                          <Button
                            variant="outline"
                            onClick={() =>
                              navigate(
                                `/story/${progress.story_slug}/chapter/${progress.chapter_number}`
                              )
                            }
                          >
                            Read Again
                          </Button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {/* Bookmarks */}
          {showBookmarks && (
            <section className="mt-10 border-t border-slate-800 pt-8">
              <MyBookmarks />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}