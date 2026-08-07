"use client";

import { DownloadSimple, PaperPlaneTilt } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { CreatorBriefPanel } from "./creator-brief";
import { ErrorState } from "./error-state";
import { type PreviewMode, FeedPreview } from "./feed-preview";
import { Header } from "./header";
import { PromptInspector } from "./prompt-inspector";
import { ThumbnailComposer } from "./thumbnail-composer";
import { TypographyControls } from "./typography-controls";
import { VariantTabs } from "./variant-tabs";
import {
  createInitialVariants,
  DEFAULT_BRIEF,
  DEFAULT_TYPOGRAPHY,
  type CreatorBrief,
  type GenerationRequest,
  type Strategy,
  STRATEGIES,
  STRATEGY_LABELS,
  type TypographySettings,
  type VariantError,
} from "@/lib/types";
import { downloadThumbnail } from "@/lib/export-thumbnail";
import { isCreatorBriefValid } from "@/lib/validation";

interface GenerationResponse {
  strategy: Strategy;
  image: string;
  model: string;
  size: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readError(value: unknown): VariantError {
  if (isRecord(value)) {
    const code = typeof value.code === "string" ? value.code : "request_failed";
    const message =
      typeof value.message === "string"
        ? value.message
        : "The image request could not be completed.";
    return { code, message };
  }

  if (value instanceof Error) {
    return { code: "request_failed", message: value.message };
  }

  return { code: "request_failed", message: "The image request could not be completed." };
}

function readGenerationResponse(value: unknown, strategy: Strategy): GenerationResponse {
  if (
    !isRecord(value) ||
    typeof value.strategy !== "string" ||
    typeof value.image !== "string" ||
    typeof value.model !== "string" ||
    typeof value.size !== "string" ||
    value.strategy !== strategy
  ) {
    throw {
      code: "invalid_provider_response",
      message: "The app received an incomplete image response. Retry this variant.",
    };
  }

  return {
    strategy,
    image: value.image,
    model: value.model,
    size: value.size,
  };
}

function readResponseError(value: unknown) {
  if (isRecord(value) && isRecord(value.error)) {
    return readError(value.error);
  }
  return readError(value);
}

export function ThumbnailStudio() {
  const [brief, setBrief] = useState<CreatorBrief>(DEFAULT_BRIEF);
  const [typography, setTypography] = useState<TypographySettings>(DEFAULT_TYPOGRAPHY);
  const [variants, setVariants] = useState(createInitialVariants);
  const [activeStrategy, setActiveStrategy] = useState<Strategy>("clarity");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [refinement, setRefinement] = useState("");
  const [isGeneratingTrio, setIsGeneratingTrio] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const currentVariant = variants[activeStrategy];
  const isBriefValid = isCreatorBriefValid(brief);
  const hasAnyImage = STRATEGIES.some((strategy) => Boolean(variants[strategy].image));
  const recipeRefinement = currentVariant.refinement;

  const statusSummary = useMemo(() => {
    const ready = STRATEGIES.filter((strategy) => variants[strategy].status === "ready").length;
    const failed = STRATEGIES.filter((strategy) => variants[strategy].status === "error").length;
    if (isGeneratingTrio) {
      return "Creating three distinct directions...";
    }
    if (ready === STRATEGIES.length) {
      return "Three directions ready to compare.";
    }
    if (failed > 0 && ready > 0) {
      return ready + " ready · " + failed + " needs a retry";
    }
    return "Create three directions from one brief.";
  }, [isGeneratingTrio, variants]);

  function handleBriefChange(patch: Partial<CreatorBrief>) {
    setBrief((previous) => ({ ...previous, ...patch }));

    if (patch.headline !== undefined) {
      setTypography((previous) => ({ ...previous, headline: patch.headline ?? "" }));
    }
    if (patch.headlinePosition !== undefined) {
      setTypography((previous) => ({ ...previous, position: patch.headlinePosition ?? "left" }));
    }
  }

  function handleTypographyChange(patch: Partial<TypographySettings>) {
    setTypography((previous) => ({ ...previous, ...patch }));

    if (patch.headline !== undefined) {
      setBrief((previous) => ({ ...previous, headline: patch.headline ?? "" }));
    }
    if (patch.position !== undefined) {
      setBrief((previous) => ({ ...previous, headlinePosition: patch.position ?? "left" }));
    }
  }

  async function requestVariant(strategy: Strategy, refinementText?: string) {
    const payload: GenerationRequest = {
      ...brief,
      strategy,
      refinement: refinementText?.trim() || undefined,
    };

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw readResponseError(body);
    }

    return readGenerationResponse(body, strategy);
  }

  function markGenerating(strategy: Strategy) {
    setVariants((previous) => ({
      ...previous,
      [strategy]: {
        ...previous[strategy],
        status: "generating",
        error: null,
      },
    }));
  }

  async function generateAndStore(strategy: Strategy, refinementText?: string) {
    markGenerating(strategy);

    try {
      const result = await requestVariant(strategy, refinementText);
      setVariants((previous) => ({
        ...previous,
        [strategy]: {
          ...previous[strategy],
          status: "ready",
          image: result.image,
          error: null,
          refinement: refinementText?.trim() ?? "",
        },
      }));
      return true;
    } catch (error) {
      const failure = readError(error);
      setVariants((previous) => ({
        ...previous,
        [strategy]: {
          ...previous[strategy],
          status: "error",
          error: failure,
        },
      }));
      return false;
    }
  }

  async function generateTrio() {
    if (!isBriefValid || isGeneratingTrio) {
      setGlobalError(
        isBriefValid
          ? "The trio is already being generated."
          : "Complete the title and video context before generating.",
      );
      return;
    }

    setGlobalError(null);
    setIsGeneratingTrio(true);
    setActiveStrategy("clarity");

    const outcomes = await Promise.all(STRATEGIES.map((strategy) => generateAndStore(strategy)));
    const successCount = outcomes.filter(Boolean).length;
    if (successCount === 0) {
      setGlobalError(
        "None of the three visuals completed. Check the provider configuration and retry.",
      );
    } else if (successCount < STRATEGIES.length) {
      setGlobalError("Some visuals completed. Select the failed tab to retry only that direction.");
    }
    setIsGeneratingTrio(false);
  }

  async function retryActiveVariant() {
    if (isGeneratingTrio) {
      return;
    }
    setGlobalError(null);
    await generateAndStore(activeStrategy, currentVariant.refinement || undefined);
  }

  async function submitRefinement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const instruction = refinement.trim();
    if (!instruction || !currentVariant.image || isGeneratingTrio) {
      return;
    }

    setGlobalError(null);
    setRefinement("");
    await generateAndStore(activeStrategy, instruction);
  }

  async function downloadCurrent() {
    if (!currentVariant.image) {
      return;
    }

    try {
      await downloadThumbnail(
        currentVariant.image,
        typography,
        "thumblab-" + activeStrategy + ".png",
      );
    } catch (error) {
      setGlobalError(readError(error).message);
    }
  }

  async function downloadAll() {
    const available = STRATEGIES.filter((strategy) => variants[strategy].image);
    if (available.length === 0) {
      return;
    }

    try {
      for (const strategy of available) {
        const image = variants[strategy].image;
        if (!image) {
          continue;
        }
        await downloadThumbnail(image, typography, "thumblab-" + strategy + ".png");
      }
    } catch (error) {
      setGlobalError(readError(error).message);
    }
  }

  return (
    <div className="studio-shell">
      <Header />
      <main className="studio-layout">
        <CreatorBriefPanel
          brief={brief}
          onChange={handleBriefChange}
          onGenerate={generateTrio}
          isGenerating={isGeneratingTrio}
          isValid={isBriefValid}
        />

        <section className="studio-column" aria-labelledby="studio-title">
          <div className="studio-title-row">
            <div>
              <p className="eyebrow">02 / Thumbnail studio</p>
              <h2 className="studio-title" id="studio-title">
                Don&apos;t guess the winner.
              </h2>
              <p className="studio-copy">
                Compare three different visual hypotheses, then let YouTube&apos;s native experiment
                decide what your audience actually watches.
              </p>
            </div>
            <span className="dimension-chip">16:9 · 1280×720</span>
          </div>

          <div className="studio-surface">
            <div className="canvas-meta">
              <span className="status-label">{statusSummary}</span>
              {currentVariant.status === "ready" ? (
                <span className="status-label">{STRATEGY_LABELS[activeStrategy]} selected</span>
              ) : null}
            </div>

            <VariantTabs
              activeStrategy={activeStrategy}
              variants={variants}
              onSelect={setActiveStrategy}
            />

            {globalError ? <ErrorState message={globalError} /> : null}

            <ThumbnailComposer
              variant={currentVariant}
              typography={typography}
              onRetry={retryActiveVariant}
            />

            <div className="download-row">
              <span className="download-row-copy">
                Exact headline type is composited in your browser.
                <br />
                Download the variants and upload them to YouTube&apos;s native A/B test.
              </span>
              <div className="button-row">
                <button
                  className="outline-button"
                  type="button"
                  disabled={!currentVariant.image}
                  onClick={downloadCurrent}
                >
                  <DownloadSimple size={15} />
                  Current
                </button>
                <button
                  className="download-button"
                  type="button"
                  disabled={!hasAnyImage}
                  onClick={downloadAll}
                >
                  <DownloadSimple size={15} />
                  Download all
                </button>
              </div>
            </div>

            <div className="studio-controls">
              <TypographyControls typography={typography} onChange={handleTypographyChange} />

              <section className="refine-panel" aria-labelledby="refine-title">
                <span className="refine-kicker">Optional generation pass</span>
                <h3 className="refine-title" id="refine-title">
                  Refine this visual
                </h3>
                <p className="refine-copy">
                  Keep the brief, add one visual instruction, and regenerate only the selected
                  direction.
                </p>
                <form className="refinement-form" onSubmit={submitRefinement}>
                  <label className="screen-reader-only" htmlFor="refinement-input">
                    Refine this visual
                  </label>
                  <input
                    id="refinement-input"
                    className="refinement-input"
                    type="text"
                    maxLength={240}
                    value={refinement}
                    placeholder="Make the subject larger..."
                    disabled={!currentVariant.image || isGeneratingTrio}
                    onChange={(event) => setRefinement(event.target.value)}
                  />
                  <button
                    className="refinement-submit"
                    type="submit"
                    aria-label="Submit visual refinement"
                    disabled={!currentVariant.image || !refinement.trim() || isGeneratingTrio}
                  >
                    <PaperPlaneTilt size={15} weight="fill" />
                  </button>
                </form>
              </section>
            </div>

            <FeedPreview
              image={currentVariant.image}
              title={brief.videoTitle}
              typography={typography}
              mode={previewMode}
              onModeChange={setPreviewMode}
            />

            <PromptInspector
              brief={brief}
              strategy={activeStrategy}
              refinement={recipeRefinement}
            />
          </div>

          <section className="how-section" id="how-it-works" aria-labelledby="how-title">
            <div>
              <p className="eyebrow">The point of the product</p>
              <h2 className="how-title" id="how-title">
                One brief.
                <br />
                Three hypotheses.
              </h2>
              <p className="how-copy">
                ThumbLab keeps image ideation flexible and typography exact. It never pretends to
                know your CTR; it gives YouTube three meaningfully different options to test.
              </p>
            </div>
            <div className="how-steps">
              <article className="how-step">
                <span className="how-number">01</span>
                <h3 className="how-step-title">Describe the real video</h3>
                <p className="how-step-copy">
                  A focused brief gives the visual model enough context to stay truthful.
                </p>
              </article>
              <article className="how-step">
                <span className="how-number">02</span>
                <h3 className="how-step-title">Compare the directions</h3>
                <p className="how-step-copy">
                  Clarity, curiosity, and emotion create distinct packaging hypotheses.
                </p>
              </article>
              <article className="how-step">
                <span className="how-number">03</span>
                <h3 className="how-step-title">Run the real experiment</h3>
                <p className="how-step-copy">
                  Export the exact PNGs and let YouTube&apos;s native A/B test choose.
                </p>
              </article>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
