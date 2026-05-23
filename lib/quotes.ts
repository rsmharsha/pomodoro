export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Deep work is the superpower of the 21st century.",
    author: "Cal Newport",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
  },
  {
    text: "It's not that I'm so smart, it's just that I stay with problems longer.",
    author: "Albert Einstein",
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "One hour of focused work is worth more than a day of scattered effort.",
    author: "Unknown",
  },
  {
    text: "Do not wait to strike till the iron is hot, but make it hot by striking.",
    author: "William Butler Yeats",
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
  },
  {
    text: "Energy, not time, is the fundamental currency of high performance.",
    author: "Jim Loehr",
  },
  {
    text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen Covey",
  },
  {
    text: "Done is better than perfect.",
    author: "Sheryl Sandberg",
  },
  {
    text: "Stay focused, go after your dreams and keep moving toward your goals.",
    author: "LL Cool J",
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
  },
];

export function getRandomQuote(excludeIndex?: number): { quote: Quote; index: number } {
  let index: number;
  do {
    index = Math.floor(Math.random() * QUOTES.length);
  } while (index === excludeIndex && QUOTES.length > 1);
  return { quote: QUOTES[index], index };
}
