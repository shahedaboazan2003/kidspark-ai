const API = "http://localhost:3000";

// LOGIN
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //   Authorization:`Bearer ${getToken}`
    },
  });
  return await response.json();
};

// REGISTER
export const register = async (data: any) => {
  //   const res = await axios.post(`${API}/auth/register`, data);
  //   return res.data;
};
