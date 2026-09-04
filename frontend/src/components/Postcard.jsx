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
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const displayName = post.pet_name || `Pet #${post.pet_id}`;
  const avatarUrl = post.avatar_url || post.pet_avatar_url;

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

  const submitComment = async (event) => {
    event.preventDefault();
    if (!comment.trim() || !pet || commentSubmitting) return;
    setCommentSubmitting(true);
    setCommentsError("");
    try {
      const saved = await api.addComment(post.id, pet.id, comment.trim());
      setSavedComments((current) => [...current, saved]);
      setLocalComments((current) => [...current, saved]);
      setComment("");
    } catch (error) {
      setCommentsError(error.message);
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <article className={`card post-card ${tilt}`} style={{ "--post-delay": `${Math.min(index, 6) * 90}ms` }}>
      <div className="post-head">
        <div className="avatar">{avatarUrl ? <img src={avatarUrl} alt={`${displayName} avatar`} /> : displayName[0]?.toUpperCase()}</div>
        <div><div className="post-pet-name">{displayName}</div><div className="post-reason">{timeAgo(post.created_at)}</div></div>
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
        {savedComments.map((item) => <div className="comment-row" key={item.id}><b>{item.pet_name || `Pet #${item.pet_id}`}</b> {item.text}</div>)}
        <form className="comment-form" onSubmit={submitComment}><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Leave a little bark..." disabled={!pet || commentSubmitting} /><button className="btn btn-primary" type="submit" aria-label="Post bark" disabled={!pet || commentSubmitting}><Dog size={15} /></button></form>
      </div>}
    </article>
  );
}
