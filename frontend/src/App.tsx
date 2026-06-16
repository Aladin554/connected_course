// src/App.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Full App.tsx with Introduction import added for the user learning flow.
// ─────────────────────────────────────────────────────────────────────────────

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseViewRoute from "./components/CourseViewRoute";
import RootRedirect from "./components/RootRedirect";

import Home from "./pages/Dashboard/Home";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminUserForm from "./pages/Admin/AdminUserForm";
import ChooseDashboard from "./components/auth/ChooseDashboard.tsx";
import AdminAllowedIps from "./pages/Admin/Security/AdminAllowedIps.tsx";
import AdminCategories from "./pages/Category/CategoriesList";
import CategoryForm from "./pages/Category/CategoryForm";
import LearningContent from "./pages/Admin/LearningContent";

// ✅ User learning flow — entry point that manages all sub-pages internally
import Introduction from "./pages/User/pages/Introduction";

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      {/* ToastContainer at root so toasts show on any page */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        toastStyle={{ zIndex: 100000 }}
      />

      <Routes>
        {/* ── Public routes ── */}
        <Route path="/"                element={<RootRedirect />} />
        <Route path="/signin"          element={<SignIn />} />
        <Route path="/signup"          element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        <Route
          path="/choose-dashboard"
          element={
            <ProtectedRoute allowedRoles={[2]} requireActivePanel={true}>
              <ChooseDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── User learning flow ── */}
        {/*
          Introduction is the single entry point.
          It internally manages: Home → Welcome → Course → Module → Lesson
          via its own page state — no extra routes needed.
        */}
        <Route
          path="/introduction/*"
          element={
            <ProtectedRoute allowedRoles={[2, 3]} requireActivePanel={true}>
              <Introduction />
            </ProtectedRoute>
          }
        />

        {/* ── Admin / dashboard routes ── */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={[1, 2]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index                element={<Home />} />
          <Route path="profile"       element={<UserProfiles />} />
          <Route path="calendar"      element={<Calendar />} />
          <Route path="blank"         element={<Blank />} />
          <Route path="form-elements" element={<FormElements />} />
          <Route path="basic-tables"  element={<BasicTables />} />
          <Route path="alerts"        element={<Alerts />} />
          <Route path="avatars"       element={<Avatars />} />
          <Route path="badges"        element={<Badges />} />
          <Route path="buttons"       element={<Buttons />} />
          <Route path="images"        element={<Images />} />
          <Route path="videos"        element={<Videos />} />
          <Route path="line-chart"    element={<LineChart />} />
          <Route path="bar-chart"     element={<BarChart />} />
          <Route path="admin-users"           element={<AdminUsers />} />
          <Route path="admin-users/add"       element={<AdminUserForm />} />
          <Route path="admin-users/:id/edit"  element={<AdminUserForm />} />
          <Route
            path="categories"
            element={
              <CourseViewRoute>
                <AdminCategories />
              </CourseViewRoute>
            }
          />
          <Route
            path="categories/add"
            element={
              <CourseViewRoute>
                <CategoryForm />
              </CourseViewRoute>
            }
          />
          <Route
            path="categories/:id/edit"
            element={
              <CourseViewRoute>
                <CategoryForm />
              </CourseViewRoute>
            }
          />
          <Route
            path="learning-content"
            element={
              <CourseViewRoute>
                <LearningContent />
              </CourseViewRoute>
            }
          />
          <Route
            path="admin-allowed-ips"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <AdminAllowedIps />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
