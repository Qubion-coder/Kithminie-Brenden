import React, { useRef, useState } from 'react';

interface VideoIntroProps {
  onComplete: () => void;
  onMusicStart?: () => void;
  readyToTransition?: boolean;
}

export function VideoIntro({ onComplete, onMusicStart, readyToTransition = true }: VideoIntroProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startVideo = () => {
    if (!readyToTransition) return;
    
    if (!hasStarted) {
      setHasStarted(true);
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const handleVideoEnded = () => {
    setExiting(true);
    if (onMusicStart) {
      onMusicStart();
    }
    setTimeout(() => onComplete(), 500); // Wait for fade out
  };

  return (
    <>
      <style>{`
        .video-scene {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease;
        }
        .video-scene.is-exiting {
          opacity: 0;
          pointer-events: none;
        }
        .intro-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .play-button-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.4);
          color: white;
          cursor: pointer;
          font-family: var(--font-serif), serif;
          z-index: 10;
        }
        .play-button {
          padding: 16px 32px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          background: rgba(0, 0, 0, 0.3);
          color: white;
          font-size: 20px;
          cursor: pointer;
          border-radius: 4px;
          font-family: inherit;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }
        .play-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }
        .play-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .skip-button {
          position: absolute;
          bottom: 40px;
          right: 40px;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.4);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--font-serif), serif;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .skip-button:hover {
          background: rgba(0, 0, 0, 0.6);
          border-color: rgba(255, 255, 255, 0.6);
        }
        @media (max-width: 600px) {
          .skip-button {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
      <div className={`video-scene ${exiting ? 'is-exiting' : ''}`}>
        <video 
          ref={videoRef}
          className="intro-video"
          src="/intro.mp4"
          playsInline
          onEnded={handleVideoEnded}
        />
        
        {!hasStarted && (
          <div className="play-button-overlay" onClick={startVideo}>
            <button 
              className="play-button" 
              onClick={(e) => { e.stopPropagation(); startVideo(); }}
              disabled={!readyToTransition}
            >
              {readyToTransition ? "Click to View Invitation" : "Loading..."}
            </button>
          </div>
        )}

        {hasStarted && (
          <button className="skip-button" onClick={handleVideoEnded}>
            Skip Intro
          </button>
        )}
      </div>
    </>
  );
}
