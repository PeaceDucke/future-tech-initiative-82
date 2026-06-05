import { useRef, useEffect, useState } from "react";

type Particle = {
  x: number;
  y: number;
  baseY: number;
  size: number;
  speed: number;
  phase: number;
  amp: number;
  opacity: number;
  flicker: number;
  filtered: boolean;
  flashed: boolean;
  bright: number;
  color: string;
};

const COLORS = ["#F3DCA2", "#E8C878", "#C89B45"];

function AIFilterFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const [reduced, setReduced] = useState(false);
  const [markersOn, setMarkersOn] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMarkersOn(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const makeParticle = (startLeft: boolean): Particle => {
      const baseY = H * (0.12 + Math.random() * 0.76);
      return {
        x: startLeft ? -20 - Math.random() * W * 0.3 : Math.random() * W,
        y: baseY,
        baseY,
        size: 0.8 + Math.random() * 2.4,
        speed: 0.25 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        amp: 14 + Math.random() * 26,
        opacity: 0.3 + Math.random() * 0.7,
        flicker: Math.random() * Math.PI * 2,
        filtered: false,
        flashed: false,
        bright: 0,
        color: COLORS[(Math.random() * COLORS.length) | 0],
      };
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(70, Math.min(150, Math.round(W * 0.22)));
      const arr: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const p = makeParticle(false);
        p.x = Math.random() * W;
        arr.push(p);
      }
      particlesRef.current = arr;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let t = 0;
    const wallX = () => W * 0.5;

    const drawWall = (wx: number, pulse: number) => {
      const grad = ctx.createLinearGradient(wx - 30, 0, wx + 30, 0);
      grad.addColorStop(0, "rgba(200,155,69,0)");
      grad.addColorStop(0.5, `rgba(243,220,162,${0.1 + pulse * 0.05})`);
      grad.addColorStop(1, "rgba(200,155,69,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(wx - 30, 0, 60, H);

      const top = H * 0.06;
      const bottom = H * 0.94;
      ctx.strokeStyle = `rgba(243,220,162,${0.32 + pulse * 0.18})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(wx, top);
      ctx.lineTo(wx, bottom);
      ctx.stroke();

      ctx.strokeStyle = `rgba(232,200,120,${0.08 + pulse * 0.05})`;
      ctx.lineWidth = 0.6;
      const rows = 14;
      for (let i = 1; i < rows; i++) {
        const gy = top + ((bottom - top) / rows) * i;
        ctx.beginPath();
        ctx.moveTo(wx - 9, gy);
        ctx.lineTo(wx + 9, gy);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(wx - 9, top);
      ctx.lineTo(wx - 9, bottom);
      ctx.moveTo(wx + 9, top);
      ctx.lineTo(wx + 9, bottom);
      ctx.stroke();
    };

    const drawLines = (wx: number) => {
      const lines = 4;
      for (let l = 0; l < lines; l++) {
        const yc = H * (0.22 + l * 0.18);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(232,200,120,${0.14 + l * 0.02})`;
        for (let x = 0; x <= W; x += 6) {
          let y: number;
          if (x < wx) {
            const chaos =
              Math.sin(x * 0.018 + t * 0.6 + l) * 16 +
              Math.sin(x * 0.05 + t * 0.9 + l * 2) * 8;
            y = yc + chaos;
          } else {
            const fade = Math.min(1, (x - wx) / (W * 0.2));
            const calm = Math.sin(x * 0.012 + t * 0.4 + l) * 4;
            y = yc + calm * fade;
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const renderStatic = () => {
      ctx.clearRect(0, 0, W, H);
      const rg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.5);
      rg.addColorStop(0, "rgba(200,155,69,0.06)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
      drawWall(wallX(), 0.5);
      for (const p of particlesRef.current) {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.baseY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      renderStatic();
      return () => {
        ro.disconnect();
      };
    }

    const loop = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      const wx = wallX();

      const rg = ctx.createRadialGradient(wx, H * 0.5, 0, wx, H * 0.5, W * 0.55);
      rg.addColorStop(0, "rgba(200,155,69,0.07)");
      rg.addColorStop(0.6, "rgba(200,155,69,0.02)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);

      drawLines(wx);

      const pulse = 0.5 + 0.5 * Math.sin(t * 1.2);

      for (const p of particlesRef.current) {
        p.x += p.speed;
        p.flicker += 0.08;

        if (p.x < wx) {
          p.y = p.baseY + Math.sin(t * 0.9 + p.phase) * p.amp;
        } else {
          if (!p.filtered) {
            p.filtered = true;
            const roll = Math.random();
            if (roll < 0.25) {
              p.opacity = 0;
            } else if (roll < 0.55) {
              p.flashed = true;
              p.bright = 1;
              p.size *= 1.4;
            }
          }
          const fade = Math.min(1, (p.x - wx) / (W * 0.18));
          p.y = p.baseY + Math.sin(t * 0.5 + p.phase) * p.amp * (1 - fade * 0.8);
        }

        if (p.bright > 0) p.bright *= 0.94;

        if (p.x > W + 30 || p.opacity <= 0.01) {
          const np = makeParticle(true);
          Object.assign(p, np);
          continue;
        }

        const flick = 0.7 + 0.3 * Math.sin(p.flicker);
        const alpha = p.opacity * flick;

        if (p.bright > 0.02) {
          ctx.globalAlpha = Math.min(1, p.bright);
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#F3DCA2";
          ctx.fillStyle = "#FFF3D6";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = alpha;
        ctx.shadowBlur = p.size * 2.2;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
      drawWall(wx, pulse);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [reduced]);

  const markers = [
    { top: "26%", left: "70%", delay: 0 },
    { top: "52%", left: "82%", delay: 0.25 },
    { top: "72%", left: "66%", delay: 0.5 },
  ];

  return (
    <div
      ref={containerRef}
      className="hidden lg:block w-[48%]"
      style={{ position: "relative", height: "520px", overflow: "hidden" }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
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
            background: "rgba(24,24,22,0.7)",
            border: "1px solid rgba(243,220,162,0.5)",
            boxShadow: "0 0 14px rgba(232,200,120,0.35), inset 0 0 8px rgba(243,220,162,0.15)",
            backdropFilter: "blur(2px)",
            opacity: markersOn ? 1 : 0,
            transform: markersOn ? "scale(1)" : "scale(0.6)",
            transition: `opacity 0.9s ease ${m.delay}s, transform 0.9s ease ${m.delay}s`,
            animation: reduced ? "none" : `aiff-glow 3s ease-in-out ${m.delay}s infinite`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3 L22 20 H2 Z"
              stroke="#F3DCA2"
              strokeWidth="1.6"
              strokeLinejoin="round"
              fill="rgba(232,200,120,0.08)"
            />
            <line x1="12" y1="9" x2="12" y2="14" stroke="#F3DCA2" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="17" r="0.9" fill="#F3DCA2" />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes aiff-glow {
          0%, 100% { box-shadow: 0 0 14px rgba(232,200,120,0.35), inset 0 0 8px rgba(243,220,162,0.15); }
          50% { box-shadow: 0 0 22px rgba(232,200,120,0.6), inset 0 0 10px rgba(243,220,162,0.25); }
        }
      `}</style>
    </div>
  );
}

export default AIFilterFlow;
