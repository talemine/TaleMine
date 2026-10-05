import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const GA_MEASUREMENT_ID = "G-JEVGH041Z0";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/*
 * Loads the Google Analytics (gtag.js) script once, then sends a
 * page_view event on every route change.
 *
 * This is required because TaleMine is a client-side-routed single-page
 * app: gtag.js's default automatic page_view only fires once, on the very
 * first script load. Without this, GA would only ever record one page
 * view per visitor session no matter how many pages they actually read.
 *
 * We disable gtag's own automatic page_view (send_page_view: false) and
 * send it manually here instead, driven by react-router's useLocation().
 */
export default function Analytics() {
  const location = useLocation();
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) {
      return;
    }

    scriptLoadedRef.current = true;

    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];

    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };

    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
    });
  }, []);

  useEffect(() => {
    if (typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", "page_view", {
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location]);

  return null;
}
