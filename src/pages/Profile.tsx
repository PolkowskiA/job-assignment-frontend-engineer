import { useLocation, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import AuthorImage from "../components/AuthorImage";
import { useProfileData } from "../hooks/useProfileData";
import { formatPublicationDate } from "../utils/articlePresentation";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const isFavoritesTab = location.pathname.endsWith("/favorites");
  const {
    profile,
    articles,
    isLoading,
    errorMessage,
    isFollowPending,
    pendingFavoriteBySlug,
    isOwnProfile,
    handleToggleFollow,
    handleToggleFavorite,
  } = useProfileData({
    username,
    isFavoritesTab,
  });

  return (
    <AppLayout activeNav="home">
      <div className="profile-page">
        <div className="user-info">
          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-10 offset-md-1">
                {isLoading && <h4>Loading profile...</h4>}

                {!isLoading && errorMessage && (
                  <ul className="error-messages">
                    <li>{errorMessage}</li>
                  </ul>
                )}

                {!isLoading && !errorMessage && profile && (
                  <>
                    <AuthorImage src={profile.image} className="user-img" alt={profile.username} />
                    <h4>{profile.username}</h4>
                    <p>{profile.bio ?? "No bio available."}</p>
                    {!isOwnProfile && (
                      <button
                        className={`btn btn-sm action-btn ${
                          profile.following ? "btn-secondary" : "btn-outline-secondary"
                        }`}
                        type="button"
                        onClick={handleToggleFollow}
                        disabled={isFollowPending}
                      >
                        <i className="ion-plus-round" />
                        &nbsp; {profile.following ? "Following" : "Follow"} {profile.username}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <div className="articles-toggle">
                <ul className="nav nav-pills outline-active">
                  <li className="nav-item">
                    <a className={`nav-link ${!isFavoritesTab ? "active" : ""}`} href={`/#/profile/${username}`}>
                      My Articles
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link ${isFavoritesTab ? "active" : ""}`}
                      href={`/#/profile/${username}/favorites`}
                    >
                      Favorited Articles
                    </a>
                  </li>
                </ul>
              </div>

              {!isLoading && !errorMessage && articles.length === 0 && (
                <div className="article-preview">No articles are here... yet.</div>
              )}

              {!isLoading &&
                !errorMessage &&
                articles.map(article => (
                  <div className="article-preview" key={article.slug}>
                    <div className="article-meta">
                      <a href={`/#/profile/${article.author.username}`}>
                        <AuthorImage src={article.author.image} alt={article.author.username} />
                      </a>
                      <div className="info">
                        <a href={`/#/profile/${article.author.username}`} className="author">
                          {article.author.username}
                        </a>
                        <span className="date">{formatPublicationDate(article.createdAt)}</span>
                      </div>
                      <button
                        className={`btn btn-sm pull-xs-right ${
                          article.favorited ? "btn-primary" : "btn-outline-primary"
                        }`}
                        type="button"
                        onClick={() => {
                          handleToggleFavorite(article);
                        }}
                        disabled={pendingFavoriteBySlug[article.slug] === true}
                      >
                        <i className="ion-heart" /> {article.favoritesCount}
                      </button>
                    </div>
                    <a href={`/#/${article.slug}`} className="preview-link">
                      <h1>{article.title}</h1>
                      <p>{article.description}</p>
                      <span>Read more...</span>
                      {article.tagList.length > 0 && (
                        <ul className="tag-list">
                          {article.tagList.map(tag => (
                            <li className="tag-default tag-pill tag-outline" key={`${article.slug}-${tag}`}>
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                    </a>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
