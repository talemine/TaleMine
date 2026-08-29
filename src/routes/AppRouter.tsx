import { BrowserRouter, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/Landing/LandingPage";
import SignUp from "../pages/Auth/SignUp";
import Login from "../pages/Auth/Login";
import Account from "../pages/Account/Account";
import WriterDashboard from "../pages/Writer/WriterDashboard";
import StoryEditor from "../pages/Writer/StoryEditor";
import StoryPage from "../pages/Story/StoryPage";
import StoryChapterPage from "../pages/Story/StoryChapterPage";
import Library from "../pages/Library/Library";
import Stories from "../pages/Stories/Stories";
import ScrollManager from "../components/layout/ScrollManager";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import WriterOnlyRoute from "./WriterOnlyRoute";

import AppLayout from "../components/layout/AppLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
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

          {/* Public-only routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
          </Route>

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

      <ScrollManager />

      <Routes>
        <Route element={<AppLayout />}>
          {/* existing routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}