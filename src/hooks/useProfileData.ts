import { useCallback, useEffect, useState } from "react";
import { apiClient, Article, isRequestCanceled, Profile, toApiClientError } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useOnUnauthorized } from "./useOnUnauthorized";

interface UseProfileDataParams {
  username: string;
  isFavoritesTab: boolean;
}

interface UseProfileDataResult {
  profile: Profile | null;
  articles: Article[];
  isLoading: boolean;
  errorMessage: string | null;
  isFollowPending: boolean;
  pendingFavoriteBySlug: Record<string, boolean>;
  isOwnProfile: boolean;
  handleToggleFollow: () => void;
  handleToggleFavorite: (article: Article) => void;
}

export function useProfileData({ username, isFavoritesTab }: UseProfileDataParams): UseProfileDataResult {
  const { isAuthenticated, user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [pendingFavoriteBySlug, setPendingFavoriteBySlug] = useState<Record<string, boolean>>({});
  const onUnauthorized = useOnUnauthorized();

  const handleUnauthorized = (error: unknown) => {
    const apiError = toApiClientError(error);
    if (apiError.status === 401 || apiError.status === 403) {
      onUnauthorized();
      return true;
    }
    return false;
  };

  const loadProfileData = useCallback(
    async (abortSignal: AbortSignal) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [profileResponse, articlesResponse] = await Promise.all([
          apiClient.getProfile(username, { signal: abortSignal }),
          apiClient.getArticles(
            {
              limit: 20,
              offset: 0,
              ...(isFavoritesTab ? { favorited: username } : { author: username }),
            },
            { signal: abortSignal }
          ),
        ]);

        if (abortSignal.aborted) return;

        setProfile(profileResponse.profile);
        setArticles(articlesResponse.articles);
      } catch (error) {
        if (abortSignal.aborted || isRequestCanceled(error)) return;

        const apiError = toApiClientError(error);
        setErrorMessage(apiError.details[0] ?? apiError.message);
      } finally {
        if (!abortSignal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [username, isFavoritesTab]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadProfileData(controller.signal);
    return () => controller.abort();
  }, [loadProfileData]);

  const isOwnProfile = profile?.username === user?.username;

  const handleToggleFollow = async () => {
    if (!profile || isOwnProfile) return;

    if (!isAuthenticated) {
      onUnauthorized();
      return;
    }

    setIsFollowPending(true);

    try {
      const response = profile.following
        ? await apiClient.unfollowUser(profile.username)
        : await apiClient.followUser(profile.username);

      setProfile(response.profile);

      setArticles(prev =>
        prev.map(article =>
          article.author.username === response.profile.username ? { ...article, author: response.profile } : article
        )
      );
    } catch (error) {
      if (!handleUnauthorized(error)) {
        console.error(error);
      }
    } finally {
      setIsFollowPending(false);
    }
  };

  const handleToggleFavorite = async (article: Article) => {
    if (!isAuthenticated) {
      onUnauthorized();
      return;
    }

    setPendingFavoriteBySlug(prev => ({
      ...prev,
      [article.slug]: true,
    }));

    try {
      const response = article.favorited
        ? await apiClient.unfavoriteArticle(article.slug)
        : await apiClient.favoriteArticle(article.slug);

      setArticles(prev => prev.map(a => (a.slug === article.slug ? response.article : a)));
    } catch (error) {
      handleUnauthorized(error);
    } finally {
      setPendingFavoriteBySlug(prev => ({
        ...prev,
        [article.slug]: false,
      }));
    }
  };

  return {
    profile,
    articles,
    isLoading,
    errorMessage,
    isFollowPending,
    pendingFavoriteBySlug,
    isOwnProfile: Boolean(isOwnProfile),
    handleToggleFollow,
    handleToggleFavorite,
  };
}
