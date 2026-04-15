import { NextRequest, NextResponse } from "next/server";
import { getState } from "@/lib/store";
import { FinalExamResponse } from "@/lib/types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function buildPrompt(input: {
  location: string;
  weather: string;
  day: string;
  stateJson: string;
  wishlistsJson: string;
}) {
  return `
You are helping plan one practical date idea for a couple.

Context:
- Couple location: ${input.location}
- Weather: ${input.weather}
- Day: ${input.day}

Rated and pending history JSON:
${input.stateJson}

Secret Scare Aspirations JSON:
${input.wishlistsJson}

Instructions:
- Recommend exactly one date idea tailored to the context above.
- Treat this as a couple-planning problem, not a single-user request.
- Learn from the rated dates JSON to infer shared likes, dislikes, and patterns in what worked or did not work.
- In the rated dates JSON, activity_scores and venue_scores are separate signals:
  - activity_scores measure how much they liked the type/style of the date idea itself
  - venue_scores measure how much they liked the specific location or venue
- Use that distinction carefully. For example, a date may have strong activity scores but weak venue scores, which means the concept worked but the specific place did not.
- It is acceptable to recommend something similar to a past date if the history suggests they genuinely like it.
- Prefer a specific real place or specific nearby places near the provided location instead of a vague generic idea.
- Use the weather and day to make the suggestion realistic and convenient.
- You may use both wishlists as surprise inspiration, but the final idea should still be compatible with both people.
- The UI keeps wishlists private, but you are allowed to use both wishlists here as hidden planning context.
- Return JSON with keys: recommendation, rationale, inspiredByWishlist.
- "recommendation" should be 2-4 practical sentences. Include the specific place name if you choose one.
- "rationale" should briefly connect the choice to weather, day, location, prior date history, and why the idea works for both people.
- "inspiredByWishlist" must be true if any part of the idea was based on the Secret Scare Aspirations.
- If inspiredByWishlist is true, the final sentence of recommendation must be exactly one of:
  P.S. Victor secretly wanted to do this!
  P.S. Gianna secretly wanted to do this!
  P.S. Victor and Gianna secretly wanted to do this!
- If inspiredByWishlist is false, do not mention the secret wishlist.
`.trim();
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (
    typeof body.location !== "string" ||
    typeof body.weather !== "string" ||
    typeof body.day !== "string"
  ) {
    return NextResponse.json({ error: "Invalid Final Exam request." }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY environment variable." },
      { status: 500 },
    );
  }

  const state = await getState();
  const prompt = buildPrompt({
    location: body.location,
    weather: body.weather,
    day: body.day,
    stateJson: JSON.stringify(state.dates, null, 2),
    wishlistsJson: JSON.stringify(state.wishlist, null, 2),
  });

  const geminiResponse = await fetch(
    `${GEMINI_URL}?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text();
    return NextResponse.json(
      { error: `Gemini request failed: ${errorText}` },
      { status: geminiResponse.status },
    );
  }

  const payload = await geminiResponse.json();
  const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    return NextResponse.json({ error: "Gemini returned an empty response." }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(rawText) as FinalExamResponse;
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Gemini returned invalid JSON.", raw: rawText },
      { status: 502 },
    );
  }
}
