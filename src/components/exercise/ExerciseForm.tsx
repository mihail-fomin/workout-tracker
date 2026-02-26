"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryMuscleGroup, PRIMARY_MUSCLE_GROUP_LABELS, MUSCLE_GROUPS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ExerciseFormProps {
  initialData?: {
    id?: string;
    name: string;
    description?: string;
    muscleGroups: string[];
    primaryMuscleGroup: PrimaryMuscleGroup;
  };
}

export function ExerciseForm({ initialData }: ExerciseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    primaryMuscleGroup: initialData?.primaryMuscleGroup || ("CHEST" as PrimaryMuscleGroup),
    muscleGroups: initialData?.muscleGroups || [],
  });

  const handleAddMuscleGroup = (group: string) => {
    if (!formData.muscleGroups.includes(group)) {
      setFormData({
        ...formData,
        muscleGroups: [...formData.muscleGroups, group],
      });
    }
  };

  const handleRemoveMuscleGroup = (group: string) => {
    setFormData({
      ...formData,
      muscleGroups: formData.muscleGroups.filter((g) => g !== group),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = initialData?.id
        ? `/api/exercises/${initialData.id}`
        : "/api/exercises";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isCustom: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка сохранения");
      }

      toast.success(
        initialData?.id ? "Упражнение обновлено" : "Упражнение создано"
      );
      router.push("/exercises");
      router.refresh();
    } catch {
      toast.error("Не удалось сохранить упражнение");
    } finally {
      setIsLoading(false);
    }
  };

  const availableMuscleGroups = MUSCLE_GROUPS.filter(
    (g) => !formData.muscleGroups.includes(g)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Информация об упражнении</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Например: Жим штанги лёжа"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryMuscleGroup">Группа мышц *</Label>
            <Select
              value={formData.primaryMuscleGroup}
              onValueChange={(value) =>
                setFormData({ ...formData, primaryMuscleGroup: value as PrimaryMuscleGroup })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIMARY_MUSCLE_GROUP_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Опишите технику выполнения..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Мышечные группы</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.muscleGroups.map((group) => (
                <Badge
                  key={group}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleRemoveMuscleGroup(group)}
                >
                  {group}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            <Select onValueChange={handleAddMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Добавить мышечную группу" />
              </SelectTrigger>
              <SelectContent>
                {availableMuscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
