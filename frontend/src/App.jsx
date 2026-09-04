import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/useAuth.js";
import FeedPage from "./pages/feedpage/Feedpage.jsx";
import Login from "./pages/login/Login.jsx";
import Signup from "./pages/signup/Signup.jsx";
import Landing from "./pages/landing/Landing.jsx";
import "./App.css";

function App() {
  const { pet, ready } = useAuth();

  if (!ready) return <div className="page-loading">Loading your pet profile...</div>;

  return (
    <Routes>
      <Route path="/login" element={pet ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={pet ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/" element={<Landing />} />
      <Route path="/feed" element={pet ? <FeedPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
