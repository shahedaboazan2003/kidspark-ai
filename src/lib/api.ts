/**
 * Mock REST-style API layer backed by localStorage.
 * Mimics the backend endpoints described in the project spec so the UI
 * can be wired as if a real server existed.
 *
 * All "endpoints" return Promises with simulated latency.
 */

import { Child, loadChildren, saveChildren, AVATAR_PRESETS } from "./children";

export type UserType = "parent" | "child";

export interface ParentAccount {
  id: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  type: "parent";
  createdAt: string;
  emailVerified: boolean;
}

export interface AccountRow {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  type: UserType;
  email: string | null;
  createdAt: string;
  lastLogin: string | null;
}

const PARENTS_KEY = "littleminds.parents";
const PENDING_KEY = "littleminds.pendingRegistration";
const LAST_LOGIN_KEY = "littleminds.lastLogin"; // map: username -> ISO string

const loadLastLogins = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(LAST_LOGIN_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const setLastLogin = (username: string) => {
  const map = loadLastLogins();
  map[username.toLowerCase()] = new Date().toISOString();
  localStorage.setItem(LAST_LOGIN_KEY, JSON.stringify(map));
};

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

// --- Seed default parent so demo creds keep working ---
const DEFAULT_PARENT: ParentAccount = {
  id: "p_default",
  username: "parent",
  password: "parent123",
  email: "parent@littleminds.app",
  firstName: "Sarah",
  lastName: "Parker",
  type: "parent",
  createdAt: new Date("2024-01-15").toISOString(),
  emailVerified: true,
};

const loadParents = (): ParentAccount[] => {
  try {
    const raw = localStorage.getItem(PARENTS_KEY);
    if (!raw) {
      localStorage.setItem(PARENTS_KEY, JSON.stringify([DEFAULT_PARENT]));
      return [DEFAULT_PARENT];
    }
    const list = JSON.parse(raw) as ParentAccount[];
    // Ensure default parent is present
    if (!list.find((p) => p.username === "parent")) {
      list.unshift(DEFAULT_PARENT);
      localStorage.setItem(PARENTS_KEY, JSON.stringify(list));
    }
    return list;
  } catch {
    return [DEFAULT_PARENT];
  }
};

const saveParents = (list: ParentAccount[]) => {
  localStorage.setItem(PARENTS_KEY, JSON.stringify(list));
};

// ====================== AUTH ======================

export interface LoginResponse {
  accessToken: string;
  userType: UserType;
  username: string;
  firstName: string;
  lastName: string;
  id: string;
}

/**
 * POST /auth/login
 * The role selected in the UI is sent for UX validation, but the backend
 * is the source of truth — if the account's actual role differs we reject.
 */
export async function login(
  username: string,
  password: string,
  selectedRole?: UserType,
): Promise<LoginResponse> {
  await delay(700);
  const u = username.trim().toLowerCase();

  // Parents
  const parent = loadParents().find((p) => p.username.toLowerCase() === u);
  if (parent) {
    if (parent.password !== password) throw new Error("INVALID_CREDENTIALS");
    if (!parent.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");
    if (selectedRole && selectedRole !== "parent")
      throw new Error("ROLE_MISMATCH");
    setLastLogin(parent.username);
    return {
      accessToken: `parent_${parent.id}_${Date.now()}`,
      userType: "parent",
      username: parent.username,
      firstName: parent.firstName,
      lastName: parent.lastName,
      id: parent.id,
    };
  }

  // Children
  const children = loadChildren();
  const child = children.find((c) => c.username.toLowerCase() === u);
  if (child) {
    const expected =
      child.password ?? (child.username === "child" ? "child123" : null);
    if (!expected || expected !== password)
      throw new Error("INVALID_CREDENTIALS");
    if (selectedRole && selectedRole !== "child")
      throw new Error("ROLE_MISMATCH");
    setLastLogin(child.username);
    return {
      accessToken: `child_${child.id}_${Date.now()}`,
      userType: "child",
      username: child.username,
      firstName: child.firstName ?? child.name,
      lastName: child.lastName ?? "",
      id: child.id,
    };
  }

  throw new Error("INVALID_CREDENTIALS");
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

/** POST /auth/register — stores a pending registration awaiting OTP */
export async function registerParent(
  payload: RegisterPayload,
): Promise<{ ok: true }> {
  await delay(900);
  const parents = loadParents();
  const u = payload.username.trim().toLowerCase();
  if (parents.find((p) => p.username.toLowerCase() === u))
    throw new Error("USERNAME_TAKEN");
  if (
    parents.find((p) => p.email.toLowerCase() === payload.email.toLowerCase())
  )
    throw new Error("EMAIL_TAKEN");

  // Stash pending until OTP verifies
  localStorage.setItem(
    PENDING_KEY,
    JSON.stringify({ ...payload, username: payload.username.trim() }),
  );
  return { ok: true };
}

/** POST /auth/verify-email — finalize the pending registration */
export async function verifyEmail(code: string): Promise<LoginResponse> {
  await delay(700);
  if (code === "000000") throw new Error("INVALID_CODE");
  if (code === "111111") throw new Error("EXPIRED_CODE");
  if (!/^\d{6}$/.test(code)) throw new Error("INVALID_CODE");

  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) throw new Error("NO_PENDING_REGISTRATION");
  const pending = JSON.parse(raw) as RegisterPayload;

  const parents = loadParents();
  const newParent: ParentAccount = {
    id: `p_${Date.now()}`,
    username: pending.username,
    password: pending.password,
    email: pending.email,
    firstName: pending.firstName,
    lastName: pending.lastName,
    type: "parent",
    createdAt: new Date().toISOString(),
    emailVerified: true,
  };
  saveParents([...parents, newParent]);
  localStorage.removeItem(PENDING_KEY);
  setLastLogin(newParent.username);

  return {
    accessToken: `parent_${newParent.id}_${Date.now()}`,
    userType: "parent",
    username: newParent.username,
    firstName: newParent.firstName,
    lastName: newParent.lastName,
    id: newParent.id,
  };
}

// ====================== ACCOUNTS ======================

/** GET /accounts — returns parent(s) + all children, with last login times */
export async function listAccounts(): Promise<AccountRow[]> {
  await delay(500);
  const lastLogins = loadLastLogins();
  const parents = loadParents().map<AccountRow>((p) => ({
    id: p.id,
    username: p.username,
    firstName: p.firstName,
    lastName: p.lastName,
    type: "parent",
    email: p.email,
    createdAt: p.createdAt,
    lastLogin: lastLogins[p.username.toLowerCase()] ?? null,
  }));
  const children = loadChildren().map<AccountRow>((c) => ({
    id: c.id,
    username: c.username,
    firstName: c.firstName ?? c.name,
    lastName: c.lastName ?? "",
    type: "child",
    email: null,
    createdAt: c.createdAt ?? new Date().toISOString(),
    lastLogin: lastLogins[c.username.toLowerCase()] ?? null,
  }));
  return [...parents, ...children];
}

// ====================== CHILDREN (saving from AddChild) ======================

export interface AddChildPayload {
  name: string;
  username: string;
  password: string;
  birthdate: string;
  firstName?: string;
  lastName?: string;
}

export async function createChild(payload: AddChildPayload): Promise<Child> {
  await delay(900);
  const children = loadChildren();
  const u = payload.username.trim().toLowerCase();
  if (children.find((c) => c.username.toLowerCase() === u))
    throw new Error("USERNAME_TAKEN");

  const preset =
    AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
  const newChild: Child = {
    id: `c_${Date.now()}`,
    name: payload.name.trim(),
    username: payload.username.trim(),
    password: payload.password,
    birthdate: payload.birthdate,
    avatarColor: preset.color,
    avatarEmoji: preset.emoji,
    firstName: payload.firstName ?? payload.name.trim().split(" ")[0],
    lastName:
      payload.lastName ?? payload.name.trim().split(" ").slice(1).join(" "),
    createdAt: new Date().toISOString(),
  };
  saveChildren([...children, newChild]);
  return newChild;
}
