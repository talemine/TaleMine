import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

interface ChapterEditFormProps {
  chapterId: string;
  initialTitle: string | null;
  initialContent: string;
  onSaved: (updatedChapter: {
    title: string | null;
    content: string;
  }) => void;
}

export default function ChapterEditForm({
  chapterId,
  initialTitle,
  initialContent,
  onSaved,
}: ChapterEditFormProps) {
  const { t } = useLanguage();

  const [title, setTitle] = useState(initialTitle ?? "");
  const [content, setContent] = useState(initialContent);

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
      setErrorMessage(
        t.chapterEditForm.contentRequired
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("chapters")
      .update({
        title: normalizedTitle || null,
        content: normalizedContent,
      })
      .eq("id", chapterId)
      .select("title, content")
      .single();

    if (error) {
      console.error(
        "Chapter update error:",
        error
      );

      setErrorMessage(
        t.chapterEditForm.unableToSave
      );
      setLoading(false);
      return;
    }

    onSaved(data);
    setTitle(data.title ?? "");
    setContent(data.content);
    setMessage(
      t.chapterEditForm.savedSuccessfully
    );
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-5 border-t border-slate-800 pt-6"
    >
      <div>
        <label
          htmlFor={`chapter-edit-title-${chapterId}`}
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.chapterEditForm.title}
        </label>

        <input
          id={`chapter-edit-title-${chapterId}`}
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          disabled={loading}
          placeholder={
            t.chapterEditForm.titlePlaceholder
          }
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
          htmlFor={`chapter-edit-content-${chapterId}`}
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.chapterEditForm.content}
        </label>

        <textarea
          id={`chapter-edit-content-${chapterId}`}
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          required
          rows={12}
          disabled={loading}
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
        {loading
          ? t.chapterEditForm.saving
          : t.chapterEditForm.saveChapter}
      </Button>
    </form>
  );
}