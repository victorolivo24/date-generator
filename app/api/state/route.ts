import { NextRequest, NextResponse } from "next/server";
import { isUserName } from "@/lib/seed-data";
import { createDate, getState, updateReport, updateWishlist } from "@/lib/store";

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

  if (body.type === "create-date") {
    const validActivities =
      Array.isArray(body.activities) &&
      body.activities.length > 0 &&
      body.activities.every(
        (activity: unknown) =>
          typeof activity === "object" &&
          activity !== null &&
          typeof (activity as { name?: unknown }).name === "string" &&
          typeof (activity as { venue?: unknown }).venue === "string" &&
          (activity as { name: string }).name.trim().length > 0 &&
          (activity as { venue: string }).venue.trim().length > 0,
      );

    if (typeof body.title !== "string" || !body.title.trim() || !validActivities) {
      return NextResponse.json({ error: "Invalid new date payload." }, { status: 400 });
    }

    const state = await createDate({
      title: body.title.trim(),
      activities: body.activities.map((activity: { name: string; venue: string }) => ({
        name: activity.name.trim(),
        venue: activity.venue.trim(),
      })),
    });
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: "Unsupported update type." }, { status: 400 });
}
