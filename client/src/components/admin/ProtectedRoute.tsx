import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const [location, setLocation] = useLocation();

  // Check if we're on a worker route or admin route
  const isWorkerRoute = location.startsWith("/worker");
  const isAdminRoute = location.startsWith("/admin");
  
  // Redirect logic based on path and user role
  useEffect(() => {
    if (loading) return;
    
    // For debugging
    console.log("Protected route check - Auth status:", isAuthenticated);
    console.log("Protected route check - User:", user);
    console.log("Protected route check - Current location:", location);
    console.log("Protected route check - isWorkerRoute:", isWorkerRoute);
    console.log("Protected route check - isAdminRoute:", isAdminRoute);
    
    if (!isAuthenticated) {
      // Redirect to appropriate login
      if (isWorkerRoute) {
        console.log("Not authenticated, redirecting to worker login");
        setLocation("/worker");
      } else {
        console.log("Not authenticated, redirecting to admin login");
        setLocation("/admin");
      }
    } else if (user && user.role) {
      // Check role-based access
      console.log("Checking role-based access. User role:", user.role);
      if (isAdminRoute && user.role !== 'admin') {
        console.log("Non-admin trying to access admin page, redirecting to home");
        setLocation("/"); // Redirect non-admins away from admin pages
      } else if (isWorkerRoute && user.role !== 'staff') {
        console.log("Non-staff trying to access worker page, redirecting to home");
        setLocation("/"); // Redirect non-staff away from worker pages
      }
    }
  }, [loading, isAuthenticated, setLocation, user, isWorkerRoute, isAdminRoute, location]);

  // If authentication is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }
  
  // Check role-based access
  if (user && user.role) {
    if (isAdminRoute && user.role !== 'admin') {
      return null; // Don't render for non-admins
    }
    if (isWorkerRoute && user.role !== 'staff') {
      return null; // Don't render for non-staff
    }
  }

  // User is authenticated and has correct role, render children
  return <>{children}</>;
}