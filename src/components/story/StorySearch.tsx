import { useState } from "react";

interface StorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StorySearch({
  value,
  onChange,
}: StorySearchProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="mt-6 mx-auto max-w-2xl">
      <label
        htmlFor="story-search"
        className="sr-only"
      >
        Search stories
      </label>

      <div
        className={`
          flex
          items-center
          rounded-2xl
          border
          bg-slate-950/50
          px-5
          py-4
          transition
          ${
            focused
              ? "border-cyan-400 ring-1 ring-cyan-400"
              : "border-slate-800"
          }
        `}
      >
        <input
          id="story-search"
          type="search"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search stories..."
          className="
            w-full
            bg-transparent
            text-white
            outline-none
            placeholder:text-gray-500
          "
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear story search"
            className="ml-3 text-sm text-gray-400 transition hover:text-white"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}