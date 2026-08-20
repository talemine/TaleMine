import { useEffect, useState } from "react";

import { useAuth } from "../auth/AuthProvider";
import Button from "../ui/Button";
import { supabase } from "../../services/supabase";

interface ChapterBookmarkButtonProps {
  storyId: string;
  chapterId: string;
}

export default function ChapterBookmarkButton({
  storyId,
  chapterId,
}: ChapterBookmarkButtonProps) {
  const { session } = useAuth();

  const [isBookmarked, setIsBookmarked] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const userId = session?.user.id;

  useEffect(() => {
    let cancelled = false;

    async function checkBookmark() {
      if (!userId) {
        setIsBookmarked(false);
        setChecking(false);
        return;
      }

      setChecking(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", userId)
        .eq("chapter_id", chapterId)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Bookmark check error:",
          error
        );

        setErrorMessage(
          "Unable to check bookmark status."
        );
        setIsBookmarked(false);
      } else {
        setIsBookmarked(Boolean(data));
      }

      setChecking(false);
    }

    checkBookmark();

    return () => {
      cancelled = true;
    };
  }, [userId, chapterId]);

  async function handleBookmarkToggle() {
    if (!userId) {
      setErrorMessage(
        "Please log in to bookmark chapters."
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    if (isBookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("chapter_id", chapterId);

      if (error) {
        console.error(
          "Bookmark removal error:",
          error
        );

        setErrorMessage(
          "Unable to remove this bookmark."
        );
        setLoading(false);
        return;
      }

      setIsBookmarked(false);
      setLoading(false);
      return;
    }

    const { error } = await supabase
        .from("bookmarks")
        .insert({
            user_id: userId,
            story_id: storyId,
            chapter_id: chapterId,
        });
        
    if (error) {
      console.error(
        "Bookmark creation error:",
        error
      );

      setErrorMessage(
        "Unable to bookmark this chapter."
      );
      setLoading(false);
      return;
    }

    setIsBookmarked(true);
    setLoading(false);
  }

  if (checking) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled
      >
        Checking bookmark...
      </Button>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant={isBookmarked ? "outline" : "primary"}
        onClick={handleBookmarkToggle}
        disabled={loading}
      >
        {loading
          ? "Saving..."
          : isBookmarked
            ? "Remove Bookmark"
            : "Bookmark Chapter"}
      </Button>

      {errorMessage && (
        <p className="mt-3 text-sm text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}