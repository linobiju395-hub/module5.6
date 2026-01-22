
import React from 'react';

interface BirdProps {
  isEating: boolean;
  isFlapping?: boolean;
  className?: string;
}

export const CartoonBat: React.FC<BirdProps> = ({ isEating, isFlapping, className }) => (
  <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl transition-all duration-700 ${isEating ? 'scale-110' : ''} ${className}`}>
    {isEating && <MunchParticles />}
    <g transform="translate(0, 20)">
      <path 
        d="M40 35 C20 40, 5 25, 2 15 C5 25, 15 30, 25 30 C15 35, 10 45, 15 50 C20 45, 30 40, 40 35" 
        fill="#D2B48C" 
        className={`origin-[40px_35px] ${isFlapping ? 'animate-wing-fast' : 'animate-wing-left'}`} 
      />
      <path 
        d="M60 35 C80 40, 95 25, 98 15 C95 25, 85 30, 75 30 C85 35, 90 45, 85 50 C80 45, 70 40, 60 35" 
        fill="#D2B48C" 
        className={`origin-[60px_35px] ${isFlapping ? 'animate-wing-fast-rev' : 'animate-wing-right'}`} 
      />
      <ellipse cx="50" cy="40" rx="12" ry="18" fill="#C19A6B" />
      <circle cx="50" cy="28" r="14" fill="#D2B48C" />
      <g>
        <path d="M40 20 L36 10 L46 22 Z" fill="#D2B48C" />
        <path d="M60 20 L64 10 L54 22 Z" fill="#D2B48C" />
      </g>
      <g>
        <circle cx="44" cy="28" r="5" fill="white" />
        <circle cx="44" cy="28" r="2.5" fill="black" />
        <circle cx="56" cy="28" r="5" fill="white" />
        <circle cx="56" cy="28" r="2.5" fill="black" />
      </g>
      <path d={isEating ? "M44 34 Q50 44 56 34" : "M44 34 Q50 38 56 34"} fill="none" stroke="#5D4037" strokeWidth="1.5" />
    </g>
  </svg>
);

export const CartoonOwl: React.FC<BirdProps> = ({ isEating, isFlapping, className }) => (
  <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl transition-all duration-700 ${isEating ? 'scale-110' : ''} ${className}`}>
    <g transform="translate(50 50) scale(0.7) translate(-50 -50)">
      <ellipse cx="50" cy="65" rx="30" ry="32" fill="#8B5E3C" />
      <ellipse cx="50" cy="68" rx="20" ry="24" fill="#F5DEB3" />
      <path d="M25 60 Q10 40 15 80" fill="#704214" className={isFlapping ? 'animate-wing-fast' : 'animate-wing-left'} style={{ transformOrigin: '25px 60px' }} />
      <path d="M75 60 Q90 40 85 80" fill="#704214" className={isFlapping ? 'animate-wing-fast-rev' : 'animate-wing-right'} style={{ transformOrigin: '75px 60px' }} />
      <circle cx="50" cy="35" r="28" fill="#8B5E3C" />
      <circle cx="38" cy="32" r="10" fill="white" />
      <circle cx="38" cy="32" r="5" fill="black" />
      <circle cx="62" cy="32" r="10" fill="white" />
      <circle cx="62" cy="32" r="5" fill="black" />
      <path d="M50 35 L44 48 L56 48 Z" fill="#FFA500" />
    </g>
  </svg>
);

export const CartoonParrot: React.FC<BirdProps> = ({ isEating, isFlapping, className }) => (
  <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl transition-all duration-700 ${isEating ? 'scale-110' : ''} ${className}`}>
    <g transform="translate(50 50) scale(0.75) translate(-50 -50)">
      {/* Wing Behind */}
      <path d="M40 50 Q10 45 20 75 Q40 70 40 50" fill="#3B82F6" className={isFlapping ? 'animate-wing-fast' : 'animate-wing-left'} style={{ transformOrigin: '40px 50px' }} />
      {/* Body */}
      <ellipse cx="45" cy="60" rx="20" ry="28" fill="#EF4444" />
      {/* Chest */}
      <ellipse cx="45" cy="62" rx="12" ry="18" fill="#FDE047" opacity="0.8" />
      {/* Head */}
      <circle cx="45" cy="30" r="18" fill="#EF4444" />
      {/* Face Patch */}
      <circle cx="52" cy="28" r="10" fill="white" />
      {/* Eye */}
      <circle cx="54" cy="28" r="4" fill="black" />
      {/* Beak - Fixed with Beak addition */}
      <path d="M60 25 Q75 25 78 35 Q75 45 60 40 Z" fill="#F59E0B" />
      <path d="M60 38 Q70 38 72 42 Q60 45 60 38" fill="#D97706" />
      {/* Main Wing */}
      <path d="M50 50 Q75 45 65 75 Q45 70 50 50" fill="#3B82F6" className={isFlapping ? 'animate-wing-fast-rev' : 'animate-wing-right'} style={{ transformOrigin: '50px 50px' }} />
    </g>
  </svg>
);

const MunchParticles = () => (
  <g>
    <circle cx="50" cy="50" r="3" fill="#ef4444" />
    <circle cx="40" cy="55" r="2.5" fill="#ef4444" />
    <circle cx="60" cy="52" r="2.8" fill="#ef4444" />
  </g>
);
