import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ChapterEditForm from "../../components/story/ChapterEditForm";
import ChapterForm from "../../components/story/ChapterForm";
import StoryEditForm from "../../components/story/StoryEditForm";
import { useAuth } from "../../components/auth/AuthProvider";
import Button from "../../components/ui/Button";
import { supabase } from "../../services/supabase";

interface Story {
  id: string;
  writer_profile_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  story_id: string;
  chapter_number: number;
  title: string | null;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function StoryEditor() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();

  const userId = session?.user.id;

  const [story, setStory] = useState<Story | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showStoryEditForm, setShowStoryEditForm] =
    useState(false);
  const [showChapterForm, setShowChapterForm] =
    useState(false);
  const [editingChapterId, setEditingChapterId] =
    useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStoryEditor() {
      if (!userId || !storyId) {
        setStory(null);
        setCategory(null);
        setChapters([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const { data: storyData, error: storyError } =
          await supabase
            .from("stories")
            .select(
              "id, writer_profile_id, category_id, title, slug, excerpt, cover_image_url, status, published_at, created_at, updated_at"
            )
            .eq("id", storyId)
            .eq("writer_profile_id", userId)
            .single();

        if (cancelled) {
          return;
        }

        if (storyError) {
          console.error("Story loading error:", storyError);

          setStory(null);
          setCategory(null);
          setChapters([]);
          setErrorMessage("Unable to load this story.");
          setLoading(false);
          return;
        }

        setStory(storyData);

        const categoryPromise = storyData.category_id
          ? supabase
              .from("categories")
              .select("id, name")
              .eq("id", storyData.category_id)
              .single()
          : Promise.resolve({
              data: null,
              error: null,
            });

        const chaptersPromise = supabase
          .from("chapters")
          .select(
            "id, story_id, chapter_number, title, content, status, created_at, updated_at"
          )
          .eq("story_id", storyId)
          .order("chapter_number", {
            ascending: true,
          });

        const [categoryResult, chaptersResult] =
          await Promise.all([
            categoryPromise,
            chaptersPromise,
          ]);

        if (cancelled) {
          return;
        }

        if (categoryResult.error) {
          console.error(
            "Category loading error:",
            categoryResult.error
          );

          setCategory(null);
          setErrorMessage(
            "Story loaded, but the category could not be loaded."
          );
        } else {
          setCategory(categoryResult.data ?? null);
        }

        if (chaptersResult.error) {
          console.error(
            "Chapters loading error:",
            chaptersResult.error
          );

          setChapters([]);
          setErrorMessage(
            "Story loaded, but the chapters could not be loaded."
          );
        } else {
          setChapters(chaptersResult.data ?? []);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Story editor loading error:",
          error
        );

        setStory(null);
        setCategory(null);
        setChapters([]);
        setErrorMessage(
          "Unable to load the story editor."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStoryEditor();

    return () => {
      cancelled = true;
    };
  }, [userId, storyId]);

  async function handleDeleteStory() {
    if (!story) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${story.title}"?\n\nThis will also permanently delete all chapters belonging to this story.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("stories")
      .delete()
      .eq("id", story.id);

    if (error) {
      console.error(
        "Story deletion error:",
        error
      );

      setErrorMessage(
        "Unable to delete this story."
      );
      setDeleting(false);
      return;
    }

    navigate("/writer", { replace: true });
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-gray-300">
          Loading story...
        </p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-4xl font-bold">
            Please Log In
          </h1>

          <p className="mt-4 text-gray-300">
            You need to be signed in to edit a story.
          </p>

          <div className="mt-8 flex justify-center">
            <Button onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-4xl font-bold">
            Story Not Found
          </h1>

          <p className="mt-4 text-gray-300">
            This story does not exist or does not belong to
            your writer account.
          </p>

          <div className="mt-8 flex justify-center">
            <Button onClick={() => navigate("/writer")}>
              Back to Writer Dashboard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-8">

          {/* Story Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Story Editor
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                {story.title}
              </h1>

              <p className="mt-3 text-gray-400">
                /{story.slug}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/writer")}
                disabled={deleting}
              >
                Back to Writer Dashboard
              </Button>

              <Button
                variant="outline"
                onClick={handleDeleteStory}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Story"}
              </Button>
            </div>
          </div>

          {errorMessage && (
            <p className="mt-6 text-sm text-red-400">
              {errorMessage}
            </p>
          )}

          {/* Story Details */}
          <section className="mt-10 border-t border-slate-800 pt-8">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
                {story.status}
              </span>

              {category && (
                <span className="rounded-full border border-cyan-500/20 px-3 py-1 text-xs uppercase tracking-wide text-cyan-300">
                  {category.name}
                </span>
              )}
            </div>

            <div className="mt-8">
              <p className="text-sm text-gray-400">
                Excerpt
              </p>

              <p className="mt-2 text-lg leading-8 text-gray-200">
                {story.excerpt ||
                  "No excerpt has been added yet."}
              </p>
            </div>

            {/* Edit Story */}
            <div className="mt-6">
              <Button
                onClick={() =>
                  setShowStoryEditForm(
                    (current) => !current
                  )
                }
              >
                {showStoryEditForm
                  ? "Cancel"
                  : "Edit Story"}
              </Button>

              {showStoryEditForm && (
                <StoryEditForm
                  storyId={story.id}
                  initialTitle={story.title}
                  initialSlug={story.slug}
                  initialCategoryId={story.category_id}
                  initialExcerpt={story.excerpt}
                  onSaved={(updatedStory) => {
                    setStory((currentStory) =>
                      currentStory
                        ? {
                            ...currentStory,
                            ...updatedStory,
                          }
                        : currentStory
                    );

                    setShowStoryEditForm(false);
                  }}
                />
              )}
            </div>
          </section>

          {/* Chapters */}
          <section className="mt-10 border-t border-slate-800 pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Chapters
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Story Chapters
                </h2>
              </div>

              <span className="w-fit rounded-full border border-cyan-500/20 px-4 py-2 text-sm text-cyan-300">
                {chapters.length}{" "}
                {chapters.length === 1
                  ? "chapter"
                  : "chapters"}
              </span>
            </div>

            {/* Chapter Creation */}
            <div className="mt-6">
              <Button
                onClick={() =>
                  setShowChapterForm(
                    (current) => !current
                  )
                }
              >
                {showChapterForm
                  ? "Cancel"
                  : "Create Chapter"}
              </Button>

              {showChapterForm && (
                <ChapterForm
                  storyId={story.id}
                  onCreated={(createdChapter) => {
                    setChapters((currentChapters) => [
                      ...currentChapters,
                      createdChapter,
                    ]);

                    setShowChapterForm(false);
                  }}
                />
              )}
            </div>

            {/* Chapter List */}
            {chapters.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
                <h3 className="text-xl font-semibold">
                  No chapters yet
                </h3>

                <p className="mt-3 text-gray-400">
                  Create the first chapter for this story.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {chapters.map((chapter) => (
                  <article
                    key={chapter.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm text-cyan-400">
                            Chapter{" "}
                            {chapter.chapter_number}
                          </span>

                          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
                            {chapter.status}
                          </span>
                        </div>

                        <h3 className="mt-2 text-xl font-semibold">
                          {chapter.title ||
                            `Chapter ${chapter.chapter_number}`}
                        </h3>

                        <p className="mt-3 whitespace-pre-wrap text-gray-400">
                          {chapter.content}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() =>
                          setEditingChapterId(
                            (currentId) =>
                              currentId === chapter.id
                                ? null
                                : chapter.id
                          )
                        }
                      >
                        {editingChapterId === chapter.id
                          ? "Cancel"
                          : "Edit"}
                      </Button>
                    </div>

                    {editingChapterId === chapter.id && (
                      <ChapterEditForm
                        chapterId={chapter.id}
                        initialTitle={chapter.title}
                        initialContent={chapter.content}
                        onSaved={(updatedChapter) => {
                          setChapters(
                            (currentChapters) =>
                              currentChapters.map(
                                (currentChapter) =>
                                  currentChapter.id ===
                                  chapter.id
                                    ? {
                                        ...currentChapter,
                                        ...updatedChapter,
                                      }
                                    : currentChapter
                              )
                          );

                          setEditingChapterId(null);
                        }}
                      />
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}