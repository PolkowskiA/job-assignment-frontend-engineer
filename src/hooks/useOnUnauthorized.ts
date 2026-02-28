import { useHistory } from "react-router-dom";

export const useOnUnauthorized = () => {
  const history = useHistory();

  const onUnauthorized = () => {
    history.push("/login");
  };

  return onUnauthorized;
};
