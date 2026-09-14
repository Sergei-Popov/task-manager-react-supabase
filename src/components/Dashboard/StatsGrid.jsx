import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
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
    </div>
  );
}

export default StatsGrid;
