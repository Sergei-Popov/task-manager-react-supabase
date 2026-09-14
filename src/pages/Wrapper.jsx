import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
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
    return (
      <div className="flex min-h-svh items-center justify-center gap-3 text-muted-foreground">
        <Spinner className="size-5" />
        <span>Проверяем сессию…</span>
      </div>
    );
  }
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default Wrapper;
