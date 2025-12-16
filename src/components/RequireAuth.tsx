import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../lib/firebase";
import type { JSX } from "react";

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const location = useLocation();
    const user = auth.currentUser;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
};