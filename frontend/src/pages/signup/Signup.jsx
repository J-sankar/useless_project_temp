import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { useAuth } from "../../context/useAuth.js";
import { DEFAULT_AVATAR } from "../../data/avatars.js";
import AvatarPicker from "../../components/AvatarPicker.jsx";
import { api } from "../../api/client.js";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", species: "", breed: "", bio: "", avatar_url: DEFAULT_AVATAR.src, personality_preset_id: null });
  const [presets, setPresets] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.presets().then((data) => {
      const loadedPresets = data.presets || [];
      console.log("[signup] presets received:", loadedPresets);
      console.log("[signup] preset count:", loadedPresets.length);
      setPresets(loadedPresets);
      if (loadedPresets[0]) {
        setForm((current) => ({ ...current, personality_preset_id: loadedPresets[0].id }));
      }
    }).catch((err) => {
      console.error("[signup] failed to load personality presets:", err);
      setPresets([]);
    });
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try { await signup(form); navigate("/feed"); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return <div className="auth-wrap"><div className="card tilt-r"><div className="tape" />
    <div className="brand-lockup" aria-label="e-മൃഗാലയം, First online മൃഗശാല">
      <span className="brand-name">e-മൃഗാലയം</span>
      <span className="brand-tagline">First online  മൃഗശാല</span>
    </div>
    <h1 className="page-title"><PawPrint size={22} /> Create a pet profile</h1>
    <p className="page-sub">A little corner of the internet for their big personality.</p>
    {error && <div className="error-box">{error}</div>}
    <form onSubmit={submit}>
      <div className="field"><label htmlFor="name">Pet name</label><input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <AvatarPicker value={form.avatar_url} onChange={(avatar_url) => setForm({ ...form, avatar_url })} />
      <div className="field"><label htmlFor="species">Species</label><input id="species" required placeholder="Dog, cat, bird..." value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} /></div>
      <div className="field"><label htmlFor="breed">Breed</label><input id="breed" placeholder="Corgi, tabby..." value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} /></div>
      <div className="field"><label htmlFor="bio">Bio</label><textarea id="bio" rows="3" placeholder="Tell the zoo about your pet" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
      <div className="field"><label htmlFor="personality">Personality <span className="optional-label">optional</span></label><select id="personality" value={form.personality_preset_id ?? ""} onChange={(e) => setForm({ ...form, personality_preset_id: e.target.value ? Number(e.target.value) : null })}><option value="">Choose later</option>{presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select><small>{presets.length ? `${presets.length} personality preset(s) loaded` : "Presets unavailable; you can choose later."}</small></div>
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Creating profile..." : "Create profile"}</button>
    </form>
    <p className="page-sub auth-switch">Already have a profile? <Link to="/login">Log in</Link></p>
  </div></div>;
}