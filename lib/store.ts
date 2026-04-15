import { createClient } from "redis";
import { createInitialState } from "@/lib/seed-data";
import {
  ClearReportPayload,
  CreateDatePayload,
  ReportUpdatePayload,
  ScareAppState,
  WishlistUpdatePayload,
} from "@/lib/types";

const STORE_KEY = "the-scare-report:state";

const DATE_CLEANUPS: Record<
  string,
  {
    title: string;
    activities: Array<{ name: string; venue: string }>;
  }
> = {
  "bowlero-bww-crumbl": {
    title: "Bowlero + Buffalo Wild Wings",
    activities: [
      { name: "Bowling", venue: "Bowlero" },
      { name: "Wings dinner", venue: "Buffalo Wild Wings" },
    ],
  },
  "central-park-cafe-apartment": {
    title: "Central Park + Cafe",
    activities: [
      { name: "Park walk", venue: "Central Park" },
      { name: "Cafe stop", venue: "Cafe" },
    ],
  },
};

function canUseRedis() {
  return Boolean(process.env.REDIS_URL);
}

let memoryState: ScareAppState | null = null;
type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let redisClientPromise: Promise<RedisClient> | null = null;

async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error("Missing REDIS_URL.");
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      const client = createClient({
        url: process.env.REDIS_URL,
      });

      client.on("error", (error: unknown) => {
        console.error("Redis client error", error);
      });

      await client.connect();
      redisClient = client;
      return client;
    })();
  }

  return redisClientPromise;
}

function normalizeStoredDates(state: ScareAppState) {
  let changed = false;

  const dates = state.dates.map((date) => {
    const cleanup = DATE_CLEANUPS[date.date_id];
    if (!cleanup) {
      return date;
    }

    const sameTitle = date.title === cleanup.title;
    const sameActivities =
      date.activities.length === cleanup.activities.length &&
      date.activities.every(
        (activity, index) =>
          activity.name === cleanup.activities[index]?.name &&
          activity.venue === cleanup.activities[index]?.venue,
      );

    if (sameTitle && sameActivities) {
      return date;
    }

    changed = true;
    return {
      ...date,
      title: cleanup.title,
      activities: cleanup.activities.map((activity, index) => ({
        id: index + 1,
        name: activity.name,
        venue: activity.venue,
      })),
    };
  });

  return {
    changed,
    state: changed ? { ...state, dates } : state,
  };
}

export async function getState(): Promise<ScareAppState> {
  if (canUseRedis()) {
    const client = await getRedisClient();
    const rawState = await client.get(STORE_KEY);
    const state = rawState ? (JSON.parse(rawState) as ScareAppState) : null;
    if (state) {
      const normalized = normalizeStoredDates(state);
      if (normalized.changed) {
        await client.set(STORE_KEY, JSON.stringify(normalized.state));
      }
      return normalized.state;
    }
    const seeded = createInitialState();
    await client.set(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  if (!memoryState) {
    memoryState = createInitialState();
  }
  const normalized = normalizeStoredDates(memoryState);
  memoryState = normalized.state;
  return memoryState;
}

async function saveState(state: ScareAppState) {
  const nextState = {
    ...state,
    lastUpdated: new Date().toISOString(),
  };

  if (canUseRedis()) {
    const client = await getRedisClient();
    await client.set(STORE_KEY, JSON.stringify(nextState));
  } else {
    memoryState = nextState;
  }

  return nextState;
}

function slugifyDateTitle(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${base || "date"}-${Date.now().toString(36)}`;
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

export async function clearReport(payload: ClearReportPayload) {
  const state = await getState();
  const nextDates = state.dates.map((date) =>
    date.date_id === payload.dateId
      ? {
          ...date,
          feedback: {
            ...date.feedback,
            [payload.user]: {
              activity_scores: [],
              venue_scores: [],
              notes: "",
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

export async function createDate(payload: CreateDatePayload) {
  const state = await getState();
  const nextDate = {
    date_id: slugifyDateTitle(payload.title),
    title: payload.title,
    activities: payload.activities.map((activity, index) => ({
      id: index + 1,
      name: activity.name,
      venue: activity.venue,
    })),
    feedback: {
      Victor: { activity_scores: [], venue_scores: [], notes: "" },
      Gianna: { activity_scores: [], venue_scores: [], notes: "" },
    },
  };

  return saveState({
    ...state,
    dates: [nextDate, ...state.dates],
  });
}
