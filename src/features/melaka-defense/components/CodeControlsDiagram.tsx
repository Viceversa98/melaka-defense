/**
 * SVG diagram: links player functions (cannon1–3) to on-screen fort slots and the radar strip.
 * Renders as a responsive image (vector) for the how-to-play guide.
 */
export const CodeControlsDiagram = () => (
  <figure className="mx-auto w-full max-w-2xl rounded-xl border border-cyan-500/25 bg-slate-900/90 p-3 shadow-lg sm:p-4">
    <svg
      viewBox="0 0 640 300"
      className="h-auto w-full text-slate-100"
      role="img"
      aria-labelledby="code-controls-diagram-title"
    >
      <title id="code-controls-diagram-title">
        Your JavaScript functions cannon1, cannon2, and cannon3 each control one physical cannon slot on the fort.
        Ships appear on the radar strip to the right. radar and artillery in your code refer to the whole battlefield.
      </title>

      <defs>
        <linearGradient id="radarSea" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#164e63" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Radar / strait background */}
      <rect x="168" y="32" width="448" height="236" fill="url(#radarSea)" rx="8" stroke="#22d3ee" strokeOpacity="0.35" />
      <text x="392" y="24" textAnchor="middle" fill="#a5f3fc" fontSize="11" fontFamily="ui-sans-serif, system-ui" letterSpacing="0.15em">
        RADAR STRAIT (ships move left toward fort)
      </text>

      {/* Simplified ship */}
      <g transform="translate(420, 118)" filter="url(#softGlow)">
        <ellipse cx="0" cy="0" rx="36" ry="14" fill="#f97316" fillOpacity="0.85" />
        <rect x="-28" y="-8" width="56" height="16" rx="3" fill="#ea580c" />
      </g>
      <text x="420" y="158" textAnchor="middle" fill="#fed7aa" fontSize="10" fontFamily="ui-sans-serif, system-ui">
        Hostile ships
      </text>

      {/* Fort column */}
      <rect x="24" y="32" width="120" height="236" fill="#0c1222" rx="8" stroke="#fbbf24" strokeOpacity="0.4" />
      <text x="84" y="58" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="bold" fontFamily="ui-sans-serif, system-ui">
        FORT
      </text>
      <text x="84" y="74" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="ui-sans-serif, system-ui">
        X = 0
      </text>

      {/* Three cannon slots (top → bottom = cannon1 → cannon3) */}
      {[
        { y: 96, n: "1", fn: "cannon1" },
        { y: 152, n: "2", fn: "cannon2" },
        { y: 208, n: "3", fn: "cannon3" },
      ].map(({ y, n, fn }) => (
        <g key={fn}>
          <rect x="44" y={y - 22} width="80" height="44" rx="6" fill="#1e293b" stroke="#22d3ee" strokeOpacity="0.5" />
          <text x="84" y={y - 4} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="600" fontFamily="ui-monospace, monospace">
            Slot {n}
          </text>
          <text x="84" y={y + 10} textAnchor="middle" fill="#67e8f9" fontSize="9" fontFamily="ui-monospace, monospace">
            {fn}(…)
          </text>
          <line
            x1="124"
            y1={y}
            x2="168"
            y2={y}
            stroke="#22d3ee"
            strokeWidth="2"
            strokeOpacity="0.6"
            strokeDasharray="4 3"
          />
        </g>
      ))}

      {/* Callout: shared API */}
      <rect x="200" y="196" width="400" height="84" rx="8" fill="#020617" fillOpacity="0.92" stroke="#64748b" strokeOpacity="0.6" />
      <text x="216" y="216" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="ui-sans-serif, system-ui">
        Same radar for every cannon:
      </text>
      <text x="216" y="232" fill="#94a3b8" fontSize="9" fontFamily="ui-sans-serif, system-ui">
        <tspan fill="#67e8f9" fontFamily="ui-monospace, monospace">
          radar.getShips()
        </tspan>
        <tspan> — all ships on the strait</tspan>
      </text>
      <text x="216" y="248" fill="#94a3b8" fontSize="9" fontFamily="ui-sans-serif, system-ui">
        <tspan fill="#67e8f9" fontFamily="ui-monospace, monospace">
          artillery.fireRentaka
        </tspan>
        <tspan> / </tspan>
        <tspan fill="#fdba74" fontFamily="ui-monospace, monospace">
          fireMeriam
        </tspan>
        <tspan> — fired from the slot whose function is running</tspan>
      </text>
      <text x="216" y="264" fill="#94a3b8" fontSize="9" fontFamily="ui-sans-serif, system-ui">
        <tspan fill="#67e8f9" fontFamily="ui-monospace, monospace">
          command.log
        </tspan>
        <tspan> — battle log on the radar</tspan>
      </text>
    </svg>
    <figcaption className="mt-3 text-center text-xs leading-relaxed text-slate-400 sm:text-sm">
      <strong className="text-slate-200">Top to bottom on the fort:</strong>{" "}
      <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-200">cannon1</code>,{" "}
      <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-200">cannon2</code>,{" "}
      <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-cyan-200">cannon3</code> — each runs once per tick
      and only controls that slot&apos;s firing. The Visual editor has one block list per cannon for the same mapping.
    </figcaption>
  </figure>
);
