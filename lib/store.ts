import { kv } from "@vercel/kv";
import { createInitialState } from "@/lib/seed-data";
import {
  ReportUpdatePayload,
  ScareAppState,
  WishlistUpdatePayload,
} from "@/lib/types";

const STORE_KEY = "the-scare-report:state";

function canUseKv() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

let memoryState: ScareAppState | null = null;

export async function getState(): Promise<ScareAppState> {
  if (canUseKv()) {
    const state = await kv.get<ScareAppState>(STORE_KEY);
    if (state) {
      return state;
    }
    const seeded = createInitialState();
    await kv.set(STORE_KEY, seeded);
    return seeded;
  }

  if (!memoryState) {
    memoryState = createInitialState();
  }
  return memoryState;
}

async function saveState(state: ScareAppState) {
  const nextState = {
    ...state,
    lastUpdated: new Date().toISOString(),
  };

  if (canUseKv()) {
    await kv.set(STORE_KEY, nextState);
  } else {
    memoryState = nextState;
  }

  return nextState;
}

export async function updateWishlist(payload: WishlistUpdatePayload) {
  const state = await getState();
  return saveState({
    ...state,
    wishlist: {
      ...state.wishlist,
      [payload.user]: payload.text,
    },
  });
}

export async function updateReport(payload: ReportUpdatePayload) {
  const state = await getState();
  const nextDates = state.dates.map((date) =>
    date.date_id === payload.dateId
      ? {
          ...date,
          feedback: {
            ...date.feedback,
            [payload.user]: {
              activity_scores: payload.activity_scores,
              venue_scores: payload.venue_scores,
              notes: payload.notes,
            },
          },
        }
      : date,
  );

  return saveState({
    ...state,
    dates: nextDates,
  });
}
