import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onUploaded: (avatarUrl: string) => void;
}

const MAX_FILE_SIZE = 1 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
  onUploaded,
}: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setSelectedFile(null);
    setMessage("");
    setErrorMessage("");

    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage(
        "Please choose a JPG, PNG, WebP, or GIF image."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("Avatar image must be 1 MB or smaller.");
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setErrorMessage("Please choose an image first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const fileExtension =
      selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, selectedFile, {
        contentType: selectedFile.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      setErrorMessage("Unable to upload your avatar.");
      setLoading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Avatar profile update error:", profileError);
      setErrorMessage("Avatar uploaded, but the profile could not be updated.");
      setLoading(false);
      return;
    }

    onUploaded(publicUrl);
    setSelectedFile(null);
    setMessage("Avatar updated successfully.");
    setLoading(false);
  }

  return (
    <div className="mt-8 border-t border-slate-800 pt-8">
      <p className="text-sm text-gray-400">
        Profile Avatar
      </p>

      <div className="mt-4 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="h-24 w-24 overflow-hidden rounded-full border border-cyan-500/30 bg-slate-950">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Profile avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
              No Avatar
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={loading}
            className="
              block
              w-full
              text-sm
              text-gray-300
              file:mr-4
              file:rounded-full
              file:border-0
              file:bg-cyan-500
              file:px-4
              file:py-2
              file:font-semibold
              file:text-black
              hover:file:bg-cyan-400
              disabled:opacity-50
            "
          />

          {selectedFile && (
            <p className="text-sm text-gray-400">
              Selected: {selectedFile.name}
            </p>
          )}

          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || loading}
          >
            {loading ? "Uploading..." : "Upload Avatar"}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <p className="mt-4 text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="mt-4 text-sm text-cyan-300">
          {message}
        </p>
      )}
    </div>
  );
}