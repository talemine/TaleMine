import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ChapterBookmarkButton from "../../components/story/ChapterBookmarkButton";
import ChapterLikeButton from "../../components/story/ChapterLikeButton";
import ChapterComments from "../../components/story/ChapterComments";
import Button from "../../components/ui/Button";
import { useAuth } from "../../components/auth/AuthProvider";
import { supabase } from "../../services/supabase";
import { useLanguage } from "../../i18n/LanguageContext";

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

type FontSizeOption =
  | "small"
  | "medium"
  | "large";

type ReadingWidthOption =
  | "narrow"
  | "standard"
  | "wide";

const FONT_SIZE_STORAGE_KEY =
  "talemine-reader-font-size";

const READING_WIDTH_STORAGE_KEY =
  "talemine-reader-width";

const readingWidthClasses: Record<
  ReadingWidthOption,
  string
> = {
  narrow: "max-w-xl",
  standard: "max-w-2xl",
  wide: "max-w-4xl",
};

const fontSizeClasses: Record<
  FontSizeOption,
  string
> = {
  small: "text-base leading-8",
  medium: "text-lg leading-9",
  large: "text-xl leading-10",
};

export default function StoryChapterPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t } = useLanguage();

  const { slug, chapterNumber } =
    useParams<{
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

  const [fontSize, setFontSize] =
    useState<FontSizeOption>("medium");

  const [readingWidth, setReadingWidth] =
    useState<ReadingWidthOption>("standard");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const savedFontSize =
      window.localStorage.getItem(
        FONT_SIZE_STORAGE_KEY
      );

    if (
      savedFontSize === "small" ||
      savedFontSize === "medium" ||
      savedFontSize === "large"
    ) {
      setFontSize(savedFontSize);
    }

    const savedReadingWidth =
      window.localStorage.getItem(
        READING_WIDTH_STORAGE_KEY
      );

    if (
      savedReadingWidth === "narrow" ||
      savedReadingWidth === "standard" ||
      savedReadingWidth === "wide"
    ) {
      setReadingWidth(savedReadingWidth);
    }
  }, []);

  function changeFontSize(
    nextSize: FontSizeOption
  ) {
    setFontSize(nextSize);

    window.localStorage.setItem(
      FONT_SIZE_STORAGE_KEY,
      nextSize
    );
  }

  function changeReadingWidth(
    nextWidth: ReadingWidthOption
  ) {
    setReadingWidth(nextWidth);

    window.localStorage.setItem(
      READING_WIDTH_STORAGE_KEY,
      nextWidth
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function loadChapter() {
      if (!slug || !chapterNumber) {
        setLoading(false);
        setErrorMessage(
          t.storyChapter.chapterNotFound
        );
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
        setErrorMessage(
          t.storyChapter.chapterNotFound
        );
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
            t.storyChapter.storyNotFound
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
            t.storyChapter.chapterNotAvailable
          );

          setLoading(false);
          return;
        }

        setChapter(chapterData);

        /*
         * Save reading progress
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
            .order("updated_at", {
              ascending: false,
            })
            .limit(1)
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
                story_id:
                  storyData.id,
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
          t.storyChapter.unableToLoad
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
    t.storyChapter.chapterNotFound,
    t.storyChapter.storyNotFound,
    t.storyChapter.chapterNotAvailable,
    t.storyChapter.unableToLoad,
  ]);

  function goToChapter(number: number) {
    if (!story) {
      return;
    }

    navigate(
      `/story/${story.slug}/chapter/${number}`
    );

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          {t.storyChapter.loading}
        </p>
      </main>
    );
  }

  if (!story || !chapter) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold">
            {t.storyChapter.chapterNotFoundTitle}
          </h1>

          <p className="mt-4 text-gray-300">
            {errorMessage ||
              t.storyChapter.chapterNotAvailable}
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() =>
                navigate(
                  `/story/${slug}`
                )
              }
            >
              {t.storyChapter.backToStory}
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

  const currentChapterPosition =
    navigation.currentIndex >= 0
      ? navigation.currentIndex + 1
      : chapter.chapter_number;

  const progressPercentage =
    navigation.totalChapters > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentChapterPosition /
              navigation.totalChapters) *
              100
          )
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <article className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-8 md:p-12">
          {/* Chapter Header */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-cyan-400">
              {t.storyChapter.chapter}{" "}
              {chapter.chapter_number}
            </span>

            <span className="rounded-full border border-cyan-500/20 px-3 py-1 text-xs uppercase tracking-wide text-cyan-300">
              {t.storyChapter.published}
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-bold md:text-5xl">
            {chapter.title ||
              `${t.storyChapter.chapter} ${chapter.chapter_number}`}
          </h1>

          <p className="mt-4 text-sm text-gray-400">
            {story.title}
          </p>

          {/* Reader Controls */}
          <div className="mt-8 flex flex-col gap-4 border-y border-slate-800 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                {t.storyChapter.readingSize}
              </p>

              <div
                className="flex items-center gap-2"
                aria-label={
                  t.storyChapter.readingTextSize
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    changeFontSize("small")
                  }
                  aria-label={
                    t.storyChapter.decreaseTextSize
                  }
                  aria-pressed={
                    fontSize === "small"
                  }
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition ${
                    fontSize === "small"
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                      : "border-slate-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
                  }`}
                >
                  A−
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeFontSize("medium")
                  }
                  aria-label={
                    t.storyChapter.defaultTextSize
                  }
                  aria-pressed={
                    fontSize === "medium"
                  }
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition ${
                    fontSize === "medium"
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                      : "border-slate-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
                  }`}
                >
                  A
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeFontSize("large")
                  }
                  aria-label={
                    t.storyChapter.increaseTextSize
                  }
                  aria-pressed={
                    fontSize === "large"
                  }
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition ${
                    fontSize === "large"
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                      : "border-slate-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
                  }`}
                >
                  A+
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                {t.storyChapter.readingWidth}
              </p>

              <div
                className="flex items-center gap-2"
                aria-label={
                  t.storyChapter.readingWidth
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    changeReadingWidth("narrow")
                  }
                  aria-label={
                    t.storyChapter.narrowReadingWidth
                  }
                  aria-pressed={
                    readingWidth === "narrow"
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    readingWidth === "narrow"
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                      : "border-slate-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
                  }`}
                >
                  {t.storyChapter.narrow}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeReadingWidth("standard")
                  }
                  aria-label={
                    t.storyChapter.standardReadingWidth
                  }
                  aria-pressed={
                    readingWidth === "standard"
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    readingWidth === "standard"
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                      : "border-slate-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
                  }`}
                >
                  {t.storyChapter.standard}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeReadingWidth("wide")
                  }
                  aria-label={
                    t.storyChapter.wideReadingWidth
                  }
                  aria-pressed={
                    readingWidth === "wide"
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    readingWidth === "wide"
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                      : "border-slate-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
                  }`}
                >
                  {t.storyChapter.wide}
                </button>
              </div>
            </div>
          </div>

          {/* Chapter Content */}
          <div className="mt-10 border-t border-slate-800 pt-10">
            <div
              className={`mx-auto whitespace-pre-wrap text-gray-200 ${readingWidthClasses[readingWidth]} ${fontSizeClasses[fontSize]} font-serif`}
            >
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

          {/* Story Complete */}
          {isLastChapter && (
            <div className="mb-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
                {t.storyChapter.storyComplete}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                {t.storyChapter.reachedEnd}
              </h2>

              <p className="mt-2 text-gray-400">
                {t.storyChapter.thanksForReading}{" "}
                {story.title}.
              </p>

              <div className="mt-5 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(
                      `/story/${story.slug}`
                    )
                  }
                >
                  {t.storyChapter.backToStory}
                </Button>
              </div>
            </div>
          )}

          {/* Chapter Navigation */}
          <div className="mt-10 border-t border-slate-800 pt-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Previous */}
                <div className="w-full sm:w-auto">
                  {hasPreviousChapter ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        goToChapter(
                          navigation.previous!
                        )
                      }
                    >
                      ←{" "}
                      {t.storyChapter.previousChapter}
                    </Button>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </div>

                {/* Position */}
                <div className="order-first text-center sm:order-none">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {t.storyChapter.readingProgress}
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-200">
                    {t.storyChapter.chapter}{" "}
                    {currentChapterPosition}{" "}
                    {t.storyChapter.of}{" "}
                    {navigation.totalChapters}

                    {navigation.totalChapters >
                      0 && (
                      <>
                        {" "}
                        ·{" "}
                        {Math.round(
                          progressPercentage
                        )}
                        %
                      </>
                    )}
                  </p>
                </div>

                {/* Next */}
                <div className="w-full sm:w-auto">
                  {hasNextChapter ? (
                    <Button
                      onClick={() =>
                        goToChapter(
                          navigation.next!
                        )
                      }
                    >
                      {t.storyChapter.nextChapter} →
                    </Button>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </div>
              </div>

              {navigation.totalChapters >
                0 && (
                <div className="mt-5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all"
                      style={{
                        width: `${progressPercentage}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Back to Stories */}
            <div className="mt-5 flex justify-center">
              <Button
                onClick={() =>
                  navigate("/stories")
                }
              >
                {t.storyChapter.exploreMoreStories}
              </Button>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}