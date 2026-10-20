import { useState } from 'react';

/**
 * Arrière-plan de la section d'accueil.
 * Affiche la photographie communautaire configurée (public/images/hero-communaute.jpg
 * ou URL définie dans les paramètres). Tant qu'aucune photo autorisée n'est
 * fournie, une illustration vectorielle d'assemblée est utilisée.
 */
export function HeroBackdrop({ src }: { src: string }) {
  const [failed, setFailed] = useState(!src);
  return (
    <div className="absolute inset-0" aria-hidden>
      {!failed && (
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" onError={() => setFailed(true)} />
      )}
      {failed && <CrowdIllustration />}
      <div className="absolute inset-0 bg-gradient-to-r from-night-950 via-night-900/85 to-night/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-night-950/50" />
      {/* Halos lumineux animés et trame fine. */}
      <div className="absolute -left-[10%] top-[8%] h-[38rem] w-[38rem] animate-aurora rounded-full bg-gold/20 blur-[130px]" />
      <div className="absolute right-[-8%] top-[-10%] h-[34rem] w-[34rem] animate-aurora rounded-full bg-[#3b5ea8]/30 blur-[130px] [animation-delay:-9s]" />
      <div className="absolute inset-0 bg-grid opacity-50 mask-radial" />
      <div className="absolute inset-0 bg-noise opacity-[0.06] mix-blend-overlay" />
    </div>
  );
}

function CrowdIllustration() {
  // Assemblée stylisée : rangées de silhouettes baignées d'une lumière dorée.
  const rows = [
    { y: 640, r: 34, gap: 92, o: 0.95, shift: 0 },
    { y: 560, r: 28, gap: 76, o: 0.75, shift: 38 },
    { y: 492, r: 23, gap: 62, o: 0.55, shift: 10 },
    { y: 436, r: 19, gap: 51, o: 0.4, shift: 30 },
    { y: 390, r: 15, gap: 42, o: 0.28, shift: 5 },
  ];
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 760" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="glow" cx="70%" cy="35%" r="60%">
          <stop offset="0" stopColor="#D4AF62" stopOpacity=".55" />
          <stop offset=".35" stopColor="#D4AF62" stopOpacity=".12" />
          <stop offset="1" stopColor="#101B33" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#142640" />
          <stop offset="1" stopColor="#0B1426" />
        </linearGradient>
        <linearGradient id="person" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A4570" />
          <stop offset="1" stopColor="#0B1426" />
        </linearGradient>
      </defs>
      <rect width="1600" height="760" fill="url(#sky)" />
      <rect width="1600" height="760" fill="url(#glow)" />
      {[180, 260, 340, 420].map((r, i) => (
        <circle key={r} cx="1120" cy="250" r={r} fill="none" stroke="#D4AF62" strokeOpacity={0.14 - i * 0.025} />
      ))}
      {[...rows].reverse().map((row, ri) => (
        <g key={ri} opacity={row.o}>
          {Array.from({ length: Math.ceil(1700 / row.gap) }).map((_, i) => {
            const x = i * row.gap + row.shift - 40 + ((i * 37) % 11);
            const r = row.r * (0.9 + ((i * 13) % 7) / 30);
            return (
              <g key={i}>
                <ellipse cx={x} cy={row.y - r * 1.9} rx={r * 0.62} ry={r * 0.74} fill="url(#person)" />
                <path d={`M${x - r * 1.35} ${row.y + r * 2} Q${x - r * 1.3} ${row.y - r * 0.9} ${x} ${row.y - r * 0.95} Q${x + r * 1.3} ${row.y - r * 0.9} ${x + r * 1.35} ${row.y + r * 2} Z`} fill="url(#person)" />
                <ellipse cx={x + r * 0.18} cy={row.y - r * 2.15} rx={r * 0.22} ry={r * 0.3} fill="#D4AF62" opacity=".10" />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
