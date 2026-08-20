import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";
import PublicStoryCard from "./PublicStoryCard";
import StoryCategoryFilter from "./StoryCategoryFilter";
import StorySearch from "./StorySearch";

interface PublicStory {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category_id: string | null;
  writer_profile_id: string;
  published_at: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface WriterProfile {
  profile_id: string;
  pen_name: string | null;
}

interface Profile {
  id: string;
  display_name: string;
}

export default function PublicStoryList() {
  const navigate = useNavigate();

  const [stories, setStories] = useState<PublicStory[]>([]);
  const [categories, setCategories] = useState<Category[]>(
    []
  );
  const [writerProfiles, setWriterProfiles] = useState<
    WriterProfile[]
  >([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPublishedStories() {
      setLoading(true);
      setErrorMessage("");

      try {
        const { data: storyData, error: storyError } =
          await supabase
            .from("stories")
            .select(
              "id, title, slug, excerpt, category_id, writer_profile_id, published_at"
            )
            .eq("status", "published")
            .order("published_at", {
              ascending: false,
            });

        if (cancelled) {
          return;
        }

        if (storyError) {
          console.error(
            "Published stories loading error:",
            storyError
          );

          setStories([]);
          setCategories([]);
          setWriterProfiles([]);
          setProfiles([]);
          setErrorMessage(
            "Unable to load published stories."
          );
          return;
        }

        const loadedStories = storyData ?? [];

        setStories(loadedStories);

        const categoryIds = Array.from(
          new Set(
            loadedStories
              .map((story) => story.category_id)
              .filter(
                (id): id is string => Boolean(id)
              )
          )
        );

        const writerProfileIds = Array.from(
          new Set(
            loadedStories
              .map((story) => story.writer_profile_id)
              .filter(
                (id): id is string => Boolean(id)
              )
          )
        );

        const [
          categoryResult,
          writerProfileResult,
          profileResult,
        ] = await Promise.all([
          categoryIds.length > 0
            ? supabase
                .from("categories")
                .select("id, name")
                .in("id", categoryIds)
            : Promise.resolve({
                data: [],
                error: null,
              }),

          writerProfileIds.length > 0
            ? supabase
                .from("writer_profiles")
                .select("profile_id, pen_name")
                .in("profile_id", writerProfileIds)
            : Promise.resolve({
                data: [],
                error: null,
              }),

          writerProfileIds.length > 0
            ? supabase
                .from("profiles")
                .select("id, display_name")
                .in("id", writerProfileIds)
            : Promise.resolve({
                data: [],
                error: null,
              }),
        ]);

        if (cancelled) {
          return;
        }

        if (categoryResult.error) {
          console.error(
            "Story categories loading error:",
            categoryResult.error
          );
          setCategories([]);
        } else {
          setCategories(categoryResult.data ?? []);
        }

        if (writerProfileResult.error) {
          console.error(
            "Writer profiles loading error:",
            writerProfileResult.error
          );
          setWriterProfiles([]);
        } else {
          setWriterProfiles(
            writerProfileResult.data ?? []
          );
        }

        if (profileResult.error) {
          console.error(
            "Profiles loading error:",
            profileResult.error
          );
          setProfiles([]);
        } else {
          setProfiles(profileResult.data ?? []);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Public story list loading error:",
          error
        );

        setStories([]);
        setCategories([]);
        setWriterProfiles([]);
        setProfiles([]);
        setErrorMessage(
          "Unable to load published stories."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPublishedStories();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStories = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    return stories.filter((story) => {
      const matchesCategory =
        selectedCategoryId === null ||
        story.category_id === selectedCategoryId;

      const matchesSearch =
        normalizedSearch === "" ||
        story.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        (story.excerpt ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [
    stories,
    selectedCategoryId,
    searchQuery,
  ]);

  function getCategoryName(
    categoryId: string | null
  ) {
    if (!categoryId) {
      return null;
    }

    return (
      categories.find(
        (category) => category.id === categoryId
      )?.name ?? null
    );
  }

  function getAuthorName(
    writerProfileId: string
  ) {
    const writerProfile = writerProfiles.find(
      (profile) =>
        profile.profile_id === writerProfileId
    );

    const profile = profiles.find(
      (profile) =>
        profile.id === writerProfileId
    );

    return (
      writerProfile?.pen_name?.trim() ||
      profile?.display_name?.trim() ||
      null
    );
  }

  if (loading) {
    return (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
            <p className="text-gray-400">
              Loading stories...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-500/20 bg-slate-950/50 p-8 text-center">
            <p className="text-red-400">
              {errorMessage}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Discover
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            Published Stories
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Explore stories currently available to read
            on TaleMine.
          </p>
        </div>

        <StorySearch
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <StoryCategoryFilter
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
        />

        {filteredStories.length === 0 ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center">
            <h3 className="text-xl font-semibold">
              {searchQuery.trim() ||
              selectedCategoryId
                ? "No matching stories"
                : "No published stories yet"}
            </h3>

            <p className="mt-3 text-gray-400">
              {searchQuery.trim() ||
              selectedCategoryId
                ? "Try a different search or category."
                : "Check back soon for new stories."}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {filteredStories.map((story) => (
              <PublicStoryCard
                key={story.id}
                title={story.title}
                slug={story.slug}
                excerpt={story.excerpt}
                categoryName={getCategoryName(
                  story.category_id
                )}
                penName={getAuthorName(
                  story.writer_profile_id
                )}
                publishedAt={story.published_at}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}