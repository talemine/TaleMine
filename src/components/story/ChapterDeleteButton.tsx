import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";

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
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    const displayTitle =
      chapterTitle?.trim() || "this chapter";

    const confirmed = window.confirm(
      `Delete "${displayTitle}"?\n\nThis chapter will be permanently deleted.`
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
      setErrorMessage("Unable to delete the chapter.");
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
        {deleting ? "Deleting..." : "Delete"}
      </Button>

      {errorMessage && (
        <p className="text-sm text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}