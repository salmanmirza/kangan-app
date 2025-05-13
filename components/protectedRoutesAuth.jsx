import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar"; // Adjust the import path as needed

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    // ✅ Show Navbar on all authorized protected pages
    return (
      <>
        <Navbar role={userRole} />
        {children || <Outlet />}
      </>
    );
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
