import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoutes() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
