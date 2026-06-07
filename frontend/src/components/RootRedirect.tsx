import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const RootRedirect = () => {
  const [token, setToken] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role_id");
    setToken(t);
    setRoleId(role ? parseInt(role, 10) : null);
    setLoading(false);
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!token) return <Navigate to="/introduction" replace />;
  return <Navigate to="/introduction" replace />;
};

export default RootRedirect;
