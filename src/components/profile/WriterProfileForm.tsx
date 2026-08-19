import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";

interface WriterProfileFormProps {
  profileId: string;
  onCreated: (writerProfile: {
    profile_id: string;
    pen_name: string | null;
    author_bio: string | null;
    website_url: string | null;
  }) => void;
}

export default function WriterProfileForm({
  profileId,
  onCreated,
}: WriterProfileFormProps) {
  const [penName, setPenName] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const normalizedPenName = penName.trim();
    const normalizedAuthorBio = authorBio.trim();
    const normalizedWebsiteUrl = websiteUrl.trim();

    const { data, error } = await supabase
      .from("writer_profiles")
      .insert({
        profile_id: profileId,
        pen_name: normalizedPenName || null,
        author_bio: normalizedAuthorBio || null,
        website_url: normalizedWebsiteUrl || null,
      })
      .select(
        "profile_id, pen_name, author_bio, website_url"
      )
      .single();

    if (error) {
      if (error.code === "23505") {
        setErrorMessage("You already have a writer profile.");
      } else {
        console.error("Writer profile creation error:", error);
        setErrorMessage("Unable to create your writer profile.");
      }

      setLoading(false);
      return;
    }

    onCreated(data);
    setMessage("Writer profile created successfully.");
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 border-t border-slate-800 pt-8"
    >
      <div>
        <label
          htmlFor="pen-name"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Pen Name
        </label>

        <input
          id="pen-name"
          type="text"
          value={penName}
          onChange={(event) => setPenName(event.target.value)}
          disabled={loading}
          placeholder="Your author name"
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
          htmlFor="author-bio"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Author Bio
        </label>

        <textarea
          id="author-bio"
          value={authorBio}
          onChange={(event) => setAuthorBio(event.target.value)}
          rows={4}
          disabled={loading}
          placeholder="Tell readers about yourself as a writer."
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

      <div>
        <label
          htmlFor="website-url"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Website
        </label>

        <input
          id="website-url"
          type="url"
          value={websiteUrl}
          onChange={(event) => setWebsiteUrl(event.target.value)}
          disabled={loading}
          placeholder="https://example.com"
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
        {loading ? "Creating..." : "Become a Writer"}
      </Button>
    </form>
  );
}