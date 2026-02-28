import { Route, HashRouter as Router, Switch } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Article from "./pages/Article";
import ArticleList from "./pages/ArticleList";
import Editor from "./pages/Editor";
import LoginRegister from "./pages/LoginRegister";
import Logout from "./pages/Logout";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route path="/editor" exact component={Editor} />
          <Route path="/editor/:slug" exact component={Editor} />
          <Route path="/login" exact component={LoginRegister} />
          <Route path="/logout" exact component={Logout} />
          <Route path="/profile/:username" exact component={Profile} />
          <Route path="/profile/:username/favorites" exact component={Profile} />
          <Route path="/register" exact component={LoginRegister} />
          <Route path="/settings" exact component={Settings} />
          <Route path="/:slug" exact component={Article} />
          <Route path="/" component={ArticleList} />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
