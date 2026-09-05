import { useEffect, useRef } from "react";
import { Dog, Hand, X } from "lucide-react";

export default function DisclaimerOverlay({ onClose }) {
  const mosquitoAudioRef = useRef(null);

  useEffect(() => {
    const audio = mosquitoAudioRef.current;
    audio?.play().catch(() => {
      // Browsers may wait for the first disclaimer interaction before playing audio.
    });

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  const startMosquitoAudio = () => {
    mosquitoAudioRef.current?.play().catch(() => {});
  };

  const closeDisclaimer = () => {
    const audio = mosquitoAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    onClose();
  };

  return (
    <div className="admin-disclaimer-backdrop" onPointerDown={startMosquitoAudio} role="dialog" aria-modal="true" aria-labelledby="admin-disclaimer-title">
      <audio ref={mosquitoAudioRef} autoPlay loop preload="auto">
        <source src="/mosquito.mp3" type="audio/mpeg" />
        <source src="/mosquito.aac" type="audio/aac" />
      </audio>
      <section className="admin-disclaimer">
        <button className="admin-disclaimer-close" type="button" onClick={closeDisclaimer} aria-label="Close admin disclaimer" title="Close disclaimer">
          <X size={19} />
        </button>
        <div className="admin-animal" aria-hidden="true">
          <div className="admin-animal-head"><Dog size={58} strokeWidth={1.8} /></div>
          <div className="admin-praying-hands"><Hand size={38} /><Hand size={38} /></div>
        </div>
        <p className="admin-eyebrow">A message from Admin</p>
        <h1 id="admin-disclaimer-title">Before you enter the zoo...</h1>
        <p className="admin-malayalam">കൊതുകിനെ പോലും കൊല്ലരുത്, പറത്തിവിടാനെ പാടുള്ളു</p>
        <p className="admin-english">“Killing mosquitoes is injurious to health. So remember to surrender your blood peacefully to avoid facing legal charges.”</p>
        <p className="admin-signoff">~Admin</p>
        <button className="btn btn-primary admin-enter" type="button" onClick={closeDisclaimer}>I understand, let me in</button>
      </section>
    </div>
  );
}
