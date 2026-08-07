import { DeviceMobile, Monitor } from "@phosphor-icons/react";

import { HeadlineOverlay } from "./thumbnail-composer";
import type { TypographySettings } from "@/lib/types";

export type PreviewMode = "desktop" | "mobile";

interface FeedPreviewProps {
  image: string | null;
  title: string;
  typography: TypographySettings;
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
}

export function FeedPreview({ image, title, typography, mode, onModeChange }: FeedPreviewProps) {
  return (
    <section className="feed-section" aria-labelledby="feed-preview-title">
      <div className="section-heading">
        <div className="feed-heading-left">
          <span className="feed-kicker">Reality check</span>
          <h2 className="feed-title" id="feed-preview-title">
            How it looks on YouTube
          </h2>
        </div>
        <div className="preview-switcher" role="group" aria-label="Feed preview size">
          <button
            className={"preview-switch" + (mode === "desktop" ? " is-active" : "")}
            type="button"
            aria-pressed={mode === "desktop"}
            onClick={() => onModeChange("desktop")}
          >
            <Monitor size={14} />
            Desktop
          </button>
          <button
            className={"preview-switch" + (mode === "mobile" ? " is-active" : "")}
            type="button"
            aria-pressed={mode === "mobile"}
            onClick={() => onModeChange("mobile")}
          >
            <DeviceMobile size={14} />
            Mobile
          </button>
        </div>
      </div>

      <div className="feed-preview-frame">
        <article className={"feed-card" + (mode === "mobile" ? " is-mobile" : "")}>
          <div className="feed-thumb">
            {image ? (
              <>
                {/* Generated provider data URLs are intentionally kept client-side and are not optimized by Next. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="feed-thumb-image" src={image} alt="" />
                <HeadlineOverlay typography={typography} />
              </>
            ) : (
              <div className="canvas-placeholder">
                <p className="placeholder-dimension">Generate a visual to preview it here</p>
              </div>
            )}
          </div>
          <div className="feed-card-meta">
            <span className="avatar-placeholder" aria-hidden="true" />
            <div className="feed-card-copy">
              <p className="feed-card-title">
                {title.trim() || "Your video title will appear here"}
              </p>
              <div className="feed-card-footer">
                <span>Your Channel</span>
                <span>·</span>
                <span>Preview only</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
