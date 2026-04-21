export interface Child {
  id: string;
  name: string;
  username: string;
  birthdate: string; // ISO date
  avatarColor: string; // tailwind gradient classes
  avatarEmoji: string;
  /** Optional — present for children created via Add Child / api */
  password?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
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
    name: "Emma Parker",
    firstName: "Emma",
    lastName: "Parker",
    username: "emma_explorer",
    password: "emma123",
    birthdate: "2017-04-12",
    avatarColor: AVATAR_PRESETS[0].color,
    avatarEmoji: AVATAR_PRESETS[0].emoji,
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "c2",
    name: "Liam Parker",
    firstName: "Liam",
    lastName: "Parker",
    username: "liam_learns",
    password: "liam123",
    birthdate: "2019-09-03",
    avatarColor: AVATAR_PRESETS[3].color,
    avatarEmoji: AVATAR_PRESETS[3].emoji,
    createdAt: "2024-02-05T10:00:00Z",
  },
  {
    id: "c_demo",
    name: "Demo Kid",
    firstName: "Demo",
    lastName: "Kid",
    username: "child",
    password: "child123",
    birthdate: "2018-06-15",
    avatarColor: AVATAR_PRESETS[5].color,
    avatarEmoji: AVATAR_PRESETS[5].emoji,
    createdAt: "2024-01-15T10:00:00Z",
  },
];

export const loadChildren = (): Child[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Child[];
    // Ensure the demo "child" account exists for the documented login creds
    if (!parsed.find((c) => c.username === "child")) {
      const merged = [...parsed, seed[2]];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
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
