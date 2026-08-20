import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

interface Category {
  id: string;
  name: string;
}

interface StoryCategoryFilterProps {
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function StoryCategoryFilter({
  selectedCategoryId,
  onCategoryChange,
}: StoryCategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoading(true);
      setErrorMessage("");

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

        setCategories([]);
        setErrorMessage(
          "Unable to load story categories."
        );
      } else {
        setCategories(data ?? []);
      }

      setLoading(false);
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <span className="text-sm text-gray-400">
          Loading categories...
        </span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mt-6 text-center">
        <p className="text-sm text-red-400">
          {errorMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <button
        type="button"
        onClick={() => onCategoryChange(null)}
        className={`
          rounded-full
          border
          px-4
          py-2
          text-sm
          transition
          ${
            selectedCategoryId === null
              ? "border-cyan-400 bg-cyan-500 text-slate-950"
              : "border-slate-700 bg-slate-950/50 text-gray-300 hover:border-cyan-500/40 hover:text-white"
          }
        `}
      >
        All
      </button>

      {categories.map((category) => {
        const selected =
          selectedCategoryId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() =>
              onCategoryChange(category.id)
            }
            className={`
              rounded-full
              border
              px-4
              py-2
              text-sm
              transition
              ${
                selected
                  ? "border-cyan-400 bg-cyan-500 text-slate-950"
                  : "border-slate-700 bg-slate-950/50 text-gray-300 hover:border-cyan-500/40 hover:text-white"
              }
            `}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}