import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

type StoryStatus =
  | "draft"
  | "review"
  | "published"
  | "archived";

interface StoryPublishControlsProps {
  storyId: string;
  status: StoryStatus;
  publishedAt: string | null;
  onStatusChanged: (updatedStory: {
    status: StoryStatus;
    published_at: string | null;
  }) => void;
}

export default function StoryPublishControls({
  storyId,
  status,
  publishedAt,
  onStatusChanged,
}: StoryPublishControlsProps) {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  async function updateStoryStatus(
    nextStatus: StoryStatus,
    nextPublishedAt: string | null
  ) {
    setLoading(true);
    setErrorMessage("");
    setMessage("");

    const { data, error } = await supabase
      .from("stories")
      .update({
        status: nextStatus,
        published_at: nextPublishedAt,
      })
      .eq("id", storyId)
      .select("status, published_at")
      .single();

    if (error) {
      console.error(
        "Story status update error:",
        error
      );

      setErrorMessage(
        t.storyPublishControls.unableToUpdate
      );
      setLoading(false);
      return;
    }

    onStatusChanged({
      status: data.status as StoryStatus,
      published_at: data.published_at,
    });

    setMessage(
      t.storyPublishControls.updatedSuccessfully
    );
    setLoading(false);
  }

  async function handleSubmitForReview() {
    const confirmed = window.confirm(
      t.storyPublishControls.submitForReviewConfirm
    );

    if (!confirmed) {
      return;
    }

    await updateStoryStatus("review", null);
  }

  async function handlePublish() {
    const confirmed = window.confirm(
      t.storyPublishControls.publishConfirm
    );

    if (!confirmed) {
      return;
    }

    await updateStoryStatus(
      "published",
      new Date().toISOString()
    );
  }

  async function handleUnpublish() {
    const confirmed = window.confirm(
      t.storyPublishControls.unpublishConfirm
    );

    if (!confirmed) {
      return;
    }

    await updateStoryStatus("draft", null);
  }

  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
      <p className="text-sm text-gray-400">
        {t.storyPublishControls.publishingLabel}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {status === "draft" && (
          <Button
            onClick={handleSubmitForReview}
            disabled={loading}
          >
            {loading
              ? t.storyPublishControls.updating
              : t.storyPublishControls.submitForReview}
          </Button>
        )}

        {status === "review" && (
          <Button
            onClick={handlePublish}
            disabled={loading}
          >
            {loading
              ? t.storyPublishControls.publishing
              : t.storyPublishControls.publishStory}
          </Button>
        )}

        {status === "published" && (
          <Button
            variant="outline"
            onClick={handleUnpublish}
            disabled={loading}
          >
            {loading
              ? t.storyPublishControls.unpublishing
              : t.storyPublishControls.unpublishStory}
          </Button>
        )}

        {status === "archived" && (
          <p className="text-sm text-gray-400">
            {t.storyPublishControls.archived}
          </p>
        )}
      </div>

      {status === "published" && publishedAt && (
        <p className="mt-3 text-sm text-gray-400">
          {t.storyPublishControls.publishedOn}{" "}
          {new Date(
            publishedAt
          ).toLocaleString()}
        </p>
      )}

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