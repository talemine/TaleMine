import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";

interface Chapter {
  id: string;
  story_id: string;
  chapter_number: number;
  title: string | null;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChapterFormProps {
  storyId: string;
  onCreated: (chapter: Chapter) => void;
}

export default function ChapterForm({
  storyId,
  onCreated,
}: ChapterFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    if (!normalizedContent) {
      setErrorMessage("Chapter content is required.");
      setLoading(false);
      return;
    }

    try {
      // Find the next chapter number for this story.
      const { data: lastChapter, error: lastChapterError } =
        await supabase
          .from("chapters")
          .select("chapter_number")
          .eq("story_id", storyId)
          .order("chapter_number", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (lastChapterError) {
        console.error(
          "Last chapter lookup error:",
          lastChapterError
        );

        setErrorMessage(
          "Unable to determine the next chapter number."
        );
        setLoading(false);
        return;
      }

      const nextChapterNumber =
        (lastChapter?.chapter_number ?? 0) + 1;

      const { data, error } = await supabase
        .from("chapters")
        .insert({
          story_id: storyId,
          chapter_number: nextChapterNumber,
          title: normalizedTitle || null,
          content: normalizedContent,
        })
        .select(
          "id, story_id, chapter_number, title, content, status, created_at, updated_at"
        )
        .single();

      if (error) {
        if (error.code === "23505") {
          setErrorMessage(
            "That chapter number already exists. Please try again."
          );
        } else {
          console.error(
            "Chapter creation error:",
            error
          );

          setErrorMessage(
            "Unable to create the chapter."
          );
        }

        setLoading(false);
        return;
      }

      onCreated(data);

      setTitle("");
      setContent("");
      setMessage(
        `Chapter ${data.chapter_number} created successfully.`
      );
    } catch (error) {
      console.error(
        "Chapter creation error:",
        error
      );

      setErrorMessage(
        "Unable to create the chapter."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 border-t border-slate-800 pt-8"
    >
      <div>
        <label
          htmlFor="chapter-title"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Chapter Title
        </label>

        <input
          id="chapter-title"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          disabled={loading}
          placeholder="Chapter title (optional)"
          className="
            w-full
            rounded-xl
            bg-slate-950/70
            border border-cyan-500/20
            px-5 py-4
            text-white
            placeholder-gray-500
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-1
            focus:ring-cyan-400
            disabled:opacity-60
          "
        />
      </div>

      <div>
        <label
          htmlFor="chapter-content"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Chapter Content
        </label>

        <textarea
          id="chapter-content"
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          required
          rows={12}
          disabled={loading}
          placeholder="Write your chapter here..."
          className="
            w-full
            resize-y
            rounded-xl
            bg-slate-950/70
            border border-cyan-500/20
            px-5 py-4
            text-white
            placeholder-gray-500
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-1
            focus:ring-cyan-400
            disabled:opacity-60
          "
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="text-sm text-cyan-300">
          {message}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Chapter"}
      </Button>
    </form>
  );
}