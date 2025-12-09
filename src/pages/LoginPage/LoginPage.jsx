import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import styles from "./LoginPage.module.css";
import supabaseClient from "../../utils/supabaseClient.js";

const LoginPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const formData = new FormData(form);
    const user = Object.fromEntries(formData);

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: user?.email?.toString() || "",
      password: user?.password?.toString() || "",
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    if (data) {
      setLoading(false);
      navigate("/dashboard");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>Вход</h1>
          {message && <p>{message}</p>}
        </div>

        <form
          className={styles.loginForm}
          id="loginForm"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className={styles.formField}>
            <input type="email" id="email" name="email" placeholder="" />
            <label htmlFor="email">Электронная почта*</label>
          </div>

          <div className={styles.formField}>
            <input
              type="password"
              id="password"
              name="password"
              placeholder=""
            />
            <label htmlFor="password">Пароль*</label>
          </div>

          <button
            type="submit"
            className={`${styles.button} ${loading && styles.loading}`}
            disabled={loading}
          >
            <span className={styles.buttonText}>Войти</span>
            <div className={styles.buttonLoader}>
              <div className={styles.loaderCircle}></div>
            </div>
          </button>
        </form>
        <div className={styles.signInPrompt}>
          <span>Еще нет аккаунта?</span>
          <Link to="/registration">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
