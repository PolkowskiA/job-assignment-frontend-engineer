import AppLayout from "../components/AppLayout";
import AuthorImage from "../components/AuthorImage";
import { useArticleListData } from "../hooks/useArticleListData";
import { formatPublicationDate } from "../utils/articlePresentation";

export default function ArticleList() {
  const { articles, isLoading, errorMessage, pendingFavoriteBySlug, handleToggleFavorite } = useArticleListData();

  return (
    <AppLayout activeNav="home">
      <div className="home-page">
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>

        <div className="container page">
          <div className="row">
            <div className="col-md-9">
              <div className="feed-toggle">
                <ul className="nav nav-pills outline-active">
                  <li className="nav-item">
                    <a className="nav-link disabled" href="/#">
                      Your Feed
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link active" href="/#">
                      Global Feed
                    </a>
                  </li>
                </ul>
              </div>

              {isLoading && <div className="article-preview">Loading articles...</div>}

              {!isLoading && errorMessage && (
                <div className="article-preview">
                  <ul className="error-messages">
                    <li>{errorMessage}</li>
                  </ul>
                </div>
              )}

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
                    </a>
                  </div>
                ))}
            </div>

            <div className="col-md-3">
              <div className="sidebar">
                <p>Popular Tags</p>

                <div className="tag-list">
                  <a href="/#" className="tag-pill tag-default">
                    programming
                  </a>
                  <a href="/#" className="tag-pill tag-default">
                    javascript
                  </a>
                  <a href="/#" className="tag-pill tag-default">
                    react
                  </a>
                  <a href="/#" className="tag-pill tag-default">
                    node
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
