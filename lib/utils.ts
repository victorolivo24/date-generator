import { DateIdea, UserName } from "@/lib/types";

export function getAverage(values: number[]) {
  if (!values.length) {
    return null;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

export function isDatePending(date: DateIdea) {
  return !(
    date.feedback.Victor.activity_scores.length &&
    date.feedback.Victor.venue_scores.length &&
    date.feedback.Gianna.activity_scores.length &&
    date.feedback.Gianna.venue_scores.length
  );
}

export function getVisibleWishlist(
  currentUser: UserName,
  wishlist: Record<UserName, string>,
) {
  return wishlist[currentUser];
}
