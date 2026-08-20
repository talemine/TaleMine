import { useState } from "react";

import { supabase } from "../../services/supabase";
import Button from "../ui/Button";

interface StoryCoverUploadProps {
  storyId: string;
  writerProfileId: string;
  currentCoverUrl: string | null;
  onUploaded: (coverUrl: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function StoryCoverUpload({
  storyId,
  writerProfileId,
  currentCoverUrl,
  onUploaded,
}: StoryCoverUploadProps) {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

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
        "Please choose a JPG, PNG, or WebP image."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        "Story cover image must be 5 MB or smaller."
      );
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setErrorMessage(
        "Please choose an image first."
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const fileExtension =
      selectedFile.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    const filePath =
      `${writerProfileId}/${storyId}/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("story-covers")
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Story cover upload error:",
        uploadError
      );

      setErrorMessage(
        "Unable to upload the story cover."
      );
      setLoading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("story-covers")
      .getPublicUrl(filePath);

    const { error: storyError } =
      await supabase
        .from("stories")
        .update({
          cover_image_url: publicUrl,
        })
        .eq("id", storyId)
        .eq(
          "writer_profile_id",
          writerProfileId
        );

    if (storyError) {
      console.error(
        "Story cover database update error:",
        storyError
      );

      setErrorMessage(
        "Cover uploaded, but the story could not be updated."
      );
      setLoading(false);
      return;
    }

    onUploaded(publicUrl);
    setSelectedFile(null);
    setMessage(
      "Story cover updated successfully."
    );
    setLoading(false);
  }

  return (
    <div className="mt-8 border-t border-slate-800 pt-8">
      <p className="text-sm text-gray-400">
        Story Cover
      </p>

      <div className="mt-4 flex flex-col gap-5">
        <div className="h-64 w-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950">
          {currentCoverUrl ? (
            <img
              src={currentCoverUrl}
              alt="Story cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
              No Cover Image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
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
            disabled={
              !selectedFile || loading
            }
          >
            {loading
              ? "Uploading..."
              : "Upload Cover"}
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