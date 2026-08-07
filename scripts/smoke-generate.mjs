const endpoint = process.env.THUMBLAB_API_URL ?? "http://localhost:3000/api/generate";

const payload = {
  videoTitle: "I built an AI agent for my startup",
  videoDescription:
    "A practical walkthrough showing how a small team uses an AI assistant to automate repetitive support and operations tasks.",
  headline: "MY AI CEO",
  audience: "founders",
  visualStyle: "tech",
  emotion: "curiosity",
  subjectPlacement: "auto",
  headlinePosition: "left",
  accentColor: "#d7ff4f",
  strategy: "clarity",
};

async function run() {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }

    if (!response.ok) {
      console.error(`[thumblab smoke] HTTP ${response.status}`);
      if (body?.error?.code) {
        console.error(`[thumblab smoke] ${body.error.code}: ${body.error.message}`);
      } else {
        console.error(`[thumblab smoke] ${text.slice(0, 400)}`);
      }
      process.exitCode = 1;
      return;
    }

    if (typeof body?.image !== "string" || !body.image.startsWith("data:image/png;base64,")) {
      console.error("[thumblab smoke] Unexpected success response format");
      process.exitCode = 1;
      return;
    }

    const strategy = body.strategy || "n/a";
    const size = body.size || "unknown";
    const byteLength = Math.floor((body.image.length - "data:image/png;base64,".length) * 0.75);
    console.log(
      `[thumblab smoke] success: strategy=${strategy} size=${size} imageBytes≈${byteLength}`,
    );
    process.exitCode = 0;
  } catch (error) {
    console.error(`[thumblab smoke] request failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

run();
