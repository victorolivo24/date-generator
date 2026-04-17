"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import {
  ClearReportPayload,
  CreateDatePayload,
  FinalExamResponse,
  ReportUpdatePayload,
  ScareAppState,
  UserName,
  USERS,
} from "@/lib/types";
import { getAverage, getVisibleWishlist, isDatePending } from "@/lib/utils";

type FinalExamForm = {
  location: string;
  weather: string;
  day: string;
  additionalCriteria: string;
};

type NewDateForm = {
  title: string;
  activities: CreateDatePayload["activities"];
};

function hasUserReviewedDate(date: ScareAppState["dates"][number], user: UserName) {
  return (
    date.feedback[user].activity_scores.length > 0 &&
    date.feedback[user].venue_scores.length > 0
  );
}

function StatusPill({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={clsx(
        "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em]",
        active
          ? "border-mu-green bg-mu-green/20 text-mu-cream"
          : "border-white/15 bg-white/5 text-white/65",
      )}
    >
      {label}
    </span>
  );
}

function SliderField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/70">
        <span>{label}</span>
        <span className="rounded-full bg-mu-purple/25 px-2 py-1 text-mu-cream">{value}/16</span>
      </div>
      <input
        type="range"
        min="1"
        max="16"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#8BBF3F]"
      />
    </label>
  );
}

function DateCard({
  date,
  currentUser,
  onSave,
  onClear,
  saving,
  queueLabel,
}: {
  date: ScareAppState["dates"][number];
  currentUser: UserName;
  onSave: (payload: ReportUpdatePayload) => void;
  onClear: (payload: ClearReportPayload) => void;
  saving: boolean;
  queueLabel?: string;
}) {
  const existingFeedback = date.feedback[currentUser];
  const hasExistingReport = hasUserReviewedDate(date, currentUser);
  const feedbackKey = JSON.stringify(existingFeedback);
  const [activityScores, setActivityScores] = useState<number[]>(
    existingFeedback.activity_scores.length
      ? existingFeedback.activity_scores
      : date.activities.map(() => 8),
  );
  const [venueScores, setVenueScores] = useState<number[]>(
    existingFeedback.venue_scores.length
      ? existingFeedback.venue_scores
      : date.activities.map(() => 8),
  );
  const [notes, setNotes] = useState(existingFeedback.notes);

  useEffect(() => {
    setActivityScores(
      existingFeedback.activity_scores.length
        ? existingFeedback.activity_scores
        : date.activities.map(() => 8),
    );
    setVenueScores(
      existingFeedback.venue_scores.length
        ? existingFeedback.venue_scores
        : date.activities.map(() => 8),
    );
    setNotes(existingFeedback.notes);
  }, [date.date_id, date.activities.length, feedbackKey]);

  const victorDone = hasUserReviewedDate(date, "Victor");
  const giannaDone = hasUserReviewedDate(date, "Gianna");

  return (
    <article className="campus-card campus-stripes rounded-[28px] p-5 shadow-varsity">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-bebas)] text-sm uppercase tracking-[0.42em] text-mu-green">
            {queueLabel ?? "Scare Report"}
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-graduate)] text-2xl text-mu-cream">
            {date.title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill label="Victor Filed" active={victorDone} />
          <StatusPill label="Gianna Filed" active={giannaDone} />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {date.activities.map((activity, index) => (
          <div
            key={activity.id}
            className="rounded-3xl border border-white/10 bg-[#0b3153]/70 p-4"
          >
            <div className="mb-4">
              <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.32em] text-mu-purple">
                Scare Segment {index + 1}
              </p>
              <h4 className="mt-1 text-lg font-semibold text-mu-cream">{activity.name}</h4>
              <p className="text-sm text-white/70">{activity.venue}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <SliderField
                label="The Vibe / Activity Style"
                value={activityScores[index] ?? 8}
                onChange={(value) =>
                  setActivityScores((current) =>
                    current.map((score, scoreIndex) =>
                      scoreIndex === index ? value : score,
                    ),
                  )
                }
              />
              <SliderField
                label="The Specific Venue"
                value={venueScores[index] ?? 8}
                onChange={(value) =>
                  setVenueScores((current) =>
                    current.map((score, scoreIndex) =>
                      scoreIndex === index ? value : score,
                    ),
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      <label className="mt-5 block space-y-2">
        <span className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.3em] text-white/75">
          Additional feedback
        </span>
        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Optional</p>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder="Optional: what hit, what flopped, what should the scare coaches remember?"
          className="w-full rounded-3xl border border-white/10 bg-[#082640]/75 px-4 py-3 text-sm text-mu-cream outline-none transition focus:border-mu-purple"
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-white/70">
          Your averages: vibe {getAverage(activityScores)?.toFixed(1) ?? "n/a"} / venue{" "}
          {getAverage(venueScores)?.toFixed(1) ?? "n/a"}
        </div>
        <div className="flex flex-wrap gap-3">
          {hasExistingReport ? (
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                onClear({
                  user: currentUser,
                  dateId: date.date_id,
                })
              }
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.16em] text-mu-cream transition hover:border-red-300/60 hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Undo Report
            </button>
          ) : null}
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              onSave({
                user: currentUser,
                dateId: date.date_id,
                activity_scores: activityScores,
                venue_scores: venueScores,
                notes,
              })
            }
            className="rounded-full border border-mu-green bg-mu-green px-5 py-3 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.16em] text-mu-navy transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Filing..." : hasExistingReport ? "Update Report" : "Submit Report"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ScareReportApp() {
  const [currentUser, setCurrentUser] = useState<UserName | null>(null);
  const [state, setState] = useState<ScareAppState | null>(null);
  const [wishlistDraft, setWishlistDraft] = useState("");
  const [wishlistDirty, setWishlistDirty] = useState(false);
  const [newDateForm, setNewDateForm] = useState<NewDateForm>({
    title: "",
    activities: [{ name: "", venue: "" }],
  });
  const [finalExamForm, setFinalExamForm] = useState<FinalExamForm>({
    location: "",
    weather: "",
    day: "",
    additionalCriteria: "",
  });
  const [finalExamResult, setFinalExamResult] = useState<FinalExamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [musicMessage, setMusicMessage] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [reviewQueueOpen, setReviewQueueOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadState = async () => {
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load scare reports.");
        }
        const data = (await response.json()) as ScareAppState;
        setState(data);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error ? fetchError.message : "Failed to load scare reports.",
        );
      }
    };

    void loadState();
    const intervalId = window.setInterval(() => {
      void loadState();
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (state && currentUser && !wishlistDirty) {
      setWishlistDraft(getVisibleWishlist(currentUser, state.wishlist));
    }
  }, [currentUser, state, wishlistDirty]);

  useEffect(() => {
    setWishlistDirty(false);
  }, [currentUser]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const pendingDates = state?.dates.filter(isDatePending) ?? [];
  const reviewedDates = state?.dates.filter((date) => !isDatePending(date)) ?? [];
  const currentUserPendingDates =
    state && currentUser
      ? state.dates.filter((date) => !hasUserReviewedDate(date, currentUser))
      : [];
  const activeReviewDate = currentUserPendingDates[reviewIndex] ?? null;

  useEffect(() => {
    if (!currentUserPendingDates.length) {
      setReviewQueueOpen(false);
      setReviewIndex(0);
      return;
    }

    if (reviewIndex > currentUserPendingDates.length - 1) {
      setReviewIndex(currentUserPendingDates.length - 1);
    }
  }, [currentUserPendingDates.length, reviewIndex]);

  const pushUpdate = (
    body: Record<string, unknown>,
    onSuccess?: (nextState: ScareAppState) => void,
  ) => {
    startTransition(async () => {
      setError(null);
      setFinalExamResult(null);
      const response = await fetch("/api/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Request failed." }));
        setError(payload.error ?? "Request failed.");
        return;
      }

      const nextState = (await response.json()) as ScareAppState;
      setState(nextState);
      if (body.type === "wishlist") {
        setWishlistDirty(false);
      }
      onSuccess?.(nextState);
    });
  };

  const saveWishlist = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }
    pushUpdate({
      type: "wishlist",
      user: currentUser,
      text: wishlistDraft,
    });
  };

  const saveReport = (payload: ReportUpdatePayload) => {
    const currentQueue = currentUserPendingDates;
    const currentDateId = payload.dateId;

    pushUpdate(
      {
        type: "report",
        ...payload,
      },
      () => {
        if (!reviewQueueOpen) {
          return;
        }

        const remainingQueue = currentQueue.filter((date) => date.date_id !== currentDateId);
        if (!remainingQueue.length) {
          setReviewQueueOpen(false);
          setReviewIndex(0);
          return;
        }

        setReviewIndex((current) => Math.min(current, remainingQueue.length - 1));
      },
    );
  };

  const clearExistingReport = (payload: ClearReportPayload) => {
    pushUpdate({
      type: "clear-report",
      ...payload,
    });
  };

  const saveNewDate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newDateForm.title.trim();
    const activities = newDateForm.activities
      .map((activity) => ({
        name: activity.name.trim(),
        venue: activity.venue.trim(),
      }))
      .filter((activity) => activity.name && activity.venue);

    if (!title || !activities.length) {
      setError("Add a title and at least one activity with a venue.");
      return;
    }

    pushUpdate({
      type: "create-date",
      title,
      activities,
    });
    setNewDateForm({
      title: "",
      activities: [{ name: "", venue: "" }],
    });
  };

  const runFinalExam = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...finalExamForm,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Final Exam failed." }));
        setError(payload.error ?? "Final Exam failed.");
        return;
      }

      const result = (await response.json()) as FinalExamResponse;
      setFinalExamResult(result);
    });
  };

  const toggleThemeMusic = async () => {
    setMusicMessage(null);

    if (!audioRef.current) {
      const audio = new Audio("/mu-theme.mp3");
      audioRef.current = audio;
      audio.addEventListener("ended", () => setIsMusicPlaying(false));
      audio.addEventListener("error", () => {
        setIsMusicPlaying(false);
        setMusicMessage("Add public/mu-theme.mp3 to enable the music button.");
      });
    }

    if (!audioRef.current) {
      return;
    }

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsMusicPlaying(true);
    } catch {
      setIsMusicPlaying(false);
      setMusicMessage("Add public/mu-theme.mp3 to enable the music button.");
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="campus-card mu-hero relative overflow-hidden rounded-[36px] border border-white/15 px-5 py-7 shadow-varsity sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(147,112,219,0.32),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(139,191,63,0.22),transparent_28%)]" />
        <div className="absolute -left-8 top-8 hidden h-32 w-32 rounded-full border border-white/10 bg-mu-green/15 blur-sm md:block" />
        <div className="absolute right-6 top-6 hidden rotate-12 rounded-full border border-white/10 bg-mu-purple/20 px-4 py-2 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.25em] text-white/80 md:block">
          OK
        </div>
        <div className="relative">
          <p className="font-[family-name:var(--font-bebas)] text-sm uppercase tracking-[0.5em] text-mu-green">
            Monsters University Date Lab
          </p>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-stroke font-[family-name:var(--font-graduate)] text-4xl leading-tight text-mu-cream sm:text-5xl">
                The Scare Report
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                File feedback on each date, keep private scare aspirations hidden from the
                other person, and let the Final Exam generate the next move using all your
                shared history.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {USERS.map((user) => (
                <button
                  key={user}
                  type="button"
                  onClick={() => setCurrentUser(user)}
                  className={clsx(
                    "rounded-[28px] border px-8 py-6 text-left transition",
                    "hover:-translate-y-0.5 hover:border-white/35",
                    currentUser === user
                      ? "border-mu-green bg-mu-green/15 shadow-varsity"
                      : "border-white/10 bg-[#082640]/70",
                  )}
                >
                  <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.4em] text-white/65">
                    Open Locker
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-graduate)] text-3xl text-mu-cream">
                    {user}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void toggleThemeMusic()}
              className="rounded-full border border-mu-purple bg-mu-purple/85 px-5 py-3 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.18em] text-white transition hover:brightness-110"
            >
              {isMusicPlaying ? "Pause Theme Music" : "Play Theme Music"}
            </button>
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setReviewIndex(0);
                  setReviewQueueOpen(true);
                }}
                disabled={!currentUserPendingDates.length}
                className="rounded-full border border-mu-green bg-mu-green px-5 py-3 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.18em] text-mu-navy transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {currentUserPendingDates.length} Unreviewed Dates
              </button>
            ) : null}
            {musicMessage ? (
              <div className="text-xs uppercase tracking-[0.18em] text-white/65">
                {musicMessage}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-3xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {!state ? (
        <div className="mt-6 rounded-[28px] border border-white/10 bg-[#082640]/70 p-6 text-white/75">
          Loading the scare archives...
        </div>
      ) : null}

      {state && currentUser ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="campus-card rounded-[30px] p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-purple">
                    Review Queue
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-graduate)] text-3xl text-mu-cream">
                    One date at a time
                  </h2>
                </div>
                <p className="max-w-md text-sm text-white/70">
                  Open the queue when you are ready. After each submitted report, the next
                  unreviewed date loads automatically.
                </p>
              </div>
              <div className="mt-5 rounded-[26px] border border-white/10 bg-[#082640]/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.32em] text-mu-green">
                      {currentUser}&apos;s queue
                    </p>
                    <p className="mt-2 text-sm text-white/72">
                      {currentUserPendingDates.length
                        ? `${currentUserPendingDates.length} dates still need your review.`
                        : "You are fully caught up."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewIndex(0);
                      setReviewQueueOpen(true);
                    }}
                    disabled={!currentUserPendingDates.length}
                    className="rounded-full border border-mu-green bg-mu-green px-5 py-3 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.16em] text-mu-navy transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {currentUserPendingDates.length} Unreviewed Dates
                  </button>
                </div>
              </div>
            </section>

            <section className="campus-card rounded-[30px] p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-purple">
                    The Lobby
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-graduate)] text-3xl text-mu-cream">
                    {currentUser}&apos;s station
                  </h2>
                </div>
                <p className="max-w-md text-sm text-white/70">
                  Your Secret Scare Aspirations stay hidden in the UI from the other user,
                  but the Final Exam can use them to surprise both of you.
                </p>
              </div>

              <form onSubmit={saveWishlist} className="mt-5 space-y-3">
                <label className="block space-y-2">
                  <span className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.34em] text-mu-green">
                    Secret Scare Aspirations
                  </span>
                  <textarea
                    value={wishlistDraft}
                    onChange={(event) => {
                      setWishlistDirty(true);
                      setWishlistDraft(event.target.value);
                    }}
                    rows={5}
                    placeholder="Hidden wishlist ideas for surprise dates, tiny obsessions, dream spots, chaotic little plans..."
                    className="w-full rounded-[26px] border border-white/10 bg-[#082640]/75 px-4 py-4 text-sm text-mu-cream outline-none transition focus:border-mu-green"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.16em] text-mu-cream transition hover:border-mu-purple hover:bg-mu-purple/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Seal Aspirations"}
                </button>
              </form>
            </section>

            <section className="campus-card rounded-[30px] p-5 sm:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-purple">
                    New Assignment
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-graduate)] text-3xl text-mu-cream">
                    Add a new date
                  </h2>
                </div>
                <p className="max-w-md text-sm text-white/70">
                  Create a fresh date idea with one or more activity and venue pairs. It
                  will appear immediately in the pending feedback queue for both people.
                </p>
              </div>

              <form onSubmit={saveNewDate} className="mt-5 space-y-4">
                <label className="block space-y-2">
                  <span className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.34em] text-mu-green">
                    Date title
                  </span>
                  <input
                    value={newDateForm.title}
                    onChange={(event) =>
                      setNewDateForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Sushi + Bookstore + Sunset Walk"
                    className="w-full rounded-[22px] border border-white/10 bg-[#082640]/75 px-4 py-3 text-sm text-mu-cream outline-none transition focus:border-mu-green"
                  />
                </label>

                <div className="space-y-3">
                  {newDateForm.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="rounded-[24px] border border-white/10 bg-[#082640]/70 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.3em] text-mu-purple">
                          Stop {index + 1}
                        </p>
                        {newDateForm.activities.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setNewDateForm((current) => ({
                                ...current,
                                activities: current.activities.filter(
                                  (_, activityIndex) => activityIndex !== index,
                                ),
                              }))
                            }
                            className="text-xs uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <input
                          value={activity.name}
                          onChange={(event) =>
                            setNewDateForm((current) => ({
                              ...current,
                              activities: current.activities.map((item, activityIndex) =>
                                activityIndex === index
                                  ? { ...item, name: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                          placeholder="Activity name"
                          className="w-full rounded-[18px] border border-white/10 bg-[#0b3153]/75 px-4 py-3 text-sm text-mu-cream outline-none transition focus:border-mu-green"
                        />
                        <input
                          value={activity.venue}
                          onChange={(event) =>
                            setNewDateForm((current) => ({
                              ...current,
                              activities: current.activities.map((item, activityIndex) =>
                                activityIndex === index
                                  ? { ...item, venue: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                          placeholder="Venue / location"
                          className="w-full rounded-[18px] border border-white/10 bg-[#0b3153]/75 px-4 py-3 text-sm text-mu-cream outline-none transition focus:border-mu-green"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setNewDateForm((current) => ({
                        ...current,
                        activities: [...current.activities, { name: "", venue: "" }],
                      }))
                    }
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-3 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.16em] text-mu-cream transition hover:border-mu-purple hover:bg-mu-purple/20"
                  >
                    Add Stop
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full border border-mu-green bg-mu-green px-5 py-3 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.16em] text-mu-navy transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Submitting..." : "Create Date"}
                  </button>
                </div>
              </form>
            </section>

          </div>

          <div className="space-y-6">
            <section className="campus-card rounded-[30px] p-5 sm:p-6">
              <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-purple">
                The Final Exam
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-graduate)] text-3xl text-mu-cream">
                Generate the next date
              </h2>
              <form onSubmit={runFinalExam} className="mt-5 space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-white/70">Location</span>
                  <input
                    value={finalExamForm.location}
                    onChange={(event) =>
                      setFinalExamForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    placeholder="NYC, Hoboken, Yonkers..."
                    className="w-full rounded-2xl border border-white/10 bg-[#082640]/75 px-4 py-3 text-sm text-mu-cream outline-none transition focus:border-mu-green"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-white/70">Weather</span>
                  <input
                    value={finalExamForm.weather}
                    onChange={(event) =>
                      setFinalExamForm((current) => ({
                        ...current,
                        weather: event.target.value,
                      }))
                    }
                    placeholder="Rainy and cold, sunny, humid..."
                    className="w-full rounded-2xl border border-white/10 bg-[#082640]/75 px-4 py-3 text-sm text-mu-cream outline-none transition focus:border-mu-green"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-white/70">Day</span>
                  <input
                    value={finalExamForm.day}
                    onChange={(event) =>
                      setFinalExamForm((current) => ({
                        ...current,
                        day: event.target.value,
                      }))
                    }
                    placeholder="Friday night, Sunday afternoon..."
                    className="w-full rounded-2xl border border-white/10 bg-[#082640]/75 px-4 py-3 text-sm text-mu-cream outline-none transition focus:border-mu-green"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-white/70">
                    Additional Criteria
                  </span>
                  <textarea
                    value={finalExamForm.additionalCriteria}
                    onChange={(event) =>
                      setFinalExamForm((current) => ({
                        ...current,
                        additionalCriteria: event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Optional: we want to be outside, this is a double date, keep it low-key, near a train, under a budget..."
                    className="w-full rounded-2xl border border-white/10 bg-[#082640]/75 px-4 py-3 text-sm text-mu-cream outline-none transition focus:border-mu-green"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-full border border-mu-purple bg-mu-purple px-5 py-3 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.18em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Consulting..." : "Run Final Exam"}
                </button>
              </form>

              {finalExamResult ? (
                <div className="mt-5 rounded-[26px] border border-white/10 bg-[#082640]/75 p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-green">
                        Style Recommendation
                      </p>
                      <p className="mt-3 text-base leading-7 text-mu-cream">
                        {finalExamResult.styleRecommendation}
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-purple">
                        Specific Place
                      </p>
                      <p className="mt-3 text-base leading-7 text-mu-cream">
                        {finalExamResult.placeRecommendation}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-white/70">
                    Rationale
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    {finalExamResult.rationale}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="campus-card rounded-[30px] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-green">
                    Archived Reports
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-graduate)] text-3xl text-mu-cream">
                    Completed dates
                  </h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  {pendingDates.length} still pending overall
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {reviewedDates.length ? (
                  reviewedDates.map((date) => (
                    <div
                      key={date.date_id}
                      className="rounded-[24px] border border-white/10 bg-[#082640]/70 p-4"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-lg font-semibold text-mu-cream">{date.title}</h3>
                          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-white/65">
                            <span>
                              Victor {getAverage(date.feedback.Victor.activity_scores)?.toFixed(1) ?? "n/a"}
                              /{getAverage(date.feedback.Victor.venue_scores)?.toFixed(1) ?? "n/a"}
                            </span>
                            <span>
                              Gianna {getAverage(date.feedback.Gianna.activity_scores)?.toFixed(1) ?? "n/a"}
                              /{getAverage(date.feedback.Gianna.venue_scores)?.toFixed(1) ?? "n/a"}
                            </span>
                          </div>
                        </div>
                        {hasUserReviewedDate(date, currentUser) ? (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                clearExistingReport({
                                  user: currentUser,
                                  dateId: date.date_id,
                                })
                              }
                              disabled={isPending}
                              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-[family-name:var(--font-bebas)] text-base uppercase tracking-[0.14em] text-mu-cream transition hover:border-red-300/60 hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Undo My Report
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-[#082640]/70 p-4 text-sm text-white/70">
                    Completed dates will move here after both people submit their scare reports.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {reviewQueueOpen && activeReviewDate && currentUser ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#031523]/80 p-4 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full w-full max-w-4xl items-start justify-center py-4">
            <div className="w-full">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-green">
                  Review Queue
                </p>
                <p className="mt-2 text-sm text-white/72">
                  {reviewIndex + 1} of {currentUserPendingDates.length}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setReviewIndex((current) => Math.max(current - 1, 0))}
                  disabled={reviewIndex === 0}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-[family-name:var(--font-bebas)] text-base uppercase tracking-[0.14em] text-mu-cream transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReviewIndex((current) =>
                      Math.min(current + 1, currentUserPendingDates.length - 1),
                    )
                  }
                  disabled={reviewIndex >= currentUserPendingDates.length - 1}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-[family-name:var(--font-bebas)] text-base uppercase tracking-[0.14em] text-mu-cream transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setReviewQueueOpen(false)}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-[family-name:var(--font-bebas)] text-base uppercase tracking-[0.14em] text-mu-cream transition hover:border-mu-purple hover:bg-mu-purple/20"
                >
                  Close
                </button>
              </div>
            </div>
              <div className="max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                <DateCard
                  date={activeReviewDate}
                  currentUser={currentUser}
                  onSave={saveReport}
                  onClear={clearExistingReport}
                  saving={isPending}
                  queueLabel="Now Reviewing"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
