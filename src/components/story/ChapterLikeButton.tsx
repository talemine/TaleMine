import { useEffect, useState } from "react";

import { useAuth } from "../auth/AuthProvider";
import Button from "../ui/Button";
import { supabase } from "../../services/supabase";
import { useLanguage } from "../../i18n/LanguageContext";

interface ChapterLikeButtonProps {
  storyId: string;
  chapterId: string;
}

export default function ChapterLikeButton({
  storyId,
  chapterId,
}: ChapterLikeButtonProps) {
  const { session } = useAuth();
  const { t } = useLanguage();

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const userId = session?.user.id;

  useEffect(() => {
    let cancelled = false;

    async function loadLikeState() {
      setChecking(true);
      setErrorMessage("");

      const countPromise = supabase
        .from("chapter_likes")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("chapter_id", chapterId);

      const userLikePromise = userId
        ? supabase
            .from("chapter_likes")
            .select("id")
            .eq("chapter_id", chapterId)
            .eq("user_id", userId)
            .maybeSingle()
        : Promise.resolve({
            data: null,
            error: null,
          });

      const [countResult, userLikeResult] =
        await Promise.all([
          countPromise,
          userLikePromise,
        ]);

      if (cancelled) {
        return;
      }

      if (countResult.error) {
        console.error(
          "Chapter like count error:",
          countResult.error
        );

        setErrorMessage(
          t.chapterLikeButton.unableToLoadCount
        );
      } else {
        setLikeCount(countResult.count ?? 0);
      }

      if (userLikeResult.error) {
        console.error(
          "Chapter like status error:",
          userLikeResult.error
        );

        setIsLiked(false);
      } else {
        setIsLiked(Boolean(userLikeResult.data));
      }

      setChecking(false);
    }

    loadLikeState();

    return () => {
      cancelled = true;
    };
  }, [
    chapterId,
    userId,
    t.chapterLikeButton.unableToLoadCount,
  ]);

  async function handleLikeToggle() {
    if (!userId) {
      setErrorMessage(
        t.chapterLikeButton.loginToLike
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    if (isLiked) {
      const { error } = await supabase
        .from("chapter_likes")
        .delete()
        .eq("chapter_id", chapterId)
        .eq("user_id", userId);

      if (error) {
        console.error(
          "Chapter unlike error:",
          error
        );

        setErrorMessage(
          t.chapterLikeButton.unableToRemove
        );
        setLoading(false);
        return;
      }

      setIsLiked(false);
      setLikeCount((currentCount) =>
        Math.max(0, currentCount - 1)
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("chapter_likes")
      .insert({
        user_id: userId,
        story_id: storyId,
        chapter_id: chapterId,
      });

    if (error) {
      console.error(
        "Chapter like creation error:",
        error
      );

      setErrorMessage(
        t.chapterLikeButton.unableToLike
      );
      setLoading(false);
      return;
    }

    setIsLiked(true);
    setLikeCount((currentCount) =>
      currentCount + 1
    );
    setLoading(false);
  }

  if (checking) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled
      >
        {t.chapterLikeButton.loadingLikes}
      </Button>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant={
          isLiked ? "outline" : "primary"
        }
        onClick={handleLikeToggle}
        disabled={loading}
      >
        {loading
          ? t.chapterLikeButton.saving
          : isLiked
            ? `♥ ${t.chapterLikeButton.liked} (${likeCount})`
            : `♡ ${t.chapterLikeButton.like} (${likeCount})`}
      </Button>

      {errorMessage && (
        <p className="mt-3 text-sm text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}