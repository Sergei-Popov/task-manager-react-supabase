import { useNavigate } from "react-router-dom";

import styles from "./SingOutButton.module.css";
import api from "../../utils/api.js";

function SingOutButton() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Ошибка при выходе из аккаунта:", error.message);
    }
    navigate("/", { replace: true });
  };

  return (
    <button className={styles.button} onClick={handleSignOut}>
      Выход
    </button>
  );
}

export default SingOutButton;
