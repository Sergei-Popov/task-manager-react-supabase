import React, { useEffect, useState } from "react";
import supabaseClient from "../utils/supabaseClient";
import { Navigate, useNavigate } from "react-router-dom";

function Wrapper({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      // !!null -> false
      // !!{} -> true
      setAuthenticated(!!session);
      setLoading(false);
    };

    getSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  } else if (!authenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}

export default Wrapper;
