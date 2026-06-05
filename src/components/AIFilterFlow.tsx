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
  clean?: boolean; // true = already-filtered straight stream (after wall)
  far?: boolean; // true = distant background stream (thin, dim)
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
  hx: number; // smoothed cursor-push offset x (eases back to 0)
  hy: number; // smoothed cursor-push offset y
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
    let PAD = 70; // top headroom (px)
    const vy = (frac: number) => PAD + frac * (H - PAD); // y from fraction of usable area
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let paths: Path[] = [];
    let grains: Grain[] = [];
    let running = true;
    let inView = true;

    // cursor (canvas-local px); -9999 = no cursor
    let mx = -9999;
    let my = -9999;
    const MOUSE_R = 70; // radius of the avoided area (px)
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    const WALL = 0.3; // wall position (normalized, fraction of full-width canvas)

    /* build flow paths:
       BEFORE wall — a real branching tree (trunks → smaller child branches,
       splits, forks). Children are always thinner than their parent.
       AFTER wall — clean straight filtered streams, no branching. */
    const buildPaths = () => {
      const list: Path[] = [];

      const TRUNK_W = 5.4; // base trunk thickness
      const CHILD_W = 3.12; // child branch thickness

      // build a smooth segment from (x0,y0) to (x1,y1) with optional bow (curve)
      const seg = (
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        bow: number,
        width: number,
        layer: number
      ) => {
        const pts: { x: number; y: number }[] = [];
        const n = 6;
        for (let s = 0; s <= n; s++) {
          const tt = s / n;
          const x = x0 + (x1 - x0) * tt;
          // sine bow for organic curvature
          const y = y0 + (y1 - y0) * tt + Math.sin(tt * Math.PI) * bow;
          pts.push({ x, y: Math.max(0.04, Math.min(0.96, y)) });
        }
        list.push({ pts, width, layer, density: 0.5 + width * 0.12 });
      };

      // ── distant background streams (thin, dim, far away) — left → wall ──
      const fr = rng(4242);
      const farCount = 9;
      for (let i = 0; i < farCount; i++) {
        const y0 = 0.06 + (i / (farCount - 1)) * 0.88 + (fr() - 0.5) * 0.03;
        const startX = -0.02 + fr() * 0.06;
        const pts: { x: number; y: number }[] = [];
        const n = 7;
        let yy = y0;
        for (let s = 0; s <= n; s++) {
          const x = startX + ((WALL - startX) * s) / n;
          yy += (fr() - 0.5) * 0.05;
          yy = Math.max(0.03, Math.min(0.97, yy));
          pts.push({ x, y: yy });
        }
        list.push({
          pts,
          width: 1.1 + fr() * 0.6, // very thin
          layer: 0,
          density: 0.45,
          far: true,
        });
      }

      // 6 evenly spaced columns/trunks on the left edge
      const cols = 6;
      const colY = (i: number) => 0.1 + (i / (cols - 1)) * 0.8;
      const sx = 0.03; // start x — at the right edge/contour of the card
      // straight parallel run: first ~1/5 of the path is perfectly horizontal
      const px = sx + (WALL - sx) * 0.2;

      // column 1 — straight start, then gently curves a bit upward
      {
        const y = colY(0);
        seg(sx, y, px, y, 0, TRUNK_W, 0); // parallel run
        seg(px, y, WALL, y - 0.05, -0.05, TRUNK_W, 0);
      }

      // column 2 — straight start, then splits in the middle into two
      {
        const y = colY(1);
        const mx = sx + (WALL - sx) * 0.5;
        seg(sx, y, px, y, 0, TRUNK_W, 1); // parallel run
        seg(px, y, mx, y, 0.02, TRUNK_W, 1); // trunk to split point
        seg(mx, y, WALL, y - 0.08, -0.04, CHILD_W, 1); // upper branch
        seg(mx, y, WALL, y + 0.08, 0.04, CHILD_W, 1); // lower branch
      }

      // column 3 — straight start, then early thin branch + a mid split
      {
        const y = colY(2);
        const ex = sx + (WALL - sx) * 0.3; // early branch point (after parallel run)
        const mx = sx + (WALL - sx) * 0.55; // mid split point
        seg(sx, y, px, y, 0, TRUNK_W, 2); // parallel run
        seg(px, y, mx, y, 0.02, TRUNK_W, 2); // trunk to split
        seg(ex, y, WALL, y - 0.14, -0.05, CHILD_W * 0.8, 2); // early thin branch up
        seg(mx, y, WALL, y - 0.04, -0.02, CHILD_W, 2); // mid upper
        seg(mx, y, WALL, y + 0.1, 0.04, CHILD_W, 2); // mid lower
      }

      // column 4 — straight start, then no branches, straight-ish
      {
        const y = colY(3);
        seg(sx, y, px, y, 0, TRUNK_W, 0); // parallel run
        seg(px, y, WALL, y + 0.04, 0.03, TRUNK_W, 0);
      }

      // column 5 — straight start, then three branches
      {
        const y = colY(4);
        const ex = sx + (WALL - sx) * 0.32;
        const mx = sx + (WALL - sx) * 0.6;
        seg(sx, y, px, y, 0, TRUNK_W, 1); // parallel run
        seg(px, y, mx, y, -0.02, TRUNK_W, 1);
        seg(ex, y, WALL, y + 0.13, 0.05, CHILD_W * 0.8, 1); // early thin branch down
        seg(mx, y, WALL, y - 0.07, -0.03, CHILD_W, 1);
        seg(mx, y, WALL, y + 0.04, 0.02, CHILD_W, 1);
      }

      // column 6 — straight start, then two branches
      {
        const y = colY(5);
        const ex = px; // branches right after the parallel run
        seg(sx, y, ex, y, 0, TRUNK_W, 2); // parallel run (= split point)
        seg(ex, y, WALL, y - 0.06, -0.03, CHILD_W, 2); // upper
        seg(ex, y, WALL, y + 0.06, 0.03, CHILD_W, 2); // lower
      }

      // ── AFTER wall: clean, straight, filtered streams (no branching) ──
      const cleanStreams = 6;
      for (let i = 0; i < cleanStreams; i++) {
        const layer = i % 3;
        const y0 = 0.1 + (i / (cleanStreams - 1)) * 0.8;
        const pts: { x: number; y: number }[] = [];
        const n = 4;
        for (let s = 0; s <= n; s++) {
          const x = WALL + (s / n) * (1 - WALL) * 1.05;
          pts.push({ x, y: y0 });
        }
        list.push({
          pts,
          width: (2.9 + layer * 1.2) * 1.2, // 1.2x thicker, clean
          layer,
          density: 0.85, // denser = brighter, crisper line
          clean: true,
        });
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

    let densSum = 0;
    const pickPath = (r: () => number) => {
      let acc = r() * densSum;
      for (let i = 0; i < paths.length; i++) {
        acc -= paths[i].density;
        if (acc <= 0) return i;
      }
      return paths.length - 1;
    };

    const spawnGrain = (r: () => number, atStart: boolean): Grain => {
      const pi = pickPath(r);
      const path = paths[pi];
      const layer = path.layer;
      return {
        path: pi,
        u: atStart ? -r() * 0.05 : r(),
        off: (r() * 2 - 1),
        speed: (0.0009 + r() * 0.0016) * (0.7 + layer * 0.4) * (path.far ? 0.7 : 1),
        size: (layer === 2 ? 1.5 : layer === 1 ? 1.05 : 0.7) * (0.6 + r() * 0.9) * (path.far ? 0.5 : 1) * (path.clean ? 1.2 : 1),
        alpha: (layer === 2 ? 0.95 : layer === 1 ? 0.6 : 0.32) * (0.55 + r() * 0.45) * (path.far ? 0.4 : 1) * (path.clean ? 1.5 : 1),
        hue: (r() * GOLD.length) | 0,
        tw: r() * Math.PI * 2,
        scatter: 0,
        hx: 0,
        hy: 0,
        filtered: !!path.clean, // clean streams are born already filtered
        flash: 0,
        dead: false,
      };
    };

    const buildGrains = () => {
      const r = rng(99);
      densSum = paths.reduce((a, p) => a + p.density, 0);
      const target = Math.max(900, Math.min(2600, Math.round(W * 4.2)));
      grains = [];
      for (let i = 0; i < target; i++) grains.push(spawnGrain(r, false));
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      PAD = 70; // empty headroom at the top so the trapezoid's top isn't clipped
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, W * dpr);
      canvas.height = Math.max(1, H * dpr);
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
      // thicker wall, with perspective: left side "far" (shorter),
      // right side "near" (taller) → trapezoid widening downward-right.
      const halfBody = 38; // body half-thickness
      const halfEdge = 19; // edge lines half-thickness (a bit wider)

      // left = far (short), right = near (tall) — kept inside the canvas
      // so the closed top/bottom edges are visible
      const topL = vy(0.04);
      const botL = vy(0.98);
      const topR = vy(-0.05);
      const botR = vy(1.06);

      // trapezoid path (used for fill + clip)
      const tracePath = () => {
        ctx.beginPath();
        ctx.moveTo(wx - halfEdge, topL);
        ctx.lineTo(wx + halfEdge, topR);
        ctx.lineTo(wx + halfEdge, botR);
        ctx.lineTo(wx - halfEdge, botL);
        ctx.closePath();
      };

      // fill interior solid black, then sprinkle tiny golden "stars".
      // must be source-over (lighter would ignore black).
      const prevOp = ctx.globalCompositeOperation;
      ctx.save();
      tracePath();
      ctx.clip();

      // semi-transparent black tint — particles behind stay visible through it.
      // light alpha + the global trail-fade keeps it from building up opaque.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fill();

      // many tiny golden stars (deterministic positions, soft twinkle)
      const sr = rng(2024);
      const starCount = 160;
      const top0 = Math.min(topL, topR);
      const bot0 = Math.max(botL, botR);
      for (let i = 0; i < starCount; i++) {
        const sx = wx - halfEdge + sr() * (halfEdge * 2);
        const sy = top0 + sr() * (bot0 - top0);
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * 1.5 + i * 1.7));
        const rad = 0.4 + sr() * 0.9;
        ctx.fillStyle = `rgba(244,213,141,${(0.4 + sr() * 0.6) * tw})`;
        ctx.beginPath();
        ctx.arc(sx, sy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalCompositeOperation = prevOp;

      // closed golden trapezoid outline (left, right, top, bottom)
      ctx.strokeStyle = `rgba(244,213,141,${0.32 + pulse * 0.16})`;
      ctx.lineWidth = 1.4;
      tracePath();
      ctx.stroke();
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

      ctx.globalCompositeOperation = "lighter";

      const pulse = 0.5 + 0.5 * Math.sin(t * 1.6);

      for (const g of grains) {
        const path = paths[g.path];

        // flow along the path
        g.u += g.speed * 0.5;
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

        const baseX = pos.x * W + nrm.nx * lateral + nrm.nx * jitter;
        const baseY = vy(pos.y) + nrm.ny * lateral + nrm.ny * jitter;

        // ── cursor repulsion: scatter & flow around cursor, smooth return ──
        let targetHx = 0;
        let targetHy = 0;
        if (mx > -9000) {
          const ddx = baseX - mx;
          const ddy = baseY - my;
          const dist = Math.hypot(ddx, ddy);
          if (dist < MOUSE_R) {
            const force = 1 - dist / MOUSE_R; // 0..1, stronger near center
            const push = force * force * MOUSE_R; // ease-out push
            const inv = dist > 0.01 ? 1 / dist : 0;
            targetHx = ddx * inv * push + (rrun() - 0.5) * force * 12;
            targetHy = ddy * inv * push + (rrun() - 0.5) * force * 12;
          }
        }
        // ease toward target (fast scatter); ease back to 0 (smooth restore)
        const ease = targetHx !== 0 || targetHy !== 0 ? 0.25 : 0.08;
        g.hx += (targetHx - g.hx) * ease;
        g.hy += (targetHy - g.hy) * ease;

        const x = baseX + g.hx;
        const y = baseY + g.hy;

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
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      className="hidden lg:block w-[48%]"
      style={{ position: "relative", height: "660px", marginTop: "-50px", marginBottom: "-50px", overflow: "visible" }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: "-70px",
          left: "-6rem",
          height: "calc(100% + 70px)",
          width: "100vw",
          display: "block",
          pointerEvents: "none",
        }}
      />

      {/* warning markers placed ON 3 of the clean streams (after the wall).
          canvas is at left:-6rem, width:100vw — so we offset markers the same. */}
      {[
        { fx: 0.5, fy: 0.26 }, // clean stream i=1
        { fx: 0.6, fy: 0.58 }, // clean stream i=3
        { fx: 0.46, fy: 0.74 }, // clean stream i=4
      ].map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${m.fy * 100}%`,
            left: `calc(-6rem + ${m.fx * 100}vw)`,
            width: 34,
            height: 34,
            transform: `translate(-50%, -50%) ${markersOn ? "scale(1)" : "scale(0.5)"}`,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(220,40,40,0.16)",
            border: "1px solid rgba(230,70,70,0.45)",
            boxShadow:
              "0 0 16px rgba(220,50,50,0.3), inset 0 0 10px rgba(230,80,80,0.18)",
            backdropFilter: "blur(1px)",
            opacity: markersOn ? 1 : 0,
            transition: `opacity 1s ease ${i * 0.3}s, transform 1s cubic-bezier(0.2,0.8,0.2,1) ${i * 0.3}s`,
            animation: reduced ? "none" : `aiff-pulse 3.4s ease-in-out ${i * 0.3}s infinite`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3.2 L21.5 20 H2.5 Z"
              stroke="#F4D58D"
              strokeWidth="1.6"
              strokeLinejoin="round"
              fill="rgba(244,213,141,0.18)"
            />
            <line x1="12" y1="9" x2="12" y2="14.5" stroke="#F4D58D" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="17.4" r="1.1" fill="#F4D58D" />
          </svg>
        </div>
      ))}

      <style>{`
        @keyframes aiff-pulse {
          0%, 100% { box-shadow: 0 0 16px rgba(220,50,50,0.3), inset 0 0 10px rgba(230,80,80,0.18); }
          50% { box-shadow: 0 0 26px rgba(220,50,50,0.5), inset 0 0 12px rgba(230,80,80,0.28); }
        }
      `}</style>
    </div>
  );
}

export default AIFilterFlow;