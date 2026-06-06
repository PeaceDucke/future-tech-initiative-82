import { useRef, useEffect, useState } from "react";

/* ── luxury gold palette ─────────────────────────────────── */
const GOLD = [
  [255, 233, 173], // bright highlight
  [244, 213, 141], // #F4D58D
  [229, 190, 110], // #E5BE6E
  [201, 151, 62], //  #C9973E
  [158, 109, 45], //  deep amber
];

type Grain = {
  x: number; // px (canvas-local)
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number; // index into GOLD
  alpha: number;
  settled: boolean;
  inStream: boolean;
};

/* hourglass geometry helpers, all in canvas-local px */
type Geo = {
  cx: number;
  topY: number;
  botY: number;
  midY: number;
  neckHalf: number; // half-width of neck opening
  bulbHalf: number; // half-width at top/bottom edge
  chamberH: number; // height of one chamber
};

/* x half-width of the glass funnel at a given y (linear taper to the neck) */
function halfWidthAt(y: number, g: Geo) {
  if (y <= g.midY) {
    // upper chamber: wide at top -> neck at mid
    const t = (y - g.topY) / (g.midY - g.topY); // 0..1
    return g.bulbHalf + (g.neckHalf - g.bulbHalf) * t;
  }
  // lower chamber: neck at mid -> wide at bottom
  const t = (y - g.midY) / (g.botY - g.midY); // 0..1
  return g.neckHalf + (g.bulbHalf - g.neckHalf) * t;
}

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
      cx: 0, topY: 0, botY: 0, midY: 0,
      neckHalf: 0, bulbHalf: 0, chamberH: 0,
    };
    let grains: Grain[] = [];
    let pile: number[] = []; // height map of settled bottom pile (per column)
    let running = true;
    let inView = true;

    /* rotation state: 0 = upright, 1 = upside-down (PI rad).
       phase: "flow" -> "flip" -> back to "flow" */
    let phase: "flow" | "flip" = "flow";
    let flip = 0; // current rotation 0..1 within a flip
    let flipDir = 0; // not rotating
    let flowTimer = 0;
    const FLOW_DURATION = 9; // seconds of pouring before a flip

    const GRAIN_COUNT = reduced ? 0 : 320;
    const PILE_COLS = 90;

    const setupGeometry = () => {
      const margin = Math.min(W, H) * 0.12;
      geo.cx = W / 2;
      const usableH = H - margin * 2;
      geo.topY = margin;
      geo.botY = H - margin;
      geo.midY = H / 2;
      geo.chamberH = usableH / 2;
      geo.bulbHalf = Math.min(W * 0.34, usableH * 0.32);
      geo.neckHalf = Math.max(6, geo.bulbHalf * 0.085);
    };

    const resetPile = () => {
      pile = new Array(PILE_COLS).fill(0);
    };

    const spawnGrain = (): Grain => ({
      x: geo.cx + (Math.random() - 0.5) * geo.neckHalf * 1.4,
      y: geo.midY,
      vx: (Math.random() - 0.5) * 6,
      vy: 18 + Math.random() * 26,
      r: 0.9 + Math.random() * 1.7,
      hue: Math.floor(Math.random() * GOLD.length),
      alpha: 0.75 + Math.random() * 0.25,
      settled: false,
      inStream: true,
    });

    const initGrains = () => {
      grains = [];
      resetPile();
      // pre-fill the upper chamber with a static "sand mass" look via grains
      // is drawn separately; particles handle the falling stream + pile.
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
      setupGeometry();
      initGrains();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (inView = e.isIntersecting)),
      { threshold: 0.05 }
    );
    io.observe(wrap);

    /* convert a column index (0..PILE_COLS-1) to canvas x */
    const colToX = (i: number) =>
      geo.cx - geo.bulbHalf + (i / (PILE_COLS - 1)) * geo.bulbHalf * 2;
    const xToCol = (x: number) =>
      Math.round(((x - (geo.cx - geo.bulbHalf)) / (geo.bulbHalf * 2)) * (PILE_COLS - 1));

    let last = performance.now();
    let emitAcc = 0;

    const draw = (now: number) => {
      if (!running) return;
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05; // clamp after tab switch

      ctx.clearRect(0, 0, W, H);

      if (!inView) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      /* ── phase timing ─────────────────────────────── */
      if (phase === "flow") {
        flowTimer += dt;
        if (flowTimer >= FLOW_DURATION && flip === 0) {
          phase = "flip";
          flipDir = 1;
        }
      } else if (phase === "flip") {
        flip += flipDir * dt * 0.55; // ~1.8s flip
        if (flip >= 1) {
          flip = 0;
          phase = "flow";
          flowTimer = 0;
          // after the flip, the "bottom" becomes "top": clear the pile,
          // grains restart pouring from the neck
          grains = [];
          resetPile();
        }
      }

      const rot = flip * Math.PI; // 0..PI

      /* ── apply rotation transform around center ────── */
      ctx.save();
      ctx.translate(geo.cx, geo.midY);
      ctx.rotate(rot);
      ctx.translate(-geo.cx, -geo.midY);

      /* ── draw the glass hourglass shell ────────────── */
      drawGlass(ctx, geo);

      /* ── draw the static upper sand mass (shrinking) ─ */
      const fillFrac = phase === "flip" ? 1 : Math.max(0, 1 - flowTimer / FLOW_DURATION);
      drawUpperSand(ctx, geo, fillFrac);

      /* ── physics: emit + integrate falling grains ──── */
      if (phase === "flow" && fillFrac > 0.02) {
        emitAcc += dt * 60; // emission rate
        while (emitAcc >= 1 && grains.length < GRAIN_COUNT) {
          emitAcc -= 1;
          grains.push(spawnGrain());
        }
      }

      const g = geo;
      for (let k = 0; k < grains.length; k++) {
        const p = grains[k];
        if (p.settled) continue;

        p.vy += 60 * dt; // gravity
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // funnel walls in lower chamber: keep grain inside the glass
        const hw = halfWidthAt(p.y, g);
        if (p.x < g.cx - hw) {
          p.x = g.cx - hw;
          p.vx = Math.abs(p.vx) * 0.3 + 4;
        } else if (p.x > g.cx + hw) {
          p.x = g.cx + hw;
          p.vx = -Math.abs(p.vx) * 0.3 - 4;
        }

        // settle onto the growing pile at the bottom
        const col = Math.max(0, Math.min(PILE_COLS - 1, xToCol(p.x)));
        const pileTopY = g.botY - pile[col];
        if (p.y >= pileTopY - p.r) {
          p.y = pileTopY - p.r;
          p.settled = true;
          p.inStream = false;
          // grow the pile + spread to neighbours (angle of repose)
          pile[col] += p.r * 1.5;
          if (col > 0) pile[col - 1] += p.r * 0.4;
          if (col < PILE_COLS - 1) pile[col + 1] += p.r * 0.4;
        }
      }

      /* ── draw the settled pile as a smooth golden mound ─ */
      drawPile(ctx, geo, pile, colToX);

      /* ── draw falling grains (the glowing stream) ───── */
      for (let k = 0; k < grains.length; k++) {
        const p = grains[k];
        const c = GOLD[p.hue];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${p.alpha})`;
        ctx.fill();
        if (!p.settled) {
          // soft glow for falling grains
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.06)`;
          ctx.fill();
        }
      }

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    /* ── glass shell with subtle highlights ───────────── */
    function drawGlass(c: CanvasRenderingContext2D, g: Geo) {
      const lx = g.cx - g.bulbHalf;
      const rx = g.cx + g.bulbHalf;
      c.save();

      // glass body fill (very faint)
      c.beginPath();
      c.moveTo(lx, g.topY);
      c.lineTo(rx, g.topY);
      c.lineTo(g.cx + g.neckHalf, g.midY);
      c.lineTo(rx, g.botY);
      c.lineTo(lx, g.botY);
      c.lineTo(g.cx - g.neckHalf, g.midY);
      c.closePath();
      const grad = c.createLinearGradient(lx, 0, rx, 0);
      grad.addColorStop(0, "rgba(255,255,255,0.015)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.05)");
      grad.addColorStop(1, "rgba(255,255,255,0.015)");
      c.fillStyle = grad;
      c.fill();

      // outline
      c.lineWidth = 1.4;
      c.strokeStyle = "rgba(244,213,141,0.28)";
      c.stroke();

      // glossy left highlight
      c.beginPath();
      c.moveTo(lx + 4, g.topY + 6);
      c.lineTo(g.cx - g.neckHalf - 2, g.midY);
      c.lineTo(lx + 4, g.botY - 6);
      c.lineWidth = 1.2;
      c.strokeStyle = "rgba(255,255,255,0.12)";
      c.stroke();

      // wooden caps top & bottom
      const capH = 10;
      const capExt = 14;
      c.fillStyle = "rgba(201,151,62,0.55)";
      c.fillRect(lx - capExt, g.topY - capH, (g.bulbHalf + capExt) * 2, capH);
      c.fillRect(lx - capExt, g.botY, (g.bulbHalf + capExt) * 2, capH);
      c.fillStyle = "rgba(255,233,173,0.25)";
      c.fillRect(lx - capExt, g.topY - capH, (g.bulbHalf + capExt) * 2, 2);
      c.fillRect(lx - capExt, g.botY, (g.bulbHalf + capExt) * 2, 2);

      c.restore();
    }

    /* ── upper sand mass: a settled body whose surface lowers ─ */
    function drawUpperSand(c: CanvasRenderingContext2D, g: Geo, frac: number) {
      if (frac <= 0.001) return;
      // surface y descends from top toward the neck as sand drains
      const surfaceY = g.topY + (g.midY - g.topY) * (1 - frac) * 0.92;
      const hwSurf = halfWidthAt(surfaceY, g);
      c.save();
      c.beginPath();
      c.moveTo(g.cx - hwSurf, surfaceY);
      // concave funnel surface (slight dip toward neck)
      c.quadraticCurveTo(g.cx, surfaceY + 14, g.cx + hwSurf, surfaceY);
      c.lineTo(g.cx + g.neckHalf, g.midY);
      c.lineTo(g.cx - g.neckHalf, g.midY);
      c.closePath();
      const grad = c.createLinearGradient(0, surfaceY, 0, g.midY);
      grad.addColorStop(0, "rgba(255,233,173,0.95)");
      grad.addColorStop(0.5, "rgba(229,190,110,0.92)");
      grad.addColorStop(1, "rgba(158,109,45,0.9)");
      c.fillStyle = grad;
      c.fill();
      // glow on surface
      c.beginPath();
      c.moveTo(g.cx - hwSurf, surfaceY);
      c.quadraticCurveTo(g.cx, surfaceY + 14, g.cx + hwSurf, surfaceY);
      c.lineWidth = 2;
      c.strokeStyle = "rgba(255,245,210,0.5)";
      c.stroke();
      c.restore();
    }

    /* ── bottom pile rendered as a smooth golden mound ─ */
    function drawPile(
      c: CanvasRenderingContext2D,
      g: Geo,
      ph: number[],
      cx2: (i: number) => number
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
        // clamp inside funnel
        const hw = halfWidthAt(y, g);
        const xc = Math.max(g.cx - hw, Math.min(g.cx + hw, x));
        c.lineTo(xc, y);
      }
      c.lineTo(cx2(ph.length - 1), g.botY);
      c.closePath();
      const grad = c.createLinearGradient(0, g.botY - maxH, 0, g.botY);
      grad.addColorStop(0, "rgba(255,233,173,0.95)");
      grad.addColorStop(0.5, "rgba(229,190,110,0.9)");
      grad.addColorStop(1, "rgba(158,109,45,0.92)");
      c.fillStyle = grad;
      c.fill();
      c.restore();
    }

    rafRef.current = requestAnimationFrame((t) => {
      last = t;
      draw(t);
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
      style={{
        height: "700px",
        position: "relative",
        overflow: "visible",
      }}
      aria-hidden="true"
    >
      {/* ambient golden glow behind the glass */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 45% 60% at 50% 50%, rgba(212,176,116,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

export default AIFilterFlow;
