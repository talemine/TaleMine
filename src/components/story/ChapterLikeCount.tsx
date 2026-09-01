import { useEffect, useState } from "react";

import { supabase } from "../../services/supabase";
import { useLanguage } from "../../i18n/LanguageContext";

interface ChapterLikeCountProps {
  chapterId: string;
}

export default function ChapterLikeCount({
  chapterId,
}: ChapterLikeCountProps) {
  const { t } = useLanguage();

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
        {t.chapterLikeCount.loading}
      </span>
    );
  }

  return (
    <span className="text-sm text-gray-500">
      ♥ {likeCount}{" "}
      {likeCount === 1
        ? t.chapterLikeCount.like
        : t.chapterLikeCount.likes}
    </span>
  );
}