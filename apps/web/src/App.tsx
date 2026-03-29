import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import OnboardingPage from "@/pages/OnboardingPage";
import MemberDashboard from "@/pages/MemberDashboard";
import HealthDashboard from "@/pages/HealthDashboard";
import CoordinatorDashboard from "@/pages/CoordinatorDashboard";
import ScenarioRunner from "@/pages/ScenarioRunner";
import TraceView from "@/pages/TraceView";
import TracesListPage from "@/pages/TracesListPage";
import CheckInPage from "@/pages/CheckInPage";
import RecipeListPage from "@/pages/RecipeListPage";
import RecipeDetailPage from "@/pages/RecipeDetailPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin" && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;

  return (
    <Routes>
      <Route path="/login/*" element={user ? <Navigate to={user.role === "admin" ? "/coordinator" : user.onboarded ? "/dashboard" : "/onboarding"} /> : <LoginPage />} />
      <Route path="/register/*" element={user ? <Navigate to={user.role === "admin" ? "/coordinator" : user.onboarded ? "/dashboard" : "/onboarding"} /> : <RegisterPage />} />
      <Route path="/onboarding" element={user ? (user.role === "admin" || user.onboarded ? <Navigate to={user.role === "admin" ? "/coordinator" : "/dashboard"} replace /> : <OnboardingPage />) : <Navigate to="/login" />} />
      <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
      <Route path="/health" element={<ProtectedRoute><HealthDashboard /></ProtectedRoute>} />
      <Route path="/check-in" element={<ProtectedRoute><CheckInPage /></ProtectedRoute>} />
      <Route path="/recipes" element={<ProtectedRoute><RecipeListPage /></ProtectedRoute>} />
      <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetailPage /></ProtectedRoute>} />
      <Route path="/coordinator" element={<AdminRoute><CoordinatorDashboard /></AdminRoute>} />
      <Route path="/scenarios" element={<AdminRoute><ScenarioRunner /></AdminRoute>} />
      <Route path="/traces" element={<AdminRoute><TracesListPage /></AdminRoute>} />
      <Route path="/traces/:runId" element={<AdminRoute><TraceView /></AdminRoute>} />
      <Route path="/" element={<Navigate to={user ? (user.role === "admin" ? "/coordinator" : user.onboarded ? "/dashboard" : "/onboarding") : "/login"} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
