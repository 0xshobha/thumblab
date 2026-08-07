import { CaretDown, CheckCircle, Copy, SlidersHorizontal } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { getPromptRecipe } from "@/lib/prompt-builder";
import type { CreatorBrief, Strategy } from "@/lib/types";

interface PromptInspectorProps {
  brief: CreatorBrief;
  strategy: Strategy;
  refinement: string;
}

export function PromptInspector({ brief, strategy, refinement }: PromptInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const recipe = useMemo(
    () => getPromptRecipe(brief, strategy, refinement || undefined),
    [brief, refinement, strategy],
  );

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(recipe.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="recipe-panel" aria-labelledby="recipe-title">
      <div className="recipe-header">
        <div className="recipe-header-actions">
          <SlidersHorizontal size={16} />
          <h2 className="recipe-title" id="recipe-title">
            Generation Recipe
          </h2>
        </div>
        <button
          className="recipe-toggle"
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? "Hide" : "Advanced"}
          <CaretDown
            size={14}
            style={{ transform: isOpen ? "rotate(180deg)" : undefined }}
            aria-hidden="true"
          />
        </button>
      </div>

      {isOpen ? (
        <div className="recipe-body">
          <div className="recipe-summary">
            <div className="recipe-card">
              <span className="tiny-label">Strategy</span>
              <span className="recipe-value">{recipe.strategy}</span>
            </div>
            <div className="recipe-card">
              <span className="tiny-label">Composition</span>
              <span className="recipe-value">{recipe.composition}</span>
            </div>
            <div className="recipe-card">
              <span className="tiny-label">Style</span>
              <span className="recipe-value">{recipe.style}</span>
            </div>
            <div className="recipe-card">
              <span className="tiny-label">Audience</span>
              <span className="recipe-value">{recipe.audience}</span>
            </div>
          </div>
          <div className="recipe-header">
            <span className="tiny-label" style={{ margin: 0 }}>
              Compiled prompt · sent to the provider
            </span>
            <button className="copy-button" type="button" onClick={copyPrompt}>
              {copied ? <CheckCircle size={13} weight="fill" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy prompt"}
            </button>
          </div>
          <pre className="prompt-code">{recipe.prompt}</pre>
        </div>
      ) : null}
    </section>
  );
}
