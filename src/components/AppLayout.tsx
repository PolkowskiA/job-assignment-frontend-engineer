import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";

type ActiveNav = "home" | "editor" | "settings" | "login" | "logout";

interface AppLayoutProps {
  children: ReactNode;
  activeNav?: ActiveNav;
}

function getNavClass(activeNav: ActiveNav, item: ActiveNav): string {
  return activeNav === item ? "nav-link active" : "nav-link";
}

export default function AppLayout({ children, activeNav = "home" }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <nav className="navbar navbar-light">
        <div className="container">
          <a className="navbar-brand" href="/#">
            conduit
          </a>
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <a className={getNavClass(activeNav, "home")} href="/#">
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className={getNavClass(activeNav, "editor")} href="/#/editor">
                <i className="ion-compose" />
                &nbsp;New Article
              </a>
            </li>
            <li className="nav-item">
              <a className={getNavClass(activeNav, "settings")} href="/#/settings">
                <i className="ion-gear-a" />
                &nbsp;Settings
              </a>
            </li>
            {isAuthenticated ? (
              <li className="nav-item">
                <a className={getNavClass(activeNav, "logout")} href="/#/logout">
                  Logout
                </a>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <a className={getNavClass(activeNav, "login")} href="/#/login">
                    Sign in
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/#/register">
                    Sign up
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {children}

      <footer>
        <div className="container">
          <a href="/#" className="logo-font">
            conduit
          </a>
          <span className="attribution">
            An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design
            licensed under MIT.
          </span>
        </div>
      </footer>
    </>
  );
}
