import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bird, Cat, Dog, Heart, PawPrint, Sparkles } from "lucide-react";

const lines = ["Welcome to e-മൃഗാലയം", "First online മൃഗശാല"];

export default function Landing() {
  const [lineIndex, setLineIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const audioRef = useRef(null);

  const startMusic = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch {
      // Browsers may require the first user gesture before allowing sound.
    }
  };

  useEffect(() => {
    audioRef.current?.play().catch(() => {
      // Browsers may require the first user gesture before allowing sound.
    });
  }, []);

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

  return (
    <main className="landing-page" onPointerDown={startMusic}>
      <div className="pet-skyline" aria-hidden="true">
        <span className="sky-pet sky-cat"><Cat size={42} /></span>
        <span className="sky-pet sky-dog"><Dog size={48} /></span>
        <span className="sky-pet sky-bird"><Bird size={35} /></span>
        <span className="sky-heart"><Heart size={20} fill="currentColor" /></span>
      </div>
      <div className="landing-paw paw-one"><PawPrint size={38} /></div>
      <div className="landing-paw paw-two"><PawPrint size={25} /></div>
      <div className="landing-paw paw-three"><PawPrint size={31} /></div>
      <audio ref={audioRef} src="/bgm.mpeg" loop autoPlay preload="auto" />

      <section className="landing-content">
        <div className="landing-badge"><Sparkles size={16} /> A cheerful place for every creature</div>
        <div className="landing-mark"><PawPrint size={34} /></div>
        <p className="landing-kicker">e-മൃഗാലയം</p>
        <h1 className="typewriter-line" aria-live="polite">
          {lines[lineIndex].slice(0, letterIndex)}<span className="typewriter-caret" aria-hidden="true" />
        </h1>
        <p className="landing-copy">Share tiny adventures, meet new furry friends, and make the internet a little kinder.</p>
        <div className="landing-actions">
          <Link className="btn btn-primary landing-button" to="/login">Dig in</Link>
          <Link className="btn btn-soft landing-button" to="/signup">Join the community</Link>
        </div>
        <div className="landing-trail" aria-hidden="true"><PawPrint size={16} /><PawPrint size={22} /><PawPrint size={14} /><PawPrint size={25} /></div>
      </section>
      <div className="landing-footer">Made for paws, whiskers, wings, and wonderful chaos.</div>
    </main>
  );
}
