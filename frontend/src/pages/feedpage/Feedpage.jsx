import { useEffect, useState } from "react";
import { PawPrint } from "lucide-react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/client.js";
import PostCard from "../../components/Postcard.jsx";
import FollowSuggestions from "../../components/FollowSuggestions.jsx";

export default function FeedPage() {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the feed once, when this component first mounts.
  // The empty [] dependency array means "run this effect only on first render."
  useEffect(() => {
    let cancelled = false;
    async function loadFeed() {
      try {
        const data = await api.feed();
        if (!cancelled) setPosts(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadFeed();
    return () => {
      cancelled = true; // avoid setting state if the user navigates away mid-fetch
    };
  }, []);

  if (loading) {
    return (
      <div className="page-loading loading-scene">
        <div className="loading-paws"><PawPrint size={28} /><PawPrint size={20} /><PawPrint size={25} /></div>
        <p>Fetching the feed...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  return (
    <div className="feed-layout">
      <div className="feed-main">
        <header className="feed-masthead">
          <div>
            <p className="eyebrow">The happy pet network</p>
            <h1>Today's tail-wagging moments</h1>
            <p className="page-sub">A lively little window into the e-മൃഗാലയം community.</p>
          </div>
          <div className="mascot" aria-hidden="true"><PawPrint size={38} /></div>
        </header>
        {location.state?.justLoggedIn && (
          <div className="welcome-banner">
            <strong>Welcome to e-മൃഗാലയം</strong>
            <span>First online  മൃഗശാല</span>
          </div>
        )}
        {posts.length === 0 && <p className="page-sub">No posts yet — be the first to post something!</p>}

        {/* This is a "list render" — mapping an array of data to an array of components.
            Every item in a list needs a unique `key` prop so React can track which
            item is which across re-renders. */}
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} reason={post.reason} index={i} tilt={i % 2 === 0 ? "tilt-l" : "tilt-r"} />
        ))}
      </div>
      <aside className="feed-sidebar">
        <FollowSuggestions />
      </aside>
    </div>
  );
}