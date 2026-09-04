
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function normalizeUrl(value) {
  return typeof value === "string" && value.startsWith("/") ? `${API_URL}${value}` : value;
}

function normalizePost(post) {
  if (!post || typeof post !== "object") return post;
  return {
    ...post,
    media_url: normalizeUrl(post.media_url),
    avatar_url: normalizeUrl(post.avatar_url),
    pet_avatar_url: normalizeUrl(post.pet_avatar_url),
  };
}

async function request(path, options = {}) {
  const headers = {
    ...options.headers,
  };
  if (!options.formData) headers["Content-Type"] = "application/json";

  const url = `${API_URL}${path}`;
  console.log(`[api] ${options.method || "GET"} ${url}`);
  const response = await fetch(url, {
    ...options,
    headers,
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

  if (response.status === 204) return null;
  const data = await response.json();
  console.log(`[api] response ${response.status} ${path}:`, data);
  return data;
}

export const api = {
  pets: () => request("/pets"),
  createPet: (pet) => request("/pets", {
    method: "POST",
    body: JSON.stringify(pet),
  }),
  feed: async () => {
    const data = await request("/posts");
    return Array.isArray(data) ? data.map(normalizePost) : data;
  },
  createPost: async (post) => normalizePost(await request("/posts", {
    method: "POST",
    body: JSON.stringify(post),
  })),
  createFilePost: async (file, petId, caption) => {
    const form = new FormData();
    form.append("media", file);
    form.append("pet_id", String(petId));
    form.append("caption", caption || "");
    return normalizePost(await request("/posts/upload", { method: "POST", body: form, formData: true }));
  },
  like: (postId, petId) => request(`/posts/${postId}/like`, {
    method: "POST",
    body: JSON.stringify({ pet_id: petId }),
  }),
  comments: (postId) => request(`/posts/${postId}/comments`),
  addComment: (postId, petId, text) => request(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ pet_id: petId, text }),
  }),
  presets: async () => {
    const data = await request("/personality-presets");
    const presets = Array.isArray(data) ? data : data?.presets;
    console.log("[api] normalized personality presets:", presets);
    return { presets: Array.isArray(presets) ? presets : [] };
  },
  createAnimalVlog: async (file, petId, petName, caption) => {
    const form = new FormData();
    form.append("video", file);
    form.append("pet_id", String(petId));
    form.append("pet_name", petName);
    form.append("personality_prompt", "You are playful, curious, and warmly dramatic.");
    form.append("caption", caption || "Animal vlog");
    return normalizePost(await request("/posts/animal-vlog", {
      method: "POST",
      body: form,
      formData: true,
    }));
  },
  animalVlogStatus: (jobId) => request(`/animalvlog/status/${jobId}`),
};
