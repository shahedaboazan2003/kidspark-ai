import http from "./http";

export interface AccountRow {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  type: "parent" | "child";
  lastLogin?: string | null;
}

export const listAccounts = async (): Promise<AccountRow[]> => {
  return http.get("/accounts");
};