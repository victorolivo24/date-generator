import { NextRequest, NextResponse } from "next/server";
import { isUserName } from "@/lib/seed-data";
import { getState, updateReport, updateWishlist } from "@/lib/store";

export async function GET() {
  const state = await getState();
  return NextResponse.json(state);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.type === "wishlist") {
    if (!isUserName(body.user) || typeof body.text !== "string") {
      return NextResponse.json({ error: "Invalid wishlist payload." }, { status: 400 });
    }
    const state = await updateWishlist({
      user: body.user,
      text: body.text,
    });
    return NextResponse.json(state);
  }

  if (body.type === "report") {
    const isValidScores =
      Array.isArray(body.activity_scores) &&
      Array.isArray(body.venue_scores) &&
      body.activity_scores.every((value: unknown) => Number.isInteger(value)) &&
      body.venue_scores.every((value: unknown) => Number.isInteger(value));

    if (
      !isUserName(body.user) ||
      typeof body.dateId !== "string" ||
      typeof body.notes !== "string" ||
      !isValidScores
    ) {
      return NextResponse.json({ error: "Invalid report payload." }, { status: 400 });
    }

    const state = await updateReport({
      user: body.user,
      dateId: body.dateId,
      activity_scores: body.activity_scores,
      venue_scores: body.venue_scores,
      notes: body.notes,
    });
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: "Unsupported update type." }, { status: 400 });
}
