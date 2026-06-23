export const isPanelActive = (user?: { panel_status?: number | string | boolean | null } | null) =>
  Number(user?.panel_status) === 1;

export const getAdminHomePath = () => {
  const roleId = Number(sessionStorage.getItem("role_id"));
  const user = getStoredUser<{ panel_status?: number | string | boolean | null }>();

  if ((roleId === 1 || roleId === 2) && isPanelActive(user)) {
    return "/choose-dashboard";
  }

  return "/dashboard";
};

export const clearAuthSession = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role_id");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("auth");
  localStorage.removeItem("token");
};

export const getStoredUser = <T = any>(): T | null => {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const persistAuthSession = (token: string, user: any) => {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("role_id", user.role_id.toString());
  sessionStorage.setItem("user", JSON.stringify(user));
};
