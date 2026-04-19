export interface Child {
  id: string;
  name: string;
  username: string;
  birthdate: string; // ISO date
  avatarColor: string; // tailwind gradient classes
  avatarEmoji: string;
}

export const AVATAR_PRESETS = [
  { color: "from-primary to-primary-glow", emoji: "🦊" },
  { color: "from-secondary to-primary-glow", emoji: "🐻" },
  { color: "from-accent to-secondary", emoji: "🐼" },
  { color: "from-primary to-secondary", emoji: "🐰" },
  { color: "from-secondary to-accent", emoji: "🦁" },
  { color: "from-accent to-primary", emoji: "🐸" },
  { color: "from-primary-glow to-accent", emoji: "🐨" },
  { color: "from-secondary to-primary", emoji: "🦄" },
];

const STORAGE_KEY = "littleminds.children";

const seed: Child[] = [
  {
    id: "c1",
    name: "Emma",
    username: "emma_explorer",
    birthdate: "2017-04-12",
    avatarColor: AVATAR_PRESETS[0].color,
    avatarEmoji: AVATAR_PRESETS[0].emoji,
  },
  {
    id: "c2",
    name: "Liam",
    username: "liam_learns",
    birthdate: "2019-09-03",
    avatarColor: AVATAR_PRESETS[3].color,
    avatarEmoji: AVATAR_PRESETS[3].emoji,
  },
];

export const loadChildren = (): Child[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Child[];
  } catch {
    return seed;
  }
};

export const saveChildren = (children: Child[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(children));
};

export const calcAge = (birthdate: string): number => {
  const b = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return Math.max(age, 0);
};
