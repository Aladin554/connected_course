import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

type CourseViewRouteProps = {
  children: ReactNode;
};

export default function CourseViewRoute({ children }: CourseViewRouteProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const roleId = Number(sessionStorage.getItem("role_id"));

    if (roleId === 1) {
      setAllowed(true);
      return;
    }

    if (roleId !== 2) {
      setAllowed(false);
      return;
    }

    api
      .get("/profile")
      .then((res) => {
        sessionStorage.setItem("user", JSON.stringify(res.data));
        setAllowed(Number(res.data?.can_view_courses) === 1);
      })
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) return null;

  if (!allowed) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          message: "You do not have permission to access Course or Learning Content.",
          type: "error",
        }}
      />
    );
  }

  return <>{children}</>;
}
