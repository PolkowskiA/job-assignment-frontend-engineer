import { FormEvent, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toApiClientError } from "../api";
import { useAuth } from "../auth/AuthContext";
import AppLayout from "../components/AppLayout";

export default function LoginRegister() {
  const history = useHistory();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors([]);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      history.replace("/");
    } catch (error) {
      const apiError = toApiClientError(error);
      setErrors(apiError.details.length > 0 ? apiError.details : [apiError.message]);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      history.replace("/");
    }
  }, [history, isAuthenticated, isLoading]);

  return (
    <AppLayout activeNav="login">
      <div className="auth-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Sign in</h1>
              <p className="text-xs-center">Registration is not required for this assignment.</p>

              {errors.length > 0 && (
                <ul className="error-messages">
                  {errors.map(errorMessage => (
                    <li key={errorMessage}>{errorMessage}</li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleSubmit}>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    required
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    required
                  />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
