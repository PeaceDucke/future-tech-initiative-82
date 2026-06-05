import { useRef, useEffect, useState } from "react";

/* ── palette ───────────────────────────────────────────── */
const GOLD = [
  [244, 213, 141], // #F4D58D
  [229, 190, 110], // #E5BE6E
  [201, 151, 62], // #C9973E
  [158, 109, 45], // #9E6D2D
];

/* ── tiny value-noise (no deps) ────────────────────────── */
function makeNoise(seed = 1) {
  const size = 256;
  const perm = new Uint8Array(size * 2);
  let s = seed * 2654435761;
  const rnd = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
  const p = new Uint8Array(size);
  for (let i = 0; i < size; i++) p[i] = i;
  for (let i = size - 1; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  for (let i = 0; i < size * 2; i++) perm[i] = p[i & (size - 1)];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const grad = (h: number, x: number, y: number) => {
    const u = h & 1 ? x : -x;
    const v = h & 2 ? y : -y;
    return u + v;
  };
  return (x: number, y: number) => {
    const X = Math.floor(x) & (size - 1);
    const Y = Math.floor(y) & (size - 1);
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return (lerp(x1, x2, v) + 1) * 0.5; // 0..1
  };
}

type P = {
  x: number;
  y: number;
  baseY: number;
  speed: number;
  layer: number; // 0 back .. 2 front
  size: number;
  alpha: number;
  hue: number;
  twk: number;
  life: number;
  filtered: boolean;
  flash: number;
  px: number;
  py: number;
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

    const noise = makeNoise(7);
    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: P[] = [];
    let running = true;
    let inView = true;

    const wallX = () => W * 0.52;

    const spawn = (fromLeft: boolean): P => {
      const layer = Math.random() < 0.45 ? 0 : Math.random() < 0.7 ? 1 : 2;
      const baseY = H * (0.08 + Math.random() * 0.84);
      const x = fromLeft ? -Math.random() * W * 0.25 : Math.random() * wallX();
      return {
        x,
        y: baseY,
        baseY,
        speed: (0.18 + Math.random() * 0.5) * (0.6 + layer * 0.4),
        layer,
        size: (layer === 2 ? 1.6 : layer === 1 ? 1.1 : 0.7) * (0.7 + Math.random() * 0.9),
        alpha: (layer === 2 ? 0.9 : layer === 1 ? 0.6 : 0.32) * (0.6 + Math.random() * 0.4),
        hue: (Math.random() * GOLD.length) | 0,
        twk: Math.random() * Math.PI * 2,
        life: 0,
        filtered: false,
        flash: 0,
        px: x,
        py: baseY,
      };
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

      const target = Math.max(260, Math.min(620, Math.round(W * 0.85)));
      particles = [];
      for (let i = 0; i < target; i++) {
        const p = spawn(false);
        p.x = Math.random() * W;
        particles.push(p);
      }
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([e]) => (inView = e.isIntersecting),
      { rootMargin: "150px 0px" }
    );
    io.observe(wrap);

    /* ── filter wall ─────────────────────────────────── */
    const drawWall = (wx: number, pulse: number) => {
      const top = H * 0.05;
      const bot = H * 0.95;

      const body = ctx.createLinearGradient(wx - 34, 0, wx + 34, 0);
      body.addColorStop(0, "rgba(201,151,62,0)");
      body.addColorStop(0.5, `rgba(244,213,141,${0.07 + pulse * 0.05})`);
      body.addColorStop(1, "rgba(201,151,62,0)");
      ctx.fillStyle = body;
      ctx.fillRect(wx - 34, top, 68, bot - top);

      ctx.strokeStyle = `rgba(244,213,141,${0.3 + pulse * 0.22})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(wx - 14, top);
      ctx.lineTo(wx - 14, bot);
      ctx.moveTo(wx + 14, top);
      ctx.lineTo(wx + 14, bot);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255,240,200,${0.5 + pulse * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx, top);
      ctx.lineTo(wx, bot);
      ctx.stroke();

      ctx.strokeStyle = `rgba(229,190,110,${0.07 + pulse * 0.04})`;
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

    /* ── static fallback ─────────────────────────────── */
    const renderStatic = () => {
      ctx.clearRect(0, 0, W, H);
      const rg = ctx.createRadialGradient(wallX(), H / 2, 0, wallX(), H / 2, W * 0.55);
      rg.addColorStop(0, "rgba(201,151,62,0.06)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
      drawWall(wallX(), 0.5);
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        const c = GOLD[p.hue];
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.baseY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
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

      t += 0.0045;
      const wx = wallX();

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(17,17,15,0.22)";
      ctx.fillRect(0, 0, W, H);

      const rg = ctx.createRadialGradient(wx, H / 2, 0, wx, H / 2, W * 0.6);
      rg.addColorStop(0, "rgba(201,151,62,0.05)");
      rg.addColorStop(0.55, "rgba(201,151,62,0.015)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);

      const pulse = 0.5 + 0.5 * Math.sin(t * 9);

      for (const p of particles) {
        p.px = p.x;
        p.py = p.y;
        p.life += 0.016;
        p.twk += 0.12;

        const beforeWall = p.x < wx;
        const ns = noise(p.x * 0.0022 + t * 1.4, p.y * 0.0042 + p.layer * 1.7) - 0.5;
        const ns2 = noise(p.x * 0.006 - t * 0.9, p.baseY * 0.01 + p.layer) - 0.5;

        let curl: number;
        if (beforeWall) {
          curl = ns * 46 + ns2 * 22;
        } else {
          const calm = Math.min(1, (p.x - wx) / (W * 0.22));
          curl = ns * 12 * (1 - calm * 0.85);
        }

        p.x += p.speed * (0.6 + p.layer * 0.35);
        p.y = p.baseY + curl + Math.sin(t * 6 + p.twk) * (beforeWall ? 1.4 : 0.5);

        if (!p.filtered && p.x >= wx) {
          p.filtered = true;
          const r = Math.random();
          if (r < 0.28) {
            p.life = 999;
          } else if (r < 0.55) {
            p.flash = 1;
            p.size *= 1.35;
            p.alpha = Math.min(1, p.alpha + 0.3);
          }
        }
        if (p.flash > 0) p.flash *= 0.9;

        if (p.x > W + 20 || p.life > 60) {
          Object.assign(p, spawn(true));
          continue;
        }

        const c = GOLD[p.hue];
        const flick = 0.65 + 0.35 * Math.sin(p.twk * 1.3);
        const a = p.alpha * flick;

        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * 0.4})`;
        ctx.lineWidth = p.size * 0.9;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        if (p.flash > 0.04) {
          ctx.fillStyle = `rgba(255,244,214,${p.flash * 0.8})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.layer === 2) {
          ctx.fillStyle = `rgba(255,244,214,${a * 0.6})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
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
      className="hidden lg:block w-[48%]"
      style={{ position: "relative", height: "560px", overflow: "hidden" }}
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

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(17,17,15,0.55) 100%)",
        }}
      />

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
