import { ArrowClockwise, MagicWand, WarningCircle } from "@phosphor-icons/react";
import type { CSSProperties } from "react";

import { getHeadlineMaxCharacters, wrapHeadline } from "@/lib/export-thumbnail";
import {
  type GeneratedVariant,
  type TypographySettings,
  STRATEGY_DESCRIPTIONS,
  STRATEGY_LABELS,
} from "@/lib/types";

interface ThumbnailComposerProps {
  variant: GeneratedVariant;
  typography: TypographySettings;
  onRetry: () => void;
}

export function HeadlineOverlay({ typography }: { typography: TypographySettings }) {
  const lines = wrapHeadline(typography.headline, getHeadlineMaxCharacters(typography.size));
  if (lines.length === 0) {
    return null;
  }

  const style = {
    "--headline-fill": typography.fill,
    "--headline-outline": typography.outline,
  } as CSSProperties;

  return (
    <div
      className={"headline-overlay position-" + typography.position}
      style={style}
      aria-label={"Headline: " + typography.headline}
    >
      {lines.join("\n")}
    </div>
  );
}

export function ThumbnailComposer({ variant, typography, onRetry }: ThumbnailComposerProps) {
  const hasImage = Boolean(variant.image);
  const isLoading = variant.status === "generating";
  const strategyLabel = STRATEGY_LABELS[variant.strategy];

  return (
    <div
      className={"canvas-wrap" + (isLoading ? " is-loading" : "")}
      id={"thumbnail-panel-" + variant.strategy}
      role="tabpanel"
      aria-label={strategyLabel + " thumbnail"}
      aria-live="polite"
    >
      {hasImage ? (
        <>
          {/* Generated provider data URLs are intentionally kept client-side and are not optimized by Next. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="generated-image"
            src={variant.image ?? undefined}
            alt={strategyLabel + " generated thumbnail visual"}
          />
          <HeadlineOverlay typography={typography} />
          <span className="canvas-badge">
            {isLoading ? "Regenerating visual" : "Generated visual · exact type"}
          </span>
          {variant.status === "error" && variant.error ? (
            <div className="canvas-error-toast" role="alert">
              <WarningCircle size={16} weight="fill" />
              <span>{variant.error.message}</span>
              <button className="outline-button" type="button" onClick={onRetry}>
                <ArrowClockwise size={14} />
                Retry
              </button>
            </div>
          ) : null}
        </>
      ) : variant.status === "generating" ? (
        <div className="canvas-loading">
          <div className="loading-stack">
            <MagicWand className="loading-icon" size={28} weight="fill" />
            <p className="loading-title">Building {strategyLabel}...</p>
            <p className="loading-copy">
              The provider is creating a real visual. This can take a moment.
            </p>
          </div>
        </div>
      ) : variant.status === "error" && variant.error ? (
        <div className="canvas-failure" role="alert">
          <div className="failure-inner">
            <WarningCircle size={25} weight="fill" color="var(--danger)" />
            <p className="failure-title">{strategyLabel} did not generate.</p>
            <p className="failure-copy">{variant.error.message}</p>
            <button className="outline-button" type="button" onClick={onRetry}>
              <ArrowClockwise size={14} />
              Retry {strategyLabel}
            </button>
          </div>
        </div>
      ) : (
        <div className="canvas-placeholder">
          <div className="placeholder-inner">
            <span className="placeholder-icon" aria-hidden="true">
              <MagicWand size={26} />
            </span>
            <p className="placeholder-title">
              {variant.strategy === "clarity"
                ? "Your thumbnail will appear here"
                : strategyLabel + " is ready when you are"}
            </p>
            <p className="placeholder-copy">{STRATEGY_DESCRIPTIONS[variant.strategy]}</p>
            <p className="placeholder-dimension">16:9 · YouTube ready</p>
          </div>
        </div>
      )}
    </div>
  );
}
