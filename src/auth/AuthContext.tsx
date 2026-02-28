import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, authStorage, isRequestCanceled, toApiClientError, User } from "../api";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isUnauthorizedError(error: unknown): boolean {
  const apiError = toApiClientError(error);
  return apiError.status === 401 || apiError.status === 403;
}

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [authToken, setAuthToken] = useState<string | null>(() => authStorage.getToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(authToken !== null);

  useEffect(() => {
    if (!authToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);

    apiClient
      .getCurrentUser({ signal: abortController.signal })
      .then(response => {
        if (abortController.signal.aborted) {
          return;
        }

        setUser(response.user);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted || isRequestCanceled(error)) {
          return;
        }

        if (isUnauthorizedError(error)) {
          authStorage.clearToken();
          setAuthToken(null);
        }
        setUser(null);
      })
      .finally(() => {
        if (abortController.signal.aborted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [authToken]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    authStorage.setToken(response.user.token);
    setAuthToken(response.user.token);
    setUser(response.user);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    authStorage.clearToken();
    setAuthToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
