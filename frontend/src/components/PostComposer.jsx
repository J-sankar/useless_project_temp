import { useEffect, useRef, useState } from "react";
import { Bird, Film, ImagePlus, LoaderCircle, Send } from "lucide-react";
import { api } from "../api/client.js";

export default function PostComposer({ pet, onCreated }) {
  const [mode, setMode] = useState("post");
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [video, setVideo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [delivered, setDelivered] = useState(false);
  const birdAudioRef = useRef(null);

  useEffect(() => {
    setMessage("");
    setError("");
  }, [mode]);

  useEffect(() => {
    const audio = birdAudioRef.current;
    if (!delivered || !audio) return undefined;

    audio.currentTime = 0;
    audio.play().catch(() => {
      // The successful submit gesture normally permits playback; ignore browser autoplay blocks.
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [delivered]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let created;
      if (mode === "post") {
        if (!media) throw new Error("Choose an image or video file.");
        created = await api.createFilePost(media, pet.id, caption);
      } else {
        if (!video) throw new Error("Choose a video for the animal vlog.");
        created = await api.createAnimalVlog(video, pet.id, pet.name, caption);
      }
      setCaption("");
      setMedia(null);
      setVideo(null);
      setMessage(mode === "post" ? "Post delivered." : "Animal vlog delivered.");
      setDelivered(true);
      window.setTimeout(() => setDelivered(false), 1800);
      onCreated(created);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <section className="card composer">
    {delivered && <div className="delivery-animation" role="status" aria-live="polite"><audio ref={birdAudioRef} autoPlay preload="auto"><source src="/bird.mp3" type="audio/mpeg" /><source src="/bird.aac" type="audio/aac" /></audio><div className="delivery-cloud delivery-cloud-one" /><div className="delivery-cloud delivery-cloud-two" /><Bird className="delivery-bird" size={62} /><strong>Delivered!</strong></div>}
    <div className="composer-tabs">
      <button type="button" className={mode === "post" ? "composer-tab active" : "composer-tab"} onClick={() => setMode("post")}><ImagePlus size={17} /> New post</button>
      <button type="button" className={mode === "vlog" ? "composer-tab active" : "composer-tab"} onClick={() => setMode("vlog")}><Film size={17} /> Animal vlog</button>
    </div>
    <form onSubmit={submit}>
      <div className="field"><label htmlFor="post-caption">Caption</label><input id="post-caption" value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="What is your animal up to?" /></div>
      {mode === "post" ? <>
        <div className="field"><label htmlFor="post-media-file">Image or video file</label><input id="post-media-file" type="file" accept="image/*,video/*" required onChange={(event) => setMedia(event.target.files?.[0] || null)} /></div>
      </> : <div className="field"><label htmlFor="animal-vlog-file">Video file</label><input id="animal-vlog-file" type="file" accept="video/*" required onChange={(event) => setVideo(event.target.files?.[0] || null)} /></div>}
      {error && <div className="error-box">{error}</div>}
      {message && <div className="composer-message">{message}</div>}
      <button className="btn btn-primary composer-submit" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17} /> Delivering...</> : <><Send size={17} /> Deliver</>}</button>
    </form>
  </section>;
}