import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearAuthSession, isAuthSessionExpired } from "../utils/session";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: number[]; // roles allowed to access this route
  requireActivePanel?: boolean; // optional: if true, role 2 must have active panel
};

const ProtectedRoute = ({
  children,
  allowedRoles,
  requireActivePanel = false,
}: ProtectedRouteProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [panelStatus, setPanelStatus] = useState<boolean | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken && isAuthSessionExpired()) {
      clearAuthSession();
      setExpired(true);
      setLoading(false);
      return;
    }

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
  if (!token || expired) return <Navigate to="/signin" replace />;

  // Role restriction
  if (allowedRoles && roleId !== null && !allowedRoles.includes(roleId)) {
    if (roleId === 3) return <Navigate to="/signin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Block inactive panel role 2 from routes that require active panel
  if (roleId === 2 && requireActivePanel && !panelStatus) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
