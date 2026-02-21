import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthCtx, useAuthProvider, useAuth } from "./hooks/useAuth.js";
import { LoginPage } from "./pages/LoginPage.js";
import { ArticleListPage } from "./pages/ArticleListPage.js";
import { ArticleEditPage } from "./pages/ArticleEditPage.js";
import type { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppWithAuth = () => {
  const auth = useAuthProvider();

  return (
    <AuthCtx.Provider value={auth}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ArticleListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/*"
            element={
              <ProtectedRoute>
                <ArticleEditPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthCtx.Provider>
  );
};

export default AppWithAuth;
