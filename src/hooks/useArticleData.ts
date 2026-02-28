import { useEffect, useState } from "react";
import { apiClient, Article, isRequestCanceled, toApiClientError } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useOnUnauthorized } from "./useOnUnauthorized";

function getApiClientErrorMessage(error: unknown, fallback: string): string {
  const apiError = toApiClientError(error);
  return apiError.details[0] ?? apiError.message ?? fallback;
}

interface UseArticleDataParams {
  slug: string;
}

interface UseArticleDataResult {
  article: Article | null;
  isLoading: boolean;
  errorMessage: string | null;
  isFavoritePending: boolean;
  isFollowPending: boolean;
  isOwnArticle: boolean;
  handleToggleFavorite: () => void;
  handleToggleFollow: () => void;
}

export function useArticleData({ slug }: UseArticleDataParams): UseArticleDataResult {
  const { isAuthenticated, user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const onUnauthorized = useOnUnauthorized();
  const isOwnArticle = user?.username === article?.author.username;

  const handleToggleFavorite = async () => {
    if (!article) {
      return;
    }

    if (!isAuthenticated) {
      onUnauthorized();
      return;
    }

    setIsFavoritePending(true);
    try {
      const response = article.favorited
        ? await apiClient.unfavoriteArticle(article.slug)
        : await apiClient.favoriteArticle(article.slug);
      setArticle(response.article);
    } catch (error) {
      const apiError = toApiClientError(error);
      if (apiError.status === 401 || apiError.status === 403) {
        onUnauthorized();
      }
    } finally {
      setIsFavoritePending(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!article || isOwnArticle) {
      return;
    }

    if (!isAuthenticated) {
      onUnauthorized();
      return;
    }

    setIsFollowPending(true);
    try {
      const response = article.author.following
        ? await apiClient.unfollowUser(article.author.username)
        : await apiClient.followUser(article.author.username);
      setArticle(currentArticle =>
        currentArticle
          ? {
              ...currentArticle,
              author: response.profile,
            }
          : currentArticle
      );
    } catch (error) {
      const apiError = toApiClientError(error);
      if (apiError.status === 401 || apiError.status === 403) {
        onUnauthorized();
      }
    } finally {
      setIsFollowPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);

    apiClient
      .getArticle(slug, { signal: abortController.signal })
      .then(response => {
        if (abortController.signal.aborted) {
          return;
        }

        setArticle(response.article);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted || isRequestCanceled(error)) {
          return;
        }

        setErrorMessage(getApiClientErrorMessage(error, "Failed to load article."));
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
  }, [slug]);

  return {
    article,
    isLoading,
    errorMessage,
    isFavoritePending,
    isFollowPending,
    isOwnArticle,
    handleToggleFavorite,
    handleToggleFollow,
  };
}
