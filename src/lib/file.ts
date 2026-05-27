export const uploadFile = async (
  file: File,
  childIds: number[]
) => {
  const token = localStorage.getItem("accessToken");

  const formData = new FormData();

  formData.append("file", file);

  childIds.forEach((id) => {
    formData.append("childIds", String(id));
  });

  const url = `${import.meta.env.VITE_API_URL}/documents/upload`;

  const res = await fetch(url, {
    method: "POST",

    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },

    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    console.log(err);

    throw new Error("Upload failed");
  }

  return res.json();
};

export const getFiles = async () => {
  const token = localStorage.getItem("accessToken");

  const url = `${import.meta.env.VITE_API_URL}/documents`;

  const res = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch files");
  }

  return res.json();
};

export const deleteFile = async (id: number) => {
  const token = localStorage.getItem("accessToken");

  const url = `${import.meta.env.VITE_API_URL}/documents/${id}`;

  const res = await fetch(url, {
    method: "DELETE",

    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    throw new Error("Delete failed");
  }

  return res.json();
};