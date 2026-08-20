import { BrowserRouter, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/Landing/LandingPage";
import SignUp from "../pages/Auth/SignUp";
import Login from "../pages/Auth/Login";
import Account from "../pages/Account/Account";
import WriterDashboard from "../pages/Writer/WriterDashboard";
import StoryEditor from "../pages/Writer/StoryEditor";
import StoryPage from "../pages/Story/StoryPage";
import StoryChapterPage from "../pages/Story/StoryChapterPage";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import WriterOnlyRoute from "./WriterOnlyRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}