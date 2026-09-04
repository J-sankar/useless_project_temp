import { useState } from "react";
import { api } from "../api/client.js";
import { AuthContext } from "./context.js";

const TOKEN_KEY = "pet-social-token";
const PET_KEY = "pet-social-profile";

function getSavedPet() {
  try {
    const savedPet = localStorage.getItem(PET_KEY);
    return savedPet && localStorage.getItem(TOKEN_KEY) ? JSON.parse(savedPet) : null;
  } catch {
    localStorage.removeItem(PET_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [pet, setPet] = useState(getSavedPet);

  const authenticate = async (method, ...credentials) => {
    const result = await api[method](...credentials);
    const token = result.token || result.access_token;
    const profile = result.pet || result.user || { name: credentials[0] };
    if (!token) throw new Error("The server did not return an access token.");
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PET_KEY, JSON.stringify(profile));
    setPet(profile);
  };

  const login = (email, password) => authenticate("login", email, password);
  const signup = (name, email, password) => authenticate("signup", name, email, password);
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PET_KEY);
    setPet(null);
  };

  return <AuthContext.Provider value={{ pet, ready: true, login, signup, logout }}>{children}</AuthContext.Provider>;
}

