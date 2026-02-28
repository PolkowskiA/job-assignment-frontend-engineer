import { useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import AuthorImage from "../components/AuthorImage";
import { useArticleData } from "../hooks/useArticleData";
import { formatPublicationDate } from "../utils/articlePresentation";

export default function Article(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const {
    article,
    isLoading,
    errorMessage,
    isFavoritePending,
    isFollowPending,
    isOwnArticle,
    handleToggleFavorite,
    handleToggleFollow,
  } = useArticleData({
    slug,
  });
  const isContentReady = !isLoading && !errorMessage && article !== null;

  const renderArticleMeta = (buttonSpacing: string) => {
    if (!article) {
      return null;
    }

    const profileHref = `/#/profile/${article.author.username}`;
    const shouldShowFollowButton = !isOwnArticle;
    const followButtonClass = `btn btn-sm ${article.author.following ? "btn-secondary" : "btn-outline-secondary"}`;
    const favoriteButtonClass = `btn btn-sm ${article.favorited ? "btn-primary" : "btn-outline-primary"}`;

    return (
      <div className="article-meta">
        <a href={profileHref}>
          <AuthorImage src={article.author.image} alt={article.author.username} />
        </a>
        <div className="info">
          <a href={profileHref} className="author">
            {article.author.username}
          </a>
          <span className="date">{formatPublicationDate(article.createdAt)}</span>
        </div>
        {shouldShowFollowButton && (
          <button className={followButtonClass} type="button" onClick={handleToggleFollow} disabled={isFollowPending}>
            <i className="ion-plus-round" />
            &nbsp; {article.author.following ? "Following" : "Follow"} {article.author.username}
          </button>
        )}
        {shouldShowFollowButton && buttonSpacing}
        <button
          className={favoriteButtonClass}
          type="button"
          onClick={handleToggleFavorite}
          disabled={isFavoritePending}
        >
          <i className="ion-heart" />
          &nbsp; Favorite Post <span className="counter">({article.favoritesCount})</span>
        </button>
      </div>
    );
  };

  return (
    <AppLayout activeNav="home">
      <div className="article-page">
        <div className="banner">
          <div className="container">
            {isLoading && <h1>Loading article...</h1>}
            {!isLoading && errorMessage && <h1>Article not available</h1>}
            {isContentReady && <h1>{article.title}</h1>}
            {isContentReady && renderArticleMeta("\u00a0\u00a0")}
          </div>
        </div>

        <div className="container page">
          {!isLoading && errorMessage && (
            <div className="row">
              <div className="col-md-12">
                <ul className="error-messages">
                  <li>{errorMessage}</li>
                </ul>
              </div>
            </div>
          )}

          {isContentReady && (
            <>
              <div className="row article-content">
                <div className="col-md-12">
                  {article.body.split("\n").map((paragraph, index) => (
                    <p key={`${article.slug}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <hr />

              <div className="article-actions">{renderArticleMeta("\u00a0")}</div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
