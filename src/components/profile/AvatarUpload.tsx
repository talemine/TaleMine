import { useState } from "react";
import { supabase } from "../../services/supabase";
import Button from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

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
  const { t } = useLanguage();

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
      setErrorMessage(t.account.avatar.invalidImageType);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(t.account.avatar.imageTooLarge);
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setErrorMessage(t.account.avatar.chooseImageFirst);
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
      setErrorMessage(t.account.avatar.uploadFailed);
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
      console.error(
        "Avatar profile update error:",
        profileError
      );
      setErrorMessage(
        t.account.avatar.profileUpdateFailed
      );
      setLoading(false);
      return;
    }

    onUploaded(publicUrl);
    setSelectedFile(null);
    setMessage(t.account.avatar.updatedSuccessfully);
    setLoading(false);
  }

  return (
    <div className="mt-8 border-t border-slate-800 pt-8">
      <p className="text-sm text-gray-400">
        {t.account.avatar.profileAvatar}
      </p>

      <div className="mt-4 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="h-24 w-24 overflow-hidden rounded-full border border-cyan-500/30 bg-slate-950">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt={t.account.avatar.profileAvatarAlt}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
              {t.account.avatar.noAvatar}
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
              {t.account.avatar.selected}: {selectedFile.name}
            </p>
          )}

          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || loading}
          >
            {loading
              ? t.account.avatar.uploading
              : t.account.avatar.uploadAvatar}
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