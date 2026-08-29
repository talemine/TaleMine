import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

interface Bookmark {
  id: string;
  story_id: string;
  chapter_id: string;
  created_at: string;
}

interface Chapter {
  id: string;
  story_id: string;
  chapter_number: number;
  title: string | null;
  status: string;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface BookmarkItem {
  bookmark: Bookmark;
  story: Story;
  chapter: Chapter;
}

export default function MyBookmarks() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { language, t } = useLanguage();

  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBookmarks() {
      if (!session?.user.id) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: bookmarkData,
          error: bookmarkError,
        } = await supabase
          .from("bookmarks")
          .select(
            "id, story_id, chapter_id, created_at"
          )
          .eq("user_id", session.user.id)
          .order("created_at", {
            ascending: false,
          });

        if (cancelled) {
          return;
        }

        if (bookmarkError) {
          console.error(
            "Bookmarks loading error:",
            bookmarkError
          );

          setItems([]);
          setErrorMessage(
            t.bookmarks.unableToLoad
          );
          setLoading(false);
          return;
        }

        const bookmarks = bookmarkData ?? [];

        if (bookmarks.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        const storyIds = Array.from(
          new Set(
            bookmarks.map(
              (bookmark) => bookmark.story_id
            )
          )
        );

        const chapterIds = Array.from(
          new Set(
            bookmarks.map(
              (bookmark) => bookmark.chapter_id
            )
          )
        );

        const [
          storyResult,
          chapterResult,
        ] = await Promise.all([
          supabase
            .from("stories")
            .select(
              "id, title, slug, status"
            )
            .in("id", storyIds)
            .eq("status", "published"),

          supabase
            .from("chapters")
            .select(
              "id, story_id, chapter_number, title, status"
            )
            .in("id", chapterIds)
            .eq("status", "published"),
        ]);

        if (cancelled) {
          return;
        }

        if (storyResult.error) {
          console.error(
            "Bookmarked stories loading error:",
            storyResult.error
          );

          setItems([]);
          setErrorMessage(
            t.bookmarks.unableToLoadStories
          );
          setLoading(false);
          return;
        }

        if (chapterResult.error) {
          console.error(
            "Bookmarked chapters loading error:",
            chapterResult.error
          );

          setItems([]);
          setErrorMessage(
            t.bookmarks.unableToLoadChapters
          );
          setLoading(false);
          return;
        }

        const stories =
          storyResult.data ?? [];
        const chapters =
          chapterResult.data ?? [];

        const loadedItems: BookmarkItem[] =
          [];

        for (const bookmark of bookmarks) {
          const story = stories.find(
            (item) =>
              item.id === bookmark.story_id
          );

          const chapter = chapters.find(
            (item) =>
              item.id === bookmark.chapter_id
          );

          if (story && chapter) {
            loadedItems.push({
              bookmark,
              story,
              chapter,
            });
          }
        }

        setItems(loadedItems);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "My bookmarks error:",
          error
        );

        setItems([]);
        setErrorMessage(
          t.bookmarks.unableToLoad
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBookmarks();

    return () => {
      cancelled = true;
    };
  }, [
    session?.user.id,
    t.bookmarks.unableToLoad,
    t.bookmarks.unableToLoadStories,
    t.bookmarks.unableToLoadChapters,
  ]);

  const locale =
    language === "hi"
      ? "hi-IN"
      : "en-IN";

  if (loading) {
    return (
      <section className="mt-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
          <p className="text-gray-400">
            {t.bookmarks.loading}
          </p>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mt-10">
        <div className="rounded-2xl border border-red-500/20 bg-slate-950/50 p-8 text-center">
          <p className="text-red-400">
            {errorMessage}
          </p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mt-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
          <h2 className="text-2xl font-bold">
            {t.bookmarks.myBookmarks}
          </h2>

          <p className="mt-3 text-gray-400">
            {t.bookmarks.empty}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div>
        <p className="text-sm text-gray-400">
          {t.bookmarks.reading}
        </p>

        <h2 className="mt-1 text-3xl font-bold">
          {t.bookmarks.myBookmarks}
        </h2>
      </div>

      <div className="mt-6 space-y-4">
        {items.map(
          ({
            bookmark,
            story,
            chapter,
          }) => {
            const chapterLabel =
              `${t.bookmarks.chapter} ${chapter.chapter_number}`;

            return (
              <article
                key={bookmark.id}
                className="
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-950/50
                  p-6
                  transition
                  hover:border-cyan-500/40
                "
              >
                <p className="text-sm text-cyan-400">
                  {chapterLabel}
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                  {chapter.title ||
                    chapterLabel}
                </h3>

                <p className="mt-2 text-sm text-cyan-300">
                  {t.bookmarks.from}{" "}
                  {story.title}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  {t.bookmarks.bookmarked}{" "}
                  {new Date(
                    bookmark.created_at
                  ).toLocaleDateString(
                    locale
                  )}
                </p>

                <div className="mt-5">
                  <Button
                    onClick={() =>
                      navigate(
                        `/story/${story.slug}/chapter/${chapter.chapter_number}`
                      )
                    }
                  >
                    {t.bookmarks.continueReading}
                  </Button>
                </div>
              </article>
            );
          }
        )}
      </div>
    </section>
  );
}