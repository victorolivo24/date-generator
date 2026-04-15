"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import clsx from "clsx";
import {
  CreateDatePayload,
  FinalExamResponse,
  ReportUpdatePayload,
  ScareAppState,
  UserName,
  USERS,
  WishlistUpdatePayload,
} from "@/lib/types";
import { getAverage, getVisibleWishlist, isDatePending } from "@/lib/utils";

type FinalExamForm = {
  location: string;
  weather: string;
  day: string;
};

type NewDateForm = {
  title: string;
  activities: CreateDatePayload["activities"];
};

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
  saving,
}: {
  date: ScareAppState["dates"][number];
  currentUser: UserName;
  onSave: (payload: ReportUpdatePayload) => void;
  saving: boolean;
}) {
  const existingFeedback = date.feedback[currentUser];
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
  }, [date, existingFeedback.activity_scores, existingFeedback.notes, existingFeedback.venue_scores]);

  const victorDone =
    date.feedback.Victor.activity_scores.length > 0 &&
    date.feedback.Victor.venue_scores.length > 0;
  const giannaDone =
    date.feedback.Gianna.activity_scores.length > 0 &&
    date.feedback.Gianna.venue_scores.length > 0;

  return (
    <article className="campus-card campus-stripes rounded-[28px] p-5 shadow-varsity">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-bebas)] text-sm uppercase tracking-[0.42em] text-mu-green">
            Pending Feedback Queue
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
          File a Scare Report
        </span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder="What hit, what flopped, what should the scare coaches remember?"
          className="w-full rounded-3xl border border-white/10 bg-[#082640]/75 px-4 py-3 text-sm text-mu-cream outline-none transition focus:border-mu-purple"
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-white/70">
          Your averages: vibe {getAverage(activityScores)?.toFixed(1) ?? "n/a"} / venue{" "}
          {getAverage(venueScores)?.toFixed(1) ?? "n/a"}
        </div>
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
          {saving ? "Filing..." : "Submit Report"}
        </button>
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
  });
  const [finalExamResult, setFinalExamResult] = useState<FinalExamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const pendingDates = state?.dates.filter(isDatePending) ?? [];
  const reviewedDates = state?.dates.filter((date) => !isDatePending(date)) ?? [];

  const pushUpdate = (body: Record<string, unknown>) => {
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
    pushUpdate({
      type: "report",
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
          focusUser: currentUser,
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

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="campus-card relative overflow-hidden rounded-[36px] border border-white/15 px-5 py-7 shadow-varsity sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(147,112,219,0.32),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(139,191,63,0.22),transparent_28%)]" />
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

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-green">
                    Scare Reports
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-graduate)] text-3xl text-mu-cream">
                    Pending feedback
                  </h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  {pendingDates.length} in queue
                </div>
              </div>

              {pendingDates.length ? (
                pendingDates.map((date) => (
                  <DateCard
                    key={date.date_id}
                    date={date}
                    currentUser={currentUser}
                    onSave={saveReport}
                    saving={isPending}
                  />
                ))
              ) : (
                <div className="campus-card rounded-[28px] p-6 text-white/75">
                  Every current date has both scare reports filed.
                </div>
              )}
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
                  <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-green">
                    Recommendation
                  </p>
                  <p className="mt-3 text-base leading-7 text-mu-cream">
                    {finalExamResult.recommendation}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-white/70">
                    {finalExamResult.rationale}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="campus-card rounded-[30px] p-5 sm:p-6">
              <p className="font-[family-name:var(--font-bebas)] text-xs uppercase tracking-[0.35em] text-mu-green">
                Archived Reports
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-graduate)] text-3xl text-mu-cream">
                Completed dates
              </h2>
              <div className="mt-5 space-y-3">
                {reviewedDates.length ? (
                  reviewedDates.map((date) => (
                    <div
                      key={date.date_id}
                      className="rounded-[24px] border border-white/10 bg-[#082640]/70 p-4"
                    >
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
    </main>
  );
}
