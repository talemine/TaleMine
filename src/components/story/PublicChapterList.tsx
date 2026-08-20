import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";

interface PublicChapter {
  id: string;
  chapter_number: number;
  title: string | null;
  content: string;
  status: string;
}

interface PublicChapterListProps {
  storyId: string;
  storySlug: string;
}

export default function PublicChapterList({
  storyId,
  storySlug,
}: PublicChapterListProps) {
  const navigate = useNavigate();

  const [chapters, setChapters] = useState<
    PublicChapter[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPublishedChapters() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("chapters")
        .select(
          "id, chapter_number, title, content, status"
        )
        .eq("story_id", storyId)
        .eq("status", "published")
        .order("chapter_number", {
          ascending: true,
        });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Published chapters loading error:",
          error
        );

        setChapters([]);
        setErrorMessage(
          "Unable to load the chapters."
        );
      } else {
        setChapters(data ?? []);
      }

      setLoading(false);
    }

    loadPublishedChapters();

    return () => {
      cancelled = true;
    };
  }, [storyId]);

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
        <p className="text-gray-400">
          Loading chapters...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mt-6 rounded-2xl border border-red-500/20 bg-slate-950/50 p-8 text-center">
        <p className="text-red-400">
          {errorMessage}
        </p>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
        <h3 className="text-xl font-semibold">
          No published chapters yet
        </h3>

        <p className="mt-3 text-gray-400">
          This story has not published any chapters yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {chapters.map((chapter) => (
        <button
          key={chapter.id}
          type="button"
          onClick={() =>
            navigate(
              `/story/${storySlug}/chapter/${chapter.chapter_number}`
            )
          }
          className="
            block
            w-full
            rounded-2xl
            border
            border-slate-800
            bg-slate-950/50
            p-6
            text-left
            transition
            hover:border-cyan-500/40
            hover:bg-slate-900
          "
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-cyan-400">
              Chapter {chapter.chapter_number}
            </span>

            <span className="rounded-full border border-cyan-500/20 px-3 py-1 text-xs uppercase tracking-wide text-cyan-300">
              Published
            </span>
          </div>

          <h3 className="mt-3 text-2xl font-semibold">
            {chapter.title ||
              `Chapter ${chapter.chapter_number}`}
          </h3>

          <p className="mt-3 text-sm text-gray-400">
            Read chapter →
          </p>
        </button>
      ))}
    </div>
  );
}