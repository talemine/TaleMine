import { useEffect, useRef } from "react";
import {
  useLocation,
  useNavigationType,
} from "react-router-dom";

const SCROLL_KEY = "talemine-scroll-position";

function getStorageKey(
  pathname: string,
  search: string
) {
  return `${SCROLL_KEY}:${pathname}${search}`;
}

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  const previousPathRef =
    useRef<string | null>(null);

  const initialRestoreCompleteRef =
    useRef(false);

  /*
   * Tell the browser that scroll restoration is handled
   * by the application.
   */
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  /*
   * Restore the saved position when the application first
   * loads.
   *
   * We deliberately do NOT attach the scroll-saving
   * listener until restoration has completed. This prevents
   * the initial scroll-to-top event from overwriting the
   * saved position.
   */
  useEffect(() => {
    const pathKey = getStorageKey(
      location.pathname,
      location.search
    );

    if (previousPathRef.current !== null) {
      return;
    }

    previousPathRef.current = pathKey;

    const savedPosition =
      sessionStorage.getItem(pathKey);

    if (savedPosition === null) {
      initialRestoreCompleteRef.current = true;
      return;
    }

    const targetScrollY = Number(savedPosition);

    if (
      !Number.isFinite(targetScrollY) ||
      targetScrollY <= 0
    ) {
      initialRestoreCompleteRef.current = true;
      return;
    }

    let attempts = 0;
    const maxAttempts = 300;

    let animationFrameId = 0;

    function restoreWhenReady() {
      attempts += 1;

      const maxScrollY =
        document.documentElement.scrollHeight -
        window.innerHeight;

      /*
       * The page must be tall enough before we restore.
       */
      if (maxScrollY >= targetScrollY) {
        window.scrollTo({
          top: targetScrollY,
          behavior: "auto",
        });

        initialRestoreCompleteRef.current = true;

        return;
      }

      /*
       * Keep waiting while asynchronous page content
       * is being loaded.
       */
      if (attempts < maxAttempts) {
        animationFrameId =
          requestAnimationFrame(
            restoreWhenReady
          );

        return;
      }

      /*
       * If the page never became tall enough, allow normal
       * scroll tracking to start.
       */
      initialRestoreCompleteRef.current = true;
    }

    animationFrameId =
      requestAnimationFrame(
        restoreWhenReady
      );

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );
    };
  }, [
    location.pathname,
    location.search,
  ]);

  /*
   * Save scroll position.
   *
   * This listener is enabled only after the initial
   * restoration process has completed.
   */
  useEffect(() => {
    const pathKey = getStorageKey(
      location.pathname,
      location.search
    );

    function saveScrollPosition() {
      if (!initialRestoreCompleteRef.current) {
        return;
      }

      sessionStorage.setItem(
        pathKey,
        String(window.scrollY)
      );
    }

    window.addEventListener(
      "scroll",
      saveScrollPosition,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        saveScrollPosition
      );
    };
  }, [
    location.pathname,
    location.search,
  ]);

  /*
   * Handle normal SPA navigation.
   */
  useEffect(() => {
    const pathKey = getStorageKey(
      location.pathname,
      location.search
    );

    if (previousPathRef.current === null) {
      return;
    }

    if (previousPathRef.current === pathKey) {
      return;
    }

    previousPathRef.current = pathKey;

    /*
     * PUSH means the user navigated to a new page.
     * New pages should start at the top.
     */
    if (navigationType === "PUSH") {
      initialRestoreCompleteRef.current = true;

      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }
  }, [
    location.pathname,
    location.search,
    navigationType,
  ]);

  return null;
}