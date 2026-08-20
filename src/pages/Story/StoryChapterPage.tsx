import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

export default function StoryChapterPage() {
  const navigate = useNavigate();
  const { slug, chapterNumber } =
    useParams<{
      slug: string;
      chapterNumber: string;
    }>();

  const [story, setStory] = useState<Story | null>(null);
  const [chapter, setChapter] =
    useState<Chapter | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
        const { data: storyData, error: storyError } =
          await supabase
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
          setErrorMessage(
            "This story could not be found."
          );
          setLoading(false);
          return;
        }

        setStory(storyData);

        const {
          data: chapterData,
          error: chapterError,
        } = await supabase
          .from("chapters")
          .select(
            "id, story_id, chapter_number, title, content, status"
          )
          .eq("story_id", storyData.id)
          .eq("chapter_number", parsedChapterNumber)
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
          setErrorMessage(
            "This chapter is not available."
          );
          setLoading(false);
          return;
        }

        setChapter(chapterData);
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

          <div className="mt-10 border-t border-slate-800 pt-10">
            <div className="whitespace-pre-wrap text-lg leading-9 text-gray-200">
              {chapter.content}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              onClick={() =>
                navigate(`/story/${story.slug}`)
              }
            >
              Back to Story
            </Button>
          </div>
        </div>
      </article>
    </main>
  );
}