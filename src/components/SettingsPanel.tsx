"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Download, Upload, Trash2, AlertTriangle, Globe, Smartphone } from "lucide-react";
import type { CycleData, UserSettings, Language } from "@/types";
import { exportDataAsJSON, importDataFromJSON } from "@/lib/dataExport";
import { useTranslation } from "@/contexts/LanguageContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cycleData: CycleData;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onReplaceAllData: (data: CycleData) => void;
  onDeleteCategory: (category: "periods" | "symptoms" | "fertility") => void;
  onDeleteAllData: () => void;
}

type DeleteTarget = "periods" | "symptoms" | "fertility" | "all" | null;

export function SettingsPanel({
  isOpen,
  onClose,
  cycleData,
  onUpdateSettings,
  onReplaceAllData,
  onDeleteCategory,
  onDeleteAllData,
}: SettingsPanelProps) {
  const { t } = useTranslation();
  const { canInstall, install } = usePWAInstall();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  // Local state for settings (applied on save)
  const [localSettings, setLocalSettings] = useState<UserSettings>(cycleData.settings);

  const categoryLabels: Record<"periods" | "symptoms" | "fertility", string> = {
    periods: t.cycle.periods,
    symptoms: t.symptoms.title,
    fertility: t.fertility.title,
  };

  // Reset local settings when dialog opens
  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setLocalSettings(cycleData.settings);
      setImportError(null);
      setImportSuccess(false);
    } else {
      onClose();
    }
  }, [cycleData.settings, onClose]);

  // Handle save
  const handleSave = useCallback(() => {
    onUpdateSettings(localSettings);
    onClose();
  }, [localSettings, onUpdateSettings, onClose]);

  // Handle export
  const handleExport = useCallback(() => {
    exportDataAsJSON(cycleData);
  }, [cycleData]);

  // Handle import
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    try {
      const data = await importDataFromJSON(file);
      onReplaceAllData(data);
      setLocalSettings(data.settings);
      setImportSuccess(true);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : t.errors.unknownError);
    }

    // Reset file input
    event.target.value = "";
  }, [onReplaceAllData, t.errors.unknownError]);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;

    if (deleteTarget === "all") {
      onDeleteAllData();
    } else {
      onDeleteCategory(deleteTarget);
    }
    setDeleteTarget(null);
  }, [deleteTarget, onDeleteAllData, onDeleteCategory]);

  // Get count for category
  const getCategoryCount = (category: "periods" | "symptoms" | "fertility"): number => {
    return cycleData[category]?.length || 0;
  };

  // Handle language change
  const handleLanguageChange = (lang: Language) => {
    setLocalSettings((prev) => ({ ...prev, language: lang }));
  };

  // Handle PWA install
  const handleInstall = useCallback(async () => {
    const accepted = await install();
    if (accepted) {
      setPwaInstalled(true);
    }
  }, [install]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.settings.title}</DialogTitle>
            <DialogDescription>
              {t.settings.subtitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Section 0: Language */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t.settings.language}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant={localSettings.language === "nl" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleLanguageChange("nl")}
                  >
                    {t.settings.languageNl}
                  </Button>
                  <Button
                    variant={localSettings.language === "en" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleLanguageChange("en")}
                  >
                    {t.settings.languageEn}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PWA Install */}
            {(canInstall || pwaInstalled) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    App
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pwaInstalled ? (
                    <p className="text-sm text-green-600">{t.settings.pwaInstalled}</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {t.settings.pwaInstallDesc}
                      </p>
                      <Button onClick={handleInstall} className="w-full">
                        <Smartphone className="w-4 h-4 mr-2" />
                        {t.settings.pwaInstall}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section 1: Cyclus Parameters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t.settings.cycleParams}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cycle Length */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">{t.cycle.cycleLength}</label>
                    <span className="text-sm text-muted-foreground">
                      {localSettings.averageCycleLength} {t.common.days}
                    </span>
                  </div>
                  <Slider
                    value={[localSettings.averageCycleLength]}
                    onValueChange={([value]) =>
                      setLocalSettings((prev) => ({ ...prev, averageCycleLength: value }))
                    }
                    min={21}
                    max={45}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>21</span>
                    <span>45</span>
                  </div>
                </div>

                {/* Period Length */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">{t.cycle.periodLength}</label>
                    <span className="text-sm text-muted-foreground">
                      {localSettings.averagePeriodLength} {t.common.days}
                    </span>
                  </div>
                  <Slider
                    value={[localSettings.averagePeriodLength]}
                    onValueChange={([value]) =>
                      setLocalSettings((prev) => ({ ...prev, averagePeriodLength: value }))
                    }
                    min={3}
                    max={10}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>3</span>
                    <span>10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Notifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t.settings.notifications}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reminders Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{t.settings.reminders}</label>
                  <Switch
                    checked={localSettings.notifications?.remindersEnabled ?? false}
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          remindersEnabled: checked,
                        },
                      }))
                    }
                  />
                </div>

                {/* Days Before Period */}
                {localSettings.notifications?.remindersEnabled && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">{t.settings.daysBefore}</label>
                      <span className="text-sm text-muted-foreground">
                        {localSettings.notifications?.daysBeforePeriod ?? 2} {t.common.days}
                      </span>
                    </div>
                    <Slider
                      value={[localSettings.notifications?.daysBeforePeriod ?? 2]}
                      onValueChange={([value]) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            daysBeforePeriod: value,
                          },
                        }))
                      }
                      min={1}
                      max={7}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1</span>
                      <span>7</span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {t.settings.notificationsLocal}
                </p>
              </CardContent>
            </Card>

            {/* Section 3: Data Management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t.settings.dataManagement}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Export/Import buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleExport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t.settings.export}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleImportClick}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t.settings.import}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Import feedback */}
                {importError && (
                  <p className="text-sm text-destructive">{importError}</p>
                )}
                {importSuccess && (
                  <p className="text-sm text-green-600">{t.settings.importSuccess}</p>
                )}

                <hr className="border-border" />

                {/* Selective Delete */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t.settings.selectiveDelete}</p>
                  {(["periods", "symptoms", "fertility"] as const).map((category) => (
                    <div key={category} className="flex items-center justify-between py-1">
                      <span className="text-sm">
                        {categoryLabels[category]} ({getCategoryCount(category)})
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(category)}
                        disabled={getCategoryCount(category) === 0}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <hr className="border-border" />

                {/* Delete All */}
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setDeleteTarget("all")}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t.settings.deleteAll}
                </Button>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSave}>
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {deleteTarget === "all" ? t.settings.deleteAllConfirm : t.settings.deleteConfirm}
            </DialogTitle>
            <DialogDescription>
              {deleteTarget === "all" ? (
                t.settings.deleteWarning
              ) : deleteTarget ? (
                <>
                  {categoryLabels[deleteTarget]} ({getCategoryCount(deleteTarget)})
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {deleteTarget === "all" ? t.settings.yesDeleteAll : t.settings.yesDelete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
