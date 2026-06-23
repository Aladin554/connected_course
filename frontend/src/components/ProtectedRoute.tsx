import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: number[]; // roles allowed to access this route
  requireActivePanel?: boolean; // optional: if true, admin roles must have active panel
};

const ProtectedRoute = ({
  children,
  allowedRoles,
  requireActivePanel = false,
}: ProtectedRouteProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [panelStatus, setPanelStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    const storedRole = sessionStorage.getItem("role_id");
    const storedUser = sessionStorage.getItem("user");
    const panel = storedUser ? JSON.parse(storedUser).panel_status : null;

    setToken(storedToken);
    setRoleId(storedRole ? parseInt(storedRole, 10) : null);
    setPanelStatus(Number(panel) === 1);
    setLoading(false);
  }, []);

  if (loading) return null;

  // Not logged in
  if (!token) return <Navigate to="/signin" replace />;

  // Role restriction
  if (allowedRoles && roleId !== null && !allowedRoles.includes(roleId)) {
    if (roleId === 3) return <Navigate to="/signin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Block inactive admin panels from routes that require active panel access
  if ((roleId === 1 || roleId === 2) && requireActivePanel && !panelStatus) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
