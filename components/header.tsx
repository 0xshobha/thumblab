import { Sparkle } from "@phosphor-icons/react";
import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand-lockup" href="/" aria-label="ThumbLab home">
        <span className="brand-mark" aria-hidden="true">
          <Sparkle size={19} weight="fill" />
        </span>
        <span>
          <span className="brand-name">ThumbLab</span>
          <span className="brand-tagline">One brief. Three testable thumbnails.</span>
        </span>
      </Link>

      <nav className="header-actions" aria-label="Main navigation">
        <a className="header-link" href="#how-it-works">
          How it works
        </a>
        <span className="header-chip">A/B studio</span>
      </nav>
    </header>
  );
}
