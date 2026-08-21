import { useEffect, useState } from "react";

import { useAuth } from "../auth/AuthProvider";
import Button from "../ui/Button";
import ChapterCommentEdit from "./ChapterCommentEdit";
import ChapterCommentModeration from "./ChapterCommentModeration";
import { supabase } from "../../services/supabase";

interface ChapterCommentsProps {
  storyId: string;
  chapterId: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface CommenterProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

interface CommentWithProfile extends Comment {
  profile: CommenterProfile | null;
}

export default function ChapterComments({
  storyId,
  chapterId,
}: ChapterCommentsProps) {
  const { session } = useAuth();

  const [comments, setComments] = useState<
    CommentWithProfile[]
  >([]);

  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [isStoryWriter, setIsStoryWriter] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");
  const [message, setMessage] = useState("");

  const userId = session?.user.id;

  useEffect(() => {
    let cancelled = false;

    async function checkStoryWriter() {
      if (!userId) {
        setIsStoryWriter(false);
        return;
      }

      const {
        data: storyData,
        error: storyError,
      } = await supabase
        .from("stories")
        .select("writer_profile_id")
        .eq("id", storyId)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (storyError) {
        console.error(
          "Story writer loading error:",
          storyError
        );

        setIsStoryWriter(false);
        return;
      }

      setIsStoryWriter(
        storyData?.writer_profile_id === userId
      );
    }

    checkStoryWriter();

    return () => {
      cancelled = true;
    };
  }, [storyId, userId]);

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: commentData,
        error: commentError,
      } = await supabase
        .from("chapter_comments")
        .select(
          "id, user_id, content, created_at"
        )
        .eq("story_id", storyId)
        .eq("chapter_id", chapterId)
        .order("created_at", {
          ascending: true,
        });

      if (cancelled) {
        return;
      }

      if (commentError) {
        console.error(
          "Chapter comments loading error:",
          commentError
        );

        setComments([]);
        setErrorMessage(
          "Unable to load comments."
        );
        setLoading(false);
        return;
      }

      const loadedComments = commentData ?? [];

      if (loadedComments.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      const userIds = Array.from(
        new Set(
          loadedComments.map(
            (comment) => comment.user_id
          )
        )
      );

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, display_name, username, avatar_url"
        )
        .in("id", userIds);

      if (cancelled) {
        return;
      }

      if (profileError) {
        console.error(
          "Comment profiles loading error:",
          profileError
        );

        setComments(
          loadedComments.map((comment) => ({
            ...comment,
            profile: null,
          }))
        );

        setLoading(false);
        return;
      }

      const enrichedComments =
        loadedComments.map((comment) => ({
          ...comment,
          profile:
            profileData?.find(
              (profile) =>
                profile.id === comment.user_id
            ) ?? null,
        }));

      setComments(enrichedComments);
      setLoading(false);
    }

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [storyId, chapterId]);

  async function handleSubmitComment() {
    const content = commentText.trim();

    if (!session || !userId) {
      setErrorMessage(
        "Please log in to leave a comment."
      );
      return;
    }

    if (!content) {
      setErrorMessage(
        "Please write a comment first."
      );
      return;
    }

    if (content.length > 2000) {
      setErrorMessage(
        "Comments must be 2000 characters or fewer."
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setMessage("");

    const {
      data: insertedComment,
      error,
    } = await supabase
      .from("chapter_comments")
      .insert({
        user_id: userId,
        story_id: storyId,
        chapter_id: chapterId,
        content,
      })
      .select(
        "id, user_id, content, created_at"
      )
      .single();

    if (error) {
      console.error(
        "Chapter comment creation error:",
        error
      );

      setErrorMessage(
        "Unable to post your comment."
      );
      setSubmitting(false);
      return;
    }

    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "id, display_name, username, avatar_url"
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Commenter profile loading error:",
        profileError
      );
    }

    setComments((currentComments) => [
      ...currentComments,
      {
        ...insertedComment,
        profile: profileData ?? null,
      },
    ]);

    setCommentText("");
    setMessage("Comment posted.");
    setSubmitting(false);
  }

  async function handleDeleteComment(
    commentId: string
  ) {
    if (!userId) {
      return;
    }

    setDeletingId(commentId);
    setErrorMessage("");
    setMessage("");

    const { error } = await supabase
      .from("chapter_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) {
      console.error(
        "Chapter comment deletion error:",
        error
      );

      setErrorMessage(
        "Unable to delete this comment."
      );
      setDeletingId(null);
      return;
    }

    setComments((currentComments) =>
      currentComments.filter(
        (comment) => comment.id !== commentId
      )
    );

    setMessage("Comment deleted.");
    setDeletingId(null);
  }

  function handleModeratedDelete(
    commentId: string
  ) {
    setComments((currentComments) =>
      currentComments.filter(
        (comment) => comment.id !== commentId
      )
    );

    setMessage("Comment removed by story writer.");
  }

  function handleCommentSaved(
    commentId: string,
    content: string
  ) {
    setComments((currentComments) =>
      currentComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              content,
            }
          : comment
      )
    );

    setEditingId(null);
    setMessage("Comment updated.");
    setErrorMessage("");
  }

  function handleEditCancel() {
    setEditingId(null);
    setErrorMessage("");
  }

  return (
    <section className="mt-12 border-t border-slate-800 pt-10">
      <div>
        <p className="text-sm text-gray-400">
          Discussion
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Comments
        </h2>
      </div>

      {session ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
          <label
            htmlFor="chapter-comment"
            className="text-sm text-gray-400"
          >
            Leave a comment
          </label>

          <textarea
            id="chapter-comment"
            value={commentText}
            onChange={(event) =>
              setCommentText(event.target.value)
            }
            maxLength={2000}
            rows={5}
            placeholder="Share your thoughts..."
            disabled={submitting}
            className="
              mt-3
              w-full
              rounded-2xl
              border
              border-slate-700
              bg-slate-950
              px-4
              py-3
              text-white
              outline-none
              placeholder:text-gray-500
              focus:border-cyan-400
            "
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              {commentText.length}/2000
            </span>

            <Button
              type="button"
              onClick={handleSubmitComment}
              disabled={submitting}
            >
              {submitting
                ? "Posting..."
                : "Post Comment"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center">
          <p className="text-gray-400">
            Log in to join the discussion.
          </p>
        </div>
      )}

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

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center">
          <p className="text-gray-400">
            Loading comments...
          </p>
        </div>
      ) : comments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center">
          <p className="text-gray-400">
            No comments yet. Be the first to comment.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border border-cyan-500/20 bg-slate-900">
                    {comment.profile?.avatar_url ? (
                      <img
                        src={comment.profile.avatar_url}
                        alt={
                          comment.profile
                            .display_name ||
                          "Reader avatar"
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-cyan-400">
                        {(
                          comment.profile
                            ?.display_name ||
                          comment.profile
                            ?.username ||
                          "R"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      {comment.profile
                        ?.display_name ||
                        comment.profile
                          ?.username ||
                        "TaleMine Reader"}
                    </p>

                    {comment.profile?.username && (
                      <p className="text-xs text-cyan-400">
                        @{comment.profile.username}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(
                        comment.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {editingId !== comment.id && (
                  <div className="flex flex-wrap gap-3">
                    {userId === comment.user_id && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingId(comment.id);
                            setErrorMessage("");
                            setMessage("");
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            handleDeleteComment(
                              comment.id
                            )
                          }
                          disabled={
                            deletingId === comment.id
                          }
                        >
                          {deletingId === comment.id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </>
                    )}

                    {isStoryWriter &&
                      userId !== comment.user_id && (
                        <ChapterCommentModeration
                          commentId={comment.id}
                          onDeleted={
                            handleModeratedDelete
                          }
                        />
                      )}
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <ChapterCommentEdit
                  commentId={comment.id}
                  initialContent={comment.content}
                  onSaved={handleCommentSaved}
                  onCancel={handleEditCancel}
                />
              ) : (
                <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-300">
                  {comment.content}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}