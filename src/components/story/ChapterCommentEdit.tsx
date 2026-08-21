import { useState } from "react";

import Button from "../ui/Button";
import { supabase } from "../../services/supabase";

interface ChapterCommentEditProps {
  commentId: string;
  initialContent: string;
  onSaved: (
    commentId: string,
    content: string
  ) => void;
  onCancel: () => void;
}

export default function ChapterCommentEdit({
  commentId,
  initialContent,
  onSaved,
  onCancel,
}: ChapterCommentEditProps) {
  const [content, setContent] =
    useState(initialContent);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleSave() {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setErrorMessage(
        "Comment cannot be empty."
      );
      return;
    }

    if (trimmedContent.length > 2000) {
      setErrorMessage(
        "Comments must be 2000 characters or fewer."
      );
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("chapter_comments")
      .update({
        content: trimmedContent,
      })
      .eq("id", commentId);

    if (error) {
      console.error(
        "Chapter comment update error:",
        error
      );

      setErrorMessage(
        "Unable to update your comment."
      );
      setSaving(false);
      return;
    }

    onSaved(commentId, trimmedContent);
    setSaving(false);
  }

  return (
    <div className="mt-4">
      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        maxLength={2000}
        rows={5}
        disabled={saving}
        className="
          w-full
          rounded-2xl
          border
          border-slate-700
          bg-slate-950
          px-4
          py-3
          text-white
          outline-none
          placeholder:text-gray-500
          focus:border-cyan-400
        "
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-gray-500">
          {content.length}/2000
        </span>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Comment"}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <p className="mt-3 text-sm text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}