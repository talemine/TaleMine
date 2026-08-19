import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";
import SignUp from "../pages/Auth/SignUp";
import Login from "../pages/Auth/Login";
import Account from "../pages/Account/Account";
import WriterDashboard from "../pages/Writer/WriterDashboard";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import WriterOnlyRoute from "./WriterOnlyRoute";
import StoryEditor from "../pages/Writer/StoryEditor";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Account />} />
        </Route>

        <Route element={<WriterOnlyRoute />}>
          <Route path="/writer" element={<WriterDashboard />} />
          <Route
            path="/writer/stories/:storyId"
            element={<StoryEditor />}
          />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}