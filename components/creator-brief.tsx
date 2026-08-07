import {
  AlignCenterHorizontal,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  ArrowRight,
  Circle,
  MagicWand,
  Sparkle,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { ChipSelector, SegmentedSelector } from "./chip-selector";
import {
  type Audience,
  type CreatorBrief,
  type Emotion,
  type HeadlinePosition,
  type SubjectPlacement,
  type VisualStyle,
} from "@/lib/types";

interface CreatorBriefProps {
  brief: CreatorBrief;
  onChange: (patch: Partial<CreatorBrief>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isValid: boolean;
}

const audienceOptions: ReadonlyArray<{ value: Audience; label: string }> = [
  { value: "general", label: "General" },
  { value: "developers", label: "Developers" },
  { value: "students", label: "Students" },
  { value: "founders", label: "Founders" },
  { value: "gamers", label: "Gamers" },
  { value: "creators", label: "Creators" },
  { value: "business", label: "Business" },
  { value: "education", label: "Education" },
];

const styleOptions: ReadonlyArray<{ value: VisualStyle; label: string }> = [
  { value: "bold", label: "Bold" },
  { value: "clean", label: "Clean" },
  { value: "cinematic", label: "Cinematic" },
  { value: "tech", label: "Tech" },
  { value: "documentary", label: "Documentary" },
  { value: "gaming", label: "Gaming" },
  { value: "educational", label: "Educational" },
  { value: "minimal", label: "Minimal" },
];

const emotionOptions: ReadonlyArray<{ value: Emotion; label: string }> = [
  { value: "curiosity", label: "Curiosity" },
  { value: "excitement", label: "Excitement" },
  { value: "urgency", label: "Urgency" },
  { value: "surprise", label: "Surprise" },
  { value: "trust", label: "Trust" },
  { value: "serious", label: "Serious" },
];

const placementOptions: ReadonlyArray<{
  value: SubjectPlacement;
  label: string;
  icon: ReactNode;
}> = [
  { value: "left", label: "Left", icon: <ArrowLeft size={14} /> },
  { value: "center", label: "Center", icon: <Circle size={12} weight="fill" /> },
  { value: "right", label: "Right", icon: <ArrowRight size={14} /> },
  { value: "auto", label: "Auto", icon: <MagicWand size={14} /> },
];

const headlinePositionOptions: ReadonlyArray<{
  value: HeadlinePosition;
  label: string;
  icon: ReactNode;
}> = [
  { value: "left", label: "Left", icon: <AlignLeft size={14} /> },
  { value: "center", label: "Center", icon: <AlignCenterHorizontal size={14} /> },
  { value: "right", label: "Right", icon: <AlignRight size={14} /> },
];

const accentSwatches = ["#d7ff4f", "#ff6b5e", "#70d6ff", "#c9a7ff", "#ffb86b"];

function readableLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function CreatorBriefPanel({
  brief,
  onChange,
  onGenerate,
  isGenerating,
  isValid,
}: CreatorBriefProps) {
  return (
    <aside className="brief-panel">
      <div className="panel-heading">
        <p className="eyebrow">01 / Creator brief</p>
        <h1 className="panel-title">Start with the video.</h1>
        <p className="panel-copy">
          Give ThumbLab the real idea. It will turn one brief into three creative hypotheses to
          test.
        </p>
      </div>

      <form
        className="brief-form"
        onSubmit={(event) => {
          event.preventDefault();
          onGenerate();
        }}
      >
        <div className="field-group">
          <label className="field-label" htmlFor="video-title">
            <span>Video title</span>
            <span className="field-hint">required</span>
          </label>
          <input
            id="video-title"
            className="text-input"
            type="text"
            value={brief.videoTitle}
            placeholder="I built an AI agent for my startup"
            maxLength={120}
            autoComplete="off"
            aria-required="true"
            aria-invalid={!brief.videoTitle.trim()}
            onChange={(event) => onChange({ videoTitle: event.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="video-description">
            <span>What is the video about?</span>
            <span className="field-hint">required</span>
          </label>
          <textarea
            id="video-description"
            className="text-area"
            value={brief.videoDescription}
            placeholder="A practical build log showing how the agent handles repetitive work..."
            maxLength={1200}
            rows={4}
            aria-required="true"
            aria-invalid={brief.videoDescription.trim().length < 20}
            onChange={(event) => onChange({ videoDescription: event.target.value })}
          />
          <span className="character-count">{brief.videoDescription.length}/1200</span>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="thumbnail-headline">
            <span>Thumbnail headline</span>
            <span className="field-hint">optional · 2–5 words</span>
          </label>
          <input
            id="thumbnail-headline"
            className="text-input"
            type="text"
            value={brief.headline}
            placeholder="MY AI CEO"
            maxLength={90}
            autoComplete="off"
            onChange={(event) => onChange({ headline: event.target.value })}
          />
        </div>

        <ChipSelector
          label="Audience"
          options={audienceOptions}
          value={brief.audience}
          onChange={(value) => onChange({ audience: value })}
        />

        <ChipSelector
          label="Visual style"
          options={styleOptions}
          value={brief.visualStyle}
          onChange={(value) => onChange({ visualStyle: value })}
        />

        <ChipSelector
          label="Emotional direction"
          options={emotionOptions}
          value={brief.emotion}
          onChange={(value) => onChange({ emotion: value })}
        />

        <SegmentedSelector
          label="Subject placement"
          options={placementOptions}
          value={brief.subjectPlacement}
          onChange={(value) => onChange({ subjectPlacement: value })}
        />

        <SegmentedSelector
          label="Headline position"
          options={headlinePositionOptions}
          value={brief.headlinePosition}
          onChange={(value) => onChange({ headlinePosition: value })}
        />

        <div className="field-group">
          <div className="field-label">
            <span>Accent direction</span>
            <span className="field-hint">{readableLabel(brief.accentColor)}</span>
          </div>
          <div className="swatch-list">
            {accentSwatches.map((swatch) => (
              <button
                className={"swatch-button" + (brief.accentColor === swatch ? " is-selected" : "")}
                key={swatch}
                type="button"
                aria-label={"Use accent " + swatch}
                aria-pressed={brief.accentColor === swatch}
                style={{ backgroundColor: swatch }}
                onClick={() => onChange({ accentColor: swatch })}
              />
            ))}
            <label>
              <span className="screen-reader-only">Choose custom accent color</span>
              <input
                className="color-input"
                type="color"
                value={brief.accentColor}
                aria-label="Choose custom accent color"
                onChange={(event) => onChange({ accentColor: event.target.value })}
              />
            </label>
          </div>
        </div>

        <button className="generate-button" type="submit" disabled={!isValid || isGenerating}>
          <Sparkle size={18} weight="fill" />
          {isGenerating ? "Generating trio..." : "Generate trio"}
        </button>
        <p className="button-note">
          {isValid
            ? "Three calls. Three directions. No fake CTR score."
            : "Add a title and at least 20 characters of video context to begin."}
        </p>
      </form>
    </aside>
  );
}
