import axios, { AxiosRequestConfig } from "axios";
import { createApiClientError } from "./errors";
import { http, isRequestCanceled } from "./http";
import type {
  ApiErrorResponse,
  ArticlesQuery,
  MultipleArticlesResponse,
  SingleArticleResponse,
  SingleProfileResponse,
  SingleUserResponse,
} from "./types";

export interface RequestOptions {
  signal?: AbortSignal;
}

async function request<TResponse>(path: string, init: AxiosRequestConfig = {}): Promise<TResponse> {
  try {
    const response = await http.request<TResponse>({
      ...init,
      url: path,
    });
    return response.data;
  } catch (error) {
    if (isRequestCanceled(error)) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as ApiErrorResponse | undefined;
      const details = responseData?.errors.body ?? [];

      throw createApiClientError(error.response?.status ?? 0, details, error.message);
    }

    if (error instanceof Error) {
      throw createApiClientError(0, [error.message], error.message);
    }

    throw createApiClientError(0);
  }
}

function requestWithSignal<TResponse>(
  path: string,
  options?: RequestOptions,
  init: AxiosRequestConfig = {}
): Promise<TResponse> {
  return request<TResponse>(path, {
    ...init,
    signal: options?.signal,
  });
}

export const apiClient = {
  login(email: string, password: string): Promise<SingleUserResponse> {
    return request<SingleUserResponse>("/users/login", {
      method: "POST",
      data: {
        user: { email, password },
      },
    });
  },

  getCurrentUser(options?: RequestOptions): Promise<SingleUserResponse> {
    return requestWithSignal<SingleUserResponse>("/user", options);
  },

  getArticles(query?: ArticlesQuery, options?: RequestOptions): Promise<MultipleArticlesResponse> {
    return requestWithSignal<MultipleArticlesResponse>("/articles", options, {
      params: query,
    });
  },

  getArticle(slug: string, options?: RequestOptions): Promise<SingleArticleResponse> {
    return requestWithSignal<SingleArticleResponse>(`/articles/${slug}`, options);
  },

  getProfile(username: string, options?: RequestOptions): Promise<SingleProfileResponse> {
    return requestWithSignal<SingleProfileResponse>(`/profiles/${username}`, options);
  },

  followUser(username: string): Promise<SingleProfileResponse> {
    return request<SingleProfileResponse>(`/profiles/${username}/follow`, { method: "POST" });
  },

  unfollowUser(username: string): Promise<SingleProfileResponse> {
    return request<SingleProfileResponse>(`/profiles/${username}/follow`, { method: "DELETE" });
  },

  favoriteArticle(slug: string): Promise<SingleArticleResponse> {
    return request<SingleArticleResponse>(`/articles/${slug}/favorite`, { method: "POST" });
  },

  unfavoriteArticle(slug: string): Promise<SingleArticleResponse> {
    return request<SingleArticleResponse>(`/articles/${slug}/favorite`, { method: "DELETE" });
  },
};
