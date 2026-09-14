import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/api.js";

function Wrapper({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.auth
      .me()
      .then((user) => {
        if (active) setAuthenticated(Boolean(user));
      })
      .catch((error) => {
        console.error("Ошибка проверки сессии:", error);
        if (active) setAuthenticated(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  } else if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default Wrapper;
