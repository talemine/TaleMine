import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";

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
        "Unable to update the chapter status."
      );
      setLoading(false);
      return;
    }

    const updatedStatus = data.status as ChapterStatus;

    onStatusChanged(updatedStatus);

    setMessage("Chapter status updated successfully.");
    setLoading(false);
  }

  async function handlePublish() {
    const confirmed = window.confirm(
      "Publish this chapter?"
    );

    if (!confirmed) {
      return;
    }

    await updateStatus("published");
  }

  async function handleUnpublish() {
    const confirmed = window.confirm(
      "Unpublish this chapter?\n\nIt will return to draft status."
    );

    if (!confirmed) {
      return;
    }

    await updateStatus("draft");
  }

  return (
    <div className="mt-4 border-t border-slate-800 pt-4">
      <p className="text-sm text-gray-400">
        Publishing
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {status === "draft" && (
          <Button
            onClick={handlePublish}
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish Chapter"}
          </Button>
        )}

        {status === "published" && (
          <Button
            variant="outline"
            onClick={handleUnpublish}
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Unpublish Chapter"}
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