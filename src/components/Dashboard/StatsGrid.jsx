import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const STATS = [
  {
    key: "todo",
    label: "К выполнению",
    icon: ListTodo,
    color: "bg-indigo-500",
  },
  { key: "inProgress", label: "В работе", icon: Clock, color: "bg-orange-500" },
  {
    key: "completed",
    label: "Завершено",
    icon: CheckCircle2,
    color: "bg-green-500",
  },
  {
    key: "overdue",
    label: "Просрочено",
    icon: AlertTriangle,
    color: "bg-red-500",
  },
];

function StatsGrid({ stats }) {
  const percent = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {STATS.map(({ key, label, icon, color }) => {
        const Icon = icon;
        return (
          <Card key={key} size="sm">
            <CardContent className="flex items-center gap-3 p-4">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-white ${color}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-2xl font-bold leading-tight">
                  {stats[key]}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {label}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card size="sm" className="col-span-2">
        <CardContent className="flex flex-col justify-center gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              <TrendingUp
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Выполнено
            </span>
            <span className="text-sm tabular-nums text-muted-foreground">
              {stats.completed} из {stats.total} · {percent}%
            </span>
          </div>
          <Progress value={percent} aria-label="Доля выполненных задач" />
        </CardContent>
      </Card>
    </div>
  );
}

export default StatsGrid;
