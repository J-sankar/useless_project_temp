import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Music2, PawPrint, Volume2, VolumeX } from "lucide-react";

const lines = ["Welcome to e-മൃഗാലയം", "First online മൃഗശാല"];

export default function Landing() {
  const [lineIndex, setLineIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const currentLine = lines[lineIndex];
    if (letterIndex < currentLine.length) {
      const timer = setTimeout(() => setLetterIndex((index) => index + 1), 85);
      return () => clearTimeout(timer);
    }
    const pause = setTimeout(() => {
      setLineIndex((index) => (index + 1) % lines.length);
      setLetterIndex(0);
    }, 2200);
    return () => clearTimeout(pause);
  }, [lineIndex, letterIndex]);

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.pause();
      setMusicOn(false);
      return;
    }
    try {
      await audioRef.current.play();
      setMusicOn(true);
    } catch {
      setMusicOn(false);
    }
  };

  return (
    <main className="landing-page">
      <div className="landing-paw paw-one"><PawPrint size={38} /></div>
      <div className="landing-paw paw-two"><PawPrint size={25} /></div>
      <div className="landing-paw paw-three"><PawPrint size={31} /></div>
      <audio ref={audioRef} src="/bgm.mp3" loop preload="none" />
      <button className="music-toggle" type="button" onClick={toggleMusic} aria-pressed={musicOn}>
        {musicOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
        <span>{musicOn ? "BGM on" : "Play BGM"}</span>
      </button>

      <section className="landing-content">
        <div className="landing-badge"><Music2 size={16} /> A cheerful place for every creature</div>
        <div className="landing-mark"><PawPrint size={34} /></div>
        <p className="landing-kicker">e-മൃഗാലയം</p>
        <h1 className="typewriter-line" aria-live="polite">
          {lines[lineIndex].slice(0, letterIndex)}<span className="typewriter-caret" aria-hidden="true" />
        </h1>
        <p className="landing-copy">Share tiny adventures, meet new furry friends, and make the internet a little kinder.</p>
        <div className="landing-actions">
          <Link className="btn btn-primary landing-button" to="/login">Log in</Link>
          <Link className="btn btn-soft landing-button" to="/signup">Join the zoo</Link>
        </div>
      </section>
      <div className="landing-footer">Made for paws, whiskers, wings, and wonderful chaos.</div>
    </main>
  );
}
