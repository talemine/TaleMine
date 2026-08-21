import { useEffect, useState } from "react";

import { useAuth } from "../auth/AuthProvider";
import Button from "../ui/Button";
import { supabase } from "../../services/supabase";

interface Notification {
  id: string;
  user_id: string;
  actor_user_id: string | null;
  type: string;
  story_id: string | null;
  chapter_id: string | null;
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

interface NotificationWithActor
  extends Notification {
  actor: ActorProfile | null;
}

export default function Notifications() {
  const { session } = useAuth();

  const [notifications, setNotifications] =
    useState<NotificationWithActor[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

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
          "Unable to load notifications."
        );
        setLoading(false);
        return;
      }

      const loadedNotifications =
        notificationData ?? [];

      if (loadedNotifications.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

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

      if (actorIds.length === 0) {
        setNotifications(
          loadedNotifications.map(
            (notification) => ({
              ...notification,
              actor: null,
            })
          )
        );

        setLoading(false);
        return;
      }

      const {
        data: actorData,
        error: actorError,
      } = await supabase
        .from("profiles")
        .select(
          "id, display_name, username, avatar_url"
        )
        .in("id", actorIds);

      if (cancelled) {
        return;
      }

      if (actorError) {
        console.error(
          "Notification actor loading error:",
          actorError
        );
      }

      const enrichedNotifications =
        loadedNotifications.map(
          (notification) => ({
            ...notification,
            actor:
              actorData?.find(
                (actor) =>
                  actor.id ===
                  notification.actor_user_id
              ) ?? null,
          })
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
  }, [userId]);

  async function markAsRead(
    notificationId: string
  ) {
    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
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
                  read_at:
                    new Date().toISOString(),
                }
              : notification
        )
    );
  }

  if (!session) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-gray-400">
          Log in to view your notifications.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">
            Activity
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            Notifications
          </h2>
        </div>

        <span className="text-sm text-gray-400">
          {
            notifications.filter(
              (notification) =>
                notification.read_at === null
            ).length
          }{" "}
          unread
        </span>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center">
          <p className="text-gray-400">
            Loading notifications...
          </p>
        </div>
      ) : errorMessage ? (
        <p className="mt-6 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : notifications.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center">
          <p className="text-gray-400">
            You have no notifications yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {notifications.map(
            (notification) => (
              <article
                key={notification.id}
                className={`rounded-2xl border p-5 ${
                  notification.read_at
                    ? "border-slate-800 bg-slate-950/30"
                    : "border-cyan-500/30 bg-cyan-500/5"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border border-cyan-500/20 bg-slate-900">
                      {notification.actor
                        ?.avatar_url ? (
                        <img
                          src={
                            notification.actor
                              .avatar_url
                          }
                          alt={
                            notification.actor
                              .display_name ||
                            "User avatar"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-cyan-400">
                          {(
                            notification.actor
                              ?.display_name ||
                            notification.actor
                              ?.username ||
                            "T"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {notification.actor
                          ?.display_name ||
                          notification.actor
                            ?.username ||
                          "TaleMine User"}
                      </p>

                      {notification.actor
                        ?.username && (
                        <p className="text-xs text-cyan-400">
                          @
                          {
                            notification.actor
                              .username
                          }
                        </p>
                      )}

                      <p className="mt-2 text-gray-300">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {notification.read_at ===
                    null && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}