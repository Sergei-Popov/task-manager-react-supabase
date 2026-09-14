import { ArrowUpDown, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TASK_PRIORITIES } from "./constants.js";

const SORT_OPTIONS = [
  { id: "deadline", name: "По сроку" },
  { id: "priority", name: "По приоритету" },
  { id: "created", name: "Сначала новые" },
];

function FilterBar({
  sortBy,
  setSortBy,
  priorityFilter,
  setPriorityFilter,
  hideCompleted,
  setHideCompleted,
  total,
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border bg-card px-3 py-2">
      <div className="flex items-center gap-2">
        <ArrowUpDown
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger size="sm" aria-label="Сортировка" className="min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger size="sm" aria-label="Приоритет" className="min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Любой приоритет</SelectItem>
            {Object.values(TASK_PRIORITIES).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="hide-completed"
          size="sm"
          checked={hideCompleted}
          onCheckedChange={setHideCompleted}
        />
        <Label htmlFor="hide-completed" className="cursor-pointer font-normal">
          Скрыть завершённые
        </Label>
      </div>

      <span className="ml-auto text-sm text-muted-foreground">
        {total} {pluralTasks(total)}
      </span>
    </div>
  );
}

function pluralTasks(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "задача";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return "задачи";
  return "задач";
}

export default FilterBar;
