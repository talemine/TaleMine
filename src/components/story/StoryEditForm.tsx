import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";

interface Category {
  id: string;
  name: string;
}

interface StoryEditFormProps {
  storyId: string;
  initialTitle: string;
  initialSlug: string;
  initialCategoryId: string | null;
  initialExcerpt: string | null;
  onSaved: (updatedStory: {
    title: string;
    slug: string;
    category_id: string | null;
    excerpt: string | null;
  }) => void;
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function StoryEditForm({
  storyId,
  initialTitle,
  initialSlug,
  initialCategoryId,
  initialExcerpt,
  onSaved,
}: StoryEditFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [categoryId, setCategoryId] =
    useState(initialCategoryId ?? "");
  const [excerpt, setExcerpt] =
    useState(initialExcerpt ?? "");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", {
          ascending: true,
        });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Categories loading error:",
          error
        );

        setErrorMessage(
          "Unable to load story categories."
        );
      } else {
        setCategories(data ?? []);
      }

      setCategoriesLoading(false);
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug || slug === createSlug(initialTitle)) {
      setSlug(createSlug(value));
    }
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedExcerpt = excerpt.trim();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    if (!normalizedTitle) {
      setErrorMessage("Story title is required.");
      setLoading(false);
      return;
    }

    if (!normalizedSlug) {
      setErrorMessage("Story slug is required.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("stories")
      .update({
        title: normalizedTitle,
        slug: normalizedSlug,
        category_id: categoryId || null,
        excerpt: normalizedExcerpt || null,
      })
      .eq("id", storyId)
      .select(
        "title, slug, category_id, excerpt"
      )
      .single();

    if (error) {
      if (error.code === "23505") {
        setErrorMessage(
          "That story slug is already in use."
        );
      } else {
        console.error(
          "Story update error:",
          error
        );

        setErrorMessage(
          "Unable to save your story."
        );
      }

      setLoading(false);
      return;
    }

    onSaved(data);
    setMessage("Story saved successfully.");
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 border-t border-slate-800 pt-8"
    >
      <div>
        <label
          htmlFor="story-edit-title"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Title
        </label>

        <input
          id="story-edit-title"
          type="text"
          value={title}
          onChange={(event) =>
            handleTitleChange(event.target.value)
          }
          required
          disabled={loading}
          className="
            w-full
            rounded-xl
            bg-slate-950/70
            border border-cyan-500/20
            px-5 py-4
            text-white
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-1
            focus:ring-cyan-400
            disabled:opacity-60
          "
        />
      </div>

      <div>
        <label
          htmlFor="story-edit-slug"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Slug
        </label>

        <input
          id="story-edit-slug"
          type="text"
          value={slug}
          onChange={(event) =>
            setSlug(createSlug(event.target.value))
          }
          required
          disabled={loading}
          className="
            w-full
            rounded-xl
            bg-slate-950/70
            border border-cyan-500/20
            px-5 py-4
            text-white
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-1
            focus:ring-cyan-400
            disabled:opacity-60
          "
        />
      </div>

      <div>
        <label
          htmlFor="story-edit-category"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Category
        </label>

        <select
          id="story-edit-category"
          value={categoryId}
          onChange={(event) =>
            setCategoryId(event.target.value)
          }
          disabled={loading || categoriesLoading}
          className="
            w-full
            rounded-xl
            bg-slate-950
            border border-cyan-500/20
            px-5 py-4
            text-white
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-1
            focus:ring-cyan-400
            disabled:opacity-60
          "
        >
          <option value="">
            {categoriesLoading
              ? "Loading categories..."
              : "No category"}
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="story-edit-excerpt"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Excerpt
        </label>

        <textarea
          id="story-edit-excerpt"
          value={excerpt}
          onChange={(event) =>
            setExcerpt(event.target.value)
          }
          rows={4}
          disabled={loading}
          className="
            w-full
            resize-none
            rounded-xl
            bg-slate-950/70
            border border-cyan-500/20
            px-5 py-4
            text-white
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-1
            focus:ring-cyan-400
            disabled:opacity-60
          "
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="text-sm text-cyan-300">
          {message}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Story"}
      </Button>
    </form>
  );
}