import { useRef, useEffect, useState } from "react";

/* ── palette ───────────────────────────────────────────── */
const GOLD = [
  [244, 213, 141], // #F4D58D
  [229, 190, 110], // #E5BE6E
  [201, 151, 62], // #C9973E
  [158, 109, 45], // #9E6D2D
];

/* deterministic rng */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1000000) / 1000000;
  };
}

/* ── A path = an invisible curve (chain of control points)
   particles flow ALONG it and ARE the line ──────────────── */
type Path = {
  pts: { x: number; y: number }[]; // normalized 0..1
  width: number; // band thickness px
  layer: number; // 0 back .. 2 front
  density: number; // relative particle count weight
};

type Grain = {
  path: number; // path index
  u: number; // 0..1 progress along path
  off: number; // lateral offset within band (-1..1)
  speed: number;
  size: number;
  alpha: number;
  hue: number;
  tw: number; // twinkle phase
  scatter: number; // current extra scatter
  filtered: boolean;
  flash: number;
  dead: boolean;
};

function AIFilterFlow() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [reduced, setReduced] = useState(false);
  const [markersOn, setMarkersOn] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMarkersOn(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let paths: Path[] = [];
    let grains: Grain[] = [];
    let running = true;
    let inView = true;

    const WALL = 0.52; // wall position (normalized)

    /* build branching flow paths: trunks that split into branches */
    const buildPaths = () => {
      const r = rng(1337);
      const list: Path[] = [];
      const trunks = 5;

      for (let i = 0; i < trunks; i++) {
        const layer = i % 3;
        const startY = 0.12 + (i / (trunks - 1)) * 0.76 + (r() - 0.5) * 0.05;

        // trunk: from left edge to the wall
        const trunkPts: { x: number; y: number }[] = [];
        const segs = 5;
        let y = startY;
        for (let s = 0; s <= segs; s++) {
          const x = (s / segs) * WALL;
          y += (r() - 0.5) * 0.12;
          y = Math.max(0.06, Math.min(0.94, y));
          trunkPts.push({ x, y });
        }
        const endY = trunkPts[trunkPts.length - 1].y;
        list.push({
          pts: trunkPts,
          width: 10 + layer * 6 + r() * 6,
          layer,
          density: 1.1 + r() * 0.5,
        });

        // branches after the wall (1..3), straighter
        const nb = 1 + ((r() * 3) | 0);
        for (let b = 0; b < nb; b++) {
          const bpts: { x: number; y: number }[] = [];
          const bsegs = 4;
          let by = endY;
          const drift = (r() - 0.5) * 0.22;
          for (let s = 0; s <= bsegs; s++) {
            const x = WALL + (s / bsegs) * (1 - WALL) * (0.9 + r() * 0.2);
            by = endY + drift * (s / bsegs) + (r() - 0.5) * 0.02;
            by = Math.max(0.05, Math.min(0.95, by));
            bpts.push({ x, y: by });
          }
          list.push({
            pts: bpts,
            width: 5 + layer * 3 + r() * 3, // thinner, cleaner
            layer,
            density: 0.5 + r() * 0.4,
          });
        }
      }
      paths = list;
    };

    /* sample a point on a path at progress u (0..1) using catmull-like smoothing */
    const sample = (path: Path, u: number) => {
      const pts = path.pts;
      const n = pts.length - 1;
      const fu = Math.max(0, Math.min(0.9999, u)) * n;
      const i = Math.floor(fu);
      const f = fu - i;
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[Math.min(n, i + 1)];
      const p3 = pts[Math.min(n, i + 2)];
      const f2 = f * f;
      const f3 = f2 * f;
      const cx =
        0.5 *
        ((2 * p1.x) +
          (-p0.x + p2.x) * f +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * f2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * f3);
      const cy =
        0.5 *
        ((2 * p1.y) +
          (-p0.y + p2.y) * f +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * f2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * f3);
      return { x: cx, y: cy };
    };

    const spawnGrain = (r: () => number, atStart: boolean): Grain => {
      const pi = (r() * paths.length) | 0;
      const layer = paths[pi].layer;
      return {
        path: pi,
        u: atStart ? -r() * 0.05 : r(),
        off: (r() * 2 - 1),
        speed: (0.0009 + r() * 0.0016) * (0.7 + layer * 0.4),
        size: (layer === 2 ? 1.5 : layer === 1 ? 1.05 : 0.7) * (0.6 + r() * 0.9),
        alpha: (layer === 2 ? 0.95 : layer === 1 ? 0.6 : 0.32) * (0.55 + r() * 0.45),
        hue: (r() * GOLD.length) | 0,
        tw: r() * Math.PI * 2,
        scatter: 0,
        filtered: false,
        flash: 0,
        dead: false,
      };
    };

    const buildGrains = () => {
      const r = rng(99);
      const target = Math.max(900, Math.min(2600, Math.round(W * 4.2)));
      grains = [];
      for (let i = 0; i < target; i++) grains.push(spawnGrain(r, false));
    };

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, W * dpr);
      canvas.height = Math.max(1, H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildPaths();
      buildGrains();
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    const io = new IntersectionObserver(
      ([e]) => (inView = e.isIntersecting),
      { rootMargin: "150px 0px" }
    );
    io.observe(wrap);

    const rrun = rng(555);

    /* ── filter wall (the only stroke element — it's not a flow line) */
    const drawWall = (wx: number, pulse: number) => {
      const top = H * 0.05;
      const bot = H * 0.95;
      const body = ctx.createLinearGradient(wx - 34, 0, wx + 34, 0);
      body.addColorStop(0, "rgba(201,151,62,0)");
      body.addColorStop(0.5, `rgba(244,213,141,${0.07 + pulse * 0.05})`);
      body.addColorStop(1, "rgba(201,151,62,0)");
      ctx.fillStyle = body;
      ctx.fillRect(wx - 34, top, 68, bot - top);

      ctx.strokeStyle = `rgba(244,213,141,${0.28 + pulse * 0.2})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(wx - 14, top);
      ctx.lineTo(wx - 14, bot);
      ctx.moveTo(wx + 14, top);
      ctx.lineTo(wx + 14, bot);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255,240,200,${0.45 + pulse * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx, top);
      ctx.lineTo(wx, bot);
      ctx.stroke();

      ctx.strokeStyle = `rgba(229,190,110,${0.06 + pulse * 0.04})`;
      ctx.lineWidth = 0.6;
      const rows = 22;
      for (let i = 1; i < rows; i++) {
        const gy = top + ((bot - top) / rows) * i;
        const wob = Math.sin(i * 0.6 + pulse * 6) * 2;
        ctx.beginPath();
        ctx.moveTo(wx - 13, gy + wob);
        ctx.lineTo(wx + 13, gy + wob);
        ctx.stroke();
      }
    };

    /* normal at progress u for lateral band offset */
    const normalAt = (path: Path, u: number) => {
      const a = sample(path, u - 0.01);
      const b = sample(path, u + 0.01);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      return { nx: -dy / len, ny: dx / len };
    };

    const renderStatic = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const g of grains) {
        const path = paths[g.path];
        const pos = sample(path, Math.max(0, g.u));
        const nrm = normalAt(path, g.u);
        const bandPx = (path.width / W) * (g.off);
        const x = pos.x * W + nrm.nx * bandPx * W * 0.02 + nrm.nx * g.off * path.width * 0.5;
        const y = pos.y * H + nrm.ny * g.off * path.width * 0.5;
        const c = GOLD[g.hue];
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${g.alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, g.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      drawWall(W * WALL, 0.5);
    };

    if (reduced) {
      renderStatic();
      return () => {
        ro.disconnect();
        io.disconnect();
      };
    }

    let t = 0;

    const frame = () => {
      if (!running) return;
      rafRef.current = requestAnimationFrame(frame);
      if (!inView) return;
      t += 0.016;
      const wx = W * WALL;

      // soft trail fade — transparent (keeps site background visible)
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.34)";
      ctx.fillRect(0, 0, W, H);

      // volumetric glow behind wall
      ctx.globalCompositeOperation = "lighter";
      const rg = ctx.createRadialGradient(wx, H / 2, 0, wx, H / 2, W * 0.6);
      rg.addColorStop(0, "rgba(201,151,62,0.05)");
      rg.addColorStop(0.55, "rgba(201,151,62,0.015)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);

      const pulse = 0.5 + 0.5 * Math.sin(t * 1.6);

      for (const g of grains) {
        const path = paths[g.path];

        // flow along the path
        g.u += g.speed * (60 / 60);
        g.tw += 0.13;

        const pos = sample(path, g.u);
        const onLeft = pos.x < WALL;

        // micro-vortex / scatter — sand breathing
        const breathe =
          Math.sin(t * 1.3 + g.tw) * 0.5 + Math.sin(t * 2.7 + g.path) * 0.5;
        if (onLeft) {
          // chaotic: occasionally fling out, then regather
          g.scatter += (breathe - g.scatter) * 0.05 + (rrun() - 0.5) * 0.06;
        } else {
          // calmer downstream — regather into clean line
          g.scatter += (0 - g.scatter) * 0.08;
        }
        const scatterPx = g.scatter * path.width * 0.45;

        const nrm = normalAt(path, g.u);
        const lateral = g.off * path.width * 0.5 + scatterPx;
        const jitter = (rrun() - 0.5) * (onLeft ? 1.6 : 0.6);

        const x = pos.x * W + nrm.nx * lateral + nrm.nx * jitter;
        const y = pos.y * H + nrm.ny * lateral + nrm.ny * jitter;

        // crossing the wall — filtering
        if (!g.filtered && pos.x >= WALL) {
          g.filtered = true;
          const roll = rrun();
          if (roll < 0.3) {
            g.dead = true; // dissolve
          } else if (roll < 0.55) {
            g.flash = 1;
            g.size *= 1.3;
            g.alpha = Math.min(1, g.alpha + 0.25);
          }
        }
        if (g.flash > 0) g.flash *= 0.9;

        // recycle
        if (g.u > 1.02 || g.dead) {
          Object.assign(g, spawnGrain(rrun, true));
          continue;
        }

        const c = GOLD[g.hue];
        const flick = 0.6 + 0.4 * Math.sin(g.tw * 1.4);
        const a = g.alpha * flick;

        // flash halo
        if (g.flash > 0.05) {
          ctx.fillStyle = `rgba(255,244,214,${g.flash * 0.7})`;
          ctx.beginPath();
          ctx.arc(x, y, g.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // the grain itself (this IS the line)
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
        ctx.beginPath();
        ctx.arc(x, y, g.size, 0, Math.PI * 2);
        ctx.fill();

        // bright core for front layer = crisp readable lines
        if (g.layer === 2) {
          ctx.fillStyle = `rgba(255,244,214,${a * 0.55})`;
          ctx.beginPath();
          ctx.arc(x, y, g.size * 0.42, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawWall(wx, pulse);
      ctx.globalCompositeOperation = "source-over";
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  const markers = [
    { top: "24%", left: "72%", d: 0 },
    { top: "47%", left: "85%", d: 0.3 },
    { top: "68%", left: "70%", d: 0.6 },
    { top: "82%", left: "88%", d: 0.9 },
  ];

  return (
    <div
      ref={wrapRef}
      className="hidden lg:block w-[48%] lg:mr-[-12rem]"
      style={{ position: "relative", height: "560px", overflow: "visible" }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, display: "block" }} />

      {markers.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: m.top,
            left: m.left,
            width: 30,
            height: 30,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(21,21,18,0.55)",
            border: "1px solid rgba(244,213,141,0.55)",
            boxShadow:
              "0 0 16px rgba(229,190,110,0.4), inset 0 0 9px rgba(244,213,141,0.18)",
            backdropFilter: "blur(2px)",
            opacity: markersOn ? 1 : 0,
            transform: markersOn ? "scale(1)" : "scale(0.5)",
            transition: `opacity 1s ease ${m.d}s, transform 1s cubic-bezier(0.2,0.8,0.2,1) ${m.d}s`,
            animation: reduced ? "none" : `aiff-pulse 3.4s ease-in-out ${m.d}s infinite`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3.2 L21.5 20 H2.5 Z"
              stroke="#F4D58D"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="rgba(229,190,110,0.07)"
            />
            <line x1="12" y1="9" x2="12" y2="14" stroke="#F4D58D" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1" fill="#F4D58D" />
          </svg>
        </div>
      ))}

      <style>{`
        @keyframes aiff-pulse {
          0%, 100% { box-shadow: 0 0 16px rgba(229,190,110,0.4), inset 0 0 9px rgba(244,213,141,0.18); }
          50% { box-shadow: 0 0 26px rgba(229,190,110,0.7), inset 0 0 12px rgba(244,213,141,0.3); }
        }
      `}</style>
    </div>
  );
}

export default AIFilterFlow;