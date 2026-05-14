import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { CreateServerPage } from "./pages/server/CreateServerPage";
import { InvitePreviewPage } from "./pages/server/InvitePreviewPage";
import { MainApplicationPage } from "./pages/server/MainApplicationPage";
import { OwnedServersPage } from "./pages/server/OwnedServersPage";
import { ServerEmptyPage } from "./pages/server/ServerEmptyPage";
import { AccountSettingsPage } from "./pages/user/AccountSettingsPage";

import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { ToastContainer } from "./components/ui/ToastContainer";
import axiosClient from "./config/axiosClient";
import { useAuthStore } from "./features/auth/store/authStore";

const AppRoot = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const setToken = useAuthStore((state) => state.setToken);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // Attempt silent refresh on app load
    const silentRefresh = async () => {
      try {
        const response = await axiosClient.post("/api/v1/auth/refresh");
        const token = response.data?.accessToken || response.data; // Depending on interceptor behavior
        if (token) {
          setToken(token);
        } else {
          logout();
        }
      } catch (err) {
        console.log("Silent refresh failed, user needs to login");
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    silentRefresh();
  }, [setToken, logout]);

  if (isInitializing) {
    // Show a loading screen while checking auth status
    return <LoadingSpinner message="Loading LiveBox..." fullScreen={true} />;
  }

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/invite/:code" element={<InvitePreviewPage />} />

        {/* Protected Routes */}
        <Route
          path="/servers/empty"
          element={
            <ProtectedRoute>
              <ServerEmptyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/servers/create"
          element={
            <ProtectedRoute>
              <CreateServerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/servers/owned"
          element={
            <ProtectedRoute>
              <OwnedServersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/main"
          element={
            <ProtectedRoute>
              <MainApplicationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
);
