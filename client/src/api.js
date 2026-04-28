function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  getPatterns: () => request("/api/patterns"),
  getPattern: (id) => request(`/api/patterns/${id}`),
  createPattern: (body) =>
    request("/api/patterns", { method: "POST", body: JSON.stringify(body) }),
  updatePattern: (id, body) =>
    request(`/api/patterns/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deletePattern: (id) => request(`/api/patterns/${id}`, { method: "DELETE" }),
  uploadImage: async (file) => {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
  register: (body) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  checkUsername: (username) =>
    request(`/api/auth/check-username/${encodeURIComponent(username)}`),
};
