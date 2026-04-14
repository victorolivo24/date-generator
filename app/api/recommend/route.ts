import { NextRequest, NextResponse } from "next/server";
import { isUserName } from "@/lib/seed-data";
import { getState } from "@/lib/store";
import { FinalExamResponse } from "@/lib/types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function buildPrompt(input: {
  location: string;
  weather: string;
  day: string;
  focusUser: "Victor" | "Gianna";
  stateJson: string;
  wishlistsJson: string;
}) {
  return `
You are "The Final Exam" inside a Monsters University themed date-planning app called "The Scare Report."

Context:
- Couple location: ${input.location}
- Weather: ${input.weather}
- Day: ${input.day}
- Focus user currently using the app: ${input.focusUser}

Rated and pending history JSON:
${input.stateJson}

Secret Scare Aspirations JSON:
${input.wishlistsJson}

Instructions:
- Recommend exactly one date idea tailored to the context above.
- Learn from the rated dates JSON to avoid boring repetition and to build on strong patterns.
- You may use the wishlist as surprise inspiration.
- The UI keeps wishlists private, but you are allowed to use either wishlist here as hidden planning context.
- Return JSON with keys: recommendation, rationale, inspiredByWishlist.
- "recommendation" should be 2-4 sentences and sound playful, like a MU scare coach.
- "rationale" should briefly connect the choice to weather, day, location, and prior date history.
- "inspiredByWishlist" must be true if any part of the idea was based on the Secret Scare Aspirations.
- If inspiredByWishlist is true, the final sentence of recommendation must be exactly one of:
  P.S. Victor secretly wanted to do this!
  P.S. Gianna secretly wanted to do this!
- If inspiredByWishlist is false, do not mention the secret wishlist.
`.trim();
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (
    !isUserName(body.focusUser) ||
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
    focusUser: body.focusUser,
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
