export const getTokenStats = async () => {
  const token = localStorage.getItem("accessToken");

  console.log(" Token:", token);

  const url = `${import.meta.env.VITE_API_URL}/ai/me/tokens`;
  console.log(" URL:", url);

  const res = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  console.log(" Response status:", res.status);

  const data = await res.json();
  console.log(" Full API response:", data);

  return data;
};
