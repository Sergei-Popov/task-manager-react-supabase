import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { validateRegistrationForm } from "../../utils/validator.js";
import api from "../../utils/api.js";

function Field({ id, label, error, ...inputProps }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}Error` : undefined}
        {...inputProps}
      />
      {error && (
        <p id={`${id}Error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

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

    if (validationResponse === true) {
      setLoading(true);
      setErrors({});
      setMessage("");
      try {
        await api.auth.register(
          user.email.toString() || "",
          user.password.toString() || "",
        );
        navigate("/dashboard");
      } catch (error) {
        console.error("Ошибка регистрации:", error);
        setMessage(error.message);
        setLoading(false);
      }
    } else {
      const errorMap = {};
      validationResponse.forEach((error) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link
            to="/"
            className="mx-auto mb-2 flex items-center gap-2 text-primary"
          >
            <CheckCircle2 className="size-6" aria-hidden="true" />
            <span className="font-semibold">Мои задачи</span>
          </Link>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>
            Аккаунт создаётся мгновенно, подтверждать почту не нужно
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="registerForm"
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <Field
              id="email"
              label="Электронная почта"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email}
            />
            <Field
              id="password"
              label="Пароль"
              type="password"
              autoComplete="new-password"
              placeholder="Минимум 6 символов"
              error={errors.password}
            />
            <Field
              id="confirmPassword"
              label="Подтвердите пароль"
              type="password"
              autoComplete="new-password"
              placeholder="Повторите пароль"
              error={errors.confirmPassword}
            />
            <p className="text-xs text-muted-foreground">
              Пароль должен содержать заглавную букву, цифру и спецсимвол
              (!@#$%^&amp;*).
            </p>
            {message && (
              <p role="alert" className="text-sm text-destructive">
                {message}
              </p>
            )}
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? <Spinner data-icon="inline-start" /> : null}
              Зарегистрироваться
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Уже зарегистрированы?
          <Link
            to="/login"
            className="ml-1 font-medium text-primary hover:underline"
          >
            Войти
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegistrationPage;
