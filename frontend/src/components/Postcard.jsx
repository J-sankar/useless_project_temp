import { useEffect, useState } from "react";
import { Heart, MessageCircle, Mic, AlertTriangle, Send } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/useAuth.js";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostCard({ post, reason, index = 0, tilt = "tilt-l" }) {
  const { pet } = useAuth();
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [video, setVideo] = useState(post.video);
  const [comments, setComments] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // useEffect runs side effects — things that happen "outside" rendering,
  // like timers, subscriptions, or fetching data.
  // This one polls the backend every 3s while the video is still being dubbed.
  useEffect(() => {
    if (!video || video.status !== "processing") return;
    const interval = setInterval(async () => {
      try {
        const updated = await api.videoStatus(video.id);
        setVideo(updated);
        if (updated.status !== "processing") clearInterval(interval);
      } catch {
        clearInterval(interval);
      }
    }, 3000);
    // the function returned here is "cleanup" — React calls it if the
    // component unmounts or `video` changes again, so we don't leak timers.
    return () => clearInterval(interval);
  }, [video]); // re-run this effect whenever `video` changes

  const toggleLike = async () => {
    if (!pet) return;
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await api.unlike(post.id).catch(() => {});
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await api.like(post.id).catch(() => {});
    }
  };

  const loadComments = async () => {
    setShowComments((s) => !s);
    if (!comments) {
      const data = await api.comments(post.id);
      setComments(data);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const created = await api.addComment(post.id, commentText.trim());
    setComments((prev) => [...(prev || []), created]);
    setCommentText("");
  };

  return (
    <article className={`card post-card ${tilt}`} style={{ "--post-delay": `${Math.min(index, 6) * 90}ms` }}>
      <div className="post-head">
        <div className="avatar">
          {post.pet_avatar ? (
            <img
              src={post.pet_avatar}
              alt=""
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            post.pet_name?.[0]?.toUpperCase()
          )}
        </div>
        <div>
          <div className="post-pet-name">{post.pet_name}</div>
          <div className="post-reason">
            {timeAgo(post.created_at)}
            {reason === "following" ? " · from a pet you follow" : reason === "trending" ? " · trending" : ""}
          </div>
        </div>
      </div>

      {post.caption && <p className="post-caption">{post.caption}</p>}

      {post.image_url && (
        <div className="post-media">
          <img src={post.image_url} alt="" />
        </div>
      )}

      {video && video.status === "ready" && video.dubbed_url && (
        <div className="post-media">
          <video src={video.dubbed_url} controls preload="metadata" />
        </div>
      )}

      {video && video.status === "processing" && (
        <div className="dub-status">
          <Mic size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
          Auto-dubbing this clip... check back in a moment.
        </div>
      )}

      {video && video.status === "failed" && (
        <div className="dub-status">
          <AlertTriangle size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
          Dubbing didn't work out this time{video.error ? `: ${video.error}` : "."}
        </div>
      )}

      {video && video.script && <div className="dub-script">"{video.script}"</div>}

      <div className="post-actions">
        <button className={`action-btn${liked ? " liked" : ""}`} onClick={toggleLike} disabled={!pet}>
          <Heart size={16} fill={liked ? "currentColor" : "none"} /> {likeCount}
        </button>
        <button className="action-btn" onClick={loadComments}>
          <MessageCircle size={16} /> {post.comment_count}
        </button>
      </div>

      {showComments && (
        <div className="comments-block">
          {(comments || []).map((c) => (
            <div className="comment-row" key={c.id}>
              <b>{c.pet_name}</b> {c.text}
            </div>
          ))}
          {(comments || []).length === 0 && <div className="comment-row">No comments yet.</div>}
          {pet && (
            <form className="comment-form" onSubmit={submitComment}>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Comment as ${pet.name}...`}
              />
              <button className="btn btn-primary" type="submit">
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}