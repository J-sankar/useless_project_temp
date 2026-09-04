
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  feed: () => request("/posts"),
  createPost: (post) => request("/posts", {
    method: "POST",
    body: JSON.stringify(post),
  }),
  like: (postId, petId) => request(`/posts/${postId}/like`, {
    method: "POST",
    body: JSON.stringify({ pet_id: petId }),
  }),
  comments: (postId) => request(`/posts/${postId}/comments`),
  presets: async () => {
    const data = await request("/personality-presets");
    const presets = Array.isArray(data) ? data : data?.presets;
    console.log("[api] normalized personality presets:", presets);
    return { presets: Array.isArray(presets) ? presets : [] };
  },
  uploadAnimalVlog: (file, petId, presetId) => {
    const form = new FormData();
    form.append("file", file);
    form.append("pet_id", String(petId));
    form.append("personality_preset_id", String(presetId));
    return request("/animalvlog/upload", {
      method: "POST",
      body: form,
      formData: true,
    });
  },
  animalVlogStatus: (jobId) => request(`/animalvlog/status/${jobId}`),
};
