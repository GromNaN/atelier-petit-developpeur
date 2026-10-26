import React from 'react';
import { Direction } from '../types';

interface RobotSpriteProps {
  direction?: Direction;
  isMoving?: boolean;
  isJumping?: boolean;
  isCelebrating?: boolean;
  isMudSplashed?: boolean;
  hasKey?: boolean;
  size?: number;
}

export const RobotSprite: React.FC<RobotSpriteProps> = ({
  direction = 'right',
  isMoving = false,
  isJumping = false,
  isCelebrating = false,
  isMudSplashed = false,
  hasKey = false,
  size = 56,
}) => {
  // Rotation degrees based on direction
  const rotationMap: Record<Direction, number> = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
  };

  const rot = rotationMap[direction];

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform duration-300 ${
        isCelebrating
          ? 'animate-bounce'
          : isMudSplashed
          ? 'animate-wiggle'
          : isMoving
          ? 'scale-105'
          : ''
      }`}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rot}deg) ${isJumping ? 'scale(1.25) translateY(-8px)' : ''}`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antennas */}
        <line x1="50" y1="20" x2="50" y2="8" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="8" r="5" fill="#f59e0b" className={isMoving ? 'animate-ping' : ''} />

        {/* Wheels / Treads */}
        <rect x="22" y="78" width="56" height="14" rx="7" fill="#334155" />
        <circle cx="32" cy="85" r="4" fill="#94a3b8" />
        <circle cx="50" cy="85" r="4" fill="#94a3b8" />
        <circle cx="68" cy="85" r="4" fill="#94a3b8" />

        {/* Robot Main Body */}
        <rect x="24" y="44" width="52" height="36" rx="10" fill="#0284c7" />
        {/* Screen/Chest plate */}
        <rect x="32" y="52" width="36" height="20" rx="6" fill="#0f172a" />
        {/* Heart / Battery indicator on chest */}
        <path
          d="M 44 58 L 52 64 L 46 68 L 56 68"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Robot Head */}
        <rect x="28" y="18" width="44" height="30" rx="8" fill="#38bdf8" />
        {/* Face screen */}
        <rect x="34" y="24" width="32" height="18" rx="5" fill="#0f172a" />

        {/* Big expressive glowing eyes */}
        {isCelebrating ? (
          // Happy smiling eyes ^_^
          <>
            <path d="M 38 34 Q 42 28 46 34" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 54 34 Q 58 28 62 34" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : isMudSplashed ? (
          // Surprised shocked dizzy eyes @ _ @
          <>
            <circle cx="42" cy="33" r="5" fill="#f59e0b" />
            <circle cx="42" cy="33" r="2" fill="#0f172a" />
            <circle cx="58" cy="33" r="5" fill="#f59e0b" />
            <circle cx="58" cy="33" r="2" fill="#0f172a" />
          </>
        ) : (
          // Normal friendly big pupils
          <>
            <circle cx="42" cy="33" r="4" fill="#38bdf8" />
            <circle cx="43" cy="32" r="1.5" fill="#ffffff" />
            <circle cx="58" cy="33" r="4" fill="#38bdf8" />
            <circle cx="59" cy="32" r="1.5" fill="#ffffff" />
          </>
        )}

        {/* Mud splatters on robot body when splashed */}
        {isMudSplashed && (
          <g opacity="0.95">
            <circle cx="34" cy="56" r="5.5" fill="#5c2a07" />
            <circle cx="65" cy="50" r="4.5" fill="#78350f" />
            <circle cx="48" cy="74" r="5" fill="#5c2a07" />
            <circle cx="30" cy="24" r="3.5" fill="#92400e" />
            <circle cx="66" cy="22" r="3" fill="#78350f" />
            <path d="M 40 85 Q 45 88 50 85 Q 55 88 60 85" stroke="#5c2a07" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* Robot Hands/Arms */}
        <rect x="16" y="50" width="8" height="14" rx="4" fill="#0284c7" />
        <rect x="76" y="50" width="8" height="14" rx="4" fill="#0284c7" />
      </svg>

      {/* Held key badge if robot collected it */}
      {hasKey && (
        <span
          className="absolute -top-1 -right-1 text-base transform -rotate-45 drop-shadow"
          role="img"
          aria-label="Clé magique"
        >
          🔑
        </span>
      )}
    </div>
  );
};
