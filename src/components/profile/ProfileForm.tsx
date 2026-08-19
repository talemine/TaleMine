import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";

interface ProfileFormProps {
  profileId: string;
  initialUsername: string;
  initialDisplayName: string;
  initialBio: string | null;
  onSaved: (profile: {
    username: string;
    display_name: string;
    bio: string | null;
  }) => void;
}

export default function ProfileForm({
  profileId,
  initialUsername,
  initialDisplayName,
  initialBio,
  onSaved,
}: ProfileFormProps) {
  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio ?? "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const normalizedUsername = username.trim();
    const normalizedDisplayName = displayName.trim();
    const normalizedBio = bio.trim();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    if (!normalizedUsername || !normalizedDisplayName) {
      setErrorMessage("Username and display name are required.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: normalizedUsername,
        display_name: normalizedDisplayName,
        bio: normalizedBio || null,
      })
      .eq("id", profileId)
      .select("username, display_name, bio")
      .single();

    if (error) {
      if (error.code === "23505") {
        setErrorMessage("That username is already in use.");
      } else {
        console.error("Profile update error:", error);
        setErrorMessage("Unable to save your profile.");
      }

      setLoading(false);
      return;
    }

    setUsername(data.username);
    setDisplayName(data.display_name);
    setBio(data.bio ?? "");

    onSaved(data);
    setMessage("Profile saved successfully.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5 border-t border-slate-800 pt-8">
      <div>
        <label
          htmlFor="profile-username"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Username
        </label>

        <input
          id="profile-username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
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
          htmlFor="profile-display-name"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Display Name
        </label>

        <input
          id="profile-display-name"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
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
          htmlFor="profile-bio"
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          Bio
        </label>

        <textarea
          id="profile-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
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
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}