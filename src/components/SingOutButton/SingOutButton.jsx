import { useNavigate } from "react-router-dom";

import styles from "./SingOutButton.module.css";
import supabaseClient from "../../utils/supabaseClient.js";

function SingOutButton() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Сначала уходим на лендинг, чтобы защищённая обёртка Dashboard
    // не успела перекинуть на /login при событии SIGNED_OUT.
    navigate("/", { replace: true });
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Ошибка при выходе из аккаунта:", error.message);
    }
  };

  return (
    <button className={styles.button} onClick={handleSignOut}>
      Выход
    </button>
  );
}

export default SingOutButton;
