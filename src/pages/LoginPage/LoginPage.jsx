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
import api from "../../utils/api.js";

const LoginPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const form = e.target;
    const formData = new FormData(form);
    const user = Object.fromEntries(formData);

    try {
      await api.auth.login(
        user?.email?.toString() || "",
        user?.password?.toString() || "",
      );
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
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
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>
            Введите почту и пароль, чтобы продолжить
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="loginForm"
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Электронная почта</Label>
              <Input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>
            {message && (
              <p role="alert" className="text-sm text-destructive">
                {message}
              </p>
            )}
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? <Spinner data-icon="inline-start" /> : null}
              Войти
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Еще нет аккаунта?
          <Link
            to="/registration"
            className="ml-1 font-medium text-primary hover:underline"
          >
            Зарегистрироваться
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
