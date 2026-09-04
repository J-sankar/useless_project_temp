import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { api } from "../api/client.js";

export default function FollowSuggestions() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    api.pets().then((data) => setPets(data.pets || [])).catch(() => setPets([]));
  }, []);

  return (
    <section className="suggestions card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">For your pet</p>
          <h2>Suggested friends</h2>
        </div>
        <UserPlus size={19} />
      </div>
      {pets.length === 0 ? (
        <p className="page-sub">No suggestions yet.</p>
      ) : pets.map((suggestion) => (
        <div className="suggestion-row" key={suggestion.id}>
          <div className="avatar small">
            {suggestion.avatar_url ? <img src={suggestion.avatar_url} alt={`${suggestion.name} avatar`} /> : suggestion.name?.[0]?.toUpperCase()}
          </div>
          <div><strong>{suggestion.name}</strong><span>{suggestion.bio || "New around here"}</span></div>
          <button className="icon-btn" aria-label={`Follow ${suggestion.name}`} title={`Follow ${suggestion.name}`}><UserPlus size={15} /></button>
        </div>
      ))}
    </section>
  );
}
