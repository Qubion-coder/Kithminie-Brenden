import React, { useState } from 'react';

interface WelcomeScreenProps {
  onComplete: () => void;
  onMusicStart?: () => void;
  readyToTransition?: boolean;
}

export function WelcomeScreen({ onComplete, onMusicStart, readyToTransition = true }: WelcomeScreenProps) {
  const [exiting, setExiting] = useState(false);

  const startEntry = () => {
    if (!readyToTransition) return;
    
    setExiting(true);
    if (onMusicStart) {
      onMusicStart();
    }
    setTimeout(() => onComplete(), 500); // Wait for fade out
  };

  return (
    <>
      <style>{`
        .welcome-scene {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease;
        }
        .welcome-scene.is-exiting {
          opacity: 0;
          pointer-events: none;
        }
        .play-button {
          padding: 16px 32px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          background: rgba(0, 0, 0, 0.3);
          color: white;
          font-size: 20px;
          cursor: pointer;
          border-radius: 4px;
          font-family: var(--font-serif), serif;
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
      `}</style>
      <div className={`welcome-scene ${exiting ? 'is-exiting' : ''}`}>
        <button 
          className="play-button" 
          onClick={startEntry}
          disabled={!readyToTransition}
        >
          {readyToTransition ? "Click to View Invitation" : "Loading..."}
        </button>
      </div>
    </>
  );
}
