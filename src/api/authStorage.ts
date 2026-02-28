const AUTH_TOKEN_STORAGE_KEY = "auth_token";

function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function setStoredToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

function clearStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export const authStorage = {
  getToken: getStoredToken,
  setToken: setStoredToken,
  clearToken: clearStoredToken,
};
