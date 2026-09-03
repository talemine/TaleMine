import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

type ChapterStatus = "draft" | "published";

interface ChapterPublishControlsProps {
  chapterId: string;
  status: ChapterStatus;
  onStatusChanged: (updatedStatus: ChapterStatus) => void;
}

export default function ChapterPublishControls({
  chapterId,
  status,
  onStatusChanged,
}: ChapterPublishControlsProps) {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function updateStatus(nextStatus: ChapterStatus) {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("chapters")
      .update({
        status: nextStatus,
      })
      .eq("id", chapterId)
      .select("status")
      .single();

    if (error) {
      console.error(
        "Chapter status update error:",
        error
      );

      setErrorMessage(
        t.chapterPublishControls.unableToUpdate
      );
      setLoading(false);
      return;
    }

    const updatedStatus = data.status as ChapterStatus;

    onStatusChanged(updatedStatus);

    setMessage(
      t.chapterPublishControls.updatedSuccessfully
    );
    setLoading(false);
  }

  async function handlePublish() {
    const confirmed = window.confirm(
      t.chapterPublishControls.publishConfirm
    );

    if (!confirmed) {
      return;
    }

    await updateStatus("published");
  }

  async function handleUnpublish() {
    const confirmed = window.confirm(
      t.chapterPublishControls.unpublishConfirm
    );

    if (!confirmed) {
      return;
    }

    await updateStatus("draft");
  }

  return (
    <div className="mt-4 border-t border-slate-800 pt-4">
      <p className="text-sm text-gray-400">
        {t.chapterPublishControls.publishingLabel}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {status === "draft" && (
          <Button
            onClick={handlePublish}
            disabled={loading}
          >
            {loading
              ? t.chapterPublishControls.publishing
              : t.chapterPublishControls.publishChapter}
          </Button>
        )}

        {status === "published" && (
          <Button
            variant="outline"
            onClick={handleUnpublish}
            disabled={loading}
          >
            {loading
              ? t.chapterPublishControls.updating
              : t.chapterPublishControls.unpublishChapter}
          </Button>
        )}
      </div>

      {errorMessage && (
        <p className="mt-4 text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="mt-4 text-sm text-cyan-300">
          {message}
        </p>
      )}
    </div>
  );
}