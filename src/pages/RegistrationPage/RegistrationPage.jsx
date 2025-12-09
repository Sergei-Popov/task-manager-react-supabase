import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { validateRegistrationForm } from "../../utils/validator.js";

import styles from "./RegistrationPage.module.css";
import supabaseClient from "../../utils/supabaseClient.js";

export const RegistrationPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const user = Object.fromEntries(formData);

    const validationResponse = validateRegistrationForm(user);

    // Очистка предыдущих ошибок
    form.querySelectorAll(".error").forEach((span) => (span.textContent = ""));

    if (validationResponse === true) {
      // Если валидация прошла успешно
      setLoading(true);
      setErrors({});
      // Регистрируем пользователя в Supabase
      const { data, error } = await supabaseClient.auth.signUp({
        email: user.email.toString() || "",
        password: user.password.toString() || "",
      });
      if (error) {
        console.error("Ошибка регистрации:", error);
        setMessage(error.message);
        setTimeout(() => setLoading(false), 500);
        form.reset();
        return;
      }
      if (data) {
        setLoading(false);
        navigate("/dashboard");
      }
    } else {
      // Если валидация не прошла
      setTimeout(() => setLoading(false), 500);
      const errorMap = {};
      validationResponse.forEach((error) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <h1>Регистрация</h1>
          {message && <p>{message}</p>}
        </div>

        <form
          className={styles.registerForm}
          id="registerForm"
          noValidate
          onSubmit={handleSubmit}
        >
          {/*<div className={styles.formField}>*/}
          {/*  <input type="text" id="username" name="username" placeholder="" />*/}
          {/*  <label htmlFor="username">Имя пользователя*</label>*/}
          {/*  <span className={styles.errorMessage} id="usernameError">*/}
          {/*    {errors.username}*/}
          {/*  </span>*/}
          {/*</div>*/}

          <div className={styles.formField}>
            <input type="email" id="email" name="email" placeholder="" />
            <label htmlFor="email">Электронная почта*</label>
            <span className={styles.errorMessage} id="emailError">
              {errors.email}
            </span>
          </div>

          <div className={styles.formField}>
            <input
              type="password"
              id="password"
              name="password"
              placeholder=""
            />
            <label htmlFor="password">Пароль*</label>
            <span className={styles.errorMessage} id="passwordError">
              {errors.password}
            </span>
          </div>

          <div className={styles.formField}>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder=""
            />
            <label htmlFor="confirmPassword">Подтвердите пароль*</label>
            <span className={styles.errorMessage} id="confirmPasswordError">
              {errors.confirmPassword}
            </span>
          </div>

          <button
            type="submit"
            className={`${styles.button} ${loading && styles.loading}`}
            disabled={loading}
          >
            <span className={styles.buttonText}>Зарегистрироваться</span>
            <div className={styles.buttonLoader}>
              <div className={styles.loaderCircle}></div>
            </div>
          </button>
        </form>
        <div className={styles.signUpPrompt}>
          <span>Уже зарегистрированы?</span>
          <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
