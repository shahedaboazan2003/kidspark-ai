import http, { ApiResponse } from "./http";

export interface AccountRow {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  type: "parent" | "child";
  lastLogin?: string | null;
}

// export const listAccounts = async (): Promise<AccountRow[]> => {
//   const res = await http.get<ApiResponse<AccountRow[]>>(
//     "/children/accounts"
//   )
//   return res.data.data;
// };
type AccountsResponse = {
  data: AccountRow[];
};

export const listAccounts = async (): Promise<AccountRow[]> => {
  const res = await http.get<ApiResponse<AccountsResponse>>(
    "/children/accounts"
  );

  return res.data.data;
};