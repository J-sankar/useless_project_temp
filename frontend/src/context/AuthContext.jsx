import { useState } from "react";
import { api } from "../api/client.js";
import { AuthContext } from "./context.js";

const PET_KEY = "pet-social-profile";

function getSavedPet() {
  try {
    const savedPet = localStorage.getItem(PET_KEY);
    return savedPet ? JSON.parse(savedPet) : null;
  } catch {
    localStorage.removeItem(PET_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [pet, setPet] = useState(getSavedPet);

  const login = async (name) => {
    const result = await api.pets();
    const profile = (result.pets || []).find((candidate) => candidate.name.toLowerCase() === name.trim().toLowerCase());
    if (!profile) throw new Error("No pet profile found with that name.");
    localStorage.setItem(PET_KEY, JSON.stringify(profile));
    setPet(profile);
  };

  const signup = async (profile) => {
    const created = await api.createPet(profile);
    localStorage.setItem(PET_KEY, JSON.stringify(created));
    setPet(created);
  };
  const logout = () => {
    localStorage.removeItem(PET_KEY);
    setPet(null);
  };

  return <AuthContext.Provider value={{ pet, ready: true, login, signup, logout }}>{children}</AuthContext.Provider>;
}

