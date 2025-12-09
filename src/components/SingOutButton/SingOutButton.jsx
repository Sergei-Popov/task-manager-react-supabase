import { Link, useNavigate } from "react-router-dom";

import styles from "./SingOutButton.module.css";
import supabaseClient from "../../utils/supabaseClient.js";

function SingOutButton() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
      navigate("/");
    }

    console.error("Ошибка при выходе из аккаунта:", error.message);
  };

  return (
    <button className={styles.button} onClick={handleSignOut}>
      Выход
    </button>
  );
}

export default SingOutButton;
