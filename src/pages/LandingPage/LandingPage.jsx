import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Palette,
  Play,
  Smartphone,
  SquarePen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/ThemeToggle.jsx";

const FEATURES = [
  {
    icon: SquarePen,
    title: "Создание задач",
    text: "Быстро создавайте задачи с описанием, дедлайном и категорией",
  },
  {
    icon: Palette,
    title: "Цветовая маркировка",
    text: "Выбирайте цвета для визуального разделения задач по приоритетам",
  },
  {
    icon: FolderKanban,
    title: "Категории и теги",
    text: "Организуйте задачи по категориям и тегам: работа, учёба, личное",
  },
  {
    icon: CalendarDays,
    title: "Календарь",
    text: "Смотрите задачи по дням месяца и выбирайте дату дедлайна",
  },
  {
    icon: BarChart3,
    title: "Статистика",
    text: "Отслеживайте прогресс: в работе, завершённые и просроченные",
  },
  {
    icon: Smartphone,
    title: "Адаптивность",
    text: "Работайте с любого устройства: компьютера, планшета или телефона",
  },
];

const BENEFITS = [
  {
    n: "01",
    title: "Простота использования",
    text: "Интуитивный интерфейс не требует обучения. Начните работать сразу после регистрации.",
  },
  {
    n: "02",
    title: "Свой сервер",
    text: "Данные хранятся в вашей базе PostgreSQL и доступны с любого устройства.",
  },
  {
    n: "03",
    title: "Безопасность",
    text: "Пароли хранятся в виде хешей, задачи видит только их владелец.",
  },
  {
    n: "04",
    title: "Без рекламы",
    text: "Никакой рекламы и отвлекающих элементов. Только вы и ваши задачи.",
  },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <CheckCircle2 className="size-5" aria-hidden="true" />
      </span>
      <span>«Мои задачи»</span>
    </Link>
  );
}

function SectionHeader({ tag, title, subtitle }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <Badge variant="secondary" className="mb-4">
        {tag}
      </Badge>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Шапка */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Возможности
            </a>
            <a
              href="#preview"
              className="transition-colors hover:text-foreground"
            >
              Превью
            </a>
            <a
              href="#benefits"
              className="transition-colors hover:text-foreground"
            >
              Преимущества
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link to="/login">Войти</Link>
            </Button>
            <Button asChild>
              <Link to="/registration">Регистрация</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-28">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Управляйте задачами{" "}
              <span className="text-muted-foreground">эффективно</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              «Мои задачи» — современный менеджер задач с интуитивным
              интерфейсом. Организуйте свои дела, устанавливайте дедлайны и
              достигайте целей.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/registration">
                  Начать бесплатно
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#preview">
                  <Play data-icon="inline-start" />
                  Смотреть демо
                </a>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6">
              {[
                ["100%", "Бесплатно"],
                ["24/7", "Доступность"],
                ["∞", "Задач"],
              ].map(([value, label], i) => (
                <div key={label} className="flex items-center gap-6">
                  {i > 0 && (
                    <Separator orientation="vertical" className="h-10" />
                  )}
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {value}
                    </div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-72 lg:block" aria-hidden="true">
            {[
              {
                icon: ListTodo,
                text: "Все задачи",
                pos: "top-[10%] left-[5%]",
              },
              {
                icon: CheckCircle2,
                text: "Завершено",
                pos: "top-[38%] right-0",
              },
              { icon: Clock, text: "В работе", pos: "bottom-[12%] left-[12%]" },
            ].map(({ icon, text, pos }) => {
              const Icon = icon;
              return (
                <Card key={text} className={`absolute ${pos} w-44 shadow-lg`}>
                  <CardContent className="flex items-center gap-3 px-4 py-3">
                    <Icon className="size-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{text}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Возможности */}
      <section id="features" className="border-t bg-card/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader
            tag="Возможности"
            title="Всё для продуктивной работы"
            subtitle="Мощные инструменты для организации ваших задач и проектов"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon, title, text }) => {
              const Icon = icon;
              return (
                <Card
                  key={title}
                  className="transition-colors hover:border-primary/50"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Превью */}
      <section id="preview" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader
            tag="Превью"
            title="Современный интерфейс"
            subtitle="Минималистичный дизайн, который помогает сосредоточиться на главном"
          />
          <div className="relative mx-auto max-w-5xl">
            <img
              src="/preview.png"
              alt="Скриншот дашборда «Мои задачи»"
              width={1440}
              height={900}
              loading="lazy"
              className="w-full rounded-xl border shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section id="benefits" className="border-t bg-card/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader tag="Преимущества" title="Почему «Мои задачи»?" />
          <div className="grid gap-6 md:grid-cols-2">
            {BENEFITS.map(({ n, title, text }) => (
              <Card key={n}>
                <CardContent className="flex gap-5 p-6">
                  <span className="text-3xl font-bold text-primary/60">
                    {n}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Готовы повысить продуктивность?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Присоединяйтесь к «Мои задачи» и начните организовывать свои задачи
            уже сегодня
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/registration">
              Создать аккаунт бесплатно
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Подвал */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} «Мои задачи»
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
