import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ChapterBookmarkButton from "../../components/story/ChapterBookmarkButton";
import ChapterLikeButton from "../../components/story/ChapterLikeButton";
import Button from "../../components/ui/Button";
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
}

export default function StoryChapterPage() {
  const navigate = useNavigate();

  const { slug, chapterNumber } = useParams<{
    slug: string;
    chapterNumber: string;
  }>();

  const [story, setStory] = useState<Story | null>(
    null
  );

  const [chapter, setChapter] =
    useState<Chapter | null>(null);

  const [navigation, setNavigation] =
    useState<ChapterNavigation>({
      previous: null,
      next: null,
    });

  const [loading, setLoading] = useState(true);
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
        !Number.isInteger(parsedChapterNumber) ||
        parsedChapterNumber < 1
      ) {
        setLoading(false);
        setErrorMessage("Chapter not found.");
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        // Load only a published story.
        const {
          data: storyData,
          error: storyError,
        } = await supabase
          .from("stories")
          .select("id, title, slug, status")
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
          });

          setErrorMessage(
            "This story could not be found."
          );

          setLoading(false);
          return;
        }

        setStory(storyData);

        // Load only the requested published chapter.
        const {
          data: chapterData,
          error: chapterError,
        } = await supabase
          .from("chapters")
          .select(
            "id, story_id, chapter_number, title, content, status"
          )
          .eq("story_id", storyData.id)
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
          });

          setErrorMessage(
            "This chapter is not available."
          );

          setLoading(false);
          return;
        }

        setChapter(chapterData);

        // Load published chapter numbers for navigation.
        const {
          data: chapterNumbers,
          error: navigationError,
        } = await supabase
          .from("chapters")
          .select("chapter_number")
          .eq("story_id", storyData.id)
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
          });
        } else {
          const numbers = (chapterNumbers ?? [])
            .map((item) => item.chapter_number)
            .filter(
              (number) =>
                Number.isInteger(number) &&
                number > 0
            );

          const currentIndex = numbers.indexOf(
            parsedChapterNumber
          );

          setNavigation({
            previous:
              currentIndex > 0
                ? numbers[currentIndex - 1]
                : null,

            next:
              currentIndex >= 0 &&
              currentIndex < numbers.length - 1
                ? numbers[currentIndex + 1]
                : null,
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
  }, [slug, chapterNumber]);

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
                navigate(`/story/${slug}`)
              }
            >
              Back to Story
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <article className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-8 md:p-12">
          {/* Chapter Header */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-cyan-400">
              Chapter {chapter.chapter_number}
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
            <div className="whitespace-pre-wrap text-lg leading-9 text-gray-200">
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

          {/* Navigation */}
          <div className="mt-10 border-t border-slate-800 pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {navigation.previous !== null ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      goToChapter(
                        navigation.previous as number
                      )
                    }
                  >
                    ← Previous Chapter
                  </Button>
                ) : (
                  <div />
                )}
              </div>

              <Button
                onClick={() =>
                  navigate(
                    `/story/${story.slug}`
                  )
                }
              >
                Back to Story
              </Button>

              <div>
                {navigation.next !== null ? (
                  <Button
                    onClick={() =>
                      goToChapter(
                        navigation.next as number
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
          </div>
        </div>
      </article>
    </main>
  );
}