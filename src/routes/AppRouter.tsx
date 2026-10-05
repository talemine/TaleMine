import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/Landing/LandingPage";
import ScrollManager from "../components/layout/ScrollManager";
import Analytics from "../components/analytics/Analytics";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import WriterOnlyRoute from "./WriterOnlyRoute";

import AppLayout from "../components/layout/AppLayout";

/*
 * Route-level code splitting.
 *
 * LandingPage is imported eagerly above since it's the entry route most
 * visitors land on first (and the one most often shared on social media /
 * search results) — we want it in the initial bundle with no extra
 * network round-trip.
 *
 * Everything else is lazy-loaded so a visitor reading a story doesn't have
 * to download the Writer dashboard/editor, auth forms, account settings,
 * etc. in their initial bundle. Each of these becomes its own small chunk
 * that's only fetched when that route is actually visited.
 */
const SignUp = lazy(() => import("../pages/Auth/SignUp"));
const Login = lazy(() => import("../pages/Auth/Login"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));
const Account = lazy(() => import("../pages/Account/Account"));
const WriterDashboard = lazy(() => import("../pages/Writer/WriterDashboard"));
const StoryEditor = lazy(() => import("../pages/Writer/StoryEditor"));
const StoryPage = lazy(() => import("../pages/Story/StoryPage"));
const StoryChapterPage = lazy(
  () => import("../pages/Story/StoryChapterPage")
);
const Library = lazy(() => import("../pages/Library/Library"));
const Stories = lazy(() => import("../pages/Stories/Stories"));
const PrivacyPolicy = lazy(() => import("../pages/Legal/PrivacyPolicy"));
const Terms = lazy(() => import("../pages/Legal/Terms"));

function RouteFallback() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <p className="text-gray-300">Loading...</p>
    </main>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<AppLayout />}>

            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/stories"
              element={<Stories />}
            />

            <Route
              path="/story/:slug"
              element={<StoryPage />}
            />

            <Route
              path="/story/:slug/chapter/:chapterNumber"
              element={<StoryChapterPage />}
            />

            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Public-only routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Authenticated user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<Account />} />

              <Route
                path="/library"
                element={<Library />}
              />
            </Route>

            {/* Writer-only routes */}
            <Route element={<WriterOnlyRoute />}>
              <Route
                path="/writer"
                element={<WriterDashboard />}
              />

              <Route
                path="/writer/stories/:storyId"
                element={<StoryEditor />}
              />
            </Route>

          </Route>
        </Routes>
      </Suspense>

      <ScrollManager />
      <Analytics />
    </BrowserRouter>
  );
}
