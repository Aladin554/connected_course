import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseViewRoute from "./components/CourseViewRoute";
import RootRedirect from "./components/RootRedirect";

const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/AuthPages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/AuthPages/ResetPassword"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const LineChart = lazy(() => import("./pages/Charts/LineChart"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const Calendar = lazy(() => import("./pages/Calendar"));
const BasicTables = lazy(() => import("./pages/Tables/BasicTables"));
const FormElements = lazy(() => import("./pages/Forms/FormElements"));
const Blank = lazy(() => import("./pages/Blank"));
const AppLayout = lazy(() => import("./layout/AppLayout"));
const Home = lazy(() => import("./pages/Dashboard/Home"));
const AdminUsers = lazy(() => import("./pages/Admin/AdminUsers"));
const AdminUserForm = lazy(() => import("./pages/Admin/AdminUserForm"));
const ChooseDashboard = lazy(() => import("./components/auth/ChooseDashboard.tsx"));
const AdminAllowedIps = lazy(() => import("./pages/Admin/Security/AdminAllowedIps.tsx"));
const AdminCategories = lazy(() => import("./pages/Category/CategoriesList"));
const CategoryForm = lazy(() => import("./pages/Category/CategoryForm"));
const LearningContent = lazy(() => import("./pages/Admin/LearningContent"));
const Introduction = lazy(() => import("./pages/User/pages/Introduction"));

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        toastStyle={{ zIndex: 100000 }}
      />

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/choose-dashboard"
            element={
              <ProtectedRoute allowedRoles={[1, 2]} requireActivePanel={true}>
                <ChooseDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/introduction/*"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3]} requireActivePanel={true}>
                <Introduction />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute allowedRoles={[1, 2]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="profile" element={<UserProfiles />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="blank" element={<Blank />} />
            <Route path="form-elements" element={<FormElements />} />
            <Route path="basic-tables" element={<BasicTables />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="avatars" element={<Avatars />} />
            <Route path="badges" element={<Badges />} />
            <Route path="buttons" element={<Buttons />} />
            <Route path="images" element={<Images />} />
            <Route path="videos" element={<Videos />} />
            <Route path="line-chart" element={<LineChart />} />
            <Route path="bar-chart" element={<BarChart />} />
            <Route path="admin-users" element={<AdminUsers />} />
            <Route path="admin-users/add" element={<AdminUserForm />} />
            <Route path="admin-users/:id/edit" element={<AdminUserForm />} />
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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
