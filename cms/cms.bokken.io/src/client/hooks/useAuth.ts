import { useState, useEffect, createContext, useContext } from "react";
import type { User } from "../api/auth.js";
import { fetchMe } from "../api/auth.js";

export interface AuthContext {
  user: User | null;
  loading: boolean;
  refetch: () => void;
}

export const AuthCtx = createContext<AuthContext>({
  user: null,
  loading: true,
  refetch: () => {},
});

export const useAuthProvider = (): AuthContext => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setLoading(true);
    fetchMe()
      .then(setUser)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refetch();
  }, []);

  return { user, loading, refetch };
};

export const useAuth = (): AuthContext => useContext(AuthCtx);
