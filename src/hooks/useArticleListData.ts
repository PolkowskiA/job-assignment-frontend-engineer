import { useEffect, useState } from "react";
import { apiClient, Article, isRequestCanceled, toApiClientError } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useOnUnauthorized } from "./useOnUnauthorized";

interface UseArticleListDataResult {
  articles: Article[];
  isLoading: boolean;
  errorMessage: string | null;
  pendingFavoriteBySlug: Record<string, boolean>;
  handleToggleFavorite: (article: Article) => void;
}

export function useArticleListData(): UseArticleListDataResult {
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingFavoriteBySlug, setPendingFavoriteBySlug] = useState<Record<string, boolean>>({});
  const onUnauthorized = useOnUnauthorized();

  useEffect(() => {
    const abortController = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);

    apiClient
      .getArticles({ limit: 20, offset: 0 }, { signal: abortController.signal })
      .then(response => {
        if (abortController.signal.aborted) {
          return;
        }

        setArticles(response.articles);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted || isRequestCanceled(error)) {
          return;
        }

        const apiError = toApiClientError(error);
        setErrorMessage(apiError.details[0] ?? apiError.message);
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
  }, []);

  const handleToggleFavorite = async (article: Article) => {
    if (!isAuthenticated) {
      onUnauthorized();
      return;
    }

    setPendingFavoriteBySlug(current => ({ ...current, [article.slug]: true }));

    try {
      const response = article.favorited
        ? await apiClient.unfavoriteArticle(article.slug)
        : await apiClient.favoriteArticle(article.slug);

      setArticles(currentArticles =>
        currentArticles.map(currentArticle =>
          currentArticle.slug === article.slug ? response.article : currentArticle
        )
      );
    } catch (error) {
      const apiError = toApiClientError(error);
      if (apiError.status === 401 || apiError.status === 403) {
        onUnauthorized();
      }
    } finally {
      setPendingFavoriteBySlug(current => ({ ...current, [article.slug]: false }));
    }
  };

  return {
    articles,
    isLoading,
    errorMessage,
    pendingFavoriteBySlug,
    handleToggleFavorite,
  };
}
