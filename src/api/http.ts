import axios, { AxiosHeaders } from "axios";
import { authStorage } from "./authStorage";

const API_BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:3000/api";
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: DEFAULT_REQUEST_TIMEOUT_MS,
});

http.interceptors.request.use(config => {
  const token = authStorage.getToken();

  if (!token) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;

  return config;
});

export function isRequestCanceled(error: unknown): boolean {
  return axios.isAxiosError(error) && error.code === "ERR_CANCELED";
}
