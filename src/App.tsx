import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicOnlyRoute from "@/components/PublicOnlyRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import VerifyEmail from "./pages/VerifyEmail.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AddChild from "./pages/AddChild.tsx";
import Chat from "./pages/Chat.tsx";
import ComingSoon from "./pages/ComingSoon.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Parent-only */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allow={["parent"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-child"
              element={
                <ProtectedRoute allow={["parent"]}>
                  <AddChild />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute allow={["parent"]}>
                  <ComingSoon
                    title="Activity History 📚"
                    emoji="📚"
                    description="A timeline of your children's questions and conversations is on its way."
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute allow={["parent"]}>
                  <ComingSoon
                    title="Accounts 👥"
                    emoji="👥"
                    description="Manage parent and child accounts here, soon."
                  />
                </ProtectedRoute>
              }
            />

            {/* Child-only */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute allow={["child"]}>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conversation/:id"
              element={
                <ProtectedRoute allow={["child"]}>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
