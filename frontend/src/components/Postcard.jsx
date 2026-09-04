import { useState } from "react";
import { Dog, PawPrint } from "lucide-react";
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

export default function PostCard({ post, index = 0, tilt = "tilt-l" }) {
  const { pet } = useAuth();
  const [liked, setLiked] = useState(Boolean(post.liked_by_me));
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [savedComments, setSavedComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");

  const toggleLike = async () => {
    if (!pet) return;
    const result = await api.like(post.id, pet.id).catch(() => null);
    if (result) {
      setLiked(result.liked);
      setLikeCount(result.like_count);
    }
  };

  const toggleComments = async () => {
    const opening = !showComments;
    setShowComments(opening);
    if (!opening || savedComments.length > 0) return;

    setCommentsLoading(true);
    setCommentsError("");
    try {
      const data = await api.comments(post.id);
      const comments = Array.isArray(data) ? data : data.comments || [];
      setSavedComments(comments);
    } catch (error) {
      setCommentsError(error.message);
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitComment = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    setLocalComments((current) => [...current, { id: `${Date.now()}-${current.length}`, text: comment.trim() }]);
    setComment("");
  };

  return (
    <article className={`card post-card ${tilt}`} style={{ "--post-delay": `${Math.min(index, 6) * 90}ms` }}>
      <div className="post-head">
        <div className="avatar">{post.pet_avatar_url ? <img src={post.pet_avatar_url} alt={`${post.pet_name} avatar`} /> : post.pet_name?.[0]?.toUpperCase()}</div>
        <div><div className="post-pet-name">{post.pet_name}</div><div className="post-reason">{timeAgo(post.created_at)}</div></div>
      </div>
      {post.caption && <p className="post-caption">{post.caption}</p>}
      {post.media_url && (post.media_type === "image" || post.media_type === "picture") && <div className="post-media"><img src={post.media_url} alt="" /></div>}
      {post.media_url && (post.media_type === "video" || post.media_type === "animalvlog") && <div className="post-media"><video src={post.media_url} controls preload="metadata" /></div>}

      <div className="post-actions animal-actions">
        <button className={`action-btn animal-action${liked ? " liked" : ""}`} onClick={toggleLike} disabled={!pet} title="Give a paw">
          <PawPrint size={19} fill={liked ? "currentColor" : "none"} /><span>{likeCount}</span><small>Paw</small>
        </button>
        <button className="action-btn animal-action" onClick={toggleComments} title="Leave a bark">
          <Dog size={20} /><span>{(post.comment_count || 0) + localComments.length}</span><small>Bark</small>
        </button>
      </div>

      {showComments && <div className="comments-block">
        <div className="comment-heading"><Dog size={17} /> Bark section</div>
        {commentsLoading && <div className="comment-row">Listening for barks...</div>}
        {commentsError && <div className="comment-row error-text">{commentsError}</div>}
        {savedComments.map((item) => <div className="comment-row" key={item.id}><b>Pet #{item.pet_id}</b> {item.text}</div>)}
        {localComments.map((item) => <div className="comment-row" key={item.id}><b>{pet?.name || "You"}</b> {item.text}</div>)}
        <form className="comment-form" onSubmit={submitComment}><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Leave a little bark..." /><button className="btn btn-primary" type="submit" aria-label="Post bark"><Dog size={15} /></button></form>
      </div>}
    </article>
  );
}
