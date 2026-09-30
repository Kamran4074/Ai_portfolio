const NODES = [
  { x: 8, y: 18 }, { x: 22, y: 42 }, { x: 12, y: 70 }, { x: 34, y: 12 },
  { x: 40, y: 55 }, { x: 30, y: 85 }, { x: 58, y: 22 }, { x: 52, y: 68 },
  { x: 68, y: 40 }, { x: 78, y: 15 }, { x: 88, y: 60 }, { x: 74, y: 82 },
  { x: 92, y: 30 }, { x: 60, y: 90 }, { x: 15, y: 95 },
]

const EDGES = [
  [0, 1], [1, 2], [1, 3], [1, 4], [4, 5], [3, 6], [4, 7], [6, 7],
  [6, 8], [7, 8], [8, 9], [8, 11], [9, 10], [9, 12], [10, 11], [10, 12],
  [11, 13], [5, 13], [2, 5], [5, 14],
]

export default function NetworkBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="url(#edge-gradient)"
          strokeWidth="0.15"
        />
      ))}
      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r="0.5"
          fill="#a78bfa"
          className="animate-pulse"
          style={{ animationDelay: `${(i % 5) * 0.4}s`, animationDuration: '3s' }}
        />
      ))}
      <defs>
        <linearGradient id="edge-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  )
}
