import { useNavigate } from "react-router-dom";

interface PublicStoryCardProps {
  title: string;
  slug: string;
  excerpt: string | null;
  categoryName: string | null;
  penName: string | null;
  publishedAt: string | null;
  coverImageUrl: string | null;
}

export default function PublicStoryCard({
  title,
  slug,
  excerpt,
  categoryName,
  penName,
  publishedAt,
  coverImageUrl,
}: PublicStoryCardProps) {
  const navigate = useNavigate();

  return (
    <article
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-950/50
        transition
        duration-200
        hover:border-cyan-500/40
      "
    >
      {coverImageUrl && (
        <button
          type="button"
          onClick={() => navigate(`/story/${slug}`)}
          className="block w-full"
          aria-label={`Read ${title}`}
        >
          <img
            src={coverImageUrl}
            alt={title}
            className="
              h-56
              w-full
              object-cover
              transition
              duration-300
              hover:scale-[1.02]
            "
          />
        </button>
      )}

      <div className="p-6">
        <div className="flex flex-wrap gap-3">
          {categoryName && (
            <span className="rounded-full border border-cyan-500/20 px-3 py-1 text-xs uppercase tracking-wide text-cyan-300">
              {categoryName}
            </span>
          )}

          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
            Published
          </span>
        </div>

        <h3 className="mt-5 text-2xl font-semibold text-white">
          {title}
        </h3>

        {excerpt && (
          <p className="mt-3 leading-7 text-gray-400">
            {excerpt}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {penName && (
            <span>
              By{" "}
              <span className="text-cyan-400">
                {penName}
              </span>
            </span>
          )}

          {penName && publishedAt && (
            <span>•</span>
          )}

          {publishedAt && (
            <span>
              Published{" "}
              {new Date(
                publishedAt
              ).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() =>
              navigate(`/story/${slug}`)
            }
            className="
              rounded-full
              bg-cyan-500
              px-5
              py-3
              font-medium
              text-slate-950
              transition
              hover:bg-cyan-400
            "
          >
            Read Story
          </button>
        </div>
      </div>
    </article>
  );
}