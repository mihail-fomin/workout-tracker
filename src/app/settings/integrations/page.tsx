"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Link as LinkIcon,
  Unlink,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatTime } from "@/lib/utils";

interface SyncStatus {
  connected: boolean;
  lastSyncAt: string | null;
  expiresAt?: string;
  isExpired?: boolean;
}

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [syncDays, setSyncDays] = useState("7");

  useEffect(() => {
    fetchSyncStatus();

    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "connected") {
      toast.success("Samsung Health успешно подключён");
    } else if (error) {
      const errorMessages: Record<string, string> = {
        oauth_denied: "Авторизация отклонена",
        no_code: "Не получен код авторизации",
        callback_failed: "Ошибка при обработке авторизации",
      };
      toast.error(errorMessages[error] || "Произошла ошибка");
    }
  }, [searchParams]);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch("/api/samsung-health/sync");
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error("Error fetching sync status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    window.location.href = "/api/samsung-health/auth";
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/samsung-health/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: parseInt(syncDays) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(
        `Синхронизация завершена: ${data.imported} импортировано, ${data.updated} обновлено`
      );
      fetchSyncStatus();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ошибка синхронизации"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/samsung-health/sync", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      toast.success("Samsung Health отключён");
      setSyncStatus({ connected: false, lastSyncAt: null });
    } catch {
      toast.error("Не удалось отключить Samsung Health");
    } finally {
      setIsDisconnecting(false);
      setShowDisconnectDialog(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Интеграции</h1>
        <p className="text-muted-foreground">
          Подключите внешние сервисы для синхронизации данных
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <div>
                <CardTitle>Samsung Health</CardTitle>
                <CardDescription>
                  Синхронизация тренировок из Samsung Health
                </CardDescription>
              </div>
            </div>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : syncStatus?.connected ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Подключено
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                <XCircle className="h-3 w-3 mr-1" />
                Не подключено
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {syncStatus?.connected ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Последняя синхронизация
                  </p>
                  <p className="font-medium">
                    {syncStatus.lastSyncAt
                      ? `${formatDate(syncStatus.lastSyncAt)} в ${formatTime(syncStatus.lastSyncAt)}`
                      : "Ещё не выполнялась"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Статус токена</p>
                  <p className="font-medium flex items-center gap-1">
                    {syncStatus.isExpired ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        Требуется переподключение
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Активен
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-end gap-4 pt-4 border-t">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="syncDays">Период синхронизации</Label>
                  <Select value={syncDays} onValueChange={setSyncDays}>
                    <SelectTrigger id="syncDays">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 дней</SelectItem>
                      <SelectItem value="14">14 дней</SelectItem>
                      <SelectItem value="30">30 дней</SelectItem>
                      <SelectItem value="60">60 дней</SelectItem>
                      <SelectItem value="90">90 дней</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSync} disabled={isSyncing}>
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Синхронизация...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Синхронизировать
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setShowDisconnectDialog(true)}
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Отключить
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Подключите Samsung Health для автоматической синхронизации
                тренировок с вашего устройства Samsung.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Импорт тренировок (бег, велосипед, силовые и др.)</li>
                <li>• Данные о калориях и пульсе</li>
                <li>• Автоматическая дедупликация</li>
              </ul>
              <Button onClick={handleConnect}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Подключить Samsung Health
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отключить Samsung Health?</DialogTitle>
            <DialogDescription>
              Синхронизация будет остановлена. Уже импортированные тренировки
              останутся в приложении.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisconnectDialog(false)}
              disabled={isDisconnecting}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отключение...
                </>
              ) : (
                "Отключить"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <IntegrationsContent />
    </Suspense>
  );
}
