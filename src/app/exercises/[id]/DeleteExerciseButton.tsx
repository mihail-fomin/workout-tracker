"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteExerciseButtonProps {
  exerciseId: string;
  exerciseName: string;
}

export function DeleteExerciseButton({
  exerciseId,
  exerciseName,
}: DeleteExerciseButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/exercises/${encodeURIComponent(exerciseId)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          toast.error(data.error || "Нельзя удалить встроенное упражнение");
        } else {
          throw new Error(data.error || "Не удалось удалить");
        }
        return;
      }

      toast.success("Упражнение удалено");
      router.push("/exercises");
      router.refresh();
    } catch {
      toast.error("Не удалось удалить упражнение");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить упражнение?</DialogTitle>
          <DialogDescription>
            Упражнение «{exerciseName}» будет удалено навсегда. Это действие
            нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
