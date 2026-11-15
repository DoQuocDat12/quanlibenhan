const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function call(path, method = "GET", body) {
  const token = localStorage.getItem("token");
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (res.status === 401 && token) { localStorage.clear(); window.location.reload(); }
  if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
  return data;
}

export const api = {
  get: (path) => call(path),
  post: (path, body) => call(path, "POST", body),
  put: (path, body) => call(path, "PUT", body),
};