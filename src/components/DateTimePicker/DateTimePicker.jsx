import { useState } from "react";
import { ru } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const pad = (n) => String(n).padStart(2, "0");

// Локальная дата в ISO-строку с часовым поясом: 2026-09-20T18:00:00+05:00
function toLocalIso(date, hours, minutes) {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const tz = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(hours)}:${pad(minutes)}:00${tz}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

function DateTimePicker({
  value,
  onChange,
  placeholder = "Выберите дату и время",
  id,
}) {
  const [open, setOpen] = useState(false);

  const current = value ? new Date(value) : null;
  const hours = current ? current.getHours() : 12;
  const minutes = current ? current.getMinutes() : 0;

  const emit = (date, h, m) => {
    if (!date) return;
    onChange(toLocalIso(date, h, m));
  };

  const handleSelectDay = (day) => {
    if (!day) return;
    emit(day, hours, minutes);
  };

  const label = current
    ? current.toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : placeholder;

  // Если минуты не кратны 5 (старые данные), добавляем их в список
  const minuteOptions = MINUTES.includes(pad(minutes))
    ? MINUTES
    : [...MINUTES, pad(minutes)].sort();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start font-normal",
            !current && "text-muted-foreground",
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ru}
          selected={current || undefined}
          defaultMonth={current || undefined}
          onSelect={handleSelectDay}
          weekStartsOn={1}
        />
        <div className="flex items-center gap-2 border-t p-3">
          <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Время</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Select
              value={pad(hours)}
              onValueChange={(v) =>
                emit(current || new Date(), Number(v), minutes)
              }
            >
              <SelectTrigger className="w-[4.5rem]" aria-label="Часы">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {HOURS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">:</span>
            <Select
              value={pad(minutes)}
              onValueChange={(v) =>
                emit(current || new Date(), hours, Number(v))
              }
            >
              <SelectTrigger className="w-[4.5rem]" aria-label="Минуты">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {minuteOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end border-t p-2">
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Готово
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DateTimePicker;
