import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { useAuth } from "../../context/useAuth.js";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try { await signup(form.name, form.email, form.password); navigate("/feed"); }
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
      <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Creating profile..." : "Create profile"}</button>
    </form>
    <p className="page-sub auth-switch">Already have a profile? <Link to="/login">Log in</Link></p>
  </div></div>;
}
