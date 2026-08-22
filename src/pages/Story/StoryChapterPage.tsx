import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ChapterBookmarkButton from "../../components/story/ChapterBookmarkButton";
import ChapterLikeButton from "../../components/story/ChapterLikeButton";
import ChapterComments from "../../components/story/ChapterComments";
import Button from "../../components/ui/Button";
import { useAuth } from "../../components/auth/AuthProvider";
import { supabase } from "../../services/supabase";

interface Story {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface Chapter {
  id: string;
  story_id: string;
  chapter_number: number;
  title: string | null;
  content: string;
  status: string;
}

interface ChapterNavigation {
  previous: number | null;
  next: number | null;
  currentIndex: number;
  totalChapters: number;
}

export default function StoryChapterPage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { slug, chapterNumber } = useParams<{
    slug: string;
    chapterNumber: string;
  }>();

  const [story, setStory] =
    useState<Story | null>(null);

  const [chapter, setChapter] =
    useState<Chapter | null>(null);

  const [navigation, setNavigation] =
    useState<ChapterNavigation>({
      previous: null,
      next: null,
      currentIndex: 0,
      totalChapters: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadChapter() {
      if (!slug || !chapterNumber) {
        setLoading(false);
        setErrorMessage("Chapter not found.");
        return;
      }

      const parsedChapterNumber =
        Number(chapterNumber);

      if (
        !Number.isInteger(
          parsedChapterNumber
        ) ||
        parsedChapterNumber < 1
      ) {
        setLoading(false);
        setErrorMessage("Chapter not found.");
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        /*
         * Load published story
         */
        const {
          data: storyData,
          error: storyError,
        } = await supabase
          .from("stories")
          .select(
            "id, title, slug, status"
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
          setChapter(null);

          setNavigation({
            previous: null,
            next: null,
            currentIndex: 0,
            totalChapters: 0,
          });

          setErrorMessage(
            "This story could not be found."
          );

          setLoading(false);
          return;
        }

        setStory(storyData);

        /*
         * Load published chapter
         */
        const {
          data: chapterData,
          error: chapterError,
        } = await supabase
          .from("chapters")
          .select(
            "id, story_id, chapter_number, title, content, status"
          )
          .eq(
            "story_id",
            storyData.id
          )
          .eq(
            "chapter_number",
            parsedChapterNumber
          )
          .eq("status", "published")
          .single();

        if (cancelled) {
          return;
        }

        if (chapterError) {
          console.error(
            "Published chapter loading error:",
            chapterError
          );

          setChapter(null);

          setNavigation({
            previous: null,
            next: null,
            currentIndex: 0,
            totalChapters: 0,
          });

          setErrorMessage(
            "This chapter is not available."
          );

          setLoading(false);
          return;
        }

        setChapter(chapterData);

        /*
         * Save reading progress
         *
         * For authenticated readers:
         * 1. Find existing progress for this story.
         * 2. Update it if it exists.
         * 3. Insert it if it does not exist.
         */
        if (session?.user.id) {
          const now =
            new Date().toISOString();

          const {
            data: existingProgress,
            error: progressLookupError,
          } = await supabase
            .from("reading_progress")
            .select("id")
            .eq(
              "user_id",
              session.user.id
            )
            .eq(
              "story_id",
              storyData.id
            )
            .maybeSingle();

          if (progressLookupError) {
            console.error(
              "Reading progress lookup error:",
              progressLookupError
            );
          } else if (existingProgress) {
            const {
              error: progressUpdateError,
            } = await supabase
              .from("reading_progress")
              .update({
                chapter_id:
                  chapterData.id,
                last_read_at: now,
                updated_at: now,
              })
              .eq(
                "id",
                existingProgress.id
              );

            if (progressUpdateError) {
              console.error(
                "Reading progress update error:",
                progressUpdateError
              );
            }
          } else {
            const {
              error: progressInsertError,
            } = await supabase
              .from("reading_progress")
              .insert({
                user_id:
                  session.user.id,
                story_id: storyData.id,
                chapter_id:
                  chapterData.id,
                last_read_at: now,
                updated_at: now,
              });

            if (progressInsertError) {
              console.error(
                "Reading progress insert error:",
                progressInsertError
              );
            }
          }
        }

        /*
         * Load published chapter numbers
         * for Previous / Next navigation.
         */
        const {
          data: chapterNumbers,
          error: navigationError,
        } = await supabase
          .from("chapters")
          .select("chapter_number")
          .eq(
            "story_id",
            storyData.id
          )
          .eq("status", "published")
          .order("chapter_number", {
            ascending: true,
          });

        if (cancelled) {
          return;
        }

        if (navigationError) {
          console.error(
            "Chapter navigation loading error:",
            navigationError
          );

          setNavigation({
            previous: null,
            next: null,
            currentIndex: 0,
            totalChapters: 0,
          });
        } else {
          const numbers =
            (chapterNumbers ?? [])
              .map(
                (item) =>
                  item.chapter_number
              )
              .filter(
                (number) =>
                  Number.isInteger(
                    number
                  ) && number > 0
              );

          const currentIndex =
            numbers.indexOf(
              parsedChapterNumber
            );

          setNavigation({
            previous:
              currentIndex > 0
                ? numbers[
                    currentIndex - 1
                  ]
                : null,

            next:
              currentIndex >= 0 &&
              currentIndex <
                numbers.length - 1
                ? numbers[
                    currentIndex + 1
                  ]
                : null,

            currentIndex,
            totalChapters:
              numbers.length,
          });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Story chapter page error:",
          error
        );

        setStory(null);
        setChapter(null);

        setNavigation({
          previous: null,
          next: null,
          currentIndex: 0,
          totalChapters: 0,
        });

        setErrorMessage(
          "Unable to load this chapter."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChapter();

    return () => {
      cancelled = true;
    };
  }, [
    slug,
    chapterNumber,
    session?.user.id,
  ]);

  function goToChapter(number: number) {
    if (!story) {
      return;
    }

    navigate(
      `/story/${story.slug}/chapter/${number}`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          Loading chapter...
        </p>
      </main>
    );
  }

  if (!story || !chapter) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold">
            Chapter Not Found
          </h1>

          <p className="mt-4 text-gray-300">
            {errorMessage ||
              "This chapter is not available."}
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() =>
                navigate(
                  `/story/${slug}`
                )
              }
            >
              Back to Story
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const hasPreviousChapter =
    navigation.previous !== null;

  const hasNextChapter =
    navigation.next !== null;

  const isLastChapter =
    !hasNextChapter &&
    navigation.totalChapters > 0;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <article className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-8 md:p-12">
          {/* Chapter Header */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-cyan-400">
              Chapter{" "}
              {chapter.chapter_number}
            </span>

            <span className="rounded-full border border-cyan-500/20 px-3 py-1 text-xs uppercase tracking-wide text-cyan-300">
              Published
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-bold md:text-5xl">
            {chapter.title ||
              `Chapter ${chapter.chapter_number}`}
          </h1>

          <p className="mt-4 text-sm text-gray-400">
            {story.title}
          </p>

          {/* Chapter Content */}
          <div className="mt-10 border-t border-slate-800 pt-10">
            <div className="mx-auto max-w-2xl whitespace-pre-wrap text-lg leading-9 text-gray-200">
              {chapter.content}
            </div>
          </div>

          {/* Reader Engagement */}
          <div className="mt-10 border-t border-slate-800 pt-8">
            <div className="flex flex-wrap justify-center gap-3">
              <ChapterLikeButton
                storyId={story.id}
                chapterId={chapter.id}
              />

              <ChapterBookmarkButton
                storyId={story.id}
                chapterId={chapter.id}
              />
            </div>
          </div>

          {/* Comments */}
          <ChapterComments
            storyId={story.id}
            chapterId={chapter.id}
          />

          {/* Navigation */}
          {isLastChapter && (
            <div className="mb-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
                Story Complete
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                You've reached the end of this story.
              </h2>

              <p className="mt-2 text-gray-400">
                Thanks for reading{" "}
                {story.title}.
              </p>
            </div>
          )}

          <div className="mt-10 border-t border-slate-800 pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {hasPreviousChapter ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      goToChapter(
                        navigation.previous!
                      )
                    }
                  >
                    ← Previous Chapter
                  </Button>
                ) : (
                  <div />
                )}
              </div>

              <div className="order-first text-center sm:order-none">
                <p className="text-sm font-medium text-gray-400">
                  Chapter{" "}
                  {navigation.currentIndex +
                    1}{" "}
                  of{" "}
                  {navigation.totalChapters}
                </p>
              </div>

              <div>
                {hasNextChapter ? (
                  <Button
                    onClick={() =>
                      goToChapter(
                        navigation.next!
                      )
                    }
                  >
                    Next Chapter →
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    `/story/${story.slug}`
                  )
                }
              >
                Back to Story
              </Button>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
