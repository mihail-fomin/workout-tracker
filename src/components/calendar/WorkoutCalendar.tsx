"use client";

import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarEvent, WORKOUT_TYPE_LABELS, WorkoutType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTime, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

const locales = { ru };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const EVENT_COLORS: Record<WorkoutType, string> = {
  STRENGTH: "#3b82f6",
  CARDIO: "#ef4444",
  STRETCHING: "#22c55e",
  MIXED: "#a855f7",
};

interface WorkoutCalendarProps {
  events: CalendarEvent[];
}

export function WorkoutCalendar({ events }: WorkoutCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: EVENT_COLORS[event.type],
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const messages = useMemo(
    () => ({
      today: "Сегодня",
      previous: "Назад",
      next: "Вперёд",
      month: "Месяц",
      week: "Неделя",
      day: "День",
      agenda: "Список",
      date: "Дата",
      time: "Время",
      event: "Событие",
      noEventsInRange: "Нет тренировок в этом периоде",
    }),
    []
  );

  const workout = selectedEvent?.resource;
  const duration =
    workout && workout.endTime
      ? Math.floor(
          (new Date(workout.endTime).getTime() -
            new Date(workout.startTime).getTime()) /
            1000
        )
      : 0;

  return (
    <div className="h-[700px]">
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 8px;
          font-weight: 500;
        }
        .rbc-month-view {
          border-radius: 8px;
          border: 1px solid hsl(var(--border));
        }
        .rbc-day-bg {
          background: hsl(var(--background));
        }
        .rbc-off-range-bg {
          background: hsl(var(--muted));
        }
        .rbc-today {
          background: hsl(var(--accent)) !important;
        }
        .rbc-toolbar button {
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          padding: 6px 12px;
        }
        .rbc-toolbar button:hover {
          background: hsl(var(--accent));
        }
        .rbc-toolbar button.rbc-active {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        .rbc-event {
          padding: 2px 4px;
          font-size: 12px;
        }
        .rbc-event-content {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        messages={messages}
        culture="ru"
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
      />

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Детали тренировки</DialogTitle>
          </DialogHeader>

          {workout && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "text-white",
                    `bg-[${EVENT_COLORS[workout.type]}]`
                  )}
                  style={{ backgroundColor: EVENT_COLORS[workout.type] }}
                >
                  {WORKOUT_TYPE_LABELS[workout.type]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Дата</p>
                  <p className="font-medium">
                    {format(new Date(workout.date), "d MMMM yyyy", {
                      locale: ru,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Время</p>
                  <p className="font-medium">
                    {formatTime(workout.startTime)}
                    {workout.endTime && ` — ${formatTime(workout.endTime)}`}
                  </p>
                </div>
                {duration > 0 && (
                  <div>
                    <p className="text-muted-foreground">Длительность</p>
                    <p className="font-medium">{formatDuration(duration)}</p>
                  </div>
                )}
                {workout.calories && (
                  <div>
                    <p className="text-muted-foreground">Калории</p>
                    <p className="font-medium">{workout.calories} ккал</p>
                  </div>
                )}
              </div>

              {workout.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Заметки</p>
                  <p className="text-sm">{workout.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Закрыть
                </Button>
                <Link href={`/workouts/${workout.id}`}>
                  <Button>Подробнее</Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
