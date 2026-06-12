import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Button from "../ui/button/Button";

export default function ChooseDashboard() {
  const navigate = useNavigate();
  const [hasFrontendAccess, setHasFrontendAccess] = useState(false);
  const [hasAdminPanelAccess, setHasAdminPanelAccess] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/profile")
      .then((res) => {
        const roleId = Number(res.data?.role_id);
        const frontendCategories = Array.isArray(res.data?.admin_frontend_categories)
          ? res.data.admin_frontend_categories
          : [];
        const adminCategories = Array.isArray(res.data?.admin_categories)
          ? res.data.admin_categories
          : [];

        setHasFrontendAccess(roleId === 2 && frontendCategories.length > 0);
        setHasAdminPanelAccess(roleId === 1 || adminCategories.length > 0);
      })
      .catch(() => {
        setHasFrontendAccess(false);
        setHasAdminPanelAccess(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (hasAdminPanelAccess && !hasFrontendAccess) {
      navigate("/dashboard", { replace: true });
    } else if (!hasAdminPanelAccess && hasFrontendAccess) {
      navigate("/introduction", { replace: true });
    } else if (!hasAdminPanelAccess && !hasFrontendAccess) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, hasAdminPanelAccess, hasFrontendAccess, navigate]);

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
