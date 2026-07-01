import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect, lazy, Suspense, type CSSProperties } from "react";
import Icon from "@/components/ui/icon";
import CauseFlipCard from "@/components/CauseFlipCard";
import DemoRequestModal from "@/components/DemoRequestModal";

const Spline = lazy(() => import("@splinetool/react-spline"));

function GoldParticles() {
  const rnd = (min: number, max: number) => min + Math.random() * (max - min);
  // bell-shaped distribution (avg of 3 randoms) -> denser in center, sparser at edges
  const centered = (center: number, spread: number) => {
    const g = (Math.random() + Math.random() + Math.random()) / 3; // ~0.5 mean
    return center + (g - 0.5) * spread;
  };
  // Allowed zone = polygon tracing the brain outline (all values in % of the photo box).
  // Drops the empty bottom-left quadrant of the old ellipse; follows the real brain shape.
  const ZONE_POLY: [number, number][] = [
    [33, 12],   // top-left of the dome
    [52, 9],    // top
    [70, 14],   // top-right
    [82, 26],
    [87, 42],
    [86, 56],   // right side
    [80, 66],
    [72, 70],
    [74, 70],   // start of the brain stem (right) — raised
    [66, 79],
    [61, 86],   // stem bottom tip — raised
    [56, 85],
    [50, 71],
    [44, 64],   // bottom of the left lobe — raised higher
    [34, 60],
    [26, 55],
    [18, 48],   // lower-left — raised
    [16, 50],   // left side
    [15, 38],
    [18, 26],
    [24, 18],
  ];
  // ray-casting point-in-polygon test
  const inPoly = (x: number, y: number) => {
    let inside = false;
    for (let a = 0, b = ZONE_POLY.length - 1; a < ZONE_POLY.length; b = a++) {
      const [xi, yi] = ZONE_POLY[a];
      const [xj, yj] = ZONE_POLY[b];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const POLY_CX = 50;
  const POLY_CY = 45;
  // if a point is outside, pull it toward the polygon centroid until it lands inside
  const clampToZone = (x: number, y: number) => {
    if (inPoly(x, y)) return { x, y };
    for (let t = 0.15; t <= 1; t += 0.05) {
      const nx = x + (POLY_CX - x) * t;
      const ny = y + (POLY_CY - y) * t;
      if (inPoly(nx, ny)) return { x: nx, y: ny };
    }
    return { x: POLY_CX, y: POLY_CY };
  };
  const PX_PER_PCT = 2.4; // convert the small % wander into px jitter for translate()
  const ox = () => rnd(-6, 6); // wandering offsets in % (kept small)
  const oy = () => rnd(-6, 6);
  // Evenly fill the polygon: scan a jittered grid and keep cells whose center is inside.
  // This spreads stars into thin areas (left side, top, stem) far better than pure random.
  const seeds: { x: number; y: number }[] = [];
  const COLS = 16;
  const ROWS = 18;
  const cellW = (88 - 14) / COLS;
  const cellH = (90 - 9) / ROWS;
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const x = 14 + c * cellW + cellW * (0.2 + Math.random() * 0.6);
      const y = 9 + r * cellH + cellH * (0.2 + Math.random() * 0.6);
      if (inPoly(x, y)) seeds.push({ x, y });
    }
  }
  const makeStar = (i: number, base: { x: number; y: number }, bright = false) => {
    const size = bright ? 4.6 + Math.random() * 2.2 : 1.7 + Math.random() * 2.9;
    // build a wandering path, clamping every waypoint to stay inside the zone
    const path: number[] = [];
    for (let k = 0; k < 5; k++) {
      const p = clampToZone(base.x + ox(), base.y + oy());
      path.push((p.x - base.x) * PX_PER_PCT, (p.y - base.y) * PX_PER_PCT);
    }
    return {
      id: i,
      left: base.x,
      top: base.y,
      size,
      bright,
      duration: 7 + Math.random() * 10, // drift speed
      delay: -Math.random() * 18,       // negative delay = already mid-animation on load
      twinkleDur: bright ? 2.4 + Math.random() * 2 : 1.6 + Math.random() * 3.5,
      twinkleDelay: -Math.random() * 5,
      maxOpacity: bright ? 1 : 0.6 + Math.random() * 0.4,
      path,
    };
  };
  const particles = seeds.map((s, i) => makeStar(i, s));
  // 3 rare extra-bright stars placed at random existing seed positions
  for (let k = 0; k < 3 && seeds.length; k++) {
    const s = seeds[Math.floor(Math.random() * seeds.length)];
    particles.push(makeStar(1000 + k, s, true));
  }

  return (
    <div style={{ position: "absolute", inset: "0", pointerEvents: "none", zIndex: 10, overflow: "hidden" }}>
      {particles.map((p) => {
        const [x1, y1, x2, y2, x3, y3, x4, y4, x5, y5] = p.path;
        const driftKf = `gd${p.id}`;
        const twinkleKf = `gt${p.id}`;
        const dim = (p.maxOpacity * 0.18).toFixed(2); // dimmest point of the twinkle
        const mid = (p.maxOpacity * 0.6).toFixed(2);
        const bright = p.maxOpacity.toFixed(2);
        return (
          <span
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `${driftKf} ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
              willChange: "transform",
            }}
          >
            <span
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "radial-gradient(circle, #FFFBEF 0%, #F4DDA0 40%, #D4B074 65%, rgba(212,176,116,0) 80%)",
                boxShadow: p.bright
                  ? "0 0 12px 4px rgba(255,247,222,0.95), 0 0 26px 8px rgba(244,221,160,0.6)"
                  : "0 0 6px 1.5px rgba(244,221,160,0.8), 0 0 12px 3px rgba(212,176,116,0.4)",
                animation: `${twinkleKf} ${p.twinkleDur}s ease-in-out ${p.twinkleDelay}s infinite`,
                willChange: "opacity, transform",
              }}
            />
            <style>{`
              @keyframes ${driftKf} {
                0%   { transform: translate(${x1}px, ${y1}px); }
                25%  { transform: translate(${x2}px, ${y2}px); }
                50%  { transform: translate(${x3}px, ${y3}px); }
                75%  { transform: translate(${x4}px, ${y4}px); }
                100% { transform: translate(${x5}px, ${y5}px); }
              }
              @keyframes ${twinkleKf} {
                0%   { opacity: ${dim}; transform: scale(0.7); }
                50%  { opacity: ${bright}; transform: scale(1.15); }
                100% { opacity: ${mid}; transform: scale(0.85); }
              }
            `}</style>
          </span>
        );
      })}
    </div>
  );
}

function SectionDivider() {
  return (
    <div style={{ background: "#151513", padding: "60px 0", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "1620px",
          height: "1.5px",
          background:
            "linear-gradient(to right, transparent 0%, rgba(200,169,106,0.38) 35%, rgba(200,169,106,0.38) 65%, transparent 100%)",
        }}
      />
    </div>
  );
}

function LazySpline({
  scene,
  style,
  className,
  containerStyle,
}: {
  scene: string;
  style?: CSSProperties;
  className?: string;
  containerStyle?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={containerStyle}>
      {visible && (
        <Suspense fallback={null}>
          <Spline scene={scene} style={style} />
        </Suspense>
      )}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function Section({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

const card = {
  background: "#151513",
  border: "1px solid rgba(240,230,210,0.22)",
};

const cardHover = "hover:border-[rgba(240,230,210,0.45)] transition-colors duration-300 cursor-default";

const iconBox = {
  background: "rgba(212,176,116,0.08)",
  border: "1px solid rgba(212,176,116,0.18)",
};

const h2Style = {
  fontFamily: '"Bodoni Moda", Georgia, serif',
  fontWeight: 400,
  color: "#FBF6EC",
  letterSpacing: "0.01em",
};

const bodyText = {
  color: "rgba(251,246,236,0.82)",
  fontWeight: 300,
  lineHeight: 1.7,
  fontFamily: "Inter, sans-serif",
};

function hslToRgbCsv(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  return `${r},${g},${b}`;
}

const labelStyle = {
  color: "#D4B074",
  fontSize: "10px" as const,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  fontFamily: "Inter, sans-serif",
};

// 2D color picker: x=hue (0..360), y=lightness (0..100).
// Насыщенность плавно спадает к краям, чтобы можно было получить чёрный и белый,
// а светлые тона выглядели пастельными, а не кислотными.
function pickerHSL(hue: number, light: number) {
  const h = ((hue % 360) + 360) % 360;
  const l = Math.max(0, Math.min(100, light));
  let s = 70;
  if (l <= 10) s = (l / 10) * 70;
  else if (l >= 95) s = ((100 - l) / 5) * 30;
  else if (l >= 80) s = 70 - ((l - 80) / 15) * 40; // 70 → 30 на отрезке 80..95
  return { h, s, l };
}
function pickerCSS(hue: number, light: number) {
  const { h, s, l } = pickerHSL(hue, light);
  return { hsl: `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`, rgb: hslToRgbCsv(h, s, l) };
}

type PickerVal = { hue: number; light: number };

// Точные стартовые цвета (используются пока пользователь не двигал соответствующий пикер)
const DEFAULTS = {
  bg:   { hue: 38, light: 94, exact: { h: 38, s: 46, l: 94 } }, // тёплый бежевый #F8F3EA
  acc:  { hue: 38, light: 90, exact: { h: 38, s: 30, l: 90 } }, // бежевый для карточек #EFE8DD
  text: { hue: 30, light: 13, exact: { h: 30, s: 40, l: 13 } }, // ≈ #2E2113 тёмно-коричневый
};

// ─── Mini sparkline SVG ───────────────────────────────────────────────────────
function Sparkline() {
  return (
    <svg width="90" height="40" viewBox="0 0 90 40" fill="none" style={{ opacity: 0.85 }}>
      <polyline
        points="0,34 14,28 26,30 36,20 48,22 58,12 70,14 80,5 90,2"
        stroke="#D4B074"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="90" cy="2" r="3" fill="#D4B074" />
    </svg>
  );
}

// ─── Одна карточка боли с rotateY по скроллу ─────────────────────────────────
function PainCard({
  c,
  progress,
  large,
}: {
  c: { num: string; icon: string; title: string; problem: string; solution: string; loss: string };
  progress: number;
  large?: boolean;
}) {
  // rotateY: от -72deg (ребром) до 0deg (лицом) - clamp 0..1
  const p = Math.min(1, Math.max(0, progress));
  const rotateY = (1 - p) * -72;
  const opacity = 0.15 + p * 0.85;

  // Толщина карточки (3D)
  const depth = 50;
  const half = depth / 2;

  // Измеряем реальные размеры карточки, чтобы строить грани в 3D
  const measureRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Внешняя обёртка задаёт перспективу
  const sceneStyle: React.CSSProperties = {
    perspective: "1400px",
    height: "100%",
    opacity,
    transition: "none",
    willChange: "opacity",
  };

  // 3D-объект, который реально вращается вокруг своего центра по толщине
  const solidStyle: React.CSSProperties = {
    position: "relative",
    height: "100%",
    transformStyle: "preserve-3d",
    transform: `rotateY(${rotateY}deg)`,
    transition: "none",
    willChange: "transform",
  };

  // Серебряный металл для торцов
  const silver = "linear-gradient(135deg, #6e6e72 0%, #c8c8cc 25%, #9a9a9e 50%, #d6d6da 70%, #7a7a7e 100%)";
  const silverV = "linear-gradient(90deg, #6e6e72 0%, #c8c8cc 25%, #9a9a9e 50%, #d6d6da 70%, #7a7a7e 100%)";

  // Передняя (лицевая) грань с контентом - выдвинута вперёд на half.
  // В нормальном потоке: именно она задаёт высоту всего 3D-объекта.
  const cardBase: React.CSSProperties = {
    position: "relative",
    minHeight: "100%",
    background: "#0f0f0f",
    border: "1px solid rgba(240,232,218,0.45)",
    borderRadius: "16px",
    padding: large ? "28px 24px 24px" : "24px 20px 20px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transform: `translateZ(${half}px)`,
    boxShadow: "0 0 0 1px rgba(240,232,218,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
    zIndex: 1,
  };

  // Все торцы строятся от ЦЕНТРА коробки (классический CSS-куб),
  // когда известны реальные размеры лицевой грани.
  const W = size.w;
  const H = size.h;

  // Задняя грань
  const backStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${W}px`,
    height: `${H}px`,
    background: "#0a0a0a",
    borderRadius: "16px",
    transform: `translate(-50%, -50%) translateZ(-${half}px)`,
  };
  // Правый торец
  const rightStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${depth}px`,
    height: `${H}px`,
    background: silverV,
    transform: `translate(-50%, -50%) translateX(${W / 2}px) rotateY(90deg)`,
  };
  // Левый торец
  const leftStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${depth}px`,
    height: `${H}px`,
    background: silverV,
    transform: `translate(-50%, -50%) translateX(-${W / 2}px) rotateY(-90deg)`,
  };
  // Верхний торец
  const topStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${W}px`,
    height: `${depth}px`,
    background: silver,
    transform: `translate(-50%, -50%) translateY(-${H / 2}px) rotateX(90deg)`,
  };
  // Нижний торец
  const bottomStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${W}px`,
    height: `${depth}px`,
    background: silver,
    transform: `translate(-50%, -50%) translateY(${H / 2}px) rotateX(-90deg)`,
  };

  const iconSize = 52;

  return (
    <div style={sceneStyle}>
      <div style={solidStyle}>
        {/* Торцы строятся только когда известны размеры - позиционируются от центра */}
        {W > 0 && (
          <>
            <div style={rightStyle} />
            <div style={leftStyle} />
            <div style={topStyle} />
            <div style={bottomStyle} />
            <div style={backStyle} />
          </>
        )}

        {/* Лицевая грань */}
        <div ref={measureRef} style={cardBase}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "120px", height: "120px", background: "radial-gradient(circle, rgba(196,158,84,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Основной layout: левая колонка (номер + иконка) + правая (текст) */}
          <div style={{ display: "flex", gap: "18px", flex: 1, minHeight: 0 }}>

            {/* Левая колонка */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#D4B074", fontWeight: 700, letterSpacing: "0.14em" }}>{c.num}</span>
              <div style={{ width: iconSize, height: iconSize, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={c.icon} size={28} style={{ color: "rgba(200,200,210,0.7)" }} />
              </div>
            </div>

            {/* Правая колонка */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <h3 style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: large ? "23px" : "18px", color: "#FBF6EC", fontWeight: 400, lineHeight: 1.3, marginBottom: "16px", whiteSpace: "pre-line" }}>{c.title}</h3>
              <div style={{ marginBottom: "12px" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#D4B074", fontWeight: 600, marginBottom: "4px" }}>Проблема:</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: large ? "14px" : "13px", color: "rgba(251,246,236,0.62)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{c.problem}</p>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#D4B074", fontWeight: 600, marginBottom: "4px" }}>Что показывает SalesFlow:</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: large ? "14px" : "13px", color: "rgba(251,246,236,0.62)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{c.solution}</p>
              </div>
              <div style={{ marginTop: "auto", borderTop: "1px solid rgba(212,176,116,0.12)", paddingTop: "12px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(251,246,236,0.38)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "3px" }}>Потенциальная потеря:</p>
                  <p style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: large ? "21px" : "17px", color: "#D4B074", fontWeight: 400 }}>{c.loss}</p>
                </div>
                <Sparkline />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Radar Scanner Animation ──────────────────────────────────────────────
function RadarScanner() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "100px 0px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Data points around radar (polar coordinates)
  const points = [
    { angle: 18, radius: 28, importance: 0.6 },
    { angle: 52, radius: 38, importance: 1.0, danger: true },
    { angle: 78, radius: 22, importance: 0.5 },
    { angle: 112, radius: 34, importance: 0.85 },
    { angle: 145, radius: 40, importance: 0.7 },
    { angle: 178, radius: 26, importance: 1.0 },
    { angle: 210, radius: 36, importance: 0.55 },
    { angle: 238, radius: 30, importance: 0.65, danger: true },
    { angle: 268, radius: 42, importance: 0.95 },
    { angle: 295, radius: 24, importance: 0.5 },
    { angle: 325, radius: 38, importance: 0.8, danger: true },
    { angle: 350, radius: 32, importance: 0.6 },
  ];

  // Floating dust particles
  const dust = Array.from({ length: 22 }, (_, i) => ({
    x: (i * 47 + 13) % 100,
    y: (i * 31 + 7) % 100,
    size: 0.5 + (i % 4) * 0.3,
    duration: 7 + (i % 5) * 1.6,
    delay: (i % 7) * 0.5,
  }));

  // Particles attracted toward center
  const attractors = Array.from({ length: 10 }, (_, i) => ({
    angle: (i * 36 + 12) % 360,
    distance: 45 + (i % 3) * 8,
    duration: 5 + (i % 4) * 1.2,
    delay: (i % 5) * 0.8,
  }));

  const rings = [28, 42, 56, 70, 84]; // % sizes of concentric rings

  return (
    <div
      ref={rootRef}
      className={`rd-root ${active ? "rd-on" : "rd-off"}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "780px",
        overflow: "visible",
        background: "transparent",
      }}
    >
      {/* Soft volumetric glow on background only (no card) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(240,232,218,0.04) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Floating dust */}
      {dust.map((d, i) => (
        <div
          key={`d-${i}`}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.size * 2}px`,
            height: `${d.size * 2}px`,
            borderRadius: "50%",
            background: "rgba(240,232,218,0.6)",
            boxShadow: "0 0 6px rgba(240,232,218,0.45)",
            animation: `rdDustFloat ${d.duration}s ease-in-out ${d.delay}s infinite`,
            opacity: 0.35,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Attractor particles drifting toward center */}
      {attractors.map((a, i) => {
        const rad = (a.angle * Math.PI) / 180;
        const startX = 50 + Math.cos(rad) * a.distance;
        const startY = 50 + Math.sin(rad) * a.distance;
        return (
          <div
            key={`a-${i}`}
            style={{
              position: "absolute",
              left: `${startX}%`,
              top: `${startY}%`,
              width: "2px",
              height: "2px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,250,1) 0%, rgba(240,232,218,0.5) 60%, transparent 100%)",
              boxShadow: "0 0 10px rgba(255,255,250,0.8)",
              ["--dx" as string]: `${50 - startX}%`,
              ["--dy" as string]: `${50 - startY}%`,
              animation: `rdAttract ${a.duration}s ease-in-out ${a.delay}s infinite`,
              pointerEvents: "none",
            } as React.CSSProperties}
          />
        );
      })}

      {/* Radar container */}
      <div
        style={{
          position: "absolute",
          left: "36%",
          top: "50%",
          width: "min(121%, 924px)",
          aspectRatio: "1 / 1",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Concentric rings */}
        {rings.map((size, i) => (
          <div
            key={`ring-${i}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: `${size}%`,
              height: `${size}%`,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: `1px solid rgba(240,232,218,${0.08 + i * 0.03})`,
              boxShadow: `inset 0 0 ${20 + i * 6}px rgba(240,232,218,0.04)`,
            }}
          />
        ))}

        {/* Outer halo */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "90%",
            height: "90%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, transparent 55%, rgba(240,232,218,0.05) 70%, transparent 85%)",
            pointerEvents: "none",
          }}
        />

        {/* Cross lines */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "8%",
            bottom: "8%",
            width: "1px",
            transform: "translateX(-50%)",
            background:
              "linear-gradient(180deg, transparent, rgba(240,232,218,0.08) 50%, transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "8%",
            right: "8%",
            height: "1px",
            transform: "translateY(-50%)",
            background:
              "linear-gradient(90deg, transparent, rgba(240,232,218,0.08) 50%, transparent)",
          }}
        />

        {/* Secondary rotating ring (subtle) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "60%",
            height: "60%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "1px dashed rgba(240,232,218,0.22)",
            animation: "rdSpinSlow 28s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "38%",
            height: "38%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "1px dashed rgba(240,232,218,0.12)",
            animation: "rdSpinReverse 36s linear infinite",
          }}
        />

        {/* Rotating scan sector */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "84%",
            height: "84%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(240,232,218,0.03) 20deg, rgba(240,232,218,0.2) 55deg, rgba(255,250,240,0.35) 72deg, rgba(255,255,250,0.5) 78deg, transparent 80deg)",
            animation: "rdScan 8s linear infinite",
            pointerEvents: "none",
            willChange: "transform",
          }}
        />
        {/* Sharp leading edge */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "84%",
            height: "84%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 76deg, rgba(255,255,250,0.7) 79deg, rgba(255,255,255,0.85) 80deg, transparent 81deg)",
            animation: "rdScan 8s linear infinite",
            pointerEvents: "none",
            willChange: "transform",
          }}
        />

        {/* Data points */}
        {points.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * p.radius;
          const y = 50 + Math.sin(rad) * p.radius;
          const isDanger = (p as { danger?: boolean }).danger;
          const isHot = p.importance > 0.85;
          const size = isDanger ? 9 : 6 + p.importance * 5;
          const delay = (p.angle / 360) * 8; // synced with scan rotation
          return (
            <div
              key={`pt-${i}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                background: isDanger
                  ? "radial-gradient(circle, rgba(255,90,90,1) 0%, rgba(255,60,60,0.6) 50%, transparent 90%)"
                  : isHot
                  ? "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(240,232,218,0.6) 50%, transparent 90%)"
                  : "radial-gradient(circle, rgba(240,232,218,0.95) 0%, rgba(220,210,190,0.4) 60%, transparent 100%)",
                boxShadow: isDanger
                  ? "0 0 16px rgba(255,80,80,0.95), 0 0 32px rgba(255,60,60,0.55)"
                  : isHot
                  ? "0 0 14px rgba(255,255,250,0.95), 0 0 28px rgba(255,255,250,0.5)"
                  : "0 0 8px rgba(240,232,218,0.55)",
                animation: `rdPointPulse ${4 + (i % 3) * 0.6}s ease-in-out ${delay}s infinite`,
                pointerEvents: "none",
              }}
            />
          );
        })}

        {/* Ripple waves from danger & hot points */}
        {points.filter((p) => (p as { danger?: boolean }).danger || p.importance > 0.85).map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * p.radius;
          const y = 50 + Math.sin(rad) * p.radius;
          const isDanger = (p as { danger?: boolean }).danger;
          return (
            <div
              key={`rp-${i}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                border: isDanger
                  ? "1px solid rgba(255,80,80,0.7)"
                  : "1px solid rgba(255,255,250,0.7)",
                animation: `rdRipple ${4 + i * 0.4}s ease-out ${(p.angle / 360) * 8}s infinite`,
                pointerEvents: "none",
              }}
            />
          );
        })}

        {/* Center core */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "10%",
            height: "10%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,250,0.55) 0%, rgba(240,232,218,0.25) 40%, transparent 80%)",
            boxShadow: "0 0 36px rgba(240,232,218,0.45)",
            animation: "rdCorePulse 3.5s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "4%",
            height: "4%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.98)",
            boxShadow:
              "0 0 16px rgba(255,255,250,0.95), 0 0 32px rgba(240,232,218,0.6)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Bottom legend (kept minimal, no background) */}
      <div
        style={{
          position: "absolute",
          bottom: "22px",
          left: "24px",
          right: "24px",
          display: "none",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: "10px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(240,232,218,0.4)",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "rgba(255,200,130,0.9)",
              boxShadow: "0 0 8px rgba(255,180,100,0.7)",
            }}
          />
          <span>Hidden Loss</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "rgba(240,232,218,0.7)",
            }}
          />
          <span>Data Signal</span>
        </div>
      </div>

      <style>{`
        .rd-off * { animation-play-state: paused !important; }
        .rd-on  * { animation-play-state: running; }
        @keyframes rdScan {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes rdSpinSlow {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes rdSpinReverse {
          0% { transform: translate(-50%, -50%) rotate(360deg); }
          100% { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes rdPointPulse {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1;    transform: translate(-50%, -50%) scale(1.35); }
        }
        @keyframes rdRipple {
          0%   { width: 8px; height: 8px; opacity: 0.8; }
          100% { width: 70px; height: 70px; opacity: 0; }
        }
        @keyframes rdCorePulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1;   transform: translate(-50%, -50%) scale(1.18); }
        }
        @keyframes rdDustFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50%      { transform: translate(8px, -12px); opacity: 0.65; }
        }
        @keyframes rdAttract {
          0%   { transform: translate(0, 0); opacity: 0; }
          15%  { opacity: 0.9; }
          85%  { opacity: 0.8; }
          100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Spline Feature Section ───────────────────────────────────────────────────
function SplineFeatureSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [hovered, setHovered] = useState<number | null>(null);

  const G = "#C8A96A";
  const T = "#F3EDE3";
  const S = "#B8AA98";

  const cards = [
    {
      badge: "AI Detected",
      title: "Потребность не выявлена",
      text: "Менеджер начал презентовать продукт, ещё не поняв, что важно клиенту. AI подсвечивает момент, где разговор свернул не туда - и подсказывает, какой вопрос вернул бы сделку в нужное русло.",
      metric: "Риск потери сделки",
      metricVal: "Высокий",
      progress: 78,
      tone: "danger" as const,
      pos: "left-top",
    },
    {
      badge: "Risk",
      title: "Возражение не обработано",
      text: "Клиент трижды сомневался, но ключевое возражение так и осталось без ответа. Интерес остывает - AI фиксирует точный момент, где сделку ещё можно было вернуть.",
      metric: "Потеря интереса",
      metricVal: "72%",
      progress: 72,
      tone: "danger" as const,
      pos: "left-bottom",
    },
    {
      badge: "AI Detected",
      title: "Клиента перебили 5 раз",
      text: "Когда менеджер не даёт договорить, клиент закрывается. AI ловит каждое перебивание и показывает, как это рушит доверие и шансы закрыть сделку.",
      metric: "Вовлечённость клиента",
      metricVal: "Снижена",
      progress: 38,
      tone: "danger" as const,
      pos: "right-top",
    },
    {
      badge: "Risk",
      title: "Ценность не объяснена",
      text: "Разговор ушёл к цене раньше, чем клиент понял, за что платит. AI показывает, где именно стоило усилить аргументацию и раскрыть выгоду.",
      metric: "Вероятность сделки",
      metricVal: "Ниже нормы",
      progress: 44,
      tone: "danger" as const,
      pos: "right-bottom",
    },
    {
      badge: "Recommendation",
      title: "AI Score: 62 / 100",
      text: "Звонок можно было закрыть. AI разобрал его по шагам: выяви потребность в начале, сними ключевое возражение и зафиксируй следующий шаг с клиентом - и конверсия пойдёт вверх.",
      metric: "Потенциал роста конверсии",
      metricVal: "+18%",
      progress: 62,
      tone: "light" as const,
      pos: "bottom-center",
    },
  ];

  const Card = ({ card, idx }: { card: typeof cards[0]; idx: number }) => {
    const active = hovered === idx;
    const isLight = card.tone === "light";
    const isDanger = card.tone === "danger";

    const accentColor = isLight ? "#2F8F4E" : isDanger ? "#D94F4F" : "#6DBF82";
    const progressColor = isDanger
      ? "linear-gradient(to right, rgba(217,79,79,0.35), #D94F4F)"
      : "linear-gradient(to right, rgba(47,143,78,0.35), #2F8F4E)";

    const borderColor = isLight
      ? active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)"
      : active ? "rgba(230,225,215,0.42)" : "rgba(210,205,195,0.16)";

    const shadow = isLight
      ? active
        ? "0 22px 70px rgba(0,0,0,0.55), 0 6px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.9)"
        : "0 14px 50px rgba(0,0,0,0.45), 0 4px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.8)"
      : active
        ? "0 14px 52px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.07)"
        : "0 5px 30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)";

    return (
      <div
        className="aiv-card"
        onMouseEnter={() => setHovered(idx)}
        onMouseLeave={() => setHovered(null)}
        style={{
          background: isLight
            ? active
              ? "linear-gradient(150deg, #FFFFFF 0%, #FBFAF7 60%, #F6F4EF 100%)"
              : "linear-gradient(150deg, #FCFBF9 0%, #F8F6F2 60%, #F2F0EA 100%)"
            : active
              ? "linear-gradient(145deg, #1f1f21 0%, #121211 60%, #0e0e0d 100%)"
              : "linear-gradient(145deg, #1a1a1a 0%, #101010 60%, #0c0c0b 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${borderColor}`,
          borderRadius: "22px",
          padding: isLight ? "38px 40px" : "32px 32px",
          width: "100%",
          cursor: "default",
          boxShadow: shadow,
          transform: active ? "translateY(-7px)" : "translateY(0)",
          transition: "all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          opacity: inView ? 1 : 0,
          transitionDelay: inView ? `${0.3 + idx * 0.1}s` : "0s",
          pointerEvents: "auto",
          position: "relative" as const,
          overflow: "hidden",
        }}
      >
        {/* Badge */}
        <div className="aiv-card-badge" style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "18px" }}>
          <div style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: accentColor,
            boxShadow: active ? `0 0 11px ${accentColor}` : "none",
            transition: "all 0.4s ease",
            flexShrink: 0,
          }} />
          <span className="aiv-card-badge-text" style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase" as const,
            color: accentColor,
            fontWeight: 600,
            opacity: 0.95,
          }}>{card.badge}</span>
          <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${isLight ? "rgba(47,143,78,0.25)" : accentColor + "30"}, transparent)` }} />
        </div>

        {/* Title */}
        <p className="aiv-card-title" style={{
          fontFamily: '"Bodoni Moda", Georgia, serif',
          fontSize: isLight ? "26px" : "21px",
          color: isLight ? "#16140F" : "#F7F2EA",
          fontWeight: 400,
          lineHeight: 1.22,
          marginBottom: "15px",
          letterSpacing: "0.01em",
        }}>{card.title}</p>

        {/* Body */}
        <p className="aiv-card-body" style={{
          fontFamily: "Inter, sans-serif",
          fontSize: isLight ? "16px" : "15px",
          color: isLight ? "#3A352C" : "#D6D3CD",
          lineHeight: 1.68,
          marginBottom: "24px",
          fontWeight: 400,
        }}>{card.text}</p>

        {/* Progress bar */}
        <div className="aiv-card-progress" style={{ marginBottom: "16px" }}>
          <div style={{
            width: "100%",
            height: "3px",
            borderRadius: "3px",
            background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)",
          }}>
            <div style={{
              width: `${card.progress}%`,
              height: "100%",
              borderRadius: "3px",
              background: progressColor,
              transition: "width 1s ease 0.5s",
            }} />
          </div>
        </div>

        {/* Metric */}
        <div className="aiv-card-metric" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontSize: isLight ? "14px" : "13.5px",
            color: isLight ? "#6B6456" : "#9a9690",
            letterSpacing: "0.03em",
          }}>{card.metric}</span>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontSize: isLight ? "15px" : "14px",
            color: accentColor,
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}>{card.metricVal}</span>
        </div>
      </div>
    );
  };

  return (
    <section
      ref={ref}
      className="aiv-section"
      style={{
        background: "#151513",
        padding: "0 20px 160px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <SectionDivider />

      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center aiv-header" style={{
          paddingTop: "100px",
          paddingBottom: "0",
          position: "relative",
          zIndex: 5,
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <h2 className="aiv-title" style={{
            fontFamily: '"Bodoni Moda", Georgia, serif',
            fontSize: "clamp(30px, 4.5vw, 58px)",
            color: T,
            fontWeight: 400,
            lineHeight: 1.1,
            marginBottom: "20px",
          }}>
            Что AI видит внутри разговора
          </h2>
          <p className="aiv-sub" style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            color: S,
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.8,
          }}>
            Voice-Tec находит моменты, где менеджеры теряют клиентов,<br />и показывает, как вернуть продажи.
          </p>
        </div>

        {/* ── Main composition: cards + robot ── */}
        {/* Spline canvas - absolute на всю зону, карточки поверх */}
        <div className="aiv-stage-wrap" style={{ position: "relative", marginTop: "60px", minHeight: "680px" }}>
        <div className="aiv-stage" style={{ position: "relative" }}>

          {/* Spline на весь контейнер - canvas покрывает всю интерактивную область */}
          <div className="aiv-spline-bg" style={{
            position: "absolute",
            top: "-25%",
            bottom: "-25%",
            left: "-25%",
            right: "-25%",
            zIndex: 0,
            opacity: inView ? 1 : 0,
            transition: "opacity 1s ease 0.2s",
            pointerEvents: "auto",
          }}>
            {/* Ambient glow */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 50% 50%, rgba(200,169,106,0.07) 0%, transparent 55%)",
              pointerEvents: "none",
              zIndex: 1,
            }} />
            <LazySpline
              scene="https://prod.spline.design/ftUPjjfe6wGNb2BY/scene.splinecode"
              containerStyle={{ width: "100%", height: "100%" }}
              style={{ width: "100%", height: "100%", transform: "scale(0.667)", transformOrigin: "center center" }}
            />
            {/* Fade edges - скрывают края canvas, не мешают событиям */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, #151513 0%, transparent 20%, transparent 80%, #151513 100%)",
              pointerEvents: "none",
              zIndex: 2,
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, #151513 0%, transparent 12%, transparent 82%, #151513 100%)",
              pointerEvents: "none",
              zIndex: 2,
            }} />
          </div>

          {/* Desktop layout - карточки поверх Spline canvas */}
          {/* pointer-events: none на всех обёртках - Spline видит мышь везде */}
          {/* pointer-events: auto только на самих карточках */}
          <div className="aiv-grid grid" style={{
            gridTemplateColumns: "400px 1fr 400px",
            gridTemplateRows: "auto",
            gap: "22px",
            alignItems: "center",
            position: "relative",
            zIndex: 3,
            minHeight: "580px",
            pointerEvents: "none",
            marginLeft: "-60px",
            marginRight: "-60px",
          }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", pointerEvents: "none" }}>
              <Card card={cards[0]} idx={0} />
              <Card card={cards[1]} idx={1} />
            </div>

            {/* Center: пустое пространство - Spline canvas проходит насквозь */}
            <div style={{ height: "580px", pointerEvents: "none" }} />

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", pointerEvents: "none" }}>
              <Card card={cards[2]} idx={2} />
              <Card card={cards[3]} idx={3} />
            </div>
          </div>

          {/* Bottom center card */}
          <div className="aiv-bottom flex" style={{ justifyContent: "center", marginTop: "24px", position: "relative", zIndex: 3, pointerEvents: "none" }}>
            <div style={{ width: "540px", pointerEvents: "none" }}>
              <Card card={cards[4]} idx={4} />
            </div>
          </div>

        </div>
        </div>
      </div>

      <style>{`
        .sfs-card-glow:hover {
          box-shadow: 0 8px 40px rgba(200,169,106,0.18), 0 2px 16px rgba(0,0,0,0.5);
        }
      `}</style>
    </section>
  );
}

// ─── Audience Card ──────────────────────────────────────────────────────────────
function AudienceCard({ it, i, inView, W, G, B, GREEN }: {
  it: { icon: string; tag: string; desc: string; gain: string; img?: string };
  i: number; inView: boolean; W: string; G: string; B: string; GREEN: string;
}) {
  // карточки прилетают со стороны, где они стоят в ряду из 4: крайние - с боков, центральные - снизу
  const col = i % 4;
  const fromX = col === 0 ? -260 : col === 3 ? 260 : 0;
  const fromY = col === 1 || col === 2 ? 200 : 120;
  const fromRot = col === 0 ? -7 : col === 3 ? 7 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: fromX, y: fromY, scale: 0.82, rotate: fromRot }}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 } : {}}
      transition={{ duration: 1.05, delay: 0.15 + i * 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="aud-card"
      style={{
        position: "relative", display: "flex", flexDirection: "column",
        minHeight: "620px",
        background: "linear-gradient(135deg, #1c1c1d 0%, #141414 42%, #0f0f10 72%, #18181a 100%)",
        border: "1px solid rgba(212,176,116,0.18)",
        borderRadius: "30px", padding: "60px 52px", overflow: "hidden",
        boxShadow: "inset 0 1px 0 rgba(255,236,200,0.06), 0 10px 30px rgba(0,0,0,0.4)",
        transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      {/* фото сверху, плавно растворяющееся в фон карточки */}
      {it.img && (
        <div className="aud-card-img" style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "440px",
          zIndex: 0, pointerEvents: "none",
        }}>
          <img
            src={it.img}
            alt={it.tag}
            style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 22%, rgba(0,0,0,0.92) 38%, rgba(0,0,0,0.6) 54%, rgba(0,0,0,0.32) 68%, rgba(0,0,0,0.12) 82%, rgba(0,0,0,0) 95%)",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 22%, rgba(0,0,0,0.92) 38%, rgba(0,0,0,0.6) 54%, rgba(0,0,0,0.32) 68%, rgba(0,0,0,0.12) 82%, rgba(0,0,0,0) 95%)",
            }}
          />
        </div>
      )}

      <div className="aud-shine" style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(212,176,116,0.5), transparent)",
        opacity: 0, transition: "opacity 0.3s ease", zIndex: 2,
      }} />

      <div className="aud-card-spacer" style={{ marginTop: it.img ? "300px" : "0" }} />

      <div className="aud-card-tag" style={{
        position: "relative", zIndex: 1,
        fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "38px", color: W,
        fontWeight: 500, lineHeight: 1.2, marginBottom: "24px",
      }}>
        {it.tag}
      </div>

      <p className="aud-card-desc" style={{
        position: "relative", zIndex: 1,
        fontFamily: "Inter, sans-serif", fontSize: "20px", color: B,
        lineHeight: 1.6, marginBottom: "36px", flex: 1,
      }}>
        {it.desc}
      </p>

      <div className="aud-card-gain" style={{
        position: "relative", zIndex: 1,
        paddingTop: "32px", borderTop: "1px solid rgba(74,222,128,0.2)",
      }}>
        <div className="aud-card-gain-head flex items-center gap-3" style={{ marginBottom: "14px" }}>
          <span className="aud-card-gain-ic" style={{
            width: "34px", height: "34px", borderRadius: "11px", flexShrink: 0,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "rgba(74,222,128,0.14)", border: "1px solid rgba(74,222,128,0.35)",
          }}>
            <Icon name="Check" size={20} style={{ color: GREEN }} />
          </span>
          <span className="aud-card-gain-title" style={{
            fontFamily: "Inter, sans-serif", fontSize: "13px", letterSpacing: "0.14em",
            textTransform: "uppercase", fontWeight: 600, color: GREEN, opacity: 0.95,
          }}>
            Что получит бизнес
          </span>
        </div>
        <p className="aud-card-gain-text" style={{ fontFamily: "Inter, sans-serif", fontSize: "19px", color: B, lineHeight: 1.6, opacity: 0.95 }}>
          {it.gain}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Audience Section (Для кого подходит) ───────────────────────────────────────
function AudienceSection() {
  const W = "#FBF6EC";
  const G = "#D4B074";
  const B = "#C9C2B2";
  const GREEN = "#4ADE80";

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const blockOneRef = useRef(null);
  const blockOneInView = useInView(blockOneRef, { once: true, margin: "-120px" });

  const blockOne = [
    {
      icon: "Briefcase",
      img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/991277f7-dfcc-45e9-bd9b-a8f1295d68b9.jpg",
      tag: "Отделы продаж B2B и B2C",
      desc: "Для компаний, где менеджеры обрабатывают входящие заявки, проводят консультации, презентуют продукт и закрывают сделки.",
      gain: "Видите каждый этап сделки и точно знаете, где теряется клиент - конверсия растёт без расширения штата.",
    },
    {
      icon: "Headphones",
      img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/e20956ae-3ebf-4f89-9e40-54cdf6b5b924.jpg",
      tag: "Колл-центры и контакт-центры",
      desc: "Для команд, где много звонков, операторов и повторяющихся сценариев общения.",
      gain: "Автоматически проверяете 100% разговоров и видите, кто работает по стандарту, а кому нужна помощь - качество растёт по всей команде.",
    },
    {
      icon: "Building2",
      img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/31bf772a-18d2-439e-98f3-1a361a364f1a.jpg",
      tag: "Недвижимость, авто и премиум",
      desc: "Автодилеры, агентства недвижимости, ремонт под ключ, юридические услуги, консалтинг, премиальные услуги.",
      gain: "Каждый дорогой лид отработан по скрипту - менеджер не теряет сделку, и вы выигрываете у конкурентов в сравнении.",
    },
    {
      icon: "Stethoscope",
      img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/b49f2db2-60fc-44d2-b856-50935b537e5f.jpg",
      tag: "Клиники, медцентры и эстетика",
      desc: "Для бизнесов, где запись зависит от качества консультации администратора или менеджера.",
      gain: "Администраторы объясняют ценность и снимают сомнения - больше пациентов записываются и доходят до визита.",
    },
  ];

  return (
    <section className="aud-section" style={{ background: "#151513", padding: "120px 0 130px", overflow: "hidden", position: "relative" }}>
      {/* мягкое золотое свечение по центру */}
      <div
        style={{
          position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)",
          width: "760px", height: "420px", pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(212,176,116,0.10) 0%, transparent 70%)",
          filter: "blur(20px)", zIndex: 1,
        }}
      />

      <div className="mx-auto px-5 sm:px-8" style={{ maxWidth: "1720px", position: "relative", zIndex: 2 }}>
        <div ref={ref} className="text-center" style={{ marginBottom: "8px" }}>
          <motion.h2
            className="aud-title"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontFamily: '"Bodoni Moda", Georgia, serif', fontWeight: 500,
              fontSize: "clamp(28px, 3.6vw, 50px)", lineHeight: 1.18, color: W,
              maxWidth: "1500px", margin: "0 auto",
            }}
          >
            Voice-Tec AI создан для компаний, где <span style={{ color: G, fontStyle: "italic" }}>звонки, заявки и консультации</span> напрямую влияют на выручку
          </motion.h2>
        </div>

        {/* ── Блок 1 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
          style={{ marginTop: "130px", marginBottom: "40px" }}
        >
          <h3 className="aud-subhead quartz-text" style={{
            fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(20px, 2.6vw, 32px)",
            fontWeight: 500, lineHeight: 1.25, maxWidth: "1100px", margin: "0 auto",
          }}>
            Где каждый день идут десятки или сотни разговоров
          </h3>
          <div className="gold-bar" />
        </motion.div>

        <div ref={blockOneRef} className="aud-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
          {blockOne.map((it, i) => (
            <AudienceCard key={i} it={it} i={i} inView={blockOneInView} W={W} G={G} B={B} GREEN={GREEN} />
          ))}
        </div>

        <motion.div
          className="aud-note"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            marginTop: "28px", padding: "22px 26px", borderRadius: "16px",
            background: "rgba(212,176,116,0.05)", border: "1px solid rgba(212,176,116,0.16)",
            display: "flex", alignItems: "flex-start", gap: "14px",
          }}
        >
          <Icon name="ShieldCheck" size={22} className="aud-note-ic" style={{ color: G, marginTop: "2px", flexShrink: 0 }} />
          <p className="aud-note-text" style={{ fontFamily: "Inter, sans-serif", fontSize: "15.5px", color: B, lineHeight: 1.6 }}>
            Здесь Voice-Tec AI работает как автоматический контроль отдела продаж:
            слушает <span style={{ color: G }}>100% разговоров</span>, находит слабые места
            менеджеров и показывает, где бизнес теряет заявки.
          </p>
        </motion.div>

      </div>

      <style>{`
        .aud-card:hover {
          transform: translateY(-6px);
          border-color: rgba(212,176,116,0.5) !important;
          box-shadow: inset 0 1px 0 rgba(255,236,200,0.10), 0 18px 50px rgba(0,0,0,0.55), 0 0 40px rgba(212,176,116,0.10) !important;
        }
        .aud-card:hover .aud-shine { opacity: 1; }
        .aud-card:hover .aud-icon {
          transform: scale(1.08) rotate(-4deg);
          background: rgba(212,176,116,0.2) !important;
        }
        @media (min-width: 640px) {
          .aud-subhead { white-space: nowrap; }
        }
        @media (min-width: 1100px) {
          .aud-grid-4 { grid-template-columns: repeat(4, 1fr) !important; }
        }
        .quartz-text {
          background: linear-gradient(
            105deg,
            #e9e4d8 0%,
            #ffffff 22%,
            #ffffff 38%,
            #fffefb 46%,
            #ffffff 54%,
            #d8d2c6 70%,
            #ffffff 88%,
            #eee9dd 100%
          );
          background-size: 240% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: quartzShift 7s ease-in-out infinite;
          text-shadow: 0 0 22px rgba(255,255,255,0.12);
        }
        @keyframes quartzShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gold-bar {
          position: relative;
          width: 420px;
          max-width: 80%;
          height: 2px;
          margin: 18px auto 0;
          border-radius: 2px;
          background: linear-gradient(90deg, rgba(212,176,116,0) 0%, rgba(212,176,116,0.45) 50%, rgba(212,176,116,0) 100%);
          overflow: hidden;
        }
        .gold-bar::after {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(255,245,220,0.15) 30%, rgba(255,236,190,0.95) 50%, rgba(255,245,220,0.15) 70%, transparent 100%);
          filter: blur(0.4px);
          animation: goldShine 4.5s ease-in-out infinite;
        }
        @keyframes goldShine {
          0%   { left: -60%; opacity: 0; }
          12%  { opacity: 1; }
          40%  { left: 100%; opacity: 1; }
          50%  { left: 100%; opacity: 0; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}

// ─── ROP Section (для руководителей отдела продаж) ──────────────────────────────
function RopSection() {
  const W = "#FBF6EC";
  const G = "#D4B074";
  const B = "#C9C2B2";

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    {
      icon: "Eye",
      title: "Полная прозрачность отдела",
      desc: "Видишь реальную картину: что работает, а что тормозит продажи.",
    },
    {
      icon: "Clock",
      title: "Освободи своё время",
      desc: "AI берёт рутину на себя: отчёты, анализ, контроль, напоминания.",
    },
    {
      icon: "TrendingUp",
      title: "Фокус на развитии",
      desc: "Больше времени на стратегию, команду и рост результатов.",
    },
    {
      icon: "Target",
      title: "Рост конверсии до 25%",
      desc: "С Voice-Tec AI и твоим управлением — рост становится системой.",
    },
  ];

  const badges = [
    { icon: "Users", title: "Контроль команды", sub: "в реальном времени", pos: { top: "14%", left: "-4%" } },
    { icon: "AudioLines", title: "Аналитика звонков", sub: "и переписок с AI", pos: { top: "22%", right: "-6%" } },
    { icon: "TrendingUp", title: "Выявление точек роста", sub: "и узких мест", pos: { top: "58%", left: "-2%" } },
    { icon: "FileText", title: "Автоматические отчёты", sub: "без рутины", pos: { top: "66%", right: "-4%" } },
  ];

  return (
    <section
      ref={ref}
      className="rop-section"
      style={{
        background: "#151513",
        padding: "100px 0 110px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div className="mx-auto px-5 sm:px-8" style={{ maxWidth: "1400px", position: "relative", zIndex: 2 }}>
        {/* outer rounded frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rop-frame"
          style={{
            position: "relative",
          }}
        >
          {/* ambient glow */}
          <div
            aria-hidden
            style={{
              position: "absolute", top: "-10%", right: "8%",
              width: "620px", height: "620px", pointerEvents: "none",
              background: "radial-gradient(ellipse at center, rgba(212,176,116,0.1) 0%, transparent 70%)",
              filter: "blur(10px)", zIndex: 0,
            }}
          />

          <div className="rop-cols" style={{ position: "relative", zIndex: 1 }}>
            {/* ── LEFT ── */}
            <div className="rop-left">
              <h2
                className="rop-title"
                style={{
                  fontFamily: '"Bodoni Moda", Georgia, serif', fontWeight: 600,
                  fontSize: "clamp(32px, 4vw, 54px)", lineHeight: 1.1, color: W,
                  marginBottom: "24px", letterSpacing: "0.005em",
                }}
              >
                Ты — РОП.<br />
                Ты управляешь <span style={{ color: G }}>результатом.</span>
              </h2>

              <p
                className="rop-sub"
                style={{
                  fontFamily: "Inter, sans-serif", fontSize: "clamp(15px, 1.6vw, 18px)",
                  color: B, lineHeight: 1.65, fontWeight: 300, maxWidth: "560px", marginBottom: "40px",
                }}
              >
                Voice-Tec AI станет твоим инструментом контроля, анализа и роста
                продаж. Освободи время от рутины и сфокусируйся на развитии команды
                и увеличении выручки.
              </p>

              {/* benefit rows */}
              <div className="flex flex-col" style={{ gap: "14px" }}>
                {benefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -24 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-4"
                    style={{
                      padding: "20px 22px", borderRadius: "16px",
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(212,176,116,0.12)",
                    }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: "46px", height: "46px", borderRadius: "12px",
                        background: "rgba(212,176,116,0.1)",
                        border: "1px solid rgba(212,176,116,0.22)",
                      }}
                    >
                      <Icon name={b.icon} size={21} style={{ color: G }} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: "17px", fontWeight: 600, color: W, marginBottom: "4px" }}>
                        {b.title}
                      </h3>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14.5px", color: B, lineHeight: 1.5, fontWeight: 300 }}>
                        {b.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="rop-right">
              <div
                style={{
                  position: "relative", borderRadius: "26px",
                  border: "1px solid rgba(212,176,116,0.14)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
                  padding: "clamp(24px, 3vw, 40px)", overflow: "hidden",
                }}
              >
                {/* photo with golden rings */}
                <div className="rop-photo-wrap" style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", maxWidth: "480px", margin: "0 auto" }}>
                  {/* rings */}
                  <div aria-hidden style={{ position: "absolute", inset: "6%", borderRadius: "50%", border: "1px solid rgba(212,176,116,0.35)", boxShadow: "0 0 60px rgba(212,176,116,0.15) inset" }} />
                  <div aria-hidden style={{ position: "absolute", inset: "14%", borderRadius: "50%", border: "1px solid rgba(212,176,116,0.18)" }} />
                  <motion.div
                    aria-hidden
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    style={{ position: "absolute", inset: "2%", borderRadius: "50%", border: "1px dashed rgba(212,176,116,0.25)" }}
                  />
                  <div
                    style={{
                      position: "absolute", inset: "12%", borderRadius: "50%", overflow: "hidden",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    }}
                  >
                    <img
                      src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/files/936ef70c-9e5d-4b92-872f-6e8681dd9da2.jpg"
                      alt="Руководитель отдела продаж"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: "center 30%" }}
                    />
                  </div>

                  {/* floating badges */}
                  {badges.map((bd, i) => (
                    <motion.div
                      key={i}
                      className="rop-badge flex items-center gap-2.5"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                      style={{
                        position: "absolute", ...bd.pos,
                        padding: "10px 14px", borderRadius: "12px",
                        background: "rgba(20,20,18,0.85)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(212,176,116,0.25)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                        whiteSpace: "nowrap", zIndex: 3,
                      }}
                    >
                      <Icon name={bd.icon} size={16} style={{ color: G, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12.5px", fontWeight: 600, color: W, lineHeight: 1.2 }}>{bd.title}</div>
                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: B, lineHeight: 1.2 }}>{bd.sub}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* +25% block */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  style={{ marginTop: "34px" }}
                >
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: B, fontWeight: 300, marginBottom: "6px" }}>
                    Увеличь конверсию до
                  </div>
                  <div className="inline-flex items-center gap-3">
                    <span
                      style={{
                        fontFamily: '"Bodoni Moda", Georgia, serif', fontWeight: 600,
                        fontSize: "clamp(56px, 9vw, 92px)", lineHeight: 1,
                        background: "linear-gradient(105deg, #E9D29A, #C8A96A 45%, #9C7C3E)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      }}
                    >
                      +25%
                    </span>
                    <Icon name="TrendingUp" size={54} style={{ color: G }} />
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: B, fontWeight: 300, marginTop: "4px" }}>
                    совместно с Voice-Tec AI
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM BAR ── */}
          <motion.div
            className="rop-bottom"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1 }}
            style={{
              marginTop: "40px", padding: "clamp(22px, 3vw, 32px)", borderRadius: "22px",
              background: "linear-gradient(135deg, rgba(212,176,116,0.1) 0%, rgba(212,176,116,0.02) 100%)",
              border: "1px solid rgba(212,176,116,0.22)",
              display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <div className="flex items-center gap-5" style={{ minWidth: "260px", flex: 1 }}>
              <Icon name="Crown" size={44} style={{ color: G, flexShrink: 0 }} className="rop-crown" />
              <div>
                <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(17px, 2vw, 21px)", fontWeight: 600, color: W, marginBottom: "5px" }}>
                  Хочешь вывести продажи на новый уровень?
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: B, fontWeight: 300, lineHeight: 1.5 }}>
                  Расскажи владельцу бизнеса о возможностях Voice-Tec AI.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-demo-modal"))}
              className="inline-flex items-center gap-2 rop-bottom-btn"
              style={{
                fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 600,
                color: "#151513",
                background: "linear-gradient(105deg, #E9D29A, #C8A96A 55%, #B8934A)",
                border: "none", borderRadius: "12px", padding: "16px 34px", cursor: "pointer",
                boxShadow: "0 8px 30px rgba(200,169,106,0.28)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(200,169,106,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(200,169,106,0.28)";
              }}
            >
              <Icon name="Send" size={17} />
              Обсудить с владельцем
            </button>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .rop-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(32px, 4vw, 64px);
          align-items: start;
        }
        @media (max-width: 1023px) {
          .rop-cols { grid-template-columns: 1fr; }
          .rop-right { margin-top: 8px; }
        }
      `}</style>
    </section>
  );
}

// ─── Implementation Section (Как внедряем) ──────────────────────────────────────
function ImplementationSection() {
  const W = "#FBF6EC";
  const G = "#D4B074";
  const B = "#C9C2B2";

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stepsRef = useRef(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-120px" });

  const steps = [
    {
      icon: "PhoneCall",
      title: "Подключаем телефонию",
      desc: "Соединяем Voice-Tec с вашей АТС или CRM. Ничего менять в работе менеджеров не нужно.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Настраиваем критерии оценки",
      desc: "Описываем под ваш бизнес, что считать хорошим разговором: скрипт, этапы, возражения.",
    },
    {
      icon: "UploadCloud",
      title: "Загружаем первые звонки",
      desc: "AI слушает реальные разговоры вашей команды и сразу начинает находить закономерности.",
    },
    {
      icon: "FileBarChart",
      title: "Показываем отчёт",
      desc: "Вы видите наглядную картину: кто как работает, где теряются заявки и деньги.",
    },
    {
      icon: "TrendingUp",
      title: "Даём рекомендации по росту продаж",
      desc: "Конкретные шаги, которые поднимают конверсию - без расширения штата и лишних затрат.",
    },
  ];

  return (
    <section className="impl-section" style={{ background: "#151513", padding: "60px 0 130px", overflow: "hidden", position: "relative" }}>
      <div
        style={{
          position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
          width: "820px", height: "440px", pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(212,176,116,0.09) 0%, transparent 70%)",
          filter: "blur(20px)", zIndex: 1,
        }}
      />

      <div className="mx-auto px-5 sm:px-8" style={{ maxWidth: "1280px", position: "relative", zIndex: 3 }}>
        <div ref={ref} className="text-center" style={{ marginBottom: "20px" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "8px 18px", borderRadius: "999px", marginBottom: "26px",
              background: "rgba(212,176,116,0.08)", border: "1px solid rgba(212,176,116,0.22)",
            }}
          >
            <Icon name="Rocket" size={16} style={{ color: G }} />
            <span className="impl-badge" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: G, letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase" }}>
              Как внедряем
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="impl-title quartz-text"
            style={{
              fontFamily: '"Bodoni Moda", Georgia, serif', fontWeight: 500,
              fontSize: "clamp(28px, 3.6vw, 50px)", lineHeight: 1.18,
              maxWidth: "900px", margin: "0 auto",
            }}
          >
            Запуск проще, чем кажется - всего 5 шагов под ключ
          </motion.h2>

          <motion.p
            className="impl-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontFamily: "Inter, sans-serif", fontSize: "clamp(16px, 1.4vw, 19px)", color: B,
              lineHeight: 1.6, maxWidth: "640px", margin: "24px auto 0",
            }}
          >
            Никакой сложной интеграции и долгого обучения. Мы берём настройку на себя - вы просто начинаете видеть результат.
          </motion.p>
        </div>

        {/* Шаги - вертикальный таймлайн */}
        <div ref={stepsRef} style={{ position: "relative", marginTop: "70px", maxWidth: "880px", marginLeft: "auto", marginRight: "auto" }}>
          {/* вертикальная линия */}
          <div className="impl-line" style={{
            position: "absolute", top: "20px", bottom: "20px", left: "39px", width: "2px",
            background: "linear-gradient(180deg, rgba(212,176,116,0) 0%, rgba(212,176,116,0.4) 12%, rgba(212,176,116,0.4) 88%, rgba(212,176,116,0) 100%)",
          }} />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              animate={stepsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.12 + i * 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="impl-step"
              style={{
                position: "relative", display: "flex", alignItems: "flex-start", gap: "26px",
                padding: "24px 28px", marginBottom: i === steps.length - 1 ? "0" : "20px",
                borderRadius: "22px",
                background: "linear-gradient(135deg, rgba(28,28,29,0.9) 0%, rgba(17,17,16,0.9) 100%)",
                border: "1px solid rgba(212,176,116,0.16)",
                boxShadow: "inset 0 1px 0 rgba(255,236,200,0.05)",
                transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              {/* номер-кружок */}
              <div className="impl-num" style={{
                position: "relative", zIndex: 1, flexShrink: 0,
                width: "56px", height: "56px", borderRadius: "50%",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, rgba(212,176,116,0.22) 0%, rgba(212,176,116,0.06) 100%)",
                border: "1px solid rgba(212,176,116,0.4)",
                fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "24px", color: G, fontWeight: 600,
                boxShadow: "0 0 22px rgba(212,176,116,0.15)",
                transition: "transform 0.3s ease, background 0.3s ease",
              }}>
                {i + 1}
              </div>

              <div style={{ flex: 1, paddingTop: "2px" }}>
                <div className="impl-step-head flex items-center gap-3" style={{ marginBottom: "8px" }}>
                  <Icon name={s.icon} size={22} className="impl-step-ic" style={{ color: G, flexShrink: 0 }} />
                  <h3 className="impl-step-title" style={{
                    fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(20px, 2vw, 26px)",
                    color: W, fontWeight: 500, lineHeight: 1.25,
                  }}>
                    {s.title}
                  </h3>
                </div>
                <p className="impl-step-text" style={{
                  fontFamily: "Inter, sans-serif", fontSize: "16.5px", color: B, lineHeight: 1.6,
                }}>
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Снятие страха «это сложно» */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={stepsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-center"
          style={{
            marginTop: "72px",
            maxWidth: "1100px", marginLeft: "auto", marginRight: "auto",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "16px",
          }}
        >
          <Icon name="CircleCheckBig" size={34} style={{ color: G, flexShrink: 0 }} />
          <p className="impl-fear" style={{
            fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(20px, 2.4vw, 30px)",
            color: W, lineHeight: 1.35, fontWeight: 500, textAlign: "left",
          }}>
            Бояться нечего - <span style={{ color: G, fontStyle: "italic" }}>всю техническую часть мы берём на себя</span>, и от подключения до первого отчёта обычно проходит всего несколько дней.
          </p>
        </motion.div>
      </div>

      <style>{`
        .impl-step:hover {
          transform: translateY(-4px);
          border-color: rgba(212,176,116,0.45) !important;
          box-shadow: inset 0 1px 0 rgba(255,236,200,0.08), 0 16px 44px rgba(0,0,0,0.5), 0 0 36px rgba(212,176,116,0.08) !important;
        }
        .impl-step:hover .impl-num {
          transform: scale(1.08);
          background: linear-gradient(135deg, rgba(212,176,116,0.34) 0%, rgba(212,176,116,0.1) 100%) !important;
        }
      `}</style>
    </section>
  );
}

// ─── Guarantee Section (Гарантия) ───────────────────────────────────────────────
function GuaranteeSection() {
  const W = "#FBF6EC";
  const G = "#D4B074";
  const B = "#C9C2B2";

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="grt-section" style={{ background: "#151513", padding: "120px 0 130px", overflow: "hidden", position: "relative" }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "900px", height: "560px", pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(212,176,116,0.1) 0%, transparent 70%)",
        filter: "blur(30px)", zIndex: 1,
      }} />

      <div ref={ref} className="mx-auto px-5 sm:px-8 text-center" style={{ maxWidth: "920px", position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grt-shield"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "84px", height: "84px", borderRadius: "50%", marginBottom: "32px",
            background: "radial-gradient(circle at 50% 35%, rgba(212,176,116,0.22) 0%, rgba(212,176,116,0.05) 70%)",
            border: "1px solid rgba(212,176,116,0.35)",
            boxShadow: "0 0 40px rgba(212,176,116,0.18), inset 0 1px 0 rgba(255,236,200,0.1)",
          }}
        >
          <Icon name="ShieldCheck" size={40} className="grt-shield-ic" style={{ color: G }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "8px 18px", borderRadius: "999px", marginBottom: "26px",
            background: "rgba(212,176,116,0.08)", border: "1px solid rgba(212,176,116,0.22)",
          }}
        >
          <Icon name="BadgeCheck" size={16} style={{ color: G }} />
          <span className="grt-badge" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: G, letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase" }}>
            Гарантия результата
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grt-title quartz-text"
          style={{
            fontFamily: '"Bodoni Moda", Georgia, serif', fontWeight: 500,
            fontSize: "clamp(28px, 3.6vw, 50px)", lineHeight: 1.2, margin: "0 auto 30px",
          }}
        >
          Мы уверены в результате - и берём риск на себя
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="grt-text"
          style={{
            fontFamily: "Inter, sans-serif", fontSize: "clamp(17px, 1.5vw, 21px)", color: B,
            lineHeight: 1.75, maxWidth: "760px", margin: "0 auto 22px",
          }}
        >
          За первый месяц работы мы покажем, где именно ваша команда теряет заявки и деньги, и дадим конкретные шаги для роста продаж. Если вы <span style={{ color: W, fontWeight: 500 }}>не увидите понятной пользы</span> - мы вернём оплату полностью, без условий и долгих разбирательств.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="grt-text"
          style={{
            fontFamily: "Inter, sans-serif", fontSize: "clamp(17px, 1.5vw, 21px)", color: B,
            lineHeight: 1.75, maxWidth: "760px", margin: "0 auto",
          }}
        >
          Нам важно, чтобы SalesFlow приносил вам прибыль, а не строчку в расходах. Поэтому вы ничем не рискуете - <span style={{ color: G, fontStyle: "italic" }}>рискуем мы</span>.
        </motion.p>
      </div>
    </section>
  );
}

// ─── Cases Section (Кейсы клиентов) ─────────────────────────────────────────────
function CaseDonut({ value, color, label, sub }: { value: number; color: string; label: string; sub: string }) {
  const W = "#FBF6EC";
  const B = "#C9C2B2";
  const r = 63;
  const c = 2 * Math.PI * r;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
      <div style={{ position: "relative", width: "156px", height: "156px" }}>
        <svg width="156" height="156" viewBox="0 0 156 156" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="78" cy="78" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="11" />
          <motion.circle
            cx="78" cy="78" r={r} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={inView ? { strokeDashoffset: c - (c * value) / 100 } : {}}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "38px", fontWeight: 600, color: W,
        }}>
          {sub}
        </div>
      </div>
      <span style={{
        fontFamily: "Inter, sans-serif", fontSize: "15px", color: B, lineHeight: 1.35,
        textAlign: "center", maxWidth: "180px",
      }}>
        {label}
      </span>
    </div>
  );
}

// Полукруглый gauge + крупная цифра
function CaseGauge({ value, sub, color, label }: { value: number; sub: string; color: string; label: string }) {
  const W = "#FBF6EC";
  const B = "#C9C2B2";
  const r = 84;
  const c = Math.PI * r; // полукруг
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
      <div style={{ position: "relative", width: "208px", height: "118px" }}>
        <svg width="208" height="118" viewBox="0 0 208 118">
          <path d="M 20 108 A 84 84 0 0 1 188 108" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="13" strokeLinecap="round" />
          <motion.path
            d="M 20 108 A 84 84 0 0 1 188 108" fill="none" stroke={color} strokeWidth="13" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={inView ? { strokeDashoffset: c - (c * value) / 100 } : {}}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </svg>
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: "2px", textAlign: "center",
          fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "46px", fontWeight: 600, color: W,
        }}>
          {sub}
        </div>
      </div>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "16.5px", color: B, textAlign: "center", maxWidth: "260px", lineHeight: 1.45 }}>
        {label}
      </span>
    </div>
  );
}

// Радар-многоугольник как в дашборде
function CaseRadar({ axes }: { axes: { label: string; value: number }[] }) {
  const G = "#D4B074";
  const B = "#C9C2B2";
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const cx = 135, cy = 129, R = 96;
  const n = axes.length;
  const pt = (frac: number, i: number) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(ang) * R * frac, cy + Math.sin(ang) * R * frac];
  };
  const grids = [0.33, 0.66, 1];
  const dataPts = axes.map((a, i) => pt(a.value / 100, i));
  const dataStr = dataPts.map((p) => p.join(",")).join(" ");
  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "-80px" }}>
      <svg width="270" height="258" viewBox="0 0 270 258" style={{ flexShrink: 0 }}>
        {grids.map((g, gi) => (
          <polygon key={gi}
            points={axes.map((_, i) => pt(g, i).join(",")).join(" ")}
            fill="none" stroke="rgba(245,237,216,0.1)" strokeWidth="1" />
        ))}
        {axes.map((_, i) => {
          const [x, y] = pt(1, i);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(245,237,216,0.1)" strokeWidth="1" />;
        })}
        <motion.polygon
          points={dataStr}
          fill="rgba(212,176,116,0.18)" stroke={G} strokeWidth="2.5" strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
        {dataPts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={G} />
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "13px", flexShrink: 0 }}>
        {axes.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: G, flexShrink: 0 }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: B, lineHeight: 1.35, whiteSpace: "nowrap" }}>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Горизонтальные столбцы (bar chart)
function CaseBars({ bars }: { bars: { label: string; value: number; sub: string; color: string }[] }) {
  const W = "#FBF6EC";
  const B = "#C9C2B2";
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {bars.map((bar, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "16.5px", color: B, lineHeight: 1.35 }}>{bar.label}</span>
            <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "22px", fontWeight: 600, color: W }}>{bar.sub}</span>
          </div>
          <div style={{ height: "10px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${bar.value}%` } : {}}
              transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.15 }}
              style={{ height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${bar.color}, ${bar.color}cc)` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

type MetricItem = { value: number; sub: string; color: string; label: string };
type CaseChartData =
  | { type: "donuts"; items: MetricItem[] }
  | { type: "gauge"; item: { value: number; sub: string; color: string; label: string } }
  | { type: "radar"; axes: { label: string; value: number }[] }
  | { type: "bars"; bars: { label: string; value: number; sub: string; color: string }[] };

// Рендер блока метрик в зависимости от типа
function CaseChart({ chart }: { chart: CaseChartData }) {
  if (chart.type === "donuts") {
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap", width: "100%" }}>
        {chart.items.map((m, k) => (
          <CaseDonut key={k} value={m.value} sub={m.sub} color={m.color} label={m.label} />
        ))}
      </div>
    );
  }
  if (chart.type === "gauge") {
    return <CaseGauge {...chart.item} />;
  }
  if (chart.type === "radar") {
    return <CaseRadar axes={chart.axes} />;
  }
  return <CaseBars bars={chart.bars} />;
}

function CaseCard({ it, i, inView }: {
  it: {
    company: string; tag: string; result: string; logo: string;
    metric: string; metricLabel: string;
  };
  i: number; inView: boolean;
}) {
  const W = "#FBF6EC";
  const G = "#D4B074";
  const B = "#C9C2B2";
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -12, transition: { duration: 0.18, ease: "easeOut" } }}
      className="case-card"
      style={{
        position: "relative", display: "flex", flexDirection: "column",
        background: "linear-gradient(160deg, #1c1c1d 0%, #141414 48%, #0f0f10 100%)",
        border: "1px solid rgba(212,176,116,0.18)",
        borderRadius: "22px",
        overflow: "hidden", padding: "26px 24px",
        boxShadow: "inset 0 1px 0 rgba(255,236,200,0.06), 0 14px 40px rgba(0,0,0,0.45)",
        transition: "transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      <img src={it.logo} alt={it.company} className="case-logo" style={{
        position: "absolute", top: "-44px", right: "-28px",
        width: "230px", height: "230px", objectFit: "contain", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: "62%" }}>
        <div className="case-company" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "28px", color: W, fontWeight: 600, lineHeight: 1.2 }}>
          {it.company === "ТехноЛайн" ? (
            <>Техно<br className="case-mobile-br" />Лайн</>
          ) : it.company}
        </div>
        <div className="case-tag" style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: G, marginTop: "4px", lineHeight: 1.3 }}>
          {it.tag}
        </div>
      </div>

      <p className="case-result" style={{
        margin: "40px 0 0", fontFamily: "Inter, sans-serif", fontSize: "18px",
        color: "#E6E0D2", lineHeight: 1.6, position: "relative", zIndex: 2,
      }}>
        {it.result}{" "}
        <span className="case-metric" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "24px", color: G, fontWeight: 600 }}>
          {it.metric}
        </span>
        {it.metricLabel ? <> <span style={{ color: B }}>{it.metricLabel}</span></> : null}.
      </p>
    </motion.div>
  );
}

function CasesSection() {
  const W = "#FBF6EC";
  const G = "#D4B074";
  const B = "#C9C2B2";
  const GREEN = "#4ADE80";
  const BLUE = "#7DA9FF";

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-120px" });

  const cases = [
    {
      company: "ТехноЛайн",
      tag: "Оптовая электроника",
      logo: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/fe70a775-96d0-49c7-9abc-6ceafd54bdf2.png",
      metric: "+12,3%",
      metricLabel: "",
      result: "После внедрения AI-анализа звонков конверсия на этапе диалога выросла на",
    },
    {
      company: "Клиника «Вита»",
      tag: "Медцентр",
      logo: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/c5ada1bb-a648-41f0-91dc-a918cd8772eb.png",
      metric: "+18,5%",
      metricLabel: "доходимость до визита",
      result: "Единый сценарий записи поднял",
    },
    {
      company: "SkillUp",
      tag: "Онлайн-школа",
      logo: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/4aa6264d-6eb8-4b86-8cdd-1f23583e7ba7.png",
      metric: "+14,7%",
      metricLabel: "оплат после консультации",
      result: "Точные формулировки для менеджеров дали",
    },
    {
      company: "ГринХаус",
      tag: "Загородная недвижимость",
      logo: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/281a8a8e-f6fe-4404-bb70-547eb5e887d9.png",
      metric: "+19%",
      metricLabel: "",
      result: "Контроль каждого диалога и напоминания довели до показа объектов на",
    },
  ];

  return (
    <section className="cases-section" style={{ background: "#151513", padding: "120px 0 130px", overflow: "hidden", position: "relative" }}>
      <div style={{
        position: "absolute", top: "6%", left: "50%", transform: "translateX(-50%)",
        width: "900px", height: "460px", pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(212,176,116,0.08) 0%, transparent 70%)",
        filter: "blur(20px)", zIndex: 1,
      }} />

      <div className="mx-auto px-4 sm:px-8" style={{ maxWidth: "1920px", position: "relative", zIndex: 2 }}>
        <div ref={ref} className="text-center" style={{ marginBottom: "56px" }}>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="cases-title quartz-text"
            style={{
              fontFamily: '"Bodoni Moda", Georgia, serif', fontWeight: 500,
              fontSize: "clamp(34px, 4.4vw, 64px)", lineHeight: 1.1,
              maxWidth: "900px", margin: "0 auto",
            }}
          >
            Кейсы клиентов
          </motion.h2>
        </div>

        <div ref={gridRef} className="grid cases-grid" style={{ gridTemplateColumns: `repeat(${cases.length}, 1fr)`, gap: "22px" }}>
          {cases.map((it, i) => (
            <CaseCard key={i} it={it} i={i} inView={gridInView} />
          ))}
        </div>
      </div>

      <style>{`
        .case-card:hover {
          border-color: rgba(255,255,255,0.32) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 26px 60px rgba(0,0,0,0.6), 0 0 30px rgba(255,255,255,0.05) !important;
        }
        @media (max-width: 1280px) and (min-width: 768px) {
          .cases-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 767px) {
          .cases-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
      `}</style>
    </section>
  );
}

// ─── Before / After Section ─────────────────────────────────────────────────────
function BeforeAfterSection() {
  const W = "#FBF6EC";
  const G = "#D4B074";
  const RED = "#FF6B6B";
  const GREEN = "#4ADE80";

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const rows = [
    {
      before: { value: "30–40%", label: "звонков слушают выборочно" },
      after: { value: "100%", label: "звонков под контролем AI" },
    },
    {
      before: { value: "На глаз", label: "оценка работы менеджеров" },
      after: { value: "По фактам", label: "честный рейтинг и аналитика" },
    },
    {
      before: { value: "Теряются", label: "возражения остаются без ответа" },
      after: { value: "Закрыты", label: "AI подсказывает, что сказать" },
    },
    {
      before: { value: "Часы", label: "на ручную проверку звонков" },
      after: { value: "Секунды", label: "отчёт готов автоматически" },
    },
    {
      before: { value: "Догадки", label: "почему падает выручка" },
      after: { value: "+8–23%", label: "рост конверсии по данным" },
    },
  ];

  const labelCss: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontSize: "11px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontWeight: 600,
  };

  return (
    <section className="cb-section" style={{ background: "#151513", padding: "120px 0 130px", overflow: "hidden", position: "relative" }}>
      <div className="mx-auto px-6" style={{ maxWidth: "1320px", position: "relative", zIndex: 2 }}>
        {/* heading */}
        <div ref={ref} className="cb-head text-center" style={{ marginBottom: "64px" }}>
          <motion.h2
            className="cb-title"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ ...h2Style, fontSize: "clamp(32px, 5vw, 62px)", lineHeight: 1.1 }}
          >
            Как меняется бизнес <span style={{ color: G, fontStyle: "italic" }}>с нами</span>
          </motion.h2>
        </div>

        {/* comparison */}
        <div style={{ position: "relative" }}>
          {/* desktop column headers */}
          <div className="cb-headers grid" style={{ gridTemplateColumns: "1fr 120px 1fr", alignItems: "center", marginBottom: "26px" }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center gap-3"
            >
              <div className="cb-head-ic" style={{ width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,107,0.10)", border: "1px solid rgba(255,107,107,0.28)" }}>
                <Icon name="TrendingDown" size={22} style={{ color: RED }} />
              </div>
              <div>
                <div className="cb-head-title" style={{ ...labelCss, color: RED, fontSize: "12px" }}>До Voice-Tec</div>
                <div className="cb-head-desc" style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(251,246,236,0.5)", marginTop: "2px" }}>Деньги утекают незаметно</div>
              </div>
            </motion.div>
            <div />
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center gap-3 justify-end"
              style={{ textAlign: "right" }}
            >
              <div>
                <div className="cb-head-title" style={{ ...labelCss, color: GREEN, fontSize: "12px" }}>С Voice-Tec</div>
                <div className="cb-head-desc" style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(251,246,236,0.5)", marginTop: "2px" }}>Контроль и рост выручки</div>
              </div>
              <div className="cb-head-ic" style={{ width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(212,176,116,0.12)", border: "1px solid rgba(212,176,116,0.32)" }}>
                <Icon name="TrendingUp" size={22} style={{ color: G }} />
              </div>
            </motion.div>
          </div>

          {/* center glowing divider (desktop) */}
          <motion.div
            className="cb-divider block"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={inView ? { opacity: 1, scaleY: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.3 }}
            style={{
              position: "absolute",
              top: "70px",
              bottom: "0",
              left: "50%",
              width: "1px",
              transformOrigin: "top",
              background: "linear-gradient(to bottom, transparent, rgba(212,176,116,0.5), transparent)",
              zIndex: 1,
            }}
          />

          {/* rows */}
          <div className="flex flex-col" style={{ gap: "16px" }}>
            {rows.map((row, i) => (
              <div key={i} className="cb-row grid grid-cols-[1fr_120px_1fr]" style={{ alignItems: "stretch", gap: "16px" }}>
                {/* before */}
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.55, delay: 0.35 + i * 0.1 }}
                  className="group sfs-before-row"
                  style={{
                    background: "linear-gradient(135deg, #1c1c1d 0%, #141414 40%, #0f0f10 72%, #18181a 100%)",
                    border: "1px solid rgba(255,107,107,0.28)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.5)",
                    borderRadius: "18px",
                    padding: "22px 26px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  <Icon name="X" size={20} className="cb-icon" style={{ color: RED, flexShrink: 0, opacity: 0.7 }} />
                  <div style={{ flex: 1 }}>
                    <div className="cb-value" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(22px, 2.4vw, 30px)", color: RED, fontWeight: 600, lineHeight: 1.05 }}>{row.before.value}</div>
                    <div className="cb-label" style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(251,246,236,0.62)", marginTop: "6px", lineHeight: 1.4 }}>{row.before.label}</div>
                  </div>
                </motion.div>

                {/* center arrow */}
                <div className="cb-arrow flex items-center justify-center" style={{ position: "relative", zIndex: 2 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                    style={{
                      width: "46px", height: "46px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "#151513",
                      border: "1px solid rgba(212,176,116,0.4)",
                      boxShadow: "0 0 24px rgba(212,176,116,0.25)",
                    }}
                  >
                    <Icon name="ArrowRight" size={20} style={{ color: G }} />
                  </motion.div>
                </div>

                {/* mobile arrow (down) - hidden, we keep the desktop side-by-side layout */}
                <div className="cb-arrow-down hidden items-center justify-center" style={{ margin: "-4px 0" }}>
                  <Icon name="ArrowDown" size={20} style={{ color: G }} />
                </div>

                {/* after */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.55, delay: 0.45 + i * 0.1 }}
                  className="group sfs-after-row"
                  style={{
                    background: "linear-gradient(135deg, #1c1c1d 0%, #141414 40%, #0f0f10 72%, #18181a 100%)",
                    border: "1px solid rgba(212,176,116,0.30)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.5)",
                    borderRadius: "18px",
                    padding: "22px 26px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  <div className="cb-check" style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(74,222,128,0.14)" }}>
                    <Icon name="Check" size={18} style={{ color: GREEN }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="cb-value" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(22px, 2.4vw, 30px)", color: G, fontWeight: 600, lineHeight: 1.05, textShadow: "0 0 24px rgba(212,176,116,0.25)" }}>{row.after.value}</div>
                    <div className="cb-label" style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: W, opacity: 0.85, marginTop: "6px", lineHeight: 1.4 }}>{row.after.label}</div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* bottom result banner */}
          <motion.div
            className="cb-result"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 + rows.length * 0.1 }}
            style={{
              marginTop: "40px",
              background: "linear-gradient(135deg, #1a1a17 0%, #131311 42%, #0d0d0c 72%, #16150f 100%)",
              border: "1px solid rgba(212,176,116,0.28)",
              borderRadius: "24px",
              padding: "clamp(28px, 4vw, 44px) clamp(28px, 5vw, 56px)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              boxShadow: "inset 0 1px 0 rgba(255,236,200,0.10), inset 0 -1px 0 rgba(0,0,0,0.5), 0 30px 80px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ maxWidth: "620px" }}>
              <div className="cb-result-label" style={{ ...labelCss, color: G, marginBottom: "12px" }}>Итог</div>
              <div className="cb-result-text" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(26px, 3.4vw, 42px)", color: W, lineHeight: 1.12, fontWeight: 500 }}>
                Та же команда. Тот же трафик.<br />
                <span style={{ color: G, fontStyle: "italic" }}>Совсем другая выручка.</span>
              </div>
            </div>
            <a
              href="#pricing"
              className="cb-result-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: "14px",
                background: "linear-gradient(135deg, #1c1b17 0%, #141310 50%, #1a1814 100%)",
                color: G,
                padding: "18px 38px", borderRadius: "10px",
                border: "1px solid rgba(212,176,116,0.45)",
                fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px",
                letterSpacing: "0.04em", textTransform: "uppercase",
                textDecoration: "none", whiteSpace: "nowrap",
                boxShadow: "inset 0 1px 0 rgba(255,236,200,0.10), 0 10px 30px rgba(0,0,0,0.45)",
                transition: "border-color 0.25s ease, transform 0.25s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(212,176,116,0.85)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(212,176,116,0.45)"; }}
            >
              Узнать стоимость
              <Icon name="ArrowRight" size={18} />
            </a>
          </motion.div>
        </div>
      </div>

      <style>{`
        .sfs-after-row:hover {
          transform: translateX(4px);
          border-color: rgba(212,176,116,0.50) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.5), 0 8px 40px rgba(0,0,0,0.5);
        }
        .sfs-before-row:hover {
          transform: translateX(-4px);
          border-color: rgba(255,107,107,0.5) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.5), 0 8px 40px rgba(0,0,0,0.5);
        }
      `}</style>
    </section>
  );
}

// ─── AI Pipeline Section ───────────────────────────────────────────────────────
function PipelineSection() {
  // measure the AI-vision heading block so the connector line stops at its top,
  // and the card bottom so the dot/line start near the bottom of the card
  const aiLineRef = useRef<HTMLDivElement>(null);
  const aiHeadingRef = useRef<HTMLDivElement>(null);
  const aiWrapRef = useRef<HTMLDivElement>(null);
  const aiCardRef = useRef<HTMLDivElement>(null);
  const [aiHeadingH, setAiHeadingH] = useState<number>(0);
  const [cardBottom, setCardBottom] = useState<number>(0);
  useEffect(() => {
    const head = aiHeadingRef.current;
    const wrap = aiWrapRef.current;
    const card = aiCardRef.current;
    const update = () => {
      if (head) setAiHeadingH(Math.max(0, head.offsetHeight - 48));
      if (wrap && card) {
        const wr = wrap.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        // ~24px above the very bottom of the card
        setCardBottom(cr.bottom - wr.top - 24);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (head) ro.observe(head);
    if (card) ro.observe(card);
    if (wrap) ro.observe(wrap);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Цветовая система
  const W = "#FBF6EC";           // белый/кремовый - основной текст
  const G = "#D4B074";           // золотой - акценты, лейблы
  const B = "#F5EDD8";           // бежевый old money - вторичный текст
  const RED = "#FF6B6B";         // красный - ошибки, потери
  const GREEN = "#4ADE80";       // зелёный - рост, успех

  const pCard: React.CSSProperties = {
    background: "linear-gradient(160deg, #1c1c1c 0%, #141414 40%, #0e0e0e 70%, #161618 100%)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "28px",
    padding: "18px 48px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.4), 0 40px 100px rgba(0,0,0,0.75)",
  };

  const num = (_n: string) => null;

  const dot = () => (
    <div className="hidden lg:flex w-[4%] justify-center" style={{ alignSelf: "center" }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.85)", boxShadow: "0 0 0 4px rgba(255,255,255,0.08), 0 0 20px rgba(255,255,255,0.2)", flexShrink: 0 }} />
    </div>
  );

  return (
    <section className="pipeline-section" style={{ background: "#151513", padding: "120px 20px 140px" }}>
      <style>{`
        @keyframes metalPulse {
          0%,100% { box-shadow: 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.07), 0 40px 100px rgba(0,0,0,0.75); }
          50%      { box-shadow: 0 0 0 1px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.1), 0 40px 100px rgba(0,0,0,0.75), 0 0 60px rgba(255,255,255,0.04); }
        }
        .pc { animation: metalPulse 5s ease-in-out infinite; }
        .pc:nth-child(2) { animation-delay: 1.25s; }
        .pc:nth-child(3) { animation-delay: 2.5s; }
        .pc:nth-child(4) { animation-delay: 3.75s; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <h2 style={{ ...h2Style, fontSize: "clamp(32px, 5vw, 60px)", lineHeight: 1.1, marginBottom: "22px" }}>
            Вы не видите 95% того, что<br />происходит в разговорах с клиентами
          </h2>
        </div>

        <div className="relative">

          <div className="flex flex-col gap-20 lg:gap-28">

            {/* ── ONE CARD LEFT + SPLINE RIGHT (+ heading below) ── */}
            <div ref={aiWrapRef} className="relative">

            <div className="relative grid grid-cols-1 lg:grid-cols-2 items-center" style={{ columnGap: "3rem", rowGap: "2rem" }}>

              {/* card */}
              <div ref={aiCardRef} className="pc pipeline-card-left w-full lg:ml-[-3rem] lg:w-[calc(100%+3rem)]" style={pCard}>
                <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "350px", height: "350px", background: `radial-gradient(circle, ${RED}0d 0%, transparent 65%)`, pointerEvents: "none" }} />
                {num("01")}
                <div className="flex flex-col" style={{ gap: "0px" }}>
                  {[
                    {
                      img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/737be0e7-316d-4380-b844-3f873c734d46.png",
                      text: "РОП тратит часы на прослушивание звонков вместо управления продажами и развития команды.",
                    },
                    {
                      img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/330efac3-b85d-4a12-b30b-c3e388e726cf.png",
                      text: "Отдел контроля качества физически не способен проверить все разговоры и обеспечить полный контроль над качеством работы сотрудников.",
                    },
                    {
                      img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/6be343a7-15dc-4739-891e-9c6c1623233c.png",
                      text: "Ошибки менеджеров обнаруживаются только после того, как бизнес уже потерял деньги.",
                    },
                  ].map((item, i, arr) => (
                    <div
                      key={i}
                      className="pipeline-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "26px",
                        padding: "36px 0",
                        borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                      }}
                    >
                      <img
                        src={item.img}
                        alt=""
                        className="pipeline-row-img"
                        style={{ width: "158px", height: "158px", objectFit: "contain", flexShrink: 0, marginLeft: "-36px", filter: "drop-shadow(0 6px 16px rgba(212,176,116,0.25))" }}
                      />
                      <p className="pipeline-row-text" style={{ fontFamily: "Inter, sans-serif", fontSize: "18px", color: B, lineHeight: 1.6, fontWeight: 500 }}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* brain image (right column) */}
              <div className="hidden lg:flex w-full items-center justify-center" style={{ height: "560px", overflow: "visible" }}>
                <div style={{ position: "relative", width: "167%", maxWidth: "933px", flexShrink: 0, transform: "translateX(80px)" }}>
                  <div style={{
                    position: "absolute",
                    inset: "-6%",
                    zIndex: 0,
                    pointerEvents: "none",
                    background: "radial-gradient(ellipse at 50% 48%, rgba(212,176,116,0.09) 0%, rgba(212,176,116,0.04) 38%, rgba(212,176,116,0) 68%)",
                    filter: "blur(20px)",
                  }} />
                  <img
                    src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/84a4f48c-9d18-4d1b-a5a6-8a06276f6730.png"
                    alt="Нейросеть"
                    style={{ position: "relative", zIndex: 1, width: "100%", height: "auto", objectFit: "contain", display: "block" }}
                  />
                  <GoldParticles />
                </div>
              </div>

            </div>

            {/* ── AI vision heading ── */}
            <div ref={aiHeadingRef} style={{ paddingTop: "48px" }}>
            <Section className="text-center">
              <motion.h2 variants={fadeUp} className="pipeline-ai-vision-title" style={{
                fontFamily: '"Bodoni Moda", Georgia, serif',
                fontSize: "clamp(32px, 5vw, 62px)",
                color: "#F7F2EA",
                fontWeight: 400,
                lineHeight: 1.12,
                letterSpacing: "0.01em",
                marginBottom: "20px",
              }}>
                AI видит то, что невозможно<br />контролировать вручную
              </motion.h2>
              <motion.p variants={fadeUp} className="pipeline-ai-vision-sub" style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "clamp(16px, 1.6vw, 20px)",
                color: "rgba(251,246,236,0.7)",
                fontWeight: 300,
                lineHeight: 1.6,
                maxWidth: "640px",
                margin: "0 auto",
              }}>
                Мы превращаем хаос звонков в понятные причины роста и продаж
              </motion.p>
            </Section>
            </div>

            </div>

            <div className="relative flex flex-col gap-20 lg:gap-28">
            <div className="absolute left-1/2 hidden lg:block" style={{ top: "-7rem", bottom: "0", width: "1px", background: "linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.12) 92%, transparent 100%)", transform: "translateX(-50%)" }} />

            {/* ── CARD 2 - RIGHT ── */}
            <div className="flex flex-col lg:flex-row-reverse items-start gap-10 lg:gap-0">
              <div className="pc pipeline-card-right w-full lg:w-[48%]" style={pCard}>
                <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 65%)", pointerEvents: "none" }} />
                {num("02")}
                <h3 className="pipeline-card2-title" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(24px, 2.8vw, 32px)", color: W, fontWeight: 400, lineHeight: 1.2, marginBottom: "18px" }}>
                  AI анализирует каждый разговор
                </h3>
                <p className="pipeline-card2-text" style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: B, lineHeight: 1.8, marginBottom: "32px" }}>
                  ИИ анализирует 100% звонков и делает оценку опираясь на скрипты и нормы менеджмента вашей компании.<br /><br />
                  ИИ покажет слабые места в продажах, ошибки менеджеров и поможет руководителю видеть реальную картину БЕЗ РУЧНОЙ ПРОВЕРКИ ЗВОНКОВ.
                </p>

                {/* ── light dashboard cut-out ── */}
                <div className="pipeline-dashboard" style={{
                  background: "#F8F3EA",
                  borderRadius: "18px",
                  padding: "22px",
                  marginBottom: "24px",
                  border: "1px solid rgba(212,176,116,0.4)",
                  boxShadow: "0 30px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}>
                  {/* heading */}
                  <div style={{ padding: "16px 8px 18px" }}>
                    <span className="pipeline-causes-title" style={{ display: "block", textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: "24px", color: "#2E2113", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.12, whiteSpace: "nowrap" }}>Обнаружены причины потерь</span>
                  </div>

                  {/* cause cards on beige (flip on click) */}
                  <div className="flex flex-col" style={{ gap: "10px" }}>
                    {[
                      { icon: "FileWarning", title: "Нарушения скрипта продаж", detail: "менеджер уходит от структуры в критический момент" },
                      { icon: "ShieldAlert", title: "Слабая обработка возражений", detail: "клиент уходит с неотработанным сомнением" },
                      { icon: "Activity", title: "Потеря интереса клиента", detail: "AI фиксирует момент, когда клиент «отключился»" },
                      { icon: "UserX", title: "Ошибки и давление менеджера", detail: "перебивания, игнорирование потребностей" },
                    ].map((r) => (
                      <CauseFlipCard key={r.title} icon={r.icon} title={r.title} detail={r.detail} />
                    ))}
                  </div>

                </div>
              </div>
              <div className="hidden lg:flex w-[4%] justify-center" style={{ paddingTop: "120px" }} />
              {/* Scanner */}
              <div className="hidden lg:block w-[48%]" style={{ height: "780px", position: "relative", overflow: "visible", marginLeft: "-120px" }}>
                <RadarScanner />
              </div>
            </div>

            </div>

          </div>

          {/* ── Что получает бизнес ── */}
          <SectionDivider />
          <div>
            <Section className="text-center">
              <motion.h2 variants={fadeUp} style={{ ...h2Style, fontSize: "clamp(32px, 5vw, 62px)", lineHeight: 1.12, marginBottom: "56px" }}>
                Что получает бизнес
              </motion.h2>

              <motion.div
                variants={stagger}
                className="bw-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-12 lg:gap-x-16"
                style={{ width: "calc(100% + 120px)", marginLeft: "-60px", marginRight: "-60px" }}
              >
                {[
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/c51db25f-5dd3-4d00-99c0-b4cf02fd0206.png", accent: "100%", title: "звонков под контролем", desc: "Ни один разговор не пройдёт мимо" },
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/e4db2d7c-9198-410e-9d0f-b65254f4f973.png", accent: "+8–23%", title: "к конверсии", desc: "Больше сделок с тем же трафиком" },
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/6c4bdf72-1774-4af5-849b-902b3b1b6439.png", accent: "0", title: "потерянных лидов", desc: "Каждый клиент доведён до результата" },
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/358dd693-b223-41b0-9254-e76f2e7c6a9d.png", accent: "Честный", title: "рейтинг менеджеров", desc: "Оценка по фактам, а не по ощущениям" },
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/24dabad9-773e-4312-ba6b-ccf2d9c65d78.png", accent: "Ясные", title: "отчёты для РОПа", desc: "Вся картина бизнеса на одном экране", scale: 1.58 },
                ].map((item) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    className="flex flex-col items-center text-center"
                  >
                    <img src={item.img} alt={item.title} loading="lazy" className="bw-img" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain", marginBottom: "10px", transform: item.scale ? `scale(${item.scale})` : undefined }} />
                    <span className="bw-accent" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(26px, 2.4vw, 34px)", color: G, fontWeight: 600, lineHeight: 1.05, letterSpacing: "0.01em", textShadow: "0 0 24px rgba(212,176,116,0.25)" }}>
                      {item.accent}
                    </span>
                    <p className="bw-title" style={{ fontFamily: "Inter, sans-serif", fontSize: "17px", color: W, fontWeight: 700, lineHeight: 1.3, marginTop: "4px" }}>
                      {item.title}
                    </p>
                    <p className="bw-desc" style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(251,246,236,0.6)", fontWeight: 400, lineHeight: 1.45, marginTop: "8px", maxWidth: "200px" }}>
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </Section>
          </div>

        </div>
      </div>
    </section>
  );
}



/* ─────────────────────────────────────────────
   Что получает клиент - scroll-reveal section
───────────────────────────────────────────── */
function SlideCard({
  side,
  image,
  label,
}: {
  side: "left" | "right";
  image: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  const G = "#C8A96A";

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        justifyContent: side === "left" ? "flex-start" : "flex-end",
      }}
    >
      <motion.div
        className="slide-card"
        initial={{ x: side === "left" ? -160 : 160, opacity: 0 }}
        animate={inView ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "103%", maxWidth: "1296px", marginLeft: side === "left" ? "-8%" : undefined, marginRight: side === "right" ? "-8%" : undefined }}
      >
        <div style={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)",
          position: "relative",
        }}>
          <img
            src={image}
            alt={label}
            style={{ width: "100%", display: "block" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 70%, rgba(21,21,19,0.55) 100%)",
            pointerEvents: "none",
          }} />
          {/* Label */}
          <div style={{
            position: "absolute",
            bottom: "22px",
            left: "26px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{ width: "24px", height: "1px", background: G }} />
            <span className="cv-card-label" style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: G,
              fontWeight: 600,
            }}>{label}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ClientValueSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const G = "#C8A96A";

  const items = [
    {
      side: "left" as const,
      image: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/124177dc-9a13-400a-bbfa-d5a5ad625808.png",
      label: "Анализ звонков",
    },
    {
      side: "right" as const,
      image: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/d6a66739-2a0c-41bf-951e-54b47fa9e498.png",
      label: "Контроль скриптов",
    },
    {
      side: "left" as const,
      image: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/cd8b44b5-632c-4c26-b65f-b173f7d6bfd1.png",
      label: "AI-рейтинг менеджеров",
    },
    {
      side: "right" as const,
      image: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/3d94dcab-8d6f-4b27-972c-e35480430c78.png",
      label: "Выявление слабых мест",
    },
    {
      side: "left" as const,
      image: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/44a9430a-21d0-4bc4-98a4-087ab5dc73aa.png",
      label: "Контроль РОПа",
    },
  ];

  return (
    <section
      ref={ref}
      className="cv-section"
      style={{
        background: "#151513",
        padding: "0 20px 160px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="text-center"
          style={{
            marginBottom: "100px",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
            <span className="cv-badge" style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: G,
              fontWeight: 600,
            }}>Что получает клиент</span>
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
          </div>
          <h2 className="cv-title" style={{
            fontFamily: '"Bodoni Moda", Georgia, serif',
            fontSize: "clamp(32px, 5vw, 62px)",
            color: "#F7F2EA",
            fontWeight: 400,
            lineHeight: 1.1,
            marginBottom: "22px",
            letterSpacing: "0.01em",
          }}>
            Не просто отчёт.<br />Полная система контроля продаж.
          </h2>
          <p className="cv-sub" style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "17px",
            color: "#9A9490",
            maxWidth: "500px",
            margin: "0 auto",
            lineHeight: 1.75,
          }}>
            SalesFlow даёт руководителю полное видение того,<br />что происходит в каждом разговоре.
          </p>
        </div>

        {/* Cards */}
        <div className="cv-cards" style={{ display: "flex", flexDirection: "column", gap: "120px" }}>
          {items.map((item, i) => (
            <SlideCard key={i} index={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const G = "#C8A96A";

  const socials = [
    { name: "Telegram", img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/2f700626-cd00-427d-9f0f-1cc4d3614911.png", href: "https://t.me/", color: "#229ED9" },
  ];

  return (
    <section
      ref={ref}
      style={{
        background: "#151513",
        padding: "0 24px 160px",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* ambient glow */}
      <div aria-hidden style={{
        position: "absolute", top: "45%", left: "30%",
        transform: "translate(-50%,-50%)",
        width: "min(700px, 80vw)", height: "500px",
        background: "radial-gradient(ellipse at center, rgba(200,169,106,0.08), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="max-w-7xl mx-auto relative">
        <div
          className="cta-grid grid grid-cols-1 lg:grid-cols-2 items-center"
          style={{ gap: "40px" }}
        >
          {/* ── Left: text + buttons ── */}
          <div
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(36px)",
              transition: "opacity 0.9s ease, transform 0.9s ease",
              position: "relative",
              zIndex: 3,
            }}
          >
            <div className="flex items-center gap-3 mb-7">
              <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
              <span className="cta-badge" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: G, fontWeight: 600 }}>Бесплатный аудит</span>
            </div>

            <h2 className="cta-title" style={{
              fontFamily: '"Bodoni Moda", Georgia, serif',
              fontSize: "clamp(34px, 4.5vw, 60px)",
              fontWeight: 600,
              color: "#FBF6EC",
              lineHeight: 1.12,
              letterSpacing: "0.01em",
              marginBottom: "24px",
            }}>
              Узнайте, где ваш отдел продаж{" "}
              <span style={{
                background: "linear-gradient(105deg, #E9D29A, #C8A96A 45%, #9C7C3E)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontStyle: "italic",
              }}>теряет деньги</span>
            </h2>

            <p className="cta-sub" style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(16px, 1.8vw, 19px)",
              color: "rgba(251,246,236,0.62)",
              lineHeight: 1.65,
              fontWeight: 300,
              maxWidth: "520px",
              marginBottom: "44px",
            }}>
              Получите бесплатный AI-аудит звонков и увидьте реальные слабые места вашей команды.
            </p>

            {/* CTA buttons */}
            <div className="cta-btns flex flex-wrap gap-4" style={{ marginBottom: "28px" }}>
              <button
                className="cta-btn"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase" as const,
                  color: "#151513",
                  background: "linear-gradient(105deg, #E9D29A, #C8A96A 55%, #B8934A)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "16px 36px",
                  cursor: "pointer",
                  boxShadow: "0 8px 30px rgba(200,169,106,0.28)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  opacity: inView ? 1 : 0,
                  transitionDelay: "0.3s",
                }}
                onClick={() => window.dispatchEvent(new Event("open-demo-modal"))}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(200,169,106,0.45)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(200,169,106,0.28)";
                }}
              >
                Начать бесплатно
              </button>

              <button
                className="cta-btn"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase" as const,
                  color: "#FBF6EC",
                  background: "transparent",
                  border: "1px solid rgba(200,169,106,0.45)",
                  borderRadius: "10px",
                  padding: "16px 36px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  opacity: inView ? 1 : 0,
                  transitionDelay: "0.38s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = "rgba(200,169,106,0.8)";
                  el.style.background = "rgba(200,169,106,0.09)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = "rgba(200,169,106,0.45)";
                  el.style.background = "transparent";
                  el.style.transform = "translateY(0)";
                }}
              >
                Связаться с нами
              </button>
            </div>

            {/* Social links */}
            <div style={{ marginTop: "40px" }}>
              <p className="cta-social-label" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(251,246,236,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" as const, marginBottom: "16px" }}>Написать нам</p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {socials.map((s, i) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                    style={{
                      textDecoration: "none",
                      transition: "transform 0.25s ease",
                      opacity: inView ? 1 : 0,
                      transitionDelay: `${0.5 + i * 0.07}s`,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
                  >
                    <img className="cta-social-icon" src={s.img} alt={s.name} style={{ width: "56px", height: "56px", objectFit: "contain" }} />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right: Spline animation ── */}
          <div className="cta-spline" style={{
            position: "relative",
            minHeight: "440px",
            opacity: inView ? 1 : 0,
            transition: "opacity 1s ease 0.2s",
          }}>
            <div className="cta-spline-inner" style={{
              position: "absolute",
              inset: "-15%",
              zIndex: 0,
            }}>
              <LazySpline
                scene="https://prod.spline.design/EEO1FK0SYvQMo8Ap/scene.splinecode"
                containerStyle={{ width: "100%", height: "100%" }}
                style={{ width: "100%", height: "100%" }}
              />
              {/* fade edges */}
              <div className="cta-spline-fade" style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to right, #151513 0%, transparent 18%, transparent 82%, #151513 100%)",
                pointerEvents: "none",
              }} />
              <div className="cta-spline-fade" style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, #151513 0%, transparent 14%, transparent 84%, #151513 100%)",
                pointerEvents: "none",
              }} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: "Как Voice-Tec анализирует звонки - это безопасно?",
    a: "Все данные передаются по зашифрованному каналу (TLS 1.3) и хранятся на серверах в России. Записи звонков не передаются третьим лицам и используются исключительно для анализа внутри вашего аккаунта. Мы соответствуем требованиям 152-ФЗ о персональных данных.",
  },
  {
    q: "Что такое Quick-анализ и Deep-анализ, в чём разница?",
    a: "Quick-анализ - это экспресс-разбор звонка за 30–60 секунд: тональность разговора, выявление ключевых тем, оценка вежливости и соответствия скрипту. Deep-анализ занимает 3–5 минут и даёт полный транскрипт, детальную карту возражений, оценку каждого этапа продажи и персональные рекомендации для менеджера. Quick подходит для потокового контроля, Deep - для разбора сложных или провальных сделок.",
  },
  {
    q: "Сколько времени занимает подключение к CRM?",
    a: "В большинстве случаев интеграция с amoCRM, Битрикс24, Ringostat или Aircall занимает от 3 до 15 минут: вы вставляете API-ключ, выбираете воронку и начинаете получать аналитику. Для Retell и нестандартных конфигураций мы предоставляем личного менеджера по онбордингу - он проведёт вас через весь процесс бесплатно.",
  },
  {
    q: "Можно ли попробовать перед оплатой?",
    a: "Да. Бесплатный тариф даёт 300 минут Quick-анализа и 30 минут Deep-анализа без каких-либо ограничений по времени - пользуйтесь столько, сколько нужно. Карта не требуется. Когда лимит будет исчерпан, вы сможете выбрать подходящий тариф или запросить расширение лимита для пилотного тестирования.",
  },
  {
    q: "Как Voice-Tec помогает увеличить конверсию?",
    a: "Система автоматически выявляет моменты, где менеджеры теряют клиентов: слабая отработка возражений, преждевременное называние цены, отсутствие follow-up и другие паттерны. На основе реальных звонков формируются персональные рекомендации и точки роста для каждого сотрудника. Наши клиенты в среднем фиксируют рост конверсии на 12–28% в течение первых двух месяцев.",
  },
  {
    q: "Работает ли система с несколькими менеджерами и командами?",
    a: "Да. В тарифах Команда и Бизнес доступны роли: РОП видит сводную аналитику по всему отделу, менеджер - только свои показатели. Можно создавать группы, сравнивать команды между собой и настраивать индивидуальные скрипты и чек-листы для каждой роли.",
  },
  {
    q: "Поддерживает ли Voice-Tec входящие звонки или только исходящие?",
    a: "Система анализирует любые звонки: входящие, исходящие и даже перезвоны по заявкам. Тип звонка фиксируется автоматически из CRM-данных. Для каждого типа можно настроить отдельный чек-лист - например, для входящих оценивать скорость ответа и выявление потребности, для исходящих - качество презентации и закрытие на следующий шаг.",
  },
  {
    q: "Что будет, если минуты в тарифе закончатся?",
    a: "Вы получите уведомление при достижении 80% лимита. После исчерпания минут новые звонки перестают анализироваться, но уже обработанные данные остаются доступны. Вы можете в любой момент перейти на более высокий тариф или докупить дополнительный пакет минут без смены тарифного плана.",
  },
  {
    q: "Есть ли API для собственных интеграций?",
    a: "Да, на тарифах Команда и Бизнес доступен REST API с полной документацией. Вы можете интегрировать Voice-Tec с любой внутренней системой: ERP, BI-платформами, Slack, Telegram-ботами для уведомлений или собственными дашбордами. Технический специалист команды помогает с нестандартными сценариями.",
  },
  {
    q: "Можно ли отменить подписку в любой момент?",
    a: "Да, подписку можно отменить в личном кабинете в один клик без звонков и объяснений. Доступ сохраняется до конца оплаченного периода. Возврат средств за неиспользованные дни рассматривается индивидуально - напишите нам, и мы решим вопрос в течение 24 часов.",
  },
];

function FaqSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [open, setOpen] = useState<number | null>(null);
  const G = "#C8A96A";

  return (
    <section
      id="faq"
      ref={ref}
      style={{
        background: "#151513",
        padding: "0 24px 80px",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "80px",
      }}
    >

      <div
        className="max-w-3xl mx-auto relative"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(36px)",
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}
      >
        {/* Header */}
        <div className="text-center" style={{ marginBottom: "72px" }}>
          <div className="flex items-center justify-center gap-3 mb-7">
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
            <span className="faq-badge" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: G, fontWeight: 600 }}>FAQ</span>
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
          </div>
          <h2 className="faq-title" style={{
            fontFamily: '"Bodoni Moda", Georgia, serif',
            fontSize: "clamp(32px, 5vw, 62px)",
            fontWeight: 600,
            color: "#FBF6EC",
            lineHeight: 1.1,
            letterSpacing: "0.01em",
          }}>
            Частые вопросы
          </h2>
        </div>

        {/* Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                borderBottom: "1px solid rgba(240,230,210,0.08)",
                opacity: inView ? 1 : 0,
                transition: `opacity 0.6s ease ${0.05 + i * 0.05}s`,
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  padding: "26px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span className="faq-q" style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(17px, 2vw, 20px)",
                  fontWeight: 500,
                  color: open === i ? "#FBF6EC" : "rgba(251,246,236,0.88)",
                  lineHeight: 1.4,
                  transition: "color 0.25s ease",
                  flex: 1,
                }}>
                  {item.q}
                </span>
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: `1px solid ${open === i ? "rgba(200,169,106,0.6)" : "rgba(240,230,210,0.15)"}`,
                  background: open === i ? "rgba(200,169,106,0.12)" : "transparent",
                  color: open === i ? G : "rgba(251,246,236,0.4)",
                  fontSize: "18px",
                  fontWeight: 300,
                  lineHeight: 1,
                  flexShrink: 0,
                  transition: "all 0.3s ease",
                  transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                }}>+</span>
              </button>

              {/* Answer */}
              <div style={{
                maxHeight: open === i ? "400px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.45s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <p className="faq-a" style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(15px, 1.7vw, 18px)",
                  color: "rgba(251,246,236,0.78)",
                  lineHeight: 1.75,
                  fontWeight: 300,
                  paddingBottom: "28px",
                  paddingRight: "48px",
                }}>
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const G = "#C8A96A";

  const plans = [
    {
      name: "Бесплатный",
      price: null,
      priceLabel: "Бесплатно",
      period: null,
      quick: "300 мин",
      deep: "30 мин",
      managers: "до 2",
      popular: false,
    },
    {
      name: "Старт",
      price: "6 900",
      period: "в месяц",
      quick: "1 500 мин",
      deep: "150 мин",
      managers: "до 3",
      popular: false,
    },
    {
      name: "Команда",
      price: "14 900",
      period: "в месяц",
      quick: "4 000 мин",
      deep: "500 мин",
      managers: "до 10",
      popular: true,
    },
    {
      name: "Бизнес",
      price: "39 900",
      period: "в месяц",
      quick: "10 000 мин",
      deep: "1 500 мин",
      managers: "до 20",
      popular: false,
    },
  ];

  return (
    <section
      id="pricing"
      ref={ref}
      className="pr-section"
      style={{
        background: "#151513",
        padding: "0 24px 60px",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "80px",
      }}
    >

      {/* ambient glow */}
      <div aria-hidden style={{
        position: "absolute", top: "35%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "min(800px, 90vw)", height: "500px",
        background: "radial-gradient(ellipse at center, rgba(200,169,106,0.07), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div
        className="max-w-7xl mx-auto relative"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(36px)",
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}
      >
        {/* Header */}
        <div className="text-center" style={{ marginBottom: "72px" }}>
          <div className="flex items-center justify-center gap-3 mb-7">
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
            <span className="pr-badge" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: G, fontWeight: 600 }}>Тарифы</span>
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
          </div>
          <h2 className="pr-title" style={{
            fontFamily: '"Bodoni Moda", Georgia, serif',
            fontSize: "clamp(34px, 5vw, 66px)",
            fontWeight: 600,
            color: "#FBF6EC",
            lineHeight: 1.1,
            marginBottom: "20px",
            letterSpacing: "0.01em",
          }}>
            Тарифы для любого{" "}
            <span style={{
              background: "linear-gradient(105deg, #E9D29A, #C8A96A 45%, #9C7C3E)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontStyle: "italic",
            }}>масштаба</span>
          </h2>
          <p className="pr-sub" style={{ fontFamily: "Inter, sans-serif", fontSize: "17px", color: "rgba(251,246,236,0.5)", fontWeight: 300 }}>
            Начните бесплатно - 300 минут Quick-анализа
          </p>
        </div>

        {/* Cards grid */}
        <div className="pr-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: "56px" }}>
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className="pr-card"
              style={{
                position: "relative",
                background: plan.popular
                  ? "linear-gradient(160deg, rgba(200,169,106,0.14) 0%, rgba(200,169,106,0.06) 100%)"
                  : "rgba(255,255,255,0.03)",
                border: plan.popular
                  ? "1px solid rgba(200,169,106,0.55)"
                  : "1px solid rgba(240,230,210,0.10)",
                borderRadius: "16px",
                padding: "32px 28px 36px",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.7s ease ${0.1 + i * 0.1}s, transform 0.7s ease ${0.1 + i * 0.1}s`,
                boxShadow: plan.popular ? "0 0 60px rgba(200,169,106,0.12)" : "none",
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="pr-badge-pop" style={{
                  position: "absolute",
                  top: "-14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(105deg, #E9D29A, #C8A96A 55%, #B8934A)",
                  borderRadius: "999px",
                  padding: "5px 18px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: "#151513",
                  whiteSpace: "nowrap",
                }}>Популярный</div>
              )}

              {/* Plan name */}
              <p className="pr-name" style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase" as const,
                color: plan.popular ? G : "rgba(251,246,236,0.45)",
                marginBottom: "16px",
              }}>{plan.name}</p>

              {/* Price */}
              <div style={{ marginBottom: "32px" }}>
                {plan.price ? (
                  <>
                    <div className="pr-price" style={{
                      fontFamily: '"Bodoni Moda", Georgia, serif',
                      fontSize: "clamp(36px, 4vw, 48px)",
                      fontWeight: 600,
                      color: "#FBF6EC",
                      lineHeight: 1,
                      letterSpacing: "-0.01em",
                    }}>
                      {plan.price} <span style={{ fontSize: "0.55em", fontWeight: 400, color: "rgba(251,246,236,0.8)" }}>₽</span>
                    </div>
                    <div className="pr-period" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(251,246,236,0.4)", marginTop: "6px" }}>{plan.period}</div>
                  </>
                ) : (
                  <div className="pr-price pr-price-free" style={{
                    fontFamily: '"Bodoni Moda", Georgia, serif',
                    fontSize: "clamp(32px, 4vw, 44px)",
                    fontWeight: 600,
                    color: "#FBF6EC",
                    lineHeight: 1,
                  }}>{plan.priceLabel}</div>
                )}
              </div>

              {/* Divider */}
              <div style={{ width: "100%", height: "1px", background: plan.popular ? "rgba(200,169,106,0.25)" : "rgba(240,230,210,0.08)", marginBottom: "24px" }} />

              {/* Features */}
              <div className="pr-feats" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { icon: "⚡", label: "Quick", value: plan.quick },
                  { icon: "🔬", label: "Deep", value: plan.deep },
                  { icon: "👤", label: "Менеджеров", value: plan.managers },
                ].map(row => (
                  <div key={row.label} className="pr-feat-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="pr-feat" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(251,246,236,0.55)", display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ fontSize: "13px" }}>{row.icon}</span>
                      {row.label}
                    </span>
                    <span className="pr-feat" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: plan.popular ? G : "#FBF6EC" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            className="pr-btn"
            onClick={() => window.dispatchEvent(new Event("open-demo-modal"))}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#151513",
              background: "linear-gradient(105deg, #E9D29A, #C8A96A 55%, #B8934A)",
              border: "none",
              borderRadius: "4px",
              padding: "16px 44px",
              cursor: "pointer",
              textTransform: "uppercase" as const,
              boxShadow: "0 8px 30px rgba(200,169,106,0.25)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(200,169,106,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(200,169,106,0.25)";
            }}
          >
            Подробнее о тарифах
          </button>
        </div>
      </div>
    </section>
  );
}

function IntegrationSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const G = "#C8A96A";

  const crms = ["amoCRM", "Битрикс24", "Retell", "Ringostat", "Aircall"];

  return (
    <section
      ref={ref}
      className="int-section"
      style={{
        background: "#151513",
        padding: "0 24px 150px",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* ambient beige glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(720px, 90vw)",
          height: "420px",
          background: "radial-gradient(ellipse at center, rgba(251,246,236,0.07), transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="max-w-5xl mx-auto text-center relative"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(36px)",
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}
      >
        {/* eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-7">
          <div style={{ width: "40px", height: "1px", background: "rgba(251,246,236,0.3)" }} />
          <span className="int-badge" style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.25em",
            textTransform: "uppercase" as const,
            color: "rgba(251,246,236,0.5)",
            fontWeight: 600,
          }}>Подключение</span>
          <div style={{ width: "40px", height: "1px", background: "rgba(251,246,236,0.3)" }} />
        </div>

        <h2
          className="int-title"
          style={{
            fontFamily: '"Bodoni Moda", Georgia, serif',
            fontSize: "clamp(34px, 5.5vw, 70px)",
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: "0.005em",
            marginBottom: "30px",
            background: "linear-gradient(135deg, #F5E6B0 0%, #E8C96A 18%, #C8A032 35%, #F0D878 50%, #B8881E 65%, #E8C45A 80%, #F7EBB0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Интеграция за 5 минут
        </h2>

        <p
          className="int-sub"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "rgba(251,246,236,0.72)",
            fontWeight: 300,
            maxWidth: "620px",
            margin: "0 auto 52px",
            lineHeight: 1.65,
          }}
        >
          Подключите <span style={{ color: "#FBF6EC", fontWeight: 600 }}>Voice-Tec</span> к вашей CRM
          и&nbsp;телефонии - и&nbsp;начните зарабатывать больше уже сегодня.
        </p>

        {/* CRM chips */}
        <div
          className="flex flex-wrap items-center justify-center gap-3"
          style={{ marginBottom: "56px" }}
        >
          {crms.map((crm, i) => (
            <div
              key={crm}
              className="group int-chip"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "11px 20px",
                background: "rgba(251,246,236,0.04)",
                border: "1px solid rgba(251,246,236,0.16)",
                borderRadius: "999px",
                backdropFilter: "blur(6px)",
                transition: "all 0.3s ease",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(14px)",
                transitionDelay: `${0.15 + i * 0.08}s`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(251,246,236,0.10)";
                e.currentTarget.style.borderColor = "rgba(251,246,236,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(251,246,236,0.04)";
                e.currentTarget.style.borderColor = "rgba(251,246,236,0.16)";
              }}
            >
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FBF6EC", boxShadow: "0 0 8px rgba(251,246,236,0.6)" }} />
              <span
                className="int-chip-text"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(14px, 1.6vw, 17px)",
                  fontWeight: 600,
                  color: "#FBF6EC",
                  letterSpacing: "0.01em",
                }}
              >
                {crm}
              </span>
            </div>
          ))}
        </div>

        <button
          className="int-btn"
          onClick={() => window.dispatchEvent(new Event("open-demo-modal"))}
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: "#151513",
            background: "linear-gradient(135deg, #FBF6EC 0%, #F0E8D8 50%, #FBF6EC 100%)",
            border: "none",
            borderRadius: "4px",
            padding: "16px 40px",
            cursor: "pointer",
            textTransform: "uppercase" as const,
            boxShadow: "0 8px 30px rgba(251,246,236,0.12)",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(251,246,236,0.22)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(251,246,236,0.12)";
          }}
        >
          Подробнее об интеграциях
        </button>
      </div>
    </section>
  );
}

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const openDemo = () => setDemoOpen(true);
    window.addEventListener("open-demo-modal", openDemo);
    return () => window.removeEventListener("open-demo-modal", openDemo);
  }, []);

  // По умолчанию - оригинальные оттенки дашборда
  const [bg, setBg] = useState<PickerVal>({ hue: DEFAULTS.bg.hue, light: DEFAULTS.bg.light });
  const [acc, setAcc] = useState<PickerVal>({ hue: DEFAULTS.acc.hue, light: DEFAULTS.acc.light });
  const [text, setText] = useState<PickerVal>({ hue: DEFAULTS.text.hue, light: DEFAULTS.text.light });

  // Флаги «пользователь трогал пикер» - пока false, используем exact-цвета из DEFAULTS
  const [bgTouched, setBgTouched] = useState(false);
  const [accTouched, setAccTouched] = useState(false);
  const [textTouched, setTextTouched] = useState(false);

  const [activeSlider, setActiveSlider] = useState<null | "bg" | "acc" | "text">(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Хелпер: вернуть точные CSS-значения, если пикер не трогали; иначе - pickerCSS
  const resolve = (val: PickerVal, touched: boolean, def: typeof DEFAULTS.bg) => {
    if (!touched) {
      const { h, s, l } = def.exact;
      return { hsl: `hsl(${h}, ${s}%, ${l}%)`, rgb: hslToRgbCsv(h, s, l), h, s, l };
    }
    const css = pickerCSS(val.hue, val.light);
    const hsl = pickerHSL(val.hue, val.light);
    return { ...css, h: hsl.h, s: hsl.s, l: hsl.l };
  };

  const bgR = resolve(bg, bgTouched, DEFAULTS.bg);
  const accR = resolve(acc, accTouched, DEFAULTS.acc);
  const textR = resolve(text, textTouched, DEFAULTS.text);

  // Утилита: получить CSS от того же hue с другой светлотой (для производных оттенков)
  const derive = (h: number, l: number) => {
    const ll = Math.max(0, Math.min(100, l));
    let s = 70;
    if (ll <= 10) s = (ll / 10) * 70;
    else if (ll >= 95) s = ((100 - ll) / 5) * 30;
    else if (ll >= 80) s = 70 - ((ll - 80) / 15) * 40;
    return { hsl: `hsl(${h}, ${s.toFixed(1)}%, ${ll}%)`, rgb: hslToRgbCsv(h, s, ll) };
  };

  // Слайдер 1 - основной светлый фон
  const bgVars = (() => {
    const lighter = derive(bgR.h, bgR.l + 3);
    return {
      "--db-bg-1": bgR.hsl,
      "--db-bg-3": lighter.hsl,
      "--db-bg-rgb-1": bgR.rgb,
    } as React.CSSProperties;
  })();

  // Слайдер 2 - акценты + светлые акцент-фоны (производные от того же hue)
  const accVars = (() => {
    const bg2 = derive(accR.h, accR.l);
    const bg4 = derive(accR.h, Math.min(99, accR.l + 2));
    const acc2 = derive(accR.h, Math.min(95, accR.l + 5));
    const acc5 = derive(accR.h, Math.min(95, accR.l + 8));
    return {
      "--db-bg-2": bg2.hsl,
      "--db-bg-4": bg4.hsl,
      "--db-acc-1": accR.hsl,
      "--db-acc-2": acc2.hsl,
      "--db-acc-5": acc5.hsl,
      "--db-acc-rgb-1": accR.rgb,
      "--db-acc-rgb-2": acc2.rgb,
      "--db-acc-rgb-3": acc5.rgb,
    } as React.CSSProperties;
  })();

  // Слайдер 3 - цвет текста
  const textVars = (() => {
    const dark = derive(textR.h, Math.max(0, textR.l - 2));
    return {
      "--db-acc-3": textR.hsl,
      "--db-acc-4": dark.hsl,
      "--db-text-main": textR.hsl,
      "--db-text-rgb": textR.rgb,
    } as React.CSSProperties;
  })();

  const dashVars = { ...bgVars, ...accVars, ...textVars } as React.CSSProperties;

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "#151513" }}
    >
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div
          className="border-b"
          style={{
            background: "rgba(21,21,19,0.95)",
            borderColor: "rgba(212,176,116,0.12)",
          }}
        >
          <div className="w-full pl-3 pr-4 md:px-8 py-2 flex items-center">
            <a href="#" className="flex items-center gap-2.5">
              <img
                src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/7fcc31d6-3f84-4311-9254-7939b16b78f4.png"
                alt="VOICE-TEC"
                className="w-9 h-9 md:w-[52px] md:h-[52px] object-contain"
              />
              <span
                className="text-[20px] md:text-[30px] tracking-wide"
                style={{
                  fontFamily: '"Bodoni Moda", Georgia, serif',
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  backgroundImage:
                    "linear-gradient(105deg, #FFFFFF 0%, #FBF3DF 22%, #E8C77C 50%, #C79A4B 78%, #9E7326 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  textShadow: "0 1px 6px rgba(199,154,75,0.18)",
                }}
              >
                VOICE
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: "1.25em",
                    margin: "0 0.02em",
                    verticalAlign: "-0.04em",
                  }}
                >
                  –
                </span>
                TEC
              </span>
            </a>

            <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center pl-16">
              {[
                { label: "Тарифы", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
                { label: "Наша команда", href: "/about" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-[18px] rounded-lg transition-all duration-200"
                  style={{ color: "rgba(251,246,236,0.95)", fontFamily: "Inter, sans-serif", fontWeight: 400 }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4 ml-auto">
              {/* Social icons in nav */}
              <div className="hidden lg:flex items-center gap-3">
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "rgba(251,246,236,0.8)", fontWeight: 400, whiteSpace: "nowrap", lineHeight: 1.25, textAlign: "right" as const }}>
                  Остались вопросы?<br />Напишите нам!
                </div>
                <Icon name="ArrowRight" size={20} style={{ color: "#D4B074" }} />
                {[
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/ec6abbd1-8802-405a-bc41-b51fb1533a67.png", name: "Telegram", href: "https://t.me/" },
                ].map(s => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" title={s.name}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "58px", height: "58px", marginTop: "-12px", marginBottom: "-12px", borderRadius: "8px", transition: "transform 0.2s ease", opacity: 1 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
                  >
                    <img src={s.img} alt={s.name} style={{ width: "58px", height: "58px", objectFit: "contain" }} />
                  </a>
                ))}
              </div>

              <div className="hidden lg:block" style={{ width: "1px", height: "20px", background: "rgba(240,230,210,0.12)" }} />

              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="hidden sm:inline-flex items-center gap-2"
                style={{
                  background: "linear-gradient(160deg, #E8CC9A 0%, #D3B076 30%, #B8904A 55%, #D3B076 75%, #E8CC9A 100%)",
                  color: "#1E1500",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  fontSize: "15px",
                  padding: "9px 20px",
                  borderRadius: "2px",
                  marginRight: "8px",
                  boxShadow: "0 2px 10px rgba(180,130,50,0.25), inset 0 1px 0 rgba(255,240,190,0.4)",
                  transition: "box-shadow 0.25s ease, transform 0.25s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(180,130,50,0.45), inset 0 1px 0 rgba(255,240,190,0.4)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 10px rgba(180,130,50,0.25), inset 0 1px 0 rgba(255,240,190,0.4)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
              >
                Запросить демо
              </button>
              <a
                href="https://t.me/voicetec"
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram"
                className="lg:hidden flex items-center justify-center"
                style={{ width: "34px", height: "34px" }}
              >
                <img
                  src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/ec6abbd1-8802-405a-bc41-b51fb1533a67.png"
                  alt="Telegram"
                  style={{ width: "34px", height: "34px", objectFit: "contain" }}
                />
              </a>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 transition-colors"
                style={{ color: "rgba(251,246,236,0.78)" }}
              >
                <Icon name={menuOpen ? "X" : "Menu"} size={20} />
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b px-5 py-4"
            style={{
              background: "rgba(21,21,19,0.98)",
              borderColor: "rgba(212,176,116,0.12)",
            }}
          >
            {[
              { label: "Тарифы", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
              { label: "Наша команда", href: "/about" },
            ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-[15px] transition-colors"
                  style={{ color: "rgba(251,246,236,0.95)", fontFamily: "Inter, sans-serif", fontWeight: 400 }}
                >
                  {item.label}
                </a>
              ),
            )}
            <a
              href="https://t.me/voicetec"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 text-[13px] text-center leading-tight"
              style={{
                background: "linear-gradient(160deg, #E8CC9A 0%, #D3B076 30%, #B8904A 55%, #D3B076 75%, #E8CC9A 100%)",
                color: "#1E1500",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.08em",
                borderRadius: "2px",
                boxShadow: "0 2px 10px rgba(180,130,50,0.25), inset 0 1px 0 rgba(255,240,190,0.4)",
              }}
            >
              <Icon name="Send" size={16} style={{ color: "#1E1500" }} />
              <span>Остались вопросы? Напишите нам!</span>
            </a>
          </motion.div>
        )}
      </header>

      <main className="relative z-10">
        {/* ═══ HERO ═══ */}
        <section className="hero-section relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
          <div className="hero-bg absolute inset-0">
            <img
              src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/a8456873-6ecd-4697-b6d7-542d9fe7d89d.jpg"
              alt="Команда Voice-Tec"
              className="hero-photo w-full h-full object-cover"
              style={{ objectPosition: "center 38%", transform: "scale(1.1)", transformOrigin: "center 38%" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(21,21,19,0.1) 0%, rgba(21,21,19,0.35) 40%, rgba(21,21,19,0.72) 60%, rgba(21,21,19,0.92) 80%, rgba(21,21,19,1) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "rgba(21,21,19,0.15)" }}
            />
          </div>

          <div className="hero-inner relative z-10 w-full max-w-7xl mx-auto px-5 py-20" style={{ marginTop: "20rem" }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-5xl"
            >
              <motion.h1
                variants={fadeUp}
                className="hero-title text-5xl lg:text-7xl xl:text-8xl mb-6 leading-none"
                style={{
                  fontFamily: '"Bodoni Moda", Georgia, serif',
                  fontWeight: 400,
                  color: "#FBF6EC",
                  letterSpacing: "-0.01em",
                }}
              >
                <span className="hero-title-1" style={{ display: "block", marginLeft: "-5rem" }}>Ваши продажи</span>
                <span className="hero-title-2" style={{
                  display: "block",
                  whiteSpace: "nowrap",
                  paddingLeft: "25%",
                  marginTop: "-0.5rem",
                  backgroundImage: "linear-gradient(135deg, #FBE7C0 0%, #E8C786 28%, #D4B074 55%, #A47B3C 80%, #6E4F22 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  filter: "drop-shadow(0 2px 14px rgba(212,176,116,0.25))",
                }}>под контролем</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="hero-lead text-[22px] mb-5"
                style={{ color: "rgba(251,246,236,0.88)", fontFamily: "Inter, sans-serif", fontWeight: 400, lineHeight: 1.6, marginLeft: "45%", width: "60vw", maxWidth: "900px", textAlign: "center" }}
              >
                ИИ прослушивает и оценивает 100% звонков: кто сливает заявки, где менеджеры не дожимают клиента, какие скрипты не работают, а какие реально приносят деньги
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="hero-underline"
                style={{ marginLeft: "45%", width: "60vw", maxWidth: "900px", marginTop: "-0.5rem", marginBottom: "1.5rem" }}
              >
                <div className="gold-underline" />
              </motion.div>

              <motion.div variants={fadeUp} className="hero-cta flex flex-wrap gap-3" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="inline-flex items-center gap-2"
                  style={{
                    background: "linear-gradient(160deg, #E8CC9A 0%, #D3B076 30%, #B8904A 55%, #D3B076 75%, #E8CC9A 100%)",
                    color: "#1E1500",
                    borderRadius: "2px",
                    letterSpacing: "0.08em",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: "16.5px",
                    padding: "15px 40px",
                    boxShadow: "0 4px 18px rgba(180,130,50,0.3), inset 0 1px 0 rgba(255,240,190,0.4)",
                    transition: "box-shadow 0.25s ease, transform 0.25s ease",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(180,130,50,0.5), inset 0 1px 0 rgba(255,240,190,0.4)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(180,130,50,0.3), inset 0 1px 0 rgba(255,240,190,0.4)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                >
                  Запросить демо
                </button>
              </motion.div>
              <motion.p variants={fadeUp} className="hero-partners mt-7" style={{ fontFamily: "Inter, sans-serif", fontSize: "15.5px", letterSpacing: "0.06em", color: "rgba(251,246,236,0.4)", fontWeight: 400 }}>
                нам доверяют лидеры рынка&nbsp;&nbsp;·&nbsp;&nbsp;amoCRM&nbsp;&nbsp;·&nbsp;&nbsp;Битрикс&nbsp;&nbsp;·&nbsp;&nbsp;Retell&nbsp;&nbsp;·&nbsp;&nbsp;Ringostat&nbsp;&nbsp;·&nbsp;&nbsp;Aircall&nbsp;&nbsp;·&nbsp;&nbsp;и многие другие
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ═══ AI PIPELINE ═══ */}
        <PipelineSection />

        <SectionDivider />

        {/* ═══ DASHBOARD PREVIEW ═══ */}
        <section className="dash-section pt-8 pb-20 px-5 overflow-hidden" style={{ background: "#151513" }}>
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div style={{ width: "32px", height: "1px", background: "#D4B074", opacity: 0.5 }} />
                  <span style={labelStyle}>Платформа</span>
                  <div style={{ width: "32px", height: "1px", background: "#D4B074", opacity: 0.5 }} />
                </div>
                <h2 className="text-3xl lg:text-5xl mb-4" style={h2Style}>
                  Всё в одном окне
                </h2>
                <p style={{ ...bodyText, fontSize: "14px", maxWidth: "480px", margin: "0 auto" }}>
                  Аналитика звонков, воронки, менеджеры, статистика и AI-инсайты - единый дашборд без лишних вкладок
                </p>
              </motion.div>

              {/* ── Color Customizer (collapsible panel, открывается кнопкой в дашборде) ── */}
              <motion.div variants={fadeUp} className="mx-auto" style={{ maxWidth: "820px" }}>
                <div
                  style={{
                    maxHeight: customizerOpen ? "500px" : "0px",
                    opacity: customizerOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.4s ease, opacity 0.3s ease, margin-bottom 0.3s ease",
                    marginBottom: customizerOpen ? "24px" : "0px",
                  }}
                >
                  <div
                    id="dashboard-customizer-panel"
                    className="rounded-2xl px-6 py-5"
                    style={{
                      background: "rgba(251,246,236,0.04)",
                      backdropFilter: "blur(14px) saturate(140%)",
                      WebkitBackdropFilter: "blur(14px) saturate(140%)",
                      border: "1px solid rgba(212,176,116,0.2)",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,250,240,0.06)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(251,246,236,0.55)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        Выберите цвета
                      </span>
                      <button
                        onClick={() => {
                          setBg({ hue: DEFAULTS.bg.hue, light: DEFAULTS.bg.light });
                          setAcc({ hue: DEFAULTS.acc.hue, light: DEFAULTS.acc.light });
                          setText({ hue: DEFAULTS.text.hue, light: DEFAULTS.text.light });
                          setBgTouched(false);
                          setAccTouched(false);
                          setTextTouched(false);
                        }}
                        className="flex items-center gap-1.5"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "11px",
                          color: "rgba(212,176,116,0.75)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          letterSpacing: "0.05em",
                        }}
                      >
                        <Icon name="RotateCcw" size={12} />
                        Сбросить
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {([
                    { id: "bg" as const, label: "Основной фон", val: bg, set: setBg, setTouched: setBgTouched, resolved: bgR },
                    { id: "acc" as const, label: "Акценты и детали", val: acc, set: setAcc, setTouched: setAccTouched, resolved: accR },
                    { id: "text" as const, label: "Цвет текста", val: text, set: setText, setTouched: setTextTouched, resolved: textR },
                  ]).map((s) => {
                    return (
                      <div key={s.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(251,246,236,0.75)", fontWeight: 500 }}>
                            {s.label}
                          </span>
                          <div className="rounded-full" style={{ width: 14, height: 14, background: s.resolved.hsl, border: "1px solid rgba(255,250,240,0.4)" }} />
                        </div>

                        {/* 2D color picker */}
                        <div
                          className="relative rounded-lg overflow-hidden"
                          style={{
                            height: "120px",
                            cursor: "crosshair",
                            background: `
                              linear-gradient(to bottom, hsl(0,0%,100%) 0%, hsla(0,0%,100%,0) 18%, hsla(0,0%,0%,0) 82%, hsl(0,0%,0%) 100%),
                              linear-gradient(to right,
                                hsl(0,70%,50%) 0%,
                                hsl(60,70%,50%) 16.6%,
                                hsl(120,70%,50%) 33.3%,
                                hsl(180,70%,50%) 50%,
                                hsl(240,70%,50%) 66.6%,
                                hsl(300,70%,50%) 83.3%,
                                hsl(360,70%,50%) 100%
                              )
                            `,
                            border: "1px solid rgba(255,250,240,0.15)",
                          }}
                          onPointerDown={(e) => {
                            const target = e.currentTarget;
                            target.setPointerCapture(e.pointerId);
                            setActiveSlider(s.id);
                            s.setTouched(true);
                            const update = (clientX: number, clientY: number) => {
                              const rect = target.getBoundingClientRect();
                              const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                              const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
                              s.set({ hue: x * 360, light: (1 - y) * 100 });
                            };
                            update(e.clientX, e.clientY);
                            const move = (ev: PointerEvent) => update(ev.clientX, ev.clientY);
                            const up = (ev: PointerEvent) => {
                              target.releasePointerCapture(ev.pointerId);
                              setActiveSlider(null);
                              target.removeEventListener("pointermove", move);
                              target.removeEventListener("pointerup", up);
                            };
                            target.addEventListener("pointermove", move);
                            target.addEventListener("pointerup", up);
                          }}
                        >
                          {/* Crosshair */}
                          <div
                            className="absolute rounded-full pointer-events-none"
                            style={{
                              left: `${(s.val.hue / 360) * 100}%`,
                              top: `${(1 - s.val.light / 100) * 100}%`,
                              transform: "translate(-50%,-50%)",
                              width: activeSlider === s.id ? "18px" : "14px",
                              height: activeSlider === s.id ? "18px" : "14px",
                              background: s.resolved.hsl,
                              border: "2px solid #fff",
                              boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.5)",
                              transition: "width 0.15s, height 0.15s",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Dashboard Scene */}
              <div className="dash-wrap">
              <div
                className="dash-scene relative mx-auto"
                style={{ maxWidth: "1320px", height: "920px", ...dashVars }}
              >
                {/* ── LUXURY GLASS FRAME ── */}
                <div
                  className="absolute rounded-[22px] pointer-events-none overflow-hidden"
                  style={{
                    top: "-7px",
                    left: "-7px",
                    right: "-7px",
                    height: "834px",
                    padding: "7px",
                    background:
                      "linear-gradient(135deg, rgba(243,224,184,0.85) 0%, rgba(212,176,116,0.35) 18%, rgba(120,95,55,0.2) 45%, rgba(212,176,116,0.3) 72%, rgba(247,232,196,0.9) 100%)",
                    boxShadow:
                      "0 80px 160px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(212,176,116,0.45), 0 0 24px rgba(212,176,116,0.08), inset 0 1px 0 rgba(255,240,210,0.55), inset 0 -1px 0 rgba(60,40,15,0.4)",
                    zIndex: 0,
                  }}
                >
                  {/* Inner glass layer */}
                  <div
                    className="w-full h-full rounded-[16px] relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,250,240,0.12) 0%, rgba(255,250,240,0.02) 40%, rgba(255,250,240,0.01) 60%, rgba(255,250,240,0.08) 100%)",
                      backdropFilter: "blur(8px) saturate(160%)",
                      WebkitBackdropFilter: "blur(8px) saturate(160%)",
                      border: "0.5px solid rgba(255,250,240,0.18)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,250,240,0.25), inset 0 -1px 0 rgba(0,0,0,0.25), inset 1px 0 0 rgba(255,250,240,0.08), inset -1px 0 0 rgba(0,0,0,0.15)",
                    }}
                  >
                    {/* Diagonal sheen - main reflection */}
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: "-10%",
                        left: "-20%",
                        width: "60%",
                        height: "140%",
                        background:
                          "linear-gradient(105deg, transparent 0%, rgba(255,250,240,0.18) 45%, rgba(255,250,240,0.32) 50%, rgba(255,250,240,0.12) 55%, transparent 100%)",
                        transform: "skewX(-18deg)",
                        filter: "blur(2px)",
                      }}
                    />
                    {/* Secondary thin sheen */}
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: "-10%",
                        left: "55%",
                        width: "8%",
                        height: "140%",
                        background:
                          "linear-gradient(105deg, transparent 0%, rgba(255,250,240,0.25) 50%, transparent 100%)",
                        transform: "skewX(-18deg)",
                        filter: "blur(1px)",
                      }}
                    />
                  </div>

                  {/* Outer top highlight (light hitting the bezel) */}
                  <div
                    className="absolute pointer-events-none rounded-t-[22px]"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,250,235,0.9) 20%, rgba(255,250,235,0.95) 50%, rgba(255,250,235,0.9) 80%, transparent 100%)",
                    }}
                  />
                  {/* Outer bottom shadow line */}
                  <div
                    className="absolute pointer-events-none rounded-b-[22px]"
                    style={{
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "1px",
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(40,25,5,0.7) 50%, transparent 100%)",
                    }}
                  />
                </div>

                {/* ── BIG MAIN DASHBOARD ── */}
                <div
                  className="absolute rounded-2xl overflow-hidden db-main"
                  style={{
                    width: "100%",
                    height: "820px",
                    top: "0px",
                    left: "0px",
                    background: "var(--db-bg-1)",
                    border: "1px solid rgba(212,176,116,0.25)",
                    boxShadow: "0 60px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(var(--db-bg-rgb-1),0.08)",
                    zIndex: 1,
                  }}
                >
                  {/* Topbar */}
                  <div className="flex items-center justify-between px-7 py-4 border-b" style={{ background: "var(--db-bg-2)", borderColor: "rgba(var(--db-text-rgb),0.18)" }}>
                    <div className="flex items-center gap-3">
                      <Icon name="Waves" size={18} style={{ color: "var(--db-text-main)" }} />
                      <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "18px", color: "var(--db-text-main)", letterSpacing: "0.08em", fontWeight: 600 }}>SALES<span style={{ color: "var(--db-text-main)", opacity: 0.6 }}>FLOW</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded" style={{ background: "var(--db-bg-1)", border: "1px solid rgba(var(--db-text-rgb),0.25)" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--db-text-main)", fontWeight: 500 }}>1–30 Апреля, 2026</span>
                        <Icon name="ChevronDown" size={12} style={{ color: "var(--db-text-main)" }} />
                      </div>
                      {/* Кнопка кастомизации - раскрывает палитру и пикеры */}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomizerOpen((v) => {
                            const next = !v;
                            if (next) {
                              setTimeout(() => {
                                document.getElementById("dashboard-customizer-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
                              }, 60);
                            }
                            return next;
                          });
                        }}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded"
                        style={{
                          background: customizerOpen
                            ? "linear-gradient(135deg, #D4B074 0%, #B8965A 100%)"
                            : "var(--db-bg-1)",
                          border: customizerOpen
                            ? "1px solid rgba(212,176,116,0.7)"
                            : "1px solid rgba(var(--db-text-rgb),0.25)",
                          boxShadow: customizerOpen
                            ? "0 4px 14px rgba(212,176,116,0.35), inset 0 1px 0 rgba(255,250,240,0.25)"
                            : "none",
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                        }}
                        title="Кастомизация дашборда"
                      >
                        <Icon name="Palette" size={13} style={{ color: customizerOpen ? "#151513" : "var(--db-text-main)" }} />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: customizerOpen ? "#151513" : "var(--db-text-main)", fontWeight: 600 }}>
                          Палитра
                        </span>
                        <span className="flex items-center gap-0.5 ml-0.5">
                          <span className="rounded-full" style={{ width: 8, height: 8, background: bgR.hsl, border: "1px solid rgba(0,0,0,0.2)" }} />
                          <span className="rounded-full" style={{ width: 8, height: 8, background: accR.hsl, border: "1px solid rgba(0,0,0,0.2)" }} />
                          <span className="rounded-full" style={{ width: 8, height: 8, background: textR.hsl, border: "1px solid rgba(0,0,0,0.2)" }} />
                        </span>
                      </button>
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded" style={{ background: "var(--db-bg-1)", border: "1px solid rgba(var(--db-text-rgb),0.25)" }}>
                        <Icon name="Download" size={12} style={{ color: "var(--db-text-main)" }} />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--db-text-main)", fontWeight: 500 }}>Экспорт</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex" style={{ height: "calc(100% - 61px)" }}>
                    {/* Sidebar */}
                    <div className="shrink-0 border-r py-6 px-4" style={{ width: "200px", background: "var(--db-bg-2)", borderColor: "rgba(var(--db-text-rgb),0.18)" }}>
                      {[
                        { icon: "LayoutDashboard", label: "Обзор", active: true },
                        { icon: "Phone", label: "Звонки" },
                        { icon: "Users", label: "Клиенты" },
                        { icon: "BarChart2", label: "Аналитика" },
                        { icon: "Sparkles", label: "AI-Инсайты" },
                        { icon: "FileText", label: "Отчёты" },
                        { icon: "Settings", label: "Настройки" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg mb-1.5" style={{ background: item.active ? "rgba(var(--db-text-rgb),0.10)" : "transparent" }}>
                          <Icon name={item.icon} size={16} style={{ color: item.active ? "var(--db-text-main)" : "rgba(var(--db-text-rgb),0.55)" }} />
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: item.active ? "var(--db-text-main)" : "rgba(var(--db-text-rgb),0.6)", fontWeight: item.active ? 600 : 500 }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-7 overflow-hidden">
                      <div className="mb-6" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "32px", color: "var(--db-text-main)", fontWeight: 600 }}>Обзор</div>
                      {/* KPIs */}
                      <div className="grid grid-cols-4 gap-4 mb-5">
                        {[
                          { label: "Проанализировано звонков", value: "3,284", sub: "AI обработал разговоры менеджеров" },
                          { label: "Выявлено критических ошибок", value: "127", sub: "Ошибки, влияющие на потерю клиентов", change: "-12.4%", dir: "down" },
                          { label: "Пропущено точек продаж", value: "38%", sub: "Менеджеры не доводят клиента до следующего шага", change: "-6.1%", dir: "down" },
                          { label: "Средний AI-рейтинг разговоров", value: "81/100", sub: "Общая оценка качества коммуникации", change: "+24.4%", dir: "up" },
                        ].map((k) => (
                          <div key={k.label} className="rounded-xl p-4 flex flex-col" style={{ background: "var(--db-bg-2)", border: "1px solid rgba(var(--db-text-rgb),0.12)" }}>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(var(--db-text-rgb),0.65)", marginBottom: "8px", fontWeight: 500 }}>{k.label}</div>
                            <div style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "28px", color: "var(--db-text-main)", marginBottom: "6px", fontWeight: 600 }}>{k.value}</div>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(var(--db-text-rgb),0.5)", lineHeight: 1.35, marginBottom: "10px", flex: 1 }}>{k.sub}</div>
                            {k.change && (
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#1a8a52", fontWeight: 600 }}>{k.dir === "up" ? "↑" : "↓"} {k.change} за период</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Revenue chart */}
                      <div className="rounded-xl p-5 mb-5" style={{ background: "var(--db-bg-2)", border: "1px solid rgba(var(--db-text-rgb),0.12)" }}>
                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "var(--db-text-main)", marginBottom: "14px", fontWeight: 600 }}>Динамика выручки</div>
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col justify-between" style={{ height: "140px" }}>
                            {["15M", "10M", "5M"].map(l => <span key={l} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(var(--db-text-rgb),0.5)", fontWeight: 500 }}>{l}</span>)}
                          </div>
                          <div className="flex-1">
                            <svg width="100%" height="140" viewBox="0 0 400 100" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--db-text-main)" stopOpacity="0.25"/>
                                  <stop offset="100%" stopColor="var(--db-text-main)" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                              {/* Сетка */}
                              <line x1="0" y1="25" x2="400" y2="25" stroke="rgba(var(--db-text-rgb),0.12)" strokeWidth="1" strokeDasharray="3 3"/>
                              <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(var(--db-text-rgb),0.12)" strokeWidth="1" strokeDasharray="3 3"/>
                              <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(var(--db-text-rgb),0.12)" strokeWidth="1" strokeDasharray="3 3"/>
                              {(() => {
                                const pts = [
                                  [0,88],[10.8,72],[21.6,90],[32.4,60],[43.2,82],[54.1,45],[64.9,78],[75.7,55],
                                  [86.5,86],[97.3,40],[108.1,70],[118.9,30],[129.7,75],[140.5,48],[151.4,82],[162.2,35],
                                  [173,62],[183.8,20],[194.6,58],[205.4,28],[216.2,72],[227,18],[237.8,55],[248.6,25],
                                  [259.5,68],[270.3,15],[281.1,50],[291.9,22],[302.7,60],[313.5,12],[324.3,45],[335.1,18],
                                  [345.9,55],[356.8,10],[367.6,38],[378.4,14],[389.2,30],[400,8]
                                ];
                                const pointsStr = pts.map(p => `${p[0]},${p[1]}`).join(" ");
                                const polyStr = pointsStr + " 400,100 0,100";
                                return (
                                  <>
                                    <polygon points={polyStr} fill="url(#g1)"/>
                                    <polyline points={pointsStr} fill="none" stroke="var(--db-text-main)" strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter"/>
                                  </>
                                );
                              })()}
                            </svg>
                            <div className="flex justify-between mt-2">
                              {["1 Апр","7 Апр","14 Апр","21 Апр","30 Апр"].map(d => <span key={d} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(var(--db-text-rgb),0.55)", fontWeight: 500 }}>{d}</span>)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Bottom row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className="rounded-xl p-4"
                          style={{ background: "var(--db-bg-2)", border: "1px solid rgba(var(--db-acc-rgb-1),0.18)", cursor: "default" }}
                        >
                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "var(--db-text-main)", marginBottom: "14px", fontWeight: 600 }}>Последние звонки</div>
                          <div className="space-y-2.5">
                            {[
                              { c: "ООО ТехноПласт", d: "32:14", r: "Успешно" },
                              { c: "Иван Петров", d: "18:42", r: "Перезвонить" },
                              { c: "АО МаркетПлейс", d: "45:30", r: "Успешно" },
                              { c: "Сергей Иванов", d: "22:11", r: "Не удалось" },
                            ].map((c) => (
                              <div key={c.c} className="flex items-center gap-2">
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--db-text-main)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{c.c}</span>
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(var(--db-text-rgb),0.6)", fontWeight: 500 }}>{c.d}</span>
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: c.r === "Успешно" ? "#1a8a52" : c.r === "Не удалось" ? "#c92a2a" : "var(--db-acc-1)", fontWeight: 600 }}>{c.r}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: "var(--db-bg-2)", border: "1px solid rgba(var(--db-acc-rgb-1),0.18)" }}>
                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "var(--db-text-main)", marginBottom: "14px", fontWeight: 600 }}>Конверсия по этапам</div>
                          <div className="space-y-3">
                            {[["Лид","100%",1],["Квалификация","78%",0.78],["Презентация","52%",0.52],["Сделка","24%",0.24]].map(([l,v,p]) => (
                              <div key={String(l)}>
                                <div className="flex justify-between mb-1">
                                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--db-text-main)", fontWeight: 500 }}>{l}</span>
                                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--db-text-main)", fontWeight: 700 }}>{v}</span>
                                </div>
                                <div className="rounded-full overflow-hidden" style={{ height: "6px", background: "rgba(var(--db-acc-rgb-1),0.15)" }}>
                                  <div style={{ height: "100%", width: `${Number(p)*100}%`, background: "var(--db-acc-1)" }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CARD: AI-Инсайты (справа сверху) ── */}
                <div
                  className="absolute rounded-2xl p-6 db-card"
                  style={{
                    width: "38%",
                    top: "320px",
                    right: "-3%",
                    background: "linear-gradient(135deg, var(--db-bg-3) 0%, var(--db-bg-4) 100%)",
                    border: "1px solid rgba(212,176,116,0.55)",
                    boxShadow:
                      "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,176,116,0.3), 0 0 36px rgba(212,176,116,0.22)",
                    zIndex: 21,
                  }}
                >
                  <div className="flex items-center mb-2">
                    <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "20px", color: "var(--db-acc-4)", fontWeight: 700, letterSpacing: "-0.01em" }}>AI-Инсайты</span>
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--db-acc-3)", marginBottom: "18px", fontWeight: 500, fontStyle: "italic" }}>Рекомендации для менеджера</div>
                  <div className="flex items-center gap-5">
                    <div className="flex-1">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "var(--db-acc-4)", lineHeight: 1.5, marginBottom: "16px", fontWeight: 600 }}>
                        Клиенты чаще всего возражают на этапе обсуждения цены.
                      </p>
                      <button
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          color: "#FFFCF0",
                          padding: "9px 18px",
                          border: "1px solid rgba(255,240,200,0.3)",
                          borderRadius: "9px",
                          background: "linear-gradient(135deg, #4A3520 0%, #2A1F12 100%)",
                          fontWeight: 600,
                          boxShadow: "0 6px 14px rgba(42,31,18,0.45), inset 0 1px 0 rgba(255,240,200,0.15)",
                          letterSpacing: "0.02em",
                          cursor: "pointer",
                        }}
                      >
                        Подробнее →
                      </button>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          <defs>
                            <linearGradient id="aiGauge" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#F3D89A"/>
                              <stop offset="35%" stopColor="#C99A4E"/>
                              <stop offset="70%" stopColor="#7A4A2A"/>
                              <stop offset="100%" stopColor="#5C2F1E"/>
                            </linearGradient>
                            <filter id="aiGlow" x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="2" result="blur"/>
                              <feMerge>
                                <feMergeNode in="blur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                          <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(var(--db-acc-rgb-1),0.14)" strokeWidth="11"/>
                          <circle
                            cx="60" cy="60" r="48"
                            fill="none"
                            stroke="url(#aiGauge)"
                            strokeWidth="11"
                            strokeDasharray="244 301"
                            strokeDashoffset="0"
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                            filter="url(#aiGlow)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "30px", color: "var(--db-acc-4)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>81%</span>
                        </div>
                      </div>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6B4A1F", textAlign: "center", marginTop: "8px", maxWidth: "120px", lineHeight: 1.3, fontWeight: 600, letterSpacing: "0.02em" }}>Вероятность успешной сделки</span>
                    </div>
                  </div>
                </div>

                {/* ── CARD: Анализ разговора (слева) ── */}
                <div
                  className="absolute rounded-2xl p-5 db-card"
                  style={{
                    width: "34%",
                    bottom: "100px",
                    left: "-3%",
                    background: "var(--db-bg-1)",
                    border: "1px solid rgba(var(--db-bg-rgb-1),0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(var(--db-bg-rgb-1),0.1)",
                    transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                    zIndex: 20,
                  }}
                >
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "var(--db-acc-3)", fontWeight: 500, marginBottom: "3px" }}>Анализ разговора</div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(var(--db-text-rgb),0.5)", marginBottom: "18px" }}>Этап: Работа с возражениями</div>
                  {/* Waveform */}
                  <div className="flex items-center gap-0.5 mb-4" style={{ height: "48px" }}>
                    {[5,9,15,11,21,14,8,18,12,22,9,17,6,19,10,15,8,12,18,9,13,21,10,16,6,12,19,9,15,7,18,10,13,16,8].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-full"
                        style={{
                          height: `${h}px`,
                          background: i < 14 ? "#453321" : "rgba(69,51,33,0.3)",
                          transformOrigin: "center",
                          animation: "none",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#453321" }}>
                      <Icon name="Play" size={12} style={{ color: "#FBF6EC" }} />
                    </div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#453321" }}>02:37 / 05:21</span>
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#453321", marginBottom: "10px" }}>Ключевые темы</div>
                  <div className="flex flex-wrap gap-2">
                    {["Цена", "Сроки", "Назначение встречи"].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-md" style={{ background: "rgba(var(--db-text-rgb),0.08)", color: "var(--db-text-main)", border: "1px solid rgba(var(--db-text-rgb),0.25)", fontSize: "12px", fontFamily: "Inter, sans-serif" }}>{tag}</span>
                    ))}
                  </div>

                </div>

                {/* ── CARD: Качество разговора (радар) ── */}
                <div
                  className="absolute rounded-2xl p-5 db-card"
                  style={{
                    width: "38%",
                    top: "350px",
                    left: "27%",
                    background: "var(--db-bg-1)",
                    border: "1px solid rgba(var(--db-bg-rgb-1),0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(var(--db-bg-rgb-1),0.1)",
                    zIndex: 22,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div style={{ fontFamily: "Inter, sans-serif", fontSize: "19px", color: "var(--db-acc-3)", fontWeight: 500 }}>Качество разговора</div>
                      <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(var(--db-text-rgb),0.5)", marginTop: "3px" }}>AI-оценка по ключевым критериям</div>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative">
                        <svg width="56" height="56" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(var(--db-acc-rgb-1),0.15)" strokeWidth="5"/>
                          <circle cx="28" cy="28" r="23" fill="none" stroke="#C9A35B" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${0.76 * 2 * Math.PI * 23} ${2 * Math.PI * 23}`} transform="rotate(-90 28 28)"/>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "15px", color: "var(--db-acc-3)", lineHeight: 1 }}>76%</span>
                        </div>
                      </div>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "#000000", marginTop: "3px" }}>общая оценка</span>
                    </div>
                  </div>

                  {(() => {
                    const axes = [
                      { label: "Установление контакта", icon: "Handshake", val: 0.92 },
                      { label: "Выявление боли", icon: "Target", val: 0.42 },
                      { label: "Выявление потребностей", icon: "ClipboardList", val: 0.8 },
                      { label: "Презентация решения", icon: "Presentation", val: 0.9 },
                      { label: "Работа с возражениями", icon: "ShieldCheck", val: 0.66 },
                      { label: "Назначение след. шага", icon: "CalendarCheck", val: 0.78 },
                      { label: "Фиксация договорённостей", icon: "ListChecks", val: 0.68 },
                      { label: "Завершение разговора", icon: "CircleCheck", val: 0.9 },
                    ];
                    const cx = 160, cy = 160, R = 113;
                    const pt = (i: number, r: number) => {
                      const ang = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
                      return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
                    };
                    const poly = axes.map((a, i) => pt(i, R * a.val).join(",")).join(" ");
                    return (
                      <div className="relative mx-auto" style={{ width: 320, height: 320 }}>
                        <svg width="320" height="320" viewBox="0 0 320 320">
                          {[0.25, 0.5, 0.75, 1].map((lvl) => (
                            <polygon key={lvl}
                              points={axes.map((_, i) => pt(i, R * lvl).join(",")).join(" ")}
                              fill="none" stroke="rgba(var(--db-text-rgb),0.13)" strokeWidth="1" />
                          ))}
                          {axes.map((_, i) => {
                            const [x, y] = pt(i, R);
                            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(var(--db-text-rgb),0.1)" strokeWidth="1" />;
                          })}
                          <polygon points={poly} fill="rgba(154,159,184,0.25)" stroke="#9a9fb8" strokeWidth="2.5" strokeLinejoin="round" />
                          {axes.map((a, i) => {
                            const [x, y] = pt(i, R * a.val);
                            return <circle key={i} cx={x} cy={y} r="4" fill="#7d839f" stroke="var(--db-bg-1)" strokeWidth="2" />;
                          })}
                          <circle cx={cx} cy={cy} r="3" fill="rgba(var(--db-text-rgb),0.3)" />
                        </svg>
                        {axes.map((a, i) => {
                          const [x, y] = pt(i, R + 36);
                          return (
                            <div key={i} className="absolute flex flex-col items-center"
                              style={{ left: x, top: y, transform: "translate(-50%,-50%)", width: 100 }}>
                              <div className="flex items-center justify-center rounded-full shrink-0"
                                style={{ width: 30, height: 30, border: "1px solid rgba(184,137,62,0.4)", background: "rgba(201,163,91,0.08)", marginBottom: 4 }}>
                                <Icon name={a.icon} size={15} style={{ color: "#A87B3C" }} fallback="Circle" />
                              </div>
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", lineHeight: 1.2, color: "rgba(var(--db-text-rgb),0.7)", textAlign: "center", fontWeight: 500 }}>{a.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* ── CARD: Последние звонки (центр-низ) ── */}
                <div
                  className="absolute rounded-2xl p-5 db-card"
                  style={{
                    width: "42%",
                    bottom: "20px",
                    left: "29%",
                    background: "var(--db-bg-1)",
                    border: "1px solid rgba(var(--db-bg-rgb-1),0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(var(--db-bg-rgb-1),0.1)",
                    zIndex: 23,
                  }}
                >
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "var(--db-acc-3)", fontWeight: 500, marginBottom: "14px" }}>Последние звонки</div>
                  {/* Table header */}
                  <div className="grid items-center gap-3 pb-2 mb-2 border-b" style={{ gridTemplateColumns: "1.6fr 1fr 1.1fr 0.7fr 1.4fr", borderColor: "rgba(var(--db-acc-rgb-2),0.18)" }}>
                    {["Клиент","Длительность","Результат","Конверсия","Запись"].map(h => (
                      <span key={h} style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(var(--db-text-rgb),0.45)", fontWeight: 500, letterSpacing: "0.04em" }}>{h}</span>
                    ))}
                  </div>
                  {/* Rows */}
                  <div className="space-y-2.5">
                    {[
                      { c: "ООО ТехноПласт", d: "4:14", r: "Успешно", k: "85%", color: "#22a868" },
                      { c: "Иван Петров", d: "18:42", r: "Перезвонить", k: "40%", color: "#b8860b" },
                      { c: "АО МаркетПлейс", d: "45:30", r: "Успешно", k: "90%", color: "#22a868" },
                      { c: "Сергей Иванов", d: "7:11", r: "Не удалось", k: "20%", color: "#ef4444" },
                      { c: "ООО СтройИнвест", d: "5:38", r: "Успешно", k: "70%", color: "#22a868" },
                    ].map((row, idx) => (
                      <div key={row.c} className="grid items-center gap-3" style={{ gridTemplateColumns: "1.6fr 1fr 1.1fr 0.7fr 1.4fr" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(var(--db-text-rgb),0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.c}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(var(--db-text-rgb),0.55)" }}>{row.d}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: row.color }}>{row.r}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--db-acc-3)", fontWeight: 500 }}>{row.k}</span>
                        {/* Audio control */}
                        <div className="flex items-center gap-1.5">
                          <button className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--db-acc-2)" }}>
                            <Icon name="Play" size={8} style={{ color: "#FBF6EC" }} />
                          </button>
                          {/* Mini waveform */}
                          <div className="flex items-center gap-[1px] flex-1" style={{ height: "14px" }}>
                            {[4,7,10,5,12,6,9,11,5,8,7,10,4,9,6,8,5,11,7,4].map((h, i) => (
                              <div key={i} className="flex-1 rounded-full" style={{ height: `${h}px`, background: i < (idx === 3 ? 4 : idx === 1 ? 8 : 14) ? "var(--db-acc-2)" : "rgba(var(--db-acc-rgb-2),0.25)" }} />
                            ))}
                          </div>
                          <button className="shrink-0" title="Скачать">
                            <Icon name="Download" size={11} style={{ color: "rgba(var(--db-acc-rgb-2),0.7)" }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── CARD: Топ менеджеров (справа) ── */}
                <div
                  className="absolute rounded-2xl p-5 db-card"
                  style={{
                    width: "38%",
                    bottom: "60px",
                    right: "0%",
                    background: "var(--db-bg-1)",
                    border: "1px solid rgba(var(--db-bg-rgb-1),0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(var(--db-bg-rgb-1),0.1)",
                    zIndex: 25,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "17px", color: "var(--db-acc-3)", fontWeight: 500 }}>Топ менеджеров</span>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded" style={{ background: "rgba(var(--db-acc-rgb-2),0.1)", border: "1px solid rgba(var(--db-acc-rgb-2),0.2)" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--db-acc-3)" }}>За месяц</span>
                      <Icon name="ChevronDown" size={10} style={{ color: "var(--db-acc-2)" }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Иван Петров", score: 89.4, a: "И", best: true },
                      { name: "Мария Смирнова", score: 78.2, a: "М" },
                      { name: "Алексей Кузнецов", score: 71.5, a: "А" },
                      { name: "Анна Васильева", score: 63.8, a: "А" },
                      { name: "Дмитрий Новиков", score: 49.3, a: "Д", worst: true },
                    ].map((m) => {
                      const sc =
                        m.score >= 80 ? "#22a868" :
                        m.score >= 65 ? "#9acd32" :
                        m.score >= 50 ? "#e8b923" :
                        m.score >= 35 ? "#e8842b" : "#e0533d";
                      return (
                        <div key={m.name} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(var(--db-acc-rgb-2),0.2)", color: "var(--db-acc-2)", fontWeight: 600, fontSize: "11px", fontFamily: "Inter, sans-serif" }}>{m.a}</div>
                          <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(var(--db-text-rgb),0.7)", whiteSpace: "nowrap" }}>{m.name}</span>
                            {m.best && <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#22a868", fontWeight: 600 }}>★ Лучший менеджер</span>}
                            {m.worst && <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#e0533d", textDecoration: "underline", cursor: "pointer" }}>Узнать подробности</span>}
                          </div>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: sc, fontWeight: 700, minWidth: "56px", textAlign: "right", marginRight: "28px" }}>{m.score.toFixed(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#000000", marginTop: "14px", lineHeight: 1.4 }}>* узнайте слабые стороны конкретного менеджера, помешавшие бизнесу заработать больше</p>
                </div>

              </div>
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ SPLINE FEATURE ═══ */}
        <SplineFeatureSection />

        <SectionDivider />

        {/* ═══ BEFORE / AFTER ═══ */}
        <BeforeAfterSection />

        <SectionDivider />

        {/* ═══ ДЛЯ КОГО ПОДХОДИТ ═══ */}
        <AudienceSection />

        <SectionDivider />

        {/* ═══ ДЛЯ РОПов ═══ */}
        <RopSection />

        <SectionDivider />

        {/* ═══ КАК ВНЕДРЯЕМ ═══ */}
        <ImplementationSection />

        <SectionDivider />

        {/* ═══ КЕЙСЫ КЛИЕНТОВ ═══ */}
        <CasesSection />

        <SectionDivider />

        {/* ═══ ГАРАНТИЯ ═══ */}
        <GuaranteeSection />

        <SectionDivider />

        {/* ═══ CLIENT VALUE ═══ */}
        <ClientValueSection />

        <SectionDivider />

        {/* ═══ INTEGRATION ═══ */}
        <IntegrationSection />

        <SectionDivider />

        {/* ═══ PRICING ═══ */}
        <PricingSection />

        <SectionDivider />

        {/* ═══ FAQ ═══ */}
        <FaqSection />

        <SectionDivider />

        {/* ═══ FINAL CTA ═══ */}
        <FinalCtaSection />

        {/* ═══ FOOTER ═══ */}
        <footer
          className="py-10 px-5"
          style={{ borderTop: "1px solid rgba(212,176,116,0.1)", background: "#151513" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/7fcc31d6-3f84-4311-9254-7939b16b78f4.png"
                  alt="VOICE-TEC"
                  className="w-9 h-9 object-contain"
                />
                <span
                  style={{
                    fontFamily: '"Bodoni Moda", Georgia, serif',
                    fontWeight: 400,
                    fontSize: "14px",
                    letterSpacing: "0.08em",
                    color: "#FBF6EC",
                  }}
                >
                  VOICE<span style={{ color: "#D4B074" }}>-TEC</span>
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
                {[
                  { label: "Тарифы", href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                  { label: "Наша команда", href: "/about" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-[12px] transition-colors"
                    style={{ color: "rgba(251,246,236,0.7)", fontFamily: "Inter, sans-serif", fontWeight: 300 }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <p style={{ fontSize: "11px", color: "rgba(251,246,236,0.3)", fontFamily: "Inter, sans-serif" }}>
                © 2026 VOICE-TEC AI. Все права защищены.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* ═══ FLOATING CTA ═══ */}
      <motion.button
        type="button"
        onClick={() => setDemoOpen(true)}
        className="floating-cta fixed bottom-6 right-6 z-50 inline-flex items-center gap-2"
        style={{
          background: "linear-gradient(160deg, #E8CC9A 0%, #D3B076 30%, #B8904A 55%, #D3B076 75%, #E8CC9A 100%)",
          color: "#1E1500",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.08em",
          fontSize: "13px",
          padding: "11px 22px",
          borderRadius: "2px",
          boxShadow: "0 4px 18px rgba(180,130,50,0.35), inset 0 1px 0 rgba(255,240,190,0.4)",
        }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon name="MessageCircle" size={15} />
        Запросить демо
      </motion.button>

      <DemoRequestModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

export default HomePage;