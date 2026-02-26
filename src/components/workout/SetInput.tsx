"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SetInputProps {
  setNumber: number;
  reps?: number;
  calories?: number;
  duration?: number;
  distance?: number;
  onChange: (data: {
    reps?: number;
    calories?: number;
    duration?: number;
    distance?: number;
  }) => void;
  onRemove: () => void;
}

export function SetInput({
  setNumber,
  reps,
  calories,
  duration,
  distance,
  onChange,
  onRemove,
}: SetInputProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <span className="w-8 text-center text-sm font-medium text-muted-foreground">
        #{setNumber}
      </span>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="relative">
          <Input
            type="number"
            placeholder="Повт."
            value={reps || ""}
            onChange={(e) =>
              onChange({ reps: e.target.value ? parseInt(e.target.value) : undefined })
            }
            className="pr-10"
            min={0}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            раз
          </span>
        </div>

        <div className="relative">
          <Input
            type="number"
            placeholder="Калории"
            value={calories || ""}
            onChange={(e) =>
              onChange({ calories: e.target.value ? parseInt(e.target.value) : undefined })
            }
            className="pr-10"
            min={0}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            ккал
          </span>
        </div>

        <div className="relative hidden md:block">
          <Input
            type="number"
            placeholder="Время"
            value={duration || ""}
            onChange={(e) =>
              onChange({ duration: e.target.value ? parseInt(e.target.value) : undefined })
            }
            className="pr-10"
            min={0}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            сек
          </span>
        </div>

        <div className="relative hidden md:block">
          <Input
            type="number"
            placeholder="Дистанция"
            value={distance || ""}
            onChange={(e) =>
              onChange({ distance: e.target.value ? parseFloat(e.target.value) : undefined })
            }
            className="pr-10"
            min={0}
            step={0.1}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            м
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
