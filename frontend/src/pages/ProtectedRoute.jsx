import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useUserAuth();
  console.log("User in ProtectedRoute:", user);

  if (!user || !user.uid) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;
