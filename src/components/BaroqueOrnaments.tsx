import React from 'react';

interface OrnamentProps {
  className?: string;
}

/**
 * Tapered antique hairline divider with symmetric Baroque central fleuron
 * Inspired by fine classical typography ornaments.
 */
export const BaroqueDivider: React.FC<OrnamentProps & { tone?: 'gold' | 'crimson' }> = ({
  className = '',
  tone = 'gold',
}) => {
  const strokeColor = tone === 'gold' ? '#C8A86B' : '#5C1110';
  const gradId = `taper-${tone}-baroque`;

  return (
    <div className={`w-full flex items-center justify-center pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 640 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[460px] h-6 opacity-75"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0" />
            <stop offset="28%" stopColor={strokeColor} stopOpacity="0.65" />
            <stop offset="50%" stopColor={strokeColor} stopOpacity="1" />
            <stop offset="72%" stopColor={strokeColor} stopOpacity="0.65" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Tapered horizontal hairlines */}
        <line x1="12" y1="14" x2="278" y2="14" stroke={`url(#${gradId})`} strokeWidth="0.9" />
        <line x1="362" y1="14" x2="628" y2="14" stroke={`url(#${gradId})`} strokeWidth="0.9" />

        {/* Left & Right tiny filigree dots */}
        <circle cx="272" cy="14" r="1.4" fill={strokeColor} />
        <circle cx="368" cy="14" r="1.4" fill={strokeColor} />

        {/* Symmetric Baroque scrolls */}
        <path
          d="M282 14 C288 6, 298 6, 304 14 C298 22, 288 22, 282 14 Z"
          stroke={strokeColor}
          strokeWidth="0.95"
        />
        <path
          d="M358 14 C352 6, 342 6, 336 14 C342 22, 352 22, 358 14 Z"
          stroke={strokeColor}
          strokeWidth="0.95"
        />
        <path
          d="M294 14 C299 9, 307 4, 320 4 C333 4, 341 9, 346 14"
          stroke={strokeColor}
          strokeWidth="0.85"
          strokeOpacity="0.8"
        />
        <path
          d="M294 14 C299 19, 307 24, 320 24 C333 24, 341 19, 346 14"
          stroke={strokeColor}
          strokeWidth="0.85"
          strokeOpacity="0.8"
        />

        {/* Central Classical Diamond Crest */}
        <path
          d="M320 6.5 L327.5 14 L320 21.5 L312.5 14 Z"
          stroke={strokeColor}
          strokeWidth="1.1"
          fill="none"
        />
        <path d="M320 10.5 L323.5 14 L320 17.5 L316.5 14 Z" fill={strokeColor} />
      </svg>
    </div>
  );
};

/**
 * Delicate architectural Baroque corner scroll flourish.
 * Pass corner="tl" | "tr" | "bl" | "br" to orient cleanly in any frame.
 */
export const BaroqueCorner: React.FC<
  OrnamentProps & { corner?: 'tl' | 'tr' | 'bl' | 'br'; tone?: 'gold' | 'crimson' }
> = ({ className = '', corner = 'tl', tone = 'gold' }) => {
  const strokeColor = tone === 'gold' ? '#C8A86B' : '#5C1110';
  const flipMap = {
    tl: '',
    tr: 'scale-x-[-1]',
    bl: 'scale-y-[-1]',
    br: 'scale-x-[-1] scale-y-[-1]',
  };

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-9 h-9 pointer-events-none select-none ${flipMap[corner]} ${className}`}
      aria-hidden="true"
    >
      {/* Crisp architectural L-frame */}
      <path d="M2 44 V2 H44" stroke={strokeColor} strokeWidth="1" strokeOpacity="0.65" />
      <path d="M7 34 V7 H34" stroke={strokeColor} strokeWidth="0.7" strokeOpacity="0.38" />
      {/* Classical curved scroll leaf */}
      <path
        d="M7 22 C7 13, 13 7, 22 7"
        stroke={strokeColor}
        strokeWidth="0.95"
        strokeOpacity="0.85"
      />
      <path
        d="M2 15 C8 15, 15 8, 15 2"
        stroke={strokeColor}
        strokeWidth="0.8"
        strokeOpacity="0.55"
      />
      {/* End pearls */}
      <circle cx="44" cy="2" r="1.4" fill={strokeColor} fillOpacity="0.85" />
      <circle cx="2" cy="44" r="1.4" fill={strokeColor} fillOpacity="0.85" />
      <path d="M12 12 L15 15 L12 18 L9 15 Z" fill={strokeColor} fillOpacity="0.7" />
    </svg>
  );
};

/**
 * Ultra-subtle letterpress ornamental crest watermark for parchment sections.
 */
export const ParchmentCrestWatermark: React.FC<OrnamentProps> = ({ className = '' }) => (
  <svg
    viewBox="0 0 220 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    <circle cx="110" cy="110" r="98" stroke="#5C1110" strokeWidth="0.7" strokeDasharray="3 5" />
    <circle cx="110" cy="110" r="84" stroke="#5C1110" strokeWidth="0.8" />
    <path
      d="M110 14 L122 98 L206 110 L122 122 L110 206 L98 122 L14 110 L98 98 Z"
      stroke="#5C1110"
      strokeWidth="0.85"
    />
    <path
      d="M110 42 C135 66, 154 85, 178 110 C154 135, 135 154, 110 178 C85 154, 66 135, 42 110 C66 85, 85 66, 110 42 Z"
      stroke="#9E4224"
      strokeWidth="0.8"
    />
    <circle cx="110" cy="110" r="12" stroke="#5C1110" strokeWidth="0.9" />
    <circle cx="110" cy="110" r="3" fill="#5C1110" />
  </svg>
);