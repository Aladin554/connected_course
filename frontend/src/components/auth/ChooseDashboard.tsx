import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Button from "../ui/button/Button";
import { isPanelActive } from "../../utils/session";

export default function ChooseDashboard() {
  const navigate = useNavigate();
  const [hasFrontendAccess, setHasFrontendAccess] = useState(false);
  const [hasAdminPanelAccess, setHasAdminPanelAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/profile")
      .then((res) => {
        const roleId = Number(res.data?.role_id);
        const panelActive = isPanelActive(res.data);

        if (roleId !== 2 || !panelActive) {
          navigate("/dashboard", { replace: true });
          return;
        }

        const adminCategories = Array.isArray(res.data?.admin_categories)
          ? res.data.admin_categories
          : [];

        const adminAccess =
          adminCategories.length > 0 ||
          Number(res.data?.can_add_courses) === 1 ||
          Number(res.data?.can_edit_courses) === 1;
        // Active panel_status unlocks the user/learner dashboard for admins
        const frontendAccess = panelActive;

        if (!adminAccess && !frontendAccess) {
          navigate("/dashboard", { replace: true });
          return;
        }

        setHasAdminPanelAccess(adminAccess);
        setHasFrontendAccess(frontendAccess);
      })
      .catch(() => {
        navigate("/dashboard", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="mb-6 text-xl font-semibold text-center text-gray-800 dark:text-white">
          Where do you want to go?
        </h2>

        <div className="space-y-4">
          {hasAdminPanelAccess && (
            <Button
              className="w-full"
              onClick={() => navigate("/dashboard", { replace: true })}
            >
              Go to Admin Dashboard
            </Button>
          )}

          {hasFrontendAccess && (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => navigate("/introduction", { replace: true })}
            >
              Go to User Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
