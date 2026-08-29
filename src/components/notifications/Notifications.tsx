import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../../services/supabase";
import { useLanguage } from "../../i18n/LanguageContext";

interface Notification {
  id: string;
  user_id: string;
  actor_user_id: string | null;
  type: string;
  story_id: string | null;
  chapter_id: string | null;
  story_slug: string | null;
  chapter_number: number | null;
  comment_id: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
}

interface ActorProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

interface StoryInfo {
  id: string;
  slug: string;
  title: string;
}

interface ChapterInfo {
  id: string;
  chapter_number: number;
  title: string;
}

interface CommentInfo {
  id: string;
  content: string;
}

interface NotificationWithDetails
  extends Notification {
  actor: ActorProfile | null;
  story: StoryInfo | null;
  chapter: ChapterInfo | null;
  comment: CommentInfo | null;
}

interface NotificationGroup {
  dateKey: string;
  label: string;
  notifications: NotificationWithDetails[];
}

function getDateKey(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateLabel(
  dateString: string,
  todayLabel: string,
  yesterdayLabel: string,
  locale: string
) {
  const date = new Date(dateString);
  const now = new Date();

  const todayKey = getDateKey(
    now.toISOString()
  );

  const yesterday = new Date(now);
  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const yesterdayKey = getDateKey(
    yesterday.toISOString()
  );

  const dateKey = getDateKey(
    dateString
  );

  if (dateKey === todayKey) {
    return todayLabel;
  }

  if (dateKey === yesterdayKey) {
    return yesterdayLabel;
  }

  return date.toLocaleDateString(
    locale,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default function Notifications() {
  const { session } = useAuth();
  const { language, t } = useLanguage();

  const [notifications, setNotifications] =
    useState<NotificationWithDetails[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    expandedNotificationId,
    setExpandedNotificationId,
  ] = useState<string | null>(null);

  const userId = session?.user.id;

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      if (!userId) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const {
        data: notificationData,
        error: notificationError,
      } = await supabase
        .from("notifications")
        .select(
          `
            id,
            user_id,
            actor_user_id,
            type,
            story_id,
            chapter_id,
            comment_id,
            message,
            read_at,
            created_at
          `
        )
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        });

      if (cancelled) {
        return;
      }

      if (notificationError) {
        console.error(
          "Notifications loading error:",
          notificationError
        );

        setNotifications([]);
        setErrorMessage(
          t.notifications.loadError
        );
        setLoading(false);
        return;
      }

      const loadedNotifications =
        notificationData ?? [];

      if (
        loadedNotifications.length === 0
      ) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const storyIds = Array.from(
        new Set(
          loadedNotifications
            .map(
              (notification) =>
                notification.story_id
            )
            .filter(
              (
                storyId
              ): storyId is string =>
                Boolean(storyId)
            )
        )
      );

      const chapterIds = Array.from(
        new Set(
          loadedNotifications
            .map(
              (notification) =>
                notification.chapter_id
            )
            .filter(
              (
                chapterId
              ): chapterId is string =>
                Boolean(chapterId)
            )
        )
      );

      const actorIds = Array.from(
        new Set(
          loadedNotifications
            .map(
              (notification) =>
                notification.actor_user_id
            )
            .filter(
              (
                actorId
              ): actorId is string =>
                Boolean(actorId)
            )
        )
      );

      const commentIds = Array.from(
        new Set(
          loadedNotifications
            .map(
              (notification) =>
                notification.comment_id
            )
            .filter(
              (
                commentId
              ): commentId is string =>
                Boolean(commentId)
            )
        )
      );

      const [
        {
          data: storyData,
          error: storyError,
        },
        {
          data: chapterData,
          error: chapterError,
        },
        {
          data: actorData,
          error: actorError,
        },
        {
          data: commentData,
          error: commentError,
        },
      ] = await Promise.all([
        storyIds.length > 0
          ? supabase
              .from("stories")
              .select(
                "id, slug, title"
              )
              .in("id", storyIds)
          : Promise.resolve({
              data: [],
              error: null,
            }),

        chapterIds.length > 0
          ? supabase
              .from("chapters")
              .select(
                "id, chapter_number, title"
              )
              .in("id", chapterIds)
          : Promise.resolve({
              data: [],
              error: null,
            }),

        actorIds.length > 0
          ? supabase
              .from("profiles")
              .select(
                `
                  id,
                  display_name,
                  username,
                  avatar_url
                `
              )
              .in("id", actorIds)
          : Promise.resolve({
              data: [],
              error: null,
            }),

        commentIds.length > 0
          ? supabase
              .from("chapter_comments")
              .select("id, content")
              .in("id", commentIds)
          : Promise.resolve({
              data: [],
              error: null,
            }),
      ]);

      if (cancelled) {
        return;
      }

      if (storyError) {
        console.error(
          "Notification story loading error:",
          storyError
        );
      }

      if (chapterError) {
        console.error(
          "Notification chapter loading error:",
          chapterError
        );
      }

      if (actorError) {
        console.error(
          "Notification actor loading error:",
          actorError
        );
      }

      if (commentError) {
        console.error(
          "Notification comment loading error:",
          commentError
        );
      }

      const enrichedNotifications =
        loadedNotifications.map(
          (notification) => {
            const story =
              storyData?.find(
                (item) =>
                  item.id ===
                  notification.story_id
              ) ?? null;

            const chapter =
              chapterData?.find(
                (item) =>
                  item.id ===
                  notification.chapter_id
              ) ?? null;

            const actor =
              actorData?.find(
                (item) =>
                  item.id ===
                  notification.actor_user_id
              ) ?? null;

            const comment =
              commentData?.find(
                (item) =>
                  item.id ===
                  notification.comment_id
              ) ?? null;

            return {
              ...notification,
              story_slug:
                story?.slug ?? null,
              chapter_number:
                chapter?.chapter_number ??
                null,
              actor,
              story,
              chapter,
              comment,
            };
          }
        );

      setNotifications(
        enrichedNotifications
      );

      setLoading(false);
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [userId, t.notifications.loadError]);

  async function markAsRead(
    notificationId: string
  ) {
    if (!userId) {
      return;
    }

    const readAt =
      new Date().toISOString();

    const { error } = await supabase
      .from("notifications")
      .update({
        read_at: readAt,
      })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error(
        "Notification read update error:",
        error
      );

      return;
    }

    setNotifications(
      (currentNotifications) =>
        currentNotifications.map(
          (notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  read_at: readAt,
                }
              : notification
        )
    );
  }

  async function handleNotificationClick(
    notification: NotificationWithDetails
  ) {
    const willExpand =
      expandedNotificationId !==
      notification.id;

    if (
      notification.read_at === null
    ) {
      await markAsRead(
        notification.id
      );
    }

    setExpandedNotificationId(
      willExpand
        ? notification.id
        : null
    );
  }

  function getNotificationAction(
    notification: NotificationWithDetails
  ): "liked" | "commented" | "replied" | "unknown" {
    const message =
      notification.message?.trim() || "";

    const lowerMessage =
      message.toLowerCase();

    if (
      lowerMessage.includes("liked")
    ) {
      return "liked";
    }

    if (
      lowerMessage.includes("commented")
    ) {
      return "commented";
    }

    if (
      lowerMessage.includes("replied")
    ) {
      return "replied";
    }

    return "unknown";
  }

  function getNotificationTargetText(
    notification: NotificationWithDetails
  ) {
    const action =
      getNotificationAction(
        notification
      );

    const chapterTitle =
      notification.chapter?.title ||
      (notification.chapter_number !==
      null
        ? `${t.notifications.chapter} ${notification.chapter_number}`
        : t.notifications.yourChapter);

    const storyTitle =
      notification.story?.title ||
      t.notifications.yourStory;

    if (action === "liked") {
      if (language === "hi") {
        return (
          <>
            <span>
              {t.notifications.liked}
            </span>{" "}
            <span className="font-medium text-white">
              {chapterTitle}
            </span>{" "}
            <span>
              {t.notifications.of}
            </span>{" "}
            <span className="font-medium text-white">
              {storyTitle}
            </span>
          </>
        );
      }

      return (
        <>
          <span>
            {t.notifications.liked}
          </span>{" "}
          <span className="font-medium text-white">
            {chapterTitle}
          </span>{" "}
          <span>
            {t.notifications.of}
          </span>{" "}
          <span className="font-medium text-white">
            {storyTitle}
          </span>
        </>
      );
    }

    if (action === "commented") {
      if (language === "hi") {
        return (
          <>
            <span>
              {t.notifications.commentedOn}
            </span>{" "}
            <span className="font-medium text-white">
              {chapterTitle}
            </span>{" "}
            <span>
              {t.notifications.of}
            </span>{" "}
            <span className="font-medium text-white">
              {storyTitle}
            </span>
          </>
        );
      }

      return (
        <>
          <span>
            {t.notifications.commentedOn}
          </span>{" "}
          <span className="font-medium text-white">
            {chapterTitle}
          </span>{" "}
          <span>
            {t.notifications.of}
          </span>{" "}
          <span className="font-medium text-white">
            {storyTitle}
          </span>
        </>
      );
    }

    if (action === "replied") {
      return (
        <span>
          {t.notifications.repliedTo}
        </span>
      );
    }

    return (
      <>
        {notification.message}
      </>
    );
  }

  function getCompactNotificationText(
    notification: NotificationWithDetails
  ) {
    const action =
      getNotificationAction(
        notification
      );

    if (action === "liked") {
      return t.notifications.likedYourChapter;
    }

    if (action === "commented") {
      return t.notifications.commentedOnYourStory;
    }

    if (action === "replied") {
      return t.notifications.repliedToComment;
    }

    return notification.message;
  }

  const locale =
    language === "hi"
      ? "hi-IN"
      : "en-IN";

  const notificationGroups =
    useMemo<NotificationGroup[]>(
      () => {
        const groups =
          new Map<
            string,
            NotificationGroup
          >();

        notifications.forEach(
          (notification) => {
            const dateKey =
              getDateKey(
                notification.created_at
              );

            const existing =
              groups.get(dateKey);

            if (existing) {
              existing.notifications.push(
                notification
              );
              return;
            }

            groups.set(dateKey, {
              dateKey,
              label: getDateLabel(
                notification.created_at,
                t.notifications.today,
                t.notifications.yesterday,
                locale
              ),
              notifications: [
                notification,
              ],
            });
          }
        );

        return Array.from(
          groups.values()
        );
      },
      [
        notifications,
        t.notifications.today,
        t.notifications.yesterday,
        locale,
      ]
    );

  if (!session) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-gray-400">
          {t.notifications.loginRequired}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">
            {t.notifications.activity}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            {t.notifications.title}
          </h2>
        </div>

        <span className="text-sm text-gray-400">
          {
            notifications.filter(
              (notification) =>
                notification.read_at ===
                null
            ).length
          }{" "}
          {t.notifications.unread}
        </span>
      </div>

      {loading ? (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-5 text-center">
          <p className="text-sm text-gray-400">
            {t.notifications.loading}
          </p>
        </div>
      ) : errorMessage ? (
        <p className="mt-5 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : notifications.length ===
        0 ? (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-5 text-center">
          <p className="text-sm text-gray-400">
            {t.notifications.empty}
          </p>
        </div>
      ) : (
        <div className="mt-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          <div className="space-y-3">
            {notificationGroups.map(
              (group) => (
                <div
                  key={group.dateKey}
                >
                  <div className="mb-1.5 flex justify-center">
                    <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-medium text-gray-400">
                      {group.label}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {group.notifications.map(
                      (
                        notification
                      ) => {
                        const actorName =
                          notification.actor
                            ?.display_name ||
                          notification.actor
                            ?.username ||
                          t.notifications.user;

                        const actorInitial =
                          actorName
                            .charAt(0)
                            .toUpperCase();

                        const isExpanded =
                          expandedNotificationId ===
                          notification.id;

                        const isUnread =
                          notification.read_at ===
                          null;

                        return (
                          <article
                            key={
                              notification.id
                            }
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`cursor-pointer rounded-lg border px-2 py-1.5 transition ${
                              isUnread
                                ? "border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10"
                                : "border-transparent bg-transparent hover:border-slate-800 hover:bg-slate-950/40"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-cyan-500/20 bg-slate-950">
                                {notification
                                  .actor
                                  ?.avatar_url ? (
                                  <img
                                    src={
                                      notification
                                        .actor
                                        .avatar_url
                                    }
                                    alt={
                                      actorName
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-cyan-400">
                                    {
                                      actorInitial
                                    }
                                  </div>
                                )}
                              </div>

                              <p className="min-w-0 flex-1 text-[13px] leading-5 text-gray-300">
                                <span className="font-semibold text-cyan-300">
                                  {actorName}
                                </span>{" "}
                                {
                                  getCompactNotificationText(
                                    notification
                                  )
                                }
                              </p>
                            </div>

                            {isExpanded && (
                              <div className="mt-1.5 ml-9 rounded-lg border border-cyan-500/20 bg-slate-950/50 p-2.5">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-cyan-500/20 bg-slate-900">
                                    {notification
                                      .actor
                                      ?.avatar_url ? (
                                      <img
                                        src={
                                          notification
                                            .actor
                                            .avatar_url
                                        }
                                        alt={
                                          actorName
                                        }
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-cyan-400">
                                        {
                                          actorInitial
                                        }
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-white">
                                      {
                                        actorName
                                      }
                                    </p>

                                    {notification
                                      .actor
                                      ?.username && (
                                      <p className="text-xs text-cyan-400">
                                        @
                                        {
                                          notification
                                            .actor
                                            .username
                                        }
                                      </p>
                                    )}

                                    <p className="mt-2 text-sm leading-5 text-gray-300">
                                      <span className="font-semibold text-cyan-300">
                                        {
                                          actorName
                                        }
                                      </span>{" "}
                                      {
                                        getNotificationTargetText(
                                          notification
                                        )
                                      }
                                    </p>

                                    {notification.comment
                                      ?.content && (
                                      <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-2">
                                        <p className="text-xs text-gray-300">
                                          {
                                            notification
                                              .comment
                                              .content
                                          }
                                        </p>
                                      </div>
                                    )}

                                    <p className="mt-2 text-[11px] text-gray-500">
                                      {new Date(
                                        notification.created_at
                                      ).toLocaleString(
                                        locale
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </article>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}