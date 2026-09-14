import { useEffect, useState } from "react";
import supabaseClient from "../utils/supabaseClient";
import { Navigate } from "react-router-dom";

function Wrapper({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setAuthenticated(!!session);
      setLoading(false);
    });

    // Держим состояние в актуальном виде: выход в другой вкладке,
    // истечение токена и т.п.
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthenticated(!!session);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
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
