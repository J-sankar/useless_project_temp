import { useEffect, useState } from "react";
import { PawPrint, UserRound } from "lucide-react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/client.js";
import PostCard from "../../components/Postcard.jsx";
import PostComposer from "../../components/PostComposer.jsx";
import { useAuth } from "../../context/useAuth.js";

export default function FeedPage() {
  const location = useLocation();
  const { pet } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const addCreatedPost = (created) => {
    const post = created?.post || created;
    if (post?.id) setPosts((current) => [post, ...current]);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadFeed() {
      try {
        const data = await api.feed();
        const feedPosts = Array.isArray(data) ? data : data.posts || [];
        if (!cancelled) setPosts(feedPosts);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadFeed();
    return () => { cancelled = true; };
  }, [pet?.id]);

  if (loading) {
    return <div className="page-loading loading-scene"><div className="loading-paws"><PawPrint size={28} /><PawPrint size={20} /><PawPrint size={25} /></div><p>Fetching the feed...</p></div>;
  }

  if (error) return <div className="error-box">{error}</div>;

  return (
    <div className="feed-layout feed-only">
      <main className="feed-main">
        <header className="feed-masthead">
          <div>
            <p className="eyebrow">The happy pet network</p>
            <h1>Today's tail-wagging moments</h1>
            <p className="page-sub">Posts from the other wonderful animals in e-മൃഗാലയം.</p>
          </div>
          <div className="mascot" aria-hidden="true"><PawPrint size={38} /></div>
        </header>
        {location.state?.justLoggedIn && <div className="welcome-banner"><strong>Welcome to e-മൃഗാലയം</strong><span>First online  മൃഗശാല</span></div>}
        {pet && <PostComposer pet={pet} onCreated={addCreatedPost} />}
        {posts.length === 0 && <p className="page-sub empty-feed">No other animal posts yet. The zoo is waiting for some mischief!</p>}
        {posts.map((post, index) => <PostCard key={post.id} post={post} index={index} tilt={index % 2 === 0 ? "tilt-l" : "tilt-r"} />)}
      </main>

      <button className="profile-dock" type="button" onClick={() => setShowProfile(true)} aria-label="Open animal profile" title="Open animal profile">
        {pet?.avatar_url ? <img src={pet.avatar_url} alt="" /> : <UserRound size={21} />}
      </button>

      {showProfile && (
        <div className="profile-backdrop" onClick={() => setShowProfile(false)}>
          <section className="profile-panel" onClick={(event) => event.stopPropagation()}>
            <button className="profile-close" type="button" onClick={() => setShowProfile(false)} aria-label="Close profile">×</button>
            <div className="profile-avatar">{pet?.avatar_url ? <img src={pet.avatar_url} alt="" /> : <UserRound size={32} />}</div>
            <p className="eyebrow">Your animal profile</p>
            <h2>{pet?.name}</h2>
            <p className="profile-species">{pet?.species}{pet?.breed ? ` · ${pet.breed}` : ""}</p>
            <p className="page-sub">{pet?.bio || "A mysterious creature of the e-മൃഗാലയം."}</p>
          </section>
        </div>
      )}
    </div>
  );
}
