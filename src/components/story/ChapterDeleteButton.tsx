import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

interface ChapterDeleteButtonProps {
  chapterId: string;
  chapterTitle: string | null;
  onDeleted: () => void;
}

export default function ChapterDeleteButton({
  chapterId,
  chapterTitle,
  onDeleted,
}: ChapterDeleteButtonProps) {
  const { t } = useLanguage();

  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    const displayTitle =
      chapterTitle?.trim() ||
      t.chapterDeleteButton.defaultChapter;

    const confirmed = window.confirm(
      `${t.chapterDeleteButton.confirmTitle} "${displayTitle}"?\n\n${t.chapterDeleteButton.confirmMessage}`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapterId);

    if (error) {
      console.error("Chapter deletion error:", error);
      setErrorMessage(
        t.chapterDeleteButton.unableToDelete
      );
      setDeleting(false);
      return;
    }

    onDeleted();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="outline"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting
          ? t.chapterDeleteButton.deleting
          : t.chapterDeleteButton.delete}
      </Button>

      {errorMessage && (
        <p className="text-sm text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}