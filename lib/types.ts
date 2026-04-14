export const USERS = ["Victor", "Gianna"] as const;

export type UserName = (typeof USERS)[number];

export type DateActivity = {
  id: number;
  name: string;
  venue: string;
};

export type UserFeedback = {
  activity_scores: number[];
  venue_scores: number[];
  notes: string;
};

export type DateFeedback = Record<UserName, UserFeedback>;

export type DateIdea = {
  date_id: string;
  title: string;
  activities: DateActivity[];
  feedback: DateFeedback;
};

export type ScareAppState = {
  dates: DateIdea[];
  wishlist: Record<UserName, string>;
  lastUpdated: string;
};

export type ReportUpdatePayload = {
  user: UserName;
  dateId: string;
  activity_scores: number[];
  venue_scores: number[];
  notes: string;
};

export type WishlistUpdatePayload = {
  user: UserName;
  text: string;
};

export type FinalExamRequest = {
  day: string;
  weather: string;
  location: string;
  focusUser: UserName;
};

export type FinalExamResponse = {
  recommendation: string;
  rationale: string;
  inspiredByWishlist: boolean;
};
