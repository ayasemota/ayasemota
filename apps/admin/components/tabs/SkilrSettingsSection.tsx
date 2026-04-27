"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { SystemSettings } from "@/hooks/useSettings";

interface SkilrSettingsSectionProps {
  settings: SystemSettings;
  loading: boolean;
  updateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
}

const parseNumber = (value: string) => {
  const numeric = Number.parseFloat(value);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const makeEmptySection = () => ({
  title: "New Section",
  points: ["New rule point"],
});

export default function SkilrSettingsSection({
  settings,
  loading,
  updateSettings,
}: SkilrSettingsSectionProps) {
  const [sectionPendingDelete, setSectionPendingDelete] = useState<
    number | null
  >(null);
  const pointTextareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>(
    {},
  );

  useLayoutEffect(() => {
    Object.values(pointTextareaRefs.current).forEach((textarea) => {
      if (!textarea) return;
      textarea.style.height = "0px";
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [settings.cohortRules]);

  useEffect(() => {
    setSectionPendingDelete(null);
  }, [settings.cohortRules]);

  const saveSettings = async (nextSettings: Partial<SystemSettings>) => {
    try {
      await updateSettings(nextSettings);
    } catch (error) {
      console.error("Failed to save Skilr settings", error);
    }
  };

  const updateVatRate = (value: string) => {
    void saveSettings({ vatRate: parseNumber(value) });
  };

  const updateTransactionFeeMin = (value: string) => {
    const min = parseNumber(value);
    const max = settings.transactionFeeMax;

    void saveSettings({
      transactionFeeMin: min,
      transactionFee: max,
      transactionFeeRange: {
        min: Math.min(min, max),
        max: Math.max(min, max),
      },
    });
  };

  const updateTransactionFeeMax = (value: string) => {
    const max = parseNumber(value);
    const min = settings.transactionFeeMin;

    void saveSettings({
      transactionFeeMax: max,
      transactionFee: max,
      transactionFeeRange: {
        min: Math.min(min, max),
        max: Math.max(min, max),
      },
    });
  };

  const updateCohortRules = (cohortRules: SystemSettings["cohortRules"]) => {
    void saveSettings({ cohortRules });
  };

  const updateSectionTitle = (sectionIndex: number, title: string) => {
    updateCohortRules(
      settings.cohortRules.map((section, index) =>
        index === sectionIndex ? { ...section, title } : section,
      ),
    );
  };

  const updateSectionPoint = (
    sectionIndex: number,
    pointIndex: number,
    value: string,
  ) => {
    updateCohortRules(
      settings.cohortRules.map((section, index) => {
        if (index !== sectionIndex) return section;

        return {
          ...section,
          points: section.points.map((point, pIndex) =>
            pIndex === pointIndex ? value : point,
          ),
        };
      }),
    );
  };

  const addSection = () => {
    updateCohortRules([...settings.cohortRules, makeEmptySection()]);
  };

  const removeSection = (sectionIndex: number) => {
    if (settings.cohortRules.length <= 1) {
      return;
    }

    updateCohortRules(
      settings.cohortRules.filter((_, index) => index !== sectionIndex),
    );
    setSectionPendingDelete(null);
  };

  const addPoint = (sectionIndex: number) => {
    updateCohortRules(
      settings.cohortRules.map((section, index) =>
        index === sectionIndex
          ? { ...section, points: [...section.points, "New rule point"] }
          : section,
      ),
    );
  };

  const removePoint = (sectionIndex: number, pointIndex: number) => {
    updateCohortRules(
      settings.cohortRules.map((section, index) => {
        if (index !== sectionIndex) return section;
        if (section.points.length <= 1) return section;

        return {
          ...section,
          points: section.points.filter((_, pIndex) => pIndex !== pointIndex),
        };
      }),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="bg-card text-card-foreground rounded-lg shadow p-6 border border-border">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap size={24} className="text-primary" />
              Skilr App Settings
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Changes here save automatically in real time and reflect in the
              Skilr app.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow p-6 border border-border space-y-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-48">
            <label className="text-xs font-medium text-muted-foreground uppercase block mb-2">
              Skilr VAT Rate (%)
            </label>
            <input
              type="number"
              value={settings.vatRate}
              onChange={(e) => updateVatRate(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. 4"
            />
          </div>

          <div className="flex-1 min-w-48">
            <label className="text-xs font-medium text-muted-foreground uppercase block mb-2">
              Transaction Fee Min (N)
            </label>
            <input
              type="number"
              value={settings.transactionFeeMin}
              onChange={(e) => updateTransactionFeeMin(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. 300"
            />
          </div>

          <div className="flex-1 min-w-48">
            <label className="text-xs font-medium text-muted-foreground uppercase block mb-2">
              Transaction Fee Max (N)
            </label>
            <input
              type="number"
              value={settings.transactionFeeMax}
              onChange={(e) => updateTransactionFeeMax(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. 500"
            />
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow p-6 border border-border">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-lg font-semibold text-foreground">
            Cohort Rules
          </h3>
          <button
            onClick={addSection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            <Plus size={14} />
            Add Section
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          You can add or remove sections and points as needed.
        </p>

        <div className="flex flex-wrap gap-5">
          {settings.cohortRules.length === 0 ? (
            <div className="w-full rounded-lg border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
              No cohort rules are stored yet. Add a section to start.
            </div>
          ) : null}
          {settings.cohortRules.map((section, sectionIndex) => (
            <div
              key={`section-${sectionIndex}`}
              className="flex-1 min-w-full sm:min-w-80 p-4 rounded-lg border border-border bg-background/70 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-muted-foreground uppercase block">
                  Section {sectionIndex + 1} Title
                </label>
                {sectionPendingDelete === sectionIndex ? (
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => removeSection(sectionIndex)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                    <button
                      onClick={() => setSectionPendingDelete(null)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSectionPendingDelete(sectionIndex)}
                    disabled={settings.cohortRules.length <= 1}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={12} />
                    Remove Section
                  </button>
                )}
              </div>
              <input
                type="text"
                value={section.title}
                onChange={(e) =>
                  updateSectionTitle(sectionIndex, e.target.value)
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Section title"
              />

              <div className="space-y-2">
                {section.points.map((point, pointIndex) => (
                  <div
                    key={`section-${sectionIndex}-point-${pointIndex}`}
                    className="flex items-end gap-2"
                  >
                    <textarea
                      ref={(el) => {
                        pointTextareaRefs.current[
                          `${sectionIndex}-${pointIndex}`
                        ] = el;
                      }}
                      value={point}
                      onChange={(e) =>
                        updateSectionPoint(
                          sectionIndex,
                          pointIndex,
                          e.target.value,
                        )
                      }
                      rows={1}
                      className="flex-1 resize-none overflow-hidden px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none leading-relaxed"
                      placeholder="Rule point"
                    />
                    <button
                      onClick={() => removePoint(sectionIndex, pointIndex)}
                      disabled={section.points.length <= 1}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addPoint(sectionIndex)}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border hover:bg-muted"
              >
                <Plus size={12} />
                Add Point
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
