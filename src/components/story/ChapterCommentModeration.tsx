import { useState } from "react";

import Button from "../ui/Button";
import { supabase } from "../../services/supabase";
import { useLanguage } from "../../i18n/LanguageContext";

interface ChapterCommentModerationProps {
  commentId: string;
  onDeleted: (commentId: string) => void;
}

export default function ChapterCommentModeration({
  commentId,
  onDeleted,
}: ChapterCommentModerationProps) {
  const { t } = useLanguage();

  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleDelete() {
    setDeleting(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("chapter_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error(
        "Writer comment moderation error:",
        error
      );

      setErrorMessage(
        t.chapterCommentModeration.unableToDelete
      );
      setDeleting(false);
      return;
    }

    onDeleted(commentId);
    setDeleting(false);
  }

  return (
    <div className="mt-4">
      <Button
        type="button"
        variant="outline"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting
          ? t.chapterCommentModeration.deleting
          : t.chapterCommentModeration.removeComment}
      </Button>

      {errorMessage && (
        <p className="mt-2 text-sm text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}