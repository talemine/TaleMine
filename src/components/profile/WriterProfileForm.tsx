import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

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
  const { t } = useLanguage();

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
        setErrorMessage(
          t.account.writerProfileForm.alreadyHaveProfile
        );
      } else {
        console.error(
          "Writer profile creation error:",
          error
        );
        setErrorMessage(
          t.account.writerProfileForm.unableToCreate
        );
      }

      setLoading(false);
      return;
    }

    onCreated(data);
    setMessage(
      t.account.writerProfileForm.createdSuccessfully
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
          htmlFor="pen-name"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.account.writerProfileForm.penName}
        </label>

        <input
          id="pen-name"
          type="text"
          value={penName}
          onChange={(event) =>
            setPenName(event.target.value)
          }
          disabled={loading}
          placeholder={
            t.account.writerProfileForm.penNamePlaceholder
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
          htmlFor="author-bio"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.account.writerProfileForm.authorBio}
        </label>

        <textarea
          id="author-bio"
          value={authorBio}
          onChange={(event) =>
            setAuthorBio(event.target.value)
          }
          rows={4}
          disabled={loading}
          placeholder={
            t.account.writerProfileForm.authorBioPlaceholder
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

      <div>
        <label
          htmlFor="website-url"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {t.account.writerProfileForm.website}
        </label>

        <input
          id="website-url"
          type="url"
          value={websiteUrl}
          onChange={(event) =>
            setWebsiteUrl(event.target.value)
          }
          disabled={loading}
          placeholder={
            t.account.writerProfileForm.websitePlaceholder
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
        {loading
          ? t.account.writerProfileForm.creating
          : t.account.writerProfileForm.becomeWriter}
      </Button>
    </form>
  );
}