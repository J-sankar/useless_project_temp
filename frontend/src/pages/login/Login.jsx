import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../../context/useAuth.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // useState gives a component memory. Each call returns [currentValue, functionToChangeIt].
  // React re-renders the component automatically whenever you call the setter.
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); // stop the browser's default "reload the page" form behavior
    setError("");
    setBusy(true);
    try {
      await login(name);
      navigate("/feed", { state: { justLoggedIn: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card tilt-l">
        <div className="tape" />
        <div className="brand-lockup" aria-label="e-മൃഗാലയം, First online മൃഗശാല">
          <span className="brand-name">e-മൃഗാലയം</span>
          <span className="brand-tagline">First online  മൃഗശാല</span>
        </div>
        <h1 className="page-title" style={{ marginTop: 0 }}>
          <LogIn size={22} style={{ verticalAlign: "middle", marginRight: 8 }} />
          Welcome back
        </h1>
        <p className="page-sub">Log in to your pet's account.</p>
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="login-name">Pet name</label>
            <input
              id="login-name"
              type="text"
              required
              placeholder="Enter your pet's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="page-sub" style={{ marginTop: 16 }}>
          New here? <Link to="/signup">Create a pet profile</Link>
        </p>
      </div>
    </div>
  );
}