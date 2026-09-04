
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem("pet-social-token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Keep the HTTP error when the server does not return JSON.
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  login: (email, password) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }),
  signup: (name, email, password) => request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  }),
  feed: () => request("/feed"),
  suggestions: () => request("/pets/suggestions"),
  like: (postId) => request(`/posts/${postId}/like`, { method: "POST" }),
  unlike: (postId) => request(`/posts/${postId}/like`, { method: "DELETE" }),
  comments: (postId) => request(`/posts/${postId}/comments`),
  addComment: (postId, text) => request(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  }),
  videoStatus: (videoId) => request(`/videos/${videoId}`),
};
