import { useState } from "react";
import { CornerDownLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";

// Быстрое добавление: текст + Enter, срок подставляется автоматически
function QuickAdd({ onAdd, onOpenFull, disabled }) {
  const [text, setText] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const ok = await onAdd(value);
    if (ok) setText("");
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Plus
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="quick-add"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Быстро добавить задачу… (срок: сегодня 18:00)"
          aria-label="Быстро добавить задачу"
          className="h-10 pr-24 pl-9"
          disabled={disabled}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-1 text-xs text-muted-foreground sm:flex">
          <Kbd>
            <CornerDownLeft className="size-3" />
          </Kbd>
          добавить
        </span>
      </div>
      <Button type="button" variant="outline" size="lg" onClick={onOpenFull}>
        Подробно
        <Kbd className="ml-1 hidden sm:inline-flex">N</Kbd>
      </Button>
    </form>
  );
}

export default QuickAdd;
