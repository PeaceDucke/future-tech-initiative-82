import { useRef, useEffect, useState } from "react";

/* ── luxury gold palette (rgb) ───────────────────────────── */
const GOLD = [
  [244, 213, 141], // #F4D58D
  [232, 200, 120], // #E8C878
  [200, 155, 69], //  #C89B45
  [158, 109, 45], //  #9E6D2D
  [255, 236, 186], // bright highlight
];

/* deterministic rng for stable outline points */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1000000) / 1000000;
  };
}

/* hourglass silhouette geometry, all in canvas-local px */
type Geo = {
  cx: number;
  topY: number;
  botY: number;
  midY: number;
  neckHalf: number;
  bulbHalf: number;
};

/* half-width of the hourglass funnel at a given y (smooth taper) */
function halfWidthAt(y: number, g: Geo) {
  if (y <= g.midY) {
    const t = (y - g.topY) / (g.midY - g.topY); // 0..1
    const e = t * t; // ease toward neck — concave elegant curve
    return g.bulbHalf + (g.neckHalf - g.bulbHalf) * e;
  }
  const t = (y - g.midY) / (g.botY - g.midY); // 0..1
  const e = 1 - (1 - t) * (1 - t);
  return g.neckHalf + (g.bulbHalf - g.neckHalf) * e;
}

/* a single outline particle that hovers around the silhouette */
type Outline = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  phase: number;
  drift: number; // how far it can stray
  size: number;
  hue: number;
  twinkle: number;
  twSpeed: number;
  detached: boolean;
  detTime: number;
  detLife: number;
  vx: number;
  vy: number;
};

/* falling sand grain through the neck */
type Grain = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  alpha: number;
  tw: number;
  settled: boolean;
};

/* ambient dust mote floating around the scene */
type Dust = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  alpha: number;
  tw: number;
  twSpeed: number;
};

function AIFilterFlow() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
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
    const geo: Geo = { cx: 0, topY: 0, botY: 0, midY: 0, neckHalf: 0, bulbHalf: 0 };

    let outline: Outline[] = [];
    let grains: Grain[] = [];
    let dust: Dust[] = [];
    let pile: number[] = []; // bottom cone height map (px) per column
    const PILE_COLS = 70;

    let running = true;
    let inView = true;
    let t = 0; // global time (s)

    const setupGeometry = () => {
      const usableH = H * 0.78;
      geo.cx = W / 2;
      geo.midY = H / 2;
      geo.topY = (H - usableH) / 2;
      geo.botY = geo.topY + usableH;
      geo.bulbHalf = Math.min(W * 0.3, usableH * 0.3);
      geo.neckHalf = Math.max(7, geo.bulbHalf * 0.075);
    };

    const colToX = (i: number) =>
      geo.cx - geo.bulbHalf + (i / (PILE_COLS - 1)) * geo.bulbHalf * 2;
    const xToCol = (x: number) =>
      Math.round(((x - (geo.cx - geo.bulbHalf)) / (geo.bulbHalf * 2)) * (PILE_COLS - 1));

    /* build the outline as a dense cloud of particles tracing the silhouette */
    const buildOutline = () => {
      outline = [];
      const r = rng(20240607);
      const SEGMENTS = reduced ? 140 : 320; // points per side
      const sides = [-1, 1];
      for (const side of sides) {
        for (let i = 0; i < SEGMENTS; i++) {
          const tt = i / (SEGMENTS - 1);
          const y = geo.topY + tt * (geo.botY - geo.topY);
          const hw = halfWidthAt(y, geo);
          const baseX = geo.cx + side * hw;
          const jx = (r() - 0.5) * 3;
          const jy = (r() - 0.5) * 3;
          outline.push({
            baseX: baseX + jx,
            baseY: y + jy,
            x: baseX,
            y,
            phase: r() * Math.PI * 2,
            drift: 1.5 + r() * 3.5,
            size: 0.6 + r() * 1.5,
            hue: Math.floor(r() * GOLD.length),
            twinkle: r() * Math.PI * 2,
            twSpeed: 0.6 + r() * 1.4,
            detached: false,
            detTime: 0,
            detLife: 0,
            vx: 0,
            vy: 0,
          });
        }
      }
      // top & bottom rims (caps made of particles)
      const rim = (yy: number) => {
        const hw = halfWidthAt(yy, geo);
        const n = reduced ? 30 : 60;
        for (let i = 0; i <= n; i++) {
          const x = geo.cx - hw + (i / n) * hw * 2;
          outline.push({
            baseX: x,
            baseY: yy,
            x,
            y: yy,
            phase: r() * Math.PI * 2,
            drift: 1 + r() * 2.5,
            size: 0.7 + r() * 1.4,
            hue: Math.floor(r() * GOLD.length),
            twinkle: r() * Math.PI * 2,
            twSpeed: 0.6 + r() * 1.4,
            detached: false,
            detTime: 0,
            detLife: 0,
            vx: 0,
            vy: 0,
          });
        }
      };
      rim(geo.topY);
      rim(geo.botY);
    };

    const initScene = () => {
      setupGeometry();
      buildOutline();
      pile = new Array(PILE_COLS).fill(0);
      grains = [];
      dust = [];
      const dN = reduced ? 0 : 70;
      for (let i = 0; i < dN; i++) {
        dust.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 4,
          vy: -3 - Math.random() * 6,
          r: 0.5 + Math.random() * 1.4,
          hue: Math.floor(Math.random() * GOLD.length),
          alpha: 0.1 + Math.random() * 0.35,
          tw: Math.random() * Math.PI * 2,
          twSpeed: 0.5 + Math.random() * 1.2,
        });
      }
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initScene();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (inView = e.isIntersecting)),
      { threshold: 0.04 }
    );
    io.observe(wrap);

    const spawnGrain = (): Grain => ({
      x: geo.cx + (Math.random() - 0.5) * geo.neckHalf * 1.2,
      y: geo.midY - geo.neckHalf * 0.5,
      vx: (Math.random() - 0.5) * 4,
      vy: 14 + Math.random() * 16, // slow, cinematic fall
      r: 0.7 + Math.random() * 1.6,
      hue: Math.floor(Math.random() * GOLD.length),
      alpha: 0.6 + Math.random() * 0.4,
      tw: Math.random() * Math.PI * 2,
      settled: false,
    });

    let last = performance.now();
    let emitAcc = 0;

    const draw = (now: number) => {
      if (!running) return;
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05;
      t += dt;

      ctx.clearRect(0, 0, W, H);
      if (!inView) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.globalCompositeOperation = "lighter"; // additive glow

      /* ── ambient dust ─────────────────────────────── */
      for (const d of dust) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.tw += d.twSpeed * dt;
        if (d.y < -10) {
          d.y = H + 10;
          d.x = Math.random() * W;
        }
        if (d.x < -10) d.x = W + 10;
        if (d.x > W + 10) d.x = -10;
        const c = GOLD[d.hue];
        const a = d.alpha * (0.55 + 0.45 * Math.sin(d.tw));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
        ctx.fill();
      }

      /* ── outline particles (the living silhouette) ── */
      for (const o of outline) {
        if (!o.detached) {
          o.x = o.baseX + Math.sin(t * 0.7 + o.phase) * o.drift;
          o.y = o.baseY + Math.cos(t * 0.6 + o.phase * 1.3) * o.drift * 0.6;
          o.twinkle += o.twSpeed * dt;
          if (!reduced && Math.random() < 0.0006) {
            o.detached = true;
            o.detTime = 0;
            o.detLife = 2.5 + Math.random() * 2.5;
            o.vx = (Math.random() - 0.5) * 8;
            o.vy = -4 - Math.random() * 10;
          }
        } else {
          o.detTime += dt;
          o.vy += 1.5 * dt;
          o.x += o.vx * dt;
          o.y += o.vy * dt;
          if (o.detTime >= o.detLife) {
            o.detached = false;
            o.x = o.baseX;
            o.y = o.baseY;
          }
        }

        const c = GOLD[o.hue];
        let a = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(o.twinkle));
        if (o.detached) {
          const lifeFrac = o.detTime / o.detLife;
          a *= Math.max(0, 1 - lifeFrac);
        }
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.size * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * 0.08})`;
        ctx.fill();
      }

      /* ── upper sand mass (gentle glowing cloud, never empties) ─ */
      drawUpperMass(ctx, geo, t);

      /* ── emit + integrate falling grains ──────────── */
      const TARGET = reduced ? 0 : 150;
      emitAcc += dt * 42;
      while (emitAcc >= 1) {
        emitAcc -= 1;
        if (grains.filter((g) => !g.settled).length < TARGET) grains.push(spawnGrain());
      }

      const g = geo;
      for (const p of grains) {
        if (p.settled) continue;
        p.vy += 22 * dt; // very gentle gravity (slow-motion)
        p.vx += Math.sin(t * 2 + p.y * 0.05) * 6 * dt; // micro swirl
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.tw += dt * 4;

        const hw = halfWidthAt(p.y, g);
        if (p.x < g.cx - hw) {
          p.x = g.cx - hw;
          p.vx = Math.abs(p.vx) * 0.25 + 2;
        } else if (p.x > g.cx + hw) {
          p.x = g.cx + hw;
          p.vx = -Math.abs(p.vx) * 0.25 - 2;
        }

        const col = Math.max(0, Math.min(PILE_COLS - 1, xToCol(p.x)));
        const pileTopY = g.botY - pile[col];
        if (p.y >= pileTopY - p.r) {
          p.settled = true;
          pile[col] += p.r * 1.4;
          if (col > 0) pile[col - 1] += p.r * 0.5;
          if (col < PILE_COLS - 1) pile[col + 1] += p.r * 0.5;
        }
      }

      // slowly drain the cone so it never overflows (eternal flow)
      const maxAllowed = (g.botY - g.midY) * 0.86;
      let coneMax = 0;
      for (let i = 0; i < PILE_COLS; i++) coneMax = Math.max(coneMax, pile[i]);
      const drain = coneMax > maxAllowed ? 26 : 9;
      for (let i = 0; i < PILE_COLS; i++) {
        pile[i] = Math.max(0, pile[i] - drain * dt);
      }
      grains = grains.filter((p) => {
        if (!p.settled) return true;
        const col = Math.max(0, Math.min(PILE_COLS - 1, xToCol(p.x)));
        return p.y <= g.botY - pile[col] + 14;
      });

      /* ── draw bottom glowing cone ──────────────────── */
      drawCone(ctx, geo, pile, colToX, t);

      /* ── draw falling grains (the hypnotic stream) ─── */
      for (const p of grains) {
        const c = GOLD[p.hue];
        const tw = 0.7 + 0.3 * Math.sin(p.tw);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${p.alpha * tw})`;
        ctx.fill();
        if (!p.settled) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.07)`;
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      rafRef.current = requestAnimationFrame(draw);
    };

    /* upper sand body — soft particle cloud that visually never drains */
    function drawUpperMass(c: CanvasRenderingContext2D, g: Geo, time: number) {
      const surfaceY = g.topY + (g.midY - g.topY) * 0.32;
      const hwSurf = halfWidthAt(surfaceY, g);
      c.save();
      c.beginPath();
      c.moveTo(g.cx - hwSurf, surfaceY);
      const dip = 10 + Math.sin(time * 0.8) * 3;
      c.quadraticCurveTo(g.cx, surfaceY + dip, g.cx + hwSurf, surfaceY);
      c.lineTo(g.cx + g.neckHalf, g.midY);
      c.lineTo(g.cx - g.neckHalf, g.midY);
      c.closePath();
      const grad = c.createLinearGradient(0, surfaceY, 0, g.midY);
      grad.addColorStop(0, "rgba(244,213,141,0.55)");
      grad.addColorStop(0.5, "rgba(200,155,69,0.5)");
      grad.addColorStop(1, "rgba(158,109,45,0.45)");
      c.fillStyle = grad;
      c.fill();
      for (let i = 0; i < 26; i++) {
        const fx = g.cx + (Math.random() - 0.5) * hwSurf * 2;
        const fy = surfaceY + Math.random() * (g.midY - surfaceY) * 0.8;
        const col = GOLD[Math.floor(Math.random() * GOLD.length)];
        c.beginPath();
        c.arc(fx, fy, Math.random() * 1.3, 0, Math.PI * 2);
        c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.5)`;
        c.fill();
      }
      c.restore();
    }

    /* bottom cone rendered as a glowing golden mound of particles */
    function drawCone(
      c: CanvasRenderingContext2D,
      g: Geo,
      ph: number[],
      cx2: (i: number) => number,
      time: number
    ) {
      let maxH = 0;
      for (let i = 0; i < ph.length; i++) maxH = Math.max(maxH, ph[i]);
      if (maxH < 0.5) return;
      c.save();
      c.beginPath();
      c.moveTo(cx2(0), g.botY);
      for (let i = 0; i < ph.length; i++) {
        const x = cx2(i);
        const y = g.botY - ph[i];
        const hw = halfWidthAt(y, g);
        const xc = Math.max(g.cx - hw, Math.min(g.cx + hw, x));
        c.lineTo(xc, y);
      }
      c.lineTo(cx2(ph.length - 1), g.botY);
      c.closePath();
      const grad = c.createLinearGradient(0, g.botY - maxH, 0, g.botY);
      grad.addColorStop(0, "rgba(244,213,141,0.6)");
      grad.addColorStop(0.5, "rgba(200,155,69,0.5)");
      grad.addColorStop(1, "rgba(158,109,45,0.5)");
      c.fillStyle = grad;
      c.fill();
      for (let i = 0; i < 30; i++) {
        const fx = g.cx + (Math.random() - 0.5) * g.bulbHalf * 1.4;
        const fy = g.botY - Math.random() * maxH;
        const col = GOLD[Math.floor(Math.random() * GOLD.length)];
        const a = 0.4 + 0.4 * Math.sin(time * 3 + i);
        c.beginPath();
        c.arc(fx, fy, Math.random() * 1.2, 0, Math.PI * 2);
        c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`;
        c.fill();
      }
      c.restore();
    }

    rafRef.current = requestAnimationFrame((tt) => {
      last = tt;
      draw(tt);
    });

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      className="hidden lg:block w-full"
      style={{ height: "700px", position: "relative", overflow: "visible" }}
      aria-hidden="true"
    >
      {/* warm ambient bloom behind the cloud of dust */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 42% 58% at 50% 50%, rgba(212,176,116,0.12) 0%, rgba(212,176,116,0.04) 45%, transparent 72%)",
          pointerEvents: "none",
        }}
      />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

export default AIFilterFlow;
