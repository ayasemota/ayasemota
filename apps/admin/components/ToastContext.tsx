"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { History, X, Undo2, Redo2, ChevronDown, ChevronUp } from "lucide-react";

interface FieldChange {
  field: string;
  from: string;
  to: string;
}

interface HistoryAction {
  id: string;
  description: string;
  details?: string;
  changes?: FieldChange[];
  timestamp: number;
  isUndone: boolean;
  undo: () => Promise<void> | void;
  redo: () => Promise<void> | void;
}

interface ToastContextType {
  addAction: (
    description: string,
    undo: () => Promise<void> | void,
    redo: () => Promise<void> | void,
    options?: { details?: string; changes?: FieldChange[] },
  ) => void;
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const actionFunctionsMap = new Map<
  string,
  { undo: () => Promise<void> | void; redo: () => Promise<void> | void }
>();

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActions] = useState<HistoryAction[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const addAction = useCallback(
    (
      description: string,
      undo: () => Promise<void> | void,
      redo: () => Promise<void> | void,
      options?: { details?: string; changes?: FieldChange[] },
    ) => {
      const id = `action_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const newAction: HistoryAction = {
        id,
        description,
        details: options?.details,
        changes: options?.changes,
        timestamp: Date.now(),
        isUndone: false,
        undo,
        redo,
      };

      actionFunctionsMap.set(id, { undo, redo });
      setActions((prev) => [newAction, ...prev].slice(0, 50));
    },
    [],
  );

  const handleUndo = useCallback(
    async (actionId: string) => {
      const action = actions.find((a) => a.id === actionId);
      const funcs = actionFunctionsMap.get(actionId);

      if (action && !action.isUndone && funcs) {
        try {
          await funcs.undo();
          setActions((prev) =>
            prev.map((a) => (a.id === actionId ? { ...a, isUndone: true } : a)),
          );
          showToast("Undone");
        } catch (error) {
          console.error("Undo failed:", error);
          showToast("Failed to undo");
        }
      }
    },
    [actions, showToast],
  );

  const handleRedo = useCallback(
    async (actionId: string) => {
      const action = actions.find((a) => a.id === actionId);
      const funcs = actionFunctionsMap.get(actionId);

      if (action && action.isUndone && funcs) {
        try {
          await funcs.redo();
          setActions((prev) =>
            prev.map((a) =>
              a.id === actionId ? { ...a, isUndone: false } : a,
            ),
          );
          showToast("Redone");
        } catch (error) {
          console.error("Redo failed:", error);
          showToast("Failed to redo");
        }
      }
    },
    [actions, showToast],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();

        if (e.shiftKey) {
          const lastUndone = actions.find(
            (a) => a.isUndone && actionFunctionsMap.has(a.id),
          );
          if (lastUndone) {
            handleRedo(lastUndone.id);
          }
        } else {
          const lastActive = actions.find(
            (a) => !a.isUndone && actionFunctionsMap.has(a.id),
          );
          if (lastActive) {
            handleUndo(lastActive.id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions, handleUndo, handleRedo]);

  const clearHistory = useCallback(() => {
    setActions([]);
    actionFunctionsMap.clear();
    setIsPanelOpen(false);
  }, []);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (timestamp: number) => {
    const diff = now - timestamp;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;

    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasActions = actions.length > 0;
  const undoableCount = actions.filter(
    (a) => !a.isUndone && actionFunctionsMap.has(a.id),
  ).length;

  return (
    <ToastContext.Provider value={{ addAction, showToast }}>
      {children}

      {/* Floating History Button */}
      {hasActions && (
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={`fixed bottom-4 right-4 z-40 w-11 h-11 rounded-lg shadow-md border flex items-center justify-center transition-all ${
            isPanelOpen
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
          title="Action History (Ctrl+Z to undo, Ctrl+Shift+Z to redo)"
        >
          <History size={18} />
          {!isPanelOpen && undoableCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
              {undoableCount}
            </span>
          )}
        </button>
      )}

      {/* History Panel - slides from right side */}
      {isPanelOpen && (
        <>
          {/* Invisible click-away layer (no dimming) */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsPanelOpen(false)}
          />

          {/* Panel - slides from right */}
          <div className="fixed z-40 top-4 right-4 bottom-4 w-80 max-w-[calc(100vw-2rem)] bg-white shadow-xl border border-gray-200 rounded-2xl animate-slideIn flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <History size={18} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">History</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {actions.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Actions List */}
            <div className="overflow-y-auto flex-1">
              {actions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No actions yet
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {actions.map((action) => {
                    const hasFunctions = actionFunctionsMap.has(action.id);
                    const isExpanded = expandedAction === action.id;

                    return (
                      <div
                        key={action.id}
                        className={`px-4 py-3 ${
                          action.isUndone ? "bg-gray-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Timeline dot */}
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              action.isUndone ? "bg-gray-300" : "bg-blue-500"
                            }`}
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm font-medium truncate ${
                                  action.isUndone
                                    ? "text-gray-400 line-through"
                                    : "text-gray-900"
                                }`}
                              >
                                {action.description}
                              </p>
                              {action.changes && action.changes.length > 0 && (
                                <button
                                  onClick={() =>
                                    setExpandedAction(
                                      isExpanded ? null : action.id,
                                    )
                                  }
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {isExpanded ? (
                                    <ChevronUp size={14} />
                                  ) : (
                                    <ChevronDown size={14} />
                                  )}
                                </button>
                              )}
                            </div>

                            {action.details && !action.changes && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {action.details}
                              </p>
                            )}

                            {/* Expanded changes */}
                            {isExpanded && action.changes && (
                              <div className="mt-2 space-y-1">
                                {action.changes.map((change, i) => (
                                  <div
                                    key={i}
                                    className="text-xs text-gray-500 flex items-center gap-1"
                                  >
                                    <span className="font-medium text-gray-600">
                                      {change.field}:
                                    </span>
                                    <span className="text-red-400 line-through">
                                      {change.from || "(empty)"}
                                    </span>
                                    <span className="text-gray-300">→</span>
                                    <span className="text-green-600">
                                      {change.to || "(empty)"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(action.timestamp)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {hasFunctions && (
                              <>
                                {action.isUndone ? (
                                  <button
                                    onClick={() => handleRedo(action.id)}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                    title="Redo"
                                  >
                                    <Redo2 size={16} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUndo(action.id)}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    title="Undo"
                                  >
                                    <Undo2 size={16} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Quick Toast */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fadeIn">
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
}
