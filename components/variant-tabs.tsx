import { CheckCircle, CircleNotch, WarningCircle } from "@phosphor-icons/react";

import { type GeneratedVariant, type Strategy, STRATEGIES, STRATEGY_LABELS } from "@/lib/types";

interface VariantTabsProps {
  activeStrategy: Strategy;
  variants: Record<Strategy, GeneratedVariant>;
  onSelect: (strategy: Strategy) => void;
}

function statusLabel(variant: GeneratedVariant) {
  if (variant.status === "generating") {
    return "building";
  }
  if (variant.status === "ready") {
    return "ready";
  }
  if (variant.status === "error") {
    return "failed";
  }
  return "waiting";
}

function StatusIcon({ status }: { status: GeneratedVariant["status"] }) {
  if (status === "generating") {
    return <CircleNotch size={14} className="variant-tab-status-icon" aria-hidden="true" />;
  }
  if (status === "ready") {
    return <CheckCircle size={14} weight="fill" aria-hidden="true" />;
  }
  if (status === "error") {
    return <WarningCircle size={14} weight="fill" aria-hidden="true" />;
  }
  return <span className="variant-tab-status" aria-hidden="true" />;
}

export function VariantTabs({ activeStrategy, variants, onSelect }: VariantTabsProps) {
  return (
    <div className="variant-tabs" role="tablist" aria-label="Generated thumbnail strategies">
      {STRATEGIES.map((strategy, index) => {
        const variant = variants[strategy];
        return (
          <button
            className={
              "variant-tab" +
              (activeStrategy === strategy ? " is-active" : "") +
              (variant.status === "error" ? " is-error" : "")
            }
            key={strategy}
            type="button"
            role="tab"
            aria-selected={activeStrategy === strategy}
            aria-controls={"thumbnail-panel-" + strategy}
            onClick={() => onSelect(strategy)}
          >
            <span className="variant-tab-content">
              <span className="variant-tab-title">
                {String.fromCharCode(65 + index)} · {STRATEGY_LABELS[strategy]}
              </span>
              <StatusIcon status={variant.status} />
            </span>
            <span className="variant-tab-meta">{statusLabel(variant)}</span>
          </button>
        );
      })}
    </div>
  );
}
