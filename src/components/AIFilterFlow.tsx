import { useRef, useEffect, useState } from "react";

/* ── luxury gold palette (rgb) ───────────────────────────── */
const GOLD = [
  [244, 213, 141], // #F4D58D
  [232, 200, 120], // #E8C878
  [200, 155, 69], //  #C89B45
  [158, 109, 45], //  #9E6D2D
  [255, 236, 186], // bright highlight
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

/* hourglass silhouette geometry, all in canvas-local px */
type Geo = {
  cx: number;
  topY: number;
  botY: number;
  midY: number;
  neckHalf: number;
  bulbHalf: number;
  capRy: number; // vertical radius of the elliptical caps (3D depth)
};

/* half-width of the hourglass funnel at a given y (smooth concave taper) */
function halfWidthAt(y: number, g: Geo) {
  if (y <= g.midY) {
    const t = (y - g.topY) / (g.midY - g.topY); // 0..1
    const e = t * t;
    return g.bulbHalf + (g.neckHalf - g.bulbHalf) * e;
  }
  const t = (y - g.midY) / (g.botY - g.midY); // 0..1
  const e = 1 - (1 - t) * (1 - t);
  return g.neckHalf + (g.bulbHalf - g.neckHalf) * e;
}

/* outline particle hovering around the silhouette (living gold dust) */
type Outline = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  phase: number;
  drift: number;
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

/* a static grain forming the sand mass (precomputed, just twinkles) */
type SandGrain = {
  x: number;
  y: number;
  r: number;
  hue: number;
  base: number; // base alpha
  tw: number;
  twSpeed: number;
};

/* falling grain in the eternal stream (loops, never accumulates) */
type Flow = {
  x: number;
  y: number;
  vx: number;
  r: number;
  hue: number;
  alpha: number;
  speed: number;
  tw: number;
  swirl: number;
};

/* ambient dust */
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
    const geo: Geo = {
      cx: 0, topY: 0, botY: 0, midY: 0, neckHalf: 0, bulbHalf: 0, capRy: 0,
    };

    let outline: Outline[] = [];
    let topSand: SandGrain[] = [];
    let botSand: SandGrain[] = [];
    let flow: Flow[] = [];
    let dust: Dust[] = [];

    let running = true;
    let inView = true;
    let t = 0;

    // surface levels (static)
    let topSurfaceY = 0; // surface of the upper sand remnant
    let coneTopY = 0; //   tip height of the bottom cone

    const setupGeometry = () => {
      const usableH = H * 0.8;
      geo.cx = W / 2;
      geo.midY = H / 2;
      geo.topY = (H - usableH) / 2;
      geo.botY = geo.topY + usableH;
      geo.bulbHalf = Math.min(W * 0.32, usableH * 0.3);
      geo.neckHalf = Math.max(8, geo.bulbHalf * 0.07);
      geo.capRy = geo.bulbHalf * 0.26; // ellipse depth for 3D caps

      // upper sand = small remnant near the neck
      topSurfaceY = geo.topY + (geo.midY - geo.topY) * 0.55;
      // bottom cone = big mound rising from the base
      coneTopY = geo.botY - (geo.botY - geo.midY) * 0.62;
    };

    /* build the dotted silhouette + elliptical 3D rims */
    const buildOutline = () => {
      outline = [];
      const r = rng(77123);
      const pushPt = (bx: number, by: number, driftBase: number) => {
        outline.push({
          baseX: bx,
          baseY: by,
          x: bx,
          y: by,
          phase: r() * Math.PI * 2,
          drift: driftBase + r() * 2.5,
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
      };

      // two curved side walls
      const SEG = reduced ? 120 : 260;
      for (const side of [-1, 1]) {
        for (let i = 0; i < SEG; i++) {
          const tt = i / (SEG - 1);
          const y = geo.topY + tt * (geo.botY - geo.topY);
          const hw = halfWidthAt(y, geo);
          pushPt(geo.cx + side * hw + (r() - 0.5) * 2, y + (r() - 0.5) * 2, 1.4);
        }
      }

      // elliptical rims (front + back arcs) — gives the 3D cap look
      const ellipse = (cy: number, ry: number) => {
        const n = reduced ? 50 : 110;
        for (let i = 0; i <= n; i++) {
          const ang = (i / n) * Math.PI * 2;
          const ex = geo.cx + Math.cos(ang) * geo.bulbHalf;
          const ey = cy + Math.sin(ang) * ry;
          pushPt(ex, ey, 1.0);
        }
      };
      ellipse(geo.topY, geo.capRy);
      ellipse(geo.botY, geo.capRy);
    };

    /* build a static sand mass shape, filled with grains, between two curves */
    const buildSand = (
      yTop: number,
      yBot: number,
      topCurve: (x: number) => number, // returns surface y at given x
      botCurve: (x: number) => number,
      count: number,
      seed: number
    ): SandGrain[] => {
      const r = rng(seed);
      const out: SandGrain[] = [];
      let guard = 0;
      while (out.length < count && guard < count * 25) {
        guard++;
        const y = yTop + r() * (yBot - yTop);
        const hw = halfWidthAt(y, geo);
        const x = geo.cx + (r() - 0.5) * 2 * hw;
        if (y < topCurve(x) || y > botCurve(x)) continue;
        // depth shading: center brighter, edges darker (volume)
        const depth = 1 - Math.abs(x - geo.cx) / (hw + 0.001);
        const hue =
          depth > 0.55
            ? Math.floor(r() * 2) // brighter golds near center top
            : 2 + Math.floor(r() * 2); // deeper amber at edges
        out.push({
          x,
          y,
          r: 0.5 + r() * 1.6,
          hue,
          base: 0.5 + r() * 0.5,
          tw: r() * Math.PI * 2,
          twSpeed: 0.4 + r() * 1.0,
        });
      }
      return out;
    };

    const initSand = () => {
      // UPPER remnant: surface (slightly concave) down to the neck
      const upTopCurve = (x: number) =>
        topSurfaceY + Math.pow(Math.abs(x - geo.cx) / geo.bulbHalf, 1.6) * -6 + 6;
      const upBotCurve = () => geo.midY - geo.neckHalf * 0.3;
      topSand = buildSand(
        topSurfaceY - 4,
        geo.midY,
        upTopCurve,
        upBotCurve,
        reduced ? 220 : 900,
        9001
      );

      // BOTTOM: a true 3D conical mound spread across the whole floor
      botSand = buildCone(reduced ? 3000 : 11000, 4242);
    };

    /* build a realistic 3D conical sand mound.
       - elliptical base covering the WHOLE floor (perspective depth via ry)
       - peak at center, smooth round slopes (cone, not pyramid)
       - fine grains scattered everywhere on the floor */
    const buildCone = (count: number, seed: number): SandGrain[] => {
      const r = rng(seed);
      const out: SandGrain[] = [];
      const baseRx = geo.bulbHalf * 0.97; // horizontal reach (full floor)
      const baseRy = geo.capRy * 0.92; //   vertical depth of the elliptical base
      const baseCy = geo.botY - geo.capRy * 0.35; // floor center (a bit above rim front)
      const peakY = coneTopY; // tip of the cone
      const peakH = baseCy - peakY; // mound height

      for (let i = 0; i < count; i++) {
        // sample a point inside the unit disk, denser toward the center (mound mass)
        const ang = r() * Math.PI * 2;
        const rad = Math.pow(r(), 0.65); // 0..1, biased to center
        const dx = Math.cos(ang) * rad;
        const dy = Math.sin(ang) * rad; // depth axis (perspective)

        const x = geo.cx + dx * baseRx;
        // base ellipse Y for this depth + cone height falloff toward edges
        const floorY = baseCy + dy * baseRy;
        // cone profile: full height at center, ~0 at the rim (smooth round slope)
        const h = peakH * (1 - rad) * (0.85 + 0.15 * (1 - Math.abs(dy)));
        // scatter grains through the volume — biased toward the SURFACE
        // (so the visible top layer is dense and never shows gaps)
        const y = floorY - Math.pow(r(), 0.45) * Math.max(2, h);

        // shading: top-lit, center-front brighter, deep edges darker → volume
        const lift = 1 - rad; // higher near peak
        const front = (dy + 1) / 2; // 0 back .. 1 front
        const litness = lift * 0.55 + front * 0.45;
        let hue: number;
        if (litness > 0.7) hue = 4; // bright highlight
        else if (litness > 0.5) hue = Math.floor(r() * 2); // light golds
        else if (litness > 0.32) hue = 2; // mid amber
        else hue = 3; // deep amber (back/edges)

        out.push({
          x,
          y,
          r: 0.32 + r() * 0.7, // fine grains, slightly larger to close gaps
          hue,
          base: 0.6 + litness * 0.4,
          tw: r() * Math.PI * 2,
          twSpeed: 0.4 + r() * 1.0,
        });
      }
      // sort back-to-front so front grains render on top (depth ordering)
      out.sort((a, b) => a.y - b.y);
      return out;
    };

    const spawnFlow = (): Flow => ({
      x: geo.cx + (Math.random() - 0.5) * geo.neckHalf * 0.9,
      y: geo.midY - (geo.midY - topSurfaceY) * Math.random(), // start within upper sand
      vx: 0,
      r: 0.6 + Math.random() * 1.4,
      hue: Math.floor(Math.random() * GOLD.length),
      alpha: 0.55 + Math.random() * 0.45,
      speed: 26 + Math.random() * 18, // slow, hypnotic
      tw: Math.random() * Math.PI * 2,
      swirl: Math.random() * Math.PI * 2,
    });

    const initFlow = () => {
      flow = [];
      const n = reduced ? 0 : 90;
      for (let i = 0; i < n; i++) {
        const f = spawnFlow();
        f.y = geo.midY - (geo.midY - coneTopY) + Math.random() * (coneTopY - topSurfaceY);
        flow.push(f);
      }
    };

    const initDust = () => {
      dust = [];
      const dN = reduced ? 0 : 60;
      for (let i = 0; i < dN; i++) {
        dust.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 3,
          vy: -2 - Math.random() * 5,
          r: 0.4 + Math.random() * 1.2,
          hue: Math.floor(Math.random() * GOLD.length),
          alpha: 0.08 + Math.random() * 0.3,
          tw: Math.random() * Math.PI * 2,
          twSpeed: 0.5 + Math.random() * 1.0,
        });
      }
    };

    const initScene = () => {
      setupGeometry();
      buildOutline();
      initSand();
      initFlow();
      initDust();
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

    let last = performance.now();

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

      const g = geo;

      /* ── ground shadow + dark base plate (часы стоят на чём-то) ── */
      ctx.save();
      // soft contact shadow ellipse on the floor
      const shY = g.botY + g.capRy * 0.9;
      const shRx = g.bulbHalf * 1.35;
      const shRy = g.capRy * 0.9;
      const shGrad = ctx.createRadialGradient(g.cx, shY, 0, g.cx, shY, shRx);
      shGrad.addColorStop(0, "rgba(0,0,0,0.55)");
      shGrad.addColorStop(0.5, "rgba(0,0,0,0.32)");
      shGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shGrad;
      ctx.save();
      ctx.translate(g.cx, shY);
      ctx.scale(1, shRy / shRx);
      ctx.beginPath();
      ctx.arc(0, 0, shRx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // dark base plate the hourglass rests on
      const plateY = g.botY + g.capRy * 0.55;
      const plateRx = g.bulbHalf * 1.12;
      const plateRy = g.capRy * 0.72;
      const plateGrad = ctx.createLinearGradient(0, plateY - plateRy, 0, plateY + plateRy);
      plateGrad.addColorStop(0, "rgba(36,30,22,0.95)");
      plateGrad.addColorStop(0.5, "rgba(22,19,15,0.98)");
      plateGrad.addColorStop(1, "rgba(10,9,7,1)");
      ctx.fillStyle = plateGrad;
      ctx.save();
      ctx.translate(g.cx, plateY);
      ctx.scale(1, plateRy / plateRx);
      ctx.beginPath();
      ctx.arc(0, 0, plateRx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // thin warm gold rim highlight on the plate's front edge
      ctx.beginPath();
      ctx.ellipse(g.cx, plateY, plateRx, plateRy, 0, 0.08 * Math.PI, 0.92 * Math.PI);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(200,155,69,0.35)";
      ctx.stroke();

      // vignette under the bottom bulb to ground it (darken the floor area)
      const vigGrad = ctx.createRadialGradient(
        g.cx, g.botY, g.bulbHalf * 0.2,
        g.cx, g.botY, g.bulbHalf * 1.6
      );
      vigGrad.addColorStop(0, "rgba(0,0,0,0)");
      vigGrad.addColorStop(0.6, "rgba(0,0,0,0.18)");
      vigGrad.addColorStop(1, "rgba(0,0,0,0.42)");
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, g.midY, W, H - g.midY);
      ctx.restore();

      /* ── soft 3D glass body shading (subtle volume) ── */
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(g.cx - g.bulbHalf, g.topY);
      ctx.lineTo(g.cx + g.bulbHalf, g.topY);
      // upper wall to neck
      for (let s = 0; s <= 10; s++) {
        const y = g.topY + (s / 10) * (g.midY - g.topY);
        ctx.lineTo(g.cx + halfWidthAt(y, g), y);
      }
      for (let s = 0; s <= 10; s++) {
        const y = g.midY + (s / 10) * (g.botY - g.midY);
        ctx.lineTo(g.cx + halfWidthAt(y, g), y);
      }
      ctx.lineTo(g.cx + g.bulbHalf, g.botY);
      ctx.lineTo(g.cx - g.bulbHalf, g.botY);
      for (let s = 10; s >= 0; s--) {
        const y = g.midY + (s / 10) * (g.botY - g.midY);
        ctx.lineTo(g.cx - halfWidthAt(y, g), y);
      }
      for (let s = 10; s >= 0; s--) {
        const y = g.topY + (s / 10) * (g.midY - g.topY);
        ctx.lineTo(g.cx - halfWidthAt(y, g), y);
      }
      ctx.closePath();
      const bodyGrad = ctx.createLinearGradient(g.cx - g.bulbHalf, 0, g.cx + g.bulbHalf, 0);
      bodyGrad.addColorStop(0, "rgba(255,255,255,0.012)");
      bodyGrad.addColorStop(0.42, "rgba(255,245,220,0.05)");
      bodyGrad.addColorStop(0.6, "rgba(255,255,255,0.02)");
      bodyGrad.addColorStop(1, "rgba(255,255,255,0.01)");
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.restore();

      /* ── ambient dust (additive) ──────────────────── */
      ctx.globalCompositeOperation = "lighter";
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

      /* ── STATIC sand masses (top remnant + bottom cone) ── */
      const drawSand = (arr: SandGrain[]) => {
        for (const s of arr) {
          s.tw += s.twSpeed * dt;
          const c = GOLD[s.hue];
          const a = s.base * (0.78 + 0.22 * Math.sin(s.tw));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
          ctx.fill();
        }
      };
      drawSand(topSand);
      drawSand(botSand);

      /* ── eternal falling stream (loops forever) ────── */
      for (const f of flow) {
        f.y += f.speed * dt;
        f.swirl += dt * 1.6;
        f.x = geo.cx + Math.sin(f.swirl) * geo.neckHalf * 0.5 + (Math.sin(t + f.tw) * 1.5);
        f.tw += dt * 4;
        // loop: when reaching the cone surface, respawn at the upper sand
        if (f.y > coneTopY + (geo.botY - coneTopY) * 0.15) {
          f.y = topSurfaceY + Math.random() * (geo.midY - topSurfaceY) * 0.5;
        }
        const c = GOLD[f.hue];
        const tw = 0.7 + 0.3 * Math.sin(f.tw);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${f.alpha * tw})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.06)`;
        ctx.fill();
      }

      /* ── outline particles (living gold-dust silhouette) ── */
      for (const o of outline) {
        if (!o.detached) {
          o.x = o.baseX + Math.sin(t * 0.7 + o.phase) * o.drift;
          o.y = o.baseY + Math.cos(t * 0.6 + o.phase * 1.3) * o.drift * 0.6;
          o.twinkle += o.twSpeed * dt;
          if (!reduced && Math.random() < 0.0005) {
            o.detached = true;
            o.detTime = 0;
            o.detLife = 2.5 + Math.random() * 2.5;
            o.vx = (Math.random() - 0.5) * 7;
            o.vy = -4 - Math.random() * 9;
          }
        } else {
          o.detTime += dt;
          o.vy += 1.4 * dt;
          o.x += o.vx * dt;
          o.y += o.vy * dt;
          if (o.detTime >= o.detLife) {
            o.detached = false;
            o.x = o.baseX;
            o.y = o.baseY;
          }
        }
        const c = GOLD[o.hue];
        let a = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(o.twinkle));
        if (o.detached) a *= Math.max(0, 1 - o.detTime / o.detLife);
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.size * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * 0.08})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      rafRef.current = requestAnimationFrame(draw);
    };

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