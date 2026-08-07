import {
  AlignCenterHorizontal,
  AlignLeft,
  AlignRight,
  Palette,
  TextT,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { type HeadlinePosition, type TypographySettings } from "@/lib/types";

interface TypographyControlsProps {
  typography: TypographySettings;
  onChange: (patch: Partial<TypographySettings>) => void;
}

const positions: ReadonlyArray<{
  value: HeadlinePosition;
  label: string;
  icon: ReactNode;
}> = [
  { value: "left", label: "Left", icon: <AlignLeft size={14} /> },
  { value: "center", label: "Center", icon: <AlignCenterHorizontal size={14} /> },
  { value: "right", label: "Right", icon: <AlignRight size={14} /> },
];

export function TypographyControls({ typography, onChange }: TypographyControlsProps) {
  return (
    <section className="controls-panel" aria-labelledby="type-controls-title">
      <div className="control-heading">
        <h3 id="type-controls-title">
          <TextT size={14} /> Headline
        </h3>
        <span>deterministic overlay</span>
      </div>

      <div className="typography-grid">
        <label className="field-group" htmlFor="type-headline">
          <span className="control-label">
            Exact text <span className="character-count">{typography.headline.length}/90</span>
          </span>
          <input
            id="type-headline"
            className="text-input"
            type="text"
            value={typography.headline}
            maxLength={90}
            placeholder="MY AI CEO"
            onChange={(event) => onChange({ headline: event.target.value })}
          />
        </label>

        <label className="range-control" htmlFor="headline-size">
          <span className="control-label">
            <span>Size</span>
            <span className="character-count mono">{typography.size}px</span>
          </span>
          <input
            id="headline-size"
            type="range"
            min="48"
            max="112"
            step="1"
            value={typography.size}
            aria-label="Headline size"
            onChange={(event) => onChange({ size: Number(event.target.value) })}
          />
        </label>

        <div className="field-group">
          <span className="control-label">Position</span>
          <div className="segmented-control" role="group" aria-label="Headline position">
            {positions.map((position) => (
              <button
                className={
                  "segmented-button" +
                  (typography.position === position.value ? " is-selected" : "")
                }
                key={position.value}
                type="button"
                aria-pressed={typography.position === position.value}
                onClick={() => onChange({ position: position.value })}
              >
                <span className="icon-segment">
                  {position.icon}
                  <span className="screen-reader-only">{position.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="color-control-row">
          <label className="field-group" htmlFor="headline-fill">
            <span className="control-label">
              <span>Fill</span>
              <Palette size={13} />
            </span>
            <span className="color-control">
              <input
                id="headline-fill"
                type="color"
                value={typography.fill}
                aria-label="Headline fill color"
                onChange={(event) => onChange({ fill: event.target.value })}
              />
              <span>{typography.fill}</span>
            </span>
          </label>
          <label className="field-group" htmlFor="headline-outline">
            <span className="control-label">Outline</span>
            <span className="color-control">
              <input
                id="headline-outline"
                type="color"
                value={typography.outline}
                aria-label="Headline outline color"
                onChange={(event) => onChange({ outline: event.target.value })}
              />
              <span>{typography.outline}</span>
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
