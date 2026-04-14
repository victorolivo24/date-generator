import { DateIdea, ScareAppState, UserName } from "@/lib/types";

function blankFeedback() {
  return {
    Victor: { activity_scores: [], venue_scores: [], notes: "" },
    Gianna: { activity_scores: [], venue_scores: [], notes: "" },
  } satisfies DateIdea["feedback"];
}

function createDate(
  date_id: string,
  title: string,
  activities: Array<{ name: string; venue: string }>,
) {
  return {
    date_id,
    title,
    activities: activities.map((activity, index) => ({
      id: index + 1,
      name: activity.name,
      venue: activity.venue,
    })),
    feedback: blankFeedback(),
  } satisfies DateIdea;
}

export const initialDates: DateIdea[] = [
  createDate("kamisama-ramen", "Kamisama Ramen", [
    { name: "Ramen date", venue: "Kamisama Ramen" },
  ]),
  createDate("los-tacos-no-1", "Los Tacos No 1 NYC", [
    { name: "Taco run", venue: "Los Tacos No 1 NYC" },
  ]),
  createDate("superbowl-yardhouse", "Superbowl @ Yardhouse Yonkers", [
    { name: "Super Bowl watch party", venue: "Yard House Yonkers" },
  ]),
  createDate(
    "valentines-cuban-kikilu",
    "Valentine's Day: The Cuban (Hoboken) + Kikilu Gelato",
    [
      { name: "Dinner", venue: "The Cuban, Hoboken" },
      { name: "Gelato stop", venue: "Kikilu Gelato" },
    ],
  ),
  createDate("brookfield-pier", "Brookfield Place Mall Pier Walk", [
    { name: "Mall walk", venue: "Brookfield Place" },
    { name: "Pier walk", venue: "Hudson River piers" },
  ]),
  createDate("bowlero-bww-crumbl", "Bowlero + Buffalo Wild Wings + Crumbl", [
    { name: "Bowling", venue: "Bowlero" },
    { name: "Wings dinner", venue: "Buffalo Wild Wings" },
    { name: "Dessert stop", venue: "Crumbl" },
  ]),
  createDate(
    "dave-busters-chinese",
    "Dave & Busters + Chinese Restaurant",
    [
      { name: "Arcade games", venue: "Dave & Buster's" },
      { name: "Dinner", venue: "Chinese Restaurant" },
    ],
  ),
  createDate("picnic-hoppers", "Picnic in Yonkers + Hoppers Movie", [
    { name: "Picnic", venue: "Yonkers" },
    { name: "Movie night", venue: "Hoppers screening" },
  ]),
  createDate(
    "nachos-cookies-dominoes",
    "Cooking Nachos/Cookies + Dominoes @ Rutgers",
    [
      { name: "Cook together", venue: "Rutgers kitchen" },
      { name: "Dominoes", venue: "Rutgers" },
    ],
  ),
  createDate(
    "mass-brookfield-study",
    "Mass + Brookfield Place Mall (Study) + Pier Walk",
    [
      { name: "Mass", venue: "Church service" },
      { name: "Study date", venue: "Brookfield Place Mall" },
      { name: "Pier walk", venue: "Hudson River piers" },
    ],
  ),
  createDate(
    "central-park-cafe-apartment",
    "Central Park + Cafe + Smoothie/Insomnia + Her Apartment",
    [
      { name: "Park walk", venue: "Central Park" },
      { name: "Cafe stop", venue: "Cafe" },
      { name: "Snack run", venue: "Smoothie/Insomnia" },
      { name: "Wind-down", venue: "Her Apartment" },
    ],
  ),
  createDate(
    "transit-museum-journaling",
    "Transit Museum Brooklyn + Journaling in the Park",
    [
      { name: "Museum visit", venue: "New York Transit Museum" },
      { name: "Journaling", venue: "Brooklyn park" },
    ],
  ),
];

export const createInitialState = (): ScareAppState => ({
  dates: initialDates,
  wishlist: {
    Victor: "",
    Gianna: "",
  },
  lastUpdated: new Date().toISOString(),
});

export const isUserName = (value: string): value is UserName =>
  value === "Victor" || value === "Gianna";
