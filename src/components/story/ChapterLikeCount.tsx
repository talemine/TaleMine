import { useEffect, useState } from "react";

import { supabase } from "../../services/supabase";

interface ChapterLikeCountProps {
  chapterId: string;
}

export default function ChapterLikeCount({
  chapterId,
}: ChapterLikeCountProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLikeCount() {
      setLoading(true);

      const { count, error } = await supabase
        .from("chapter_likes")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("chapter_id", chapterId);

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Chapter like count loading error:",
          error
        );

        setLikeCount(0);
      } else {
        setLikeCount(count ?? 0);
      }

      setLoading(false);
    }

    loadLikeCount();

    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  if (loading) {
    return (
      <span className="text-sm text-gray-500">
        Loading likes...
      </span>
    );
  }

  return (
    <span className="text-sm text-gray-500">
      ♥ {likeCount}{" "}
      {likeCount === 1 ? "like" : "likes"}
    </span>
  );
}