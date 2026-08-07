import type { HeadlinePosition, TypographySettings } from "./types";

export const EXPORT_WIDTH = 1280;
export const EXPORT_HEIGHT = 720;

export function getHeadlineMaxCharacters(fontSize: number) {
  return Math.max(14, Math.round(1200 / fontSize));
}

export function wrapHeadline(text: string, maxCharacters = 18) {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return [];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > maxCharacters) {
      if (current) {
        lines.push(current);
        current = "";
      }

      for (let start = 0; start < word.length; start += maxCharacters) {
        lines.push(word.slice(start, start + maxCharacters));
      }
      continue;
    }

    const candidate = current ? current + " " + word : word;
    if (candidate.length <= maxCharacters) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

export function getHeadlineAnchor(position: HeadlinePosition, width = EXPORT_WIDTH, margin = 72) {
  if (position === "left") {
    return margin;
  }
  if (position === "right") {
    return width - margin;
  }
  return width / 2;
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The generated image could not be loaded for export."));
    image.src = source;
  });
}

export async function composeThumbnailPng(
  source: string,
  typography: TypographySettings,
): Promise<Blob> {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser does not support canvas export.");
  }

  context.drawImage(image, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  const fontSize = typography.size;
  const lines = wrapHeadline(typography.headline, getHeadlineMaxCharacters(fontSize));
  if (lines.length > 0) {
    const lineHeight = Math.round(fontSize * 0.92);
    const totalHeight = lineHeight * lines.length;
    const anchorX = getHeadlineAnchor(typography.position);
    const startY = EXPORT_HEIGHT / 2 - totalHeight / 2 + lineHeight / 2;

    context.font = "900 " + fontSize + "px Manrope, Arial, sans-serif";
    context.textAlign = typography.position;
    context.textBaseline = "middle";
    context.lineJoin = "round";
    context.lineWidth = Math.max(8, Math.round(fontSize * 0.1));
    context.strokeStyle = typography.outline;
    context.fillStyle = typography.fill;

    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      context.strokeText(line, anchorX, y);
      context.fillText(line, anchorX, y);
    });
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("The browser could not create a PNG export."));
      }
    }, "image/png");
  });
}

export async function downloadThumbnail(
  source: string,
  typography: TypographySettings,
  filename: string,
) {
  const blob = await composeThumbnailPng(source, typography);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
