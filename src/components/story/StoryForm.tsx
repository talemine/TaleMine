import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

interface Category {
  id: string;
  name: string;
}

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

interface StoryFormProps {
  writerProfileId: string;
  onCreated: (story: Story) => void;
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function StoryForm({
  writerProfileId,
  onCreated,
}: StoryFormProps) {
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setCategoriesLoading(true);

      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Categories loading error:",
          error
        );

        setErrorMessage(
          t.storyForm.unableToLoadCategories
        );

        setCategories([]);
      } else {
        setCategories(data ?? []);
      }

      setCategoriesLoading(false);
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [t.storyForm.unableToLoadCategories]);

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(createSlug(value));
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const normalizedTitle = title.trim();
    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedExcerpt = excerpt.trim();

    if (!normalizedTitle) {
      setErrorMessage(
        t.storyForm.titleRequired
      );
      setLoading(false);
      return;
    }

    if (!normalizedSlug) {
      setErrorMessage(
        t.storyForm.slugRequired
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("stories")
      .insert({
        writer_profile_id: writerProfileId,
        category_id: categoryId || null,
        title: normalizedTitle,
        slug: normalizedSlug,
        excerpt: normalizedExcerpt || null,
        status: "draft",
      })
      .select(
        "id, writer_profile_id, category_id, title, slug, excerpt, cover_image_url, status, published_at, created_at, updated_at"
      )
      .single();

    if (error) {
      if (error.code === "23505") {
        setErrorMessage(
          t.storyForm.slugAlreadyExists
        );
      } else {
        console.error(
          "Story creation error:",
          error
        );

        setErrorMessage(
          t.storyForm.unableToCreate
        );
      }

      setLoading(false);
      return;
    }

    onCreated(data);

    setTitle("");
    setSlug("");
    setExcerpt("");
    setCategoryId("");

    setMessage(
      t.storyForm.createdSuccessfully
    );

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 border-t border-slate-800 pt-8"
    >
      <div>
        <label
          htmlFor="story-title"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.storyForm.title}
        </label>

        <input
          id="story-title"
          type="text"
          value={title}
          onChange={(event) =>
            handleTitleChange(event.target.value)
          }
          required
          disabled={loading}
          placeholder={
            t.storyForm.titlePlaceholder
          }
          className="
            w-full
            rounded-xl
            bg-slate-950/70
            border border-cyan-500/20
            px-5 py-4
            text-white
            placeholder-gray-500
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
          htmlFor="story-slug"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.storyForm.slug}
        </label>

        <input
          id="story-slug"
          type="text"
          value={slug}
          onChange={(event) =>
            setSlug(
              createSlug(event.target.value)
            )
          }
          required
          disabled={loading}
          placeholder={
            t.storyForm.slugPlaceholder
          }
          className="
            w-full
            rounded-xl
            bg-slate-950/70
            border border-cyan-500/20
            px-5 py-4
            text-white
            placeholder-gray-500
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
          htmlFor="story-category"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.storyForm.category}
        </label>

        <select
          id="story-category"
          value={categoryId}
          onChange={(event) =>
            setCategoryId(event.target.value)
          }
          disabled={
            loading || categoriesLoading
          }
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
              ? t.storyForm.loadingCategories
              : t.storyForm.selectCategory}
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
          htmlFor="story-excerpt"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.storyForm.excerpt}
        </label>

        <textarea
          id="story-excerpt"
          value={excerpt}
          onChange={(event) =>
            setExcerpt(event.target.value)
          }
          rows={4}
          disabled={loading}
          placeholder={
            t.storyForm.excerptPlaceholder
          }
          className="
            w-full
            resize-none
            rounded-xl
            bg-slate-950/70
            border border-cyan-500/20
            px-5 py-4
            text-white
            placeholder-gray-500
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

      <Button
        type="submit"
        disabled={loading}
      >
        {loading
          ? t.storyForm.creating
          : t.storyForm.createStory}
      </Button>
    </form>
  );
}