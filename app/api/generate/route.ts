import OpenAI from "openai";
import { NextResponse } from "next/server";

import { buildThumbnailPrompt } from "@/lib/prompt-builder";
import { parseGenerationRequest } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 120;

const IMAGE_SIZE = "1280x720";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function providerError(error: unknown) {
  const record = isRecord(error) ? error : {};
  const code = readString(record.code);
  const name = readString(record.name);
  const status = readNumber(record.status);
  const requestId = readString(record.request_id);

  if (requestId) {
    console.error("ThumbLab image provider request failed", {
      requestId,
      code,
      status,
    });
  } else {
    console.error("ThumbLab image provider request failed", { code, name, status });
  }

  if (code === "moderation_blocked") {
    return {
      status: 422,
      code: "moderation_blocked",
      message:
        "The provider blocked this visual request. Try a neutral description without sensitive or targeting language.",
    };
  }

  if (status === 401 || status === 403) {
    return {
      status: 502,
      code: "provider_configuration",
      message:
        "The image provider rejected the server configuration. Check the API key and project access.",
    };
  }

  if (status === 429) {
    return {
      status: 429,
      code: "rate_limit",
      message:
        "The image provider is rate-limiting requests. Wait a moment and retry this variant.",
    };
  }

  if (status === 408 || status === 504) {
    return {
      status: 504,
      code: "provider_timeout",
      message: "Image generation took too long. Retry this variant when the provider is ready.",
    };
  }

  if (name === "TimeoutError" || name === "AbortError") {
    return {
      status: 504,
      code: "provider_timeout",
      message: "Image generation took too long. Retry this variant when the provider is ready.",
    };
  }

  if (status === 400) {
    return {
      status: 422,
      code: "provider_rejected",
      message: "The provider rejected this visual request. Try simplifying the video description.",
    };
  }

  return {
    status: 502,
    code: "provider_failure",
    message: "The image provider could not complete this request. Retry the variant.",
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid_json",
          message: "Send a valid JSON creator brief.",
        },
      },
      { status: 400 },
    );
  }

  const parsed = parseGenerationRequest(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Complete the creator brief before generating.",
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: {
          code: "missing_configuration",
          message:
            "Image generation is not configured. Add OPENAI_API_KEY to the server environment and restart the app.",
        },
      },
      { status: 503 },
    );
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = buildThumbnailPrompt(parsed.data, parsed.data.strategy, parsed.data.refinement);

  try {
    const result = await client.images.generate(
      {
        model: "gpt-image-2",
        prompt,
        size: IMAGE_SIZE,
        quality: "low",
      },
      { signal: AbortSignal.timeout(120_000) },
    );

    const imageData = result.data?.[0]?.b64_json;
    if (!imageData) {
      return NextResponse.json(
        {
          error: {
            code: "empty_provider_response",
            message: "The image provider returned no image. Retry this variant.",
          },
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      strategy: parsed.data.strategy,
      image: "data:image/png;base64," + imageData,
      model: "gpt-image-2",
      size: IMAGE_SIZE,
    });
  } catch (error) {
    const failure = providerError(error);
    return NextResponse.json(
      { error: { code: failure.code, message: failure.message } },
      {
        status: failure.status,
      },
    );
  }
}
