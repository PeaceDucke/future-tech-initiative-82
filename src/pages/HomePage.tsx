import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import Spline from "@splinetool/react-spline";

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
}: {
  children: React.ReactNode;
  className?: string;
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
  // rotateY: от -72deg (ребром) до 0deg (лицом) — clamp 0..1
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

  // Передняя (лицевая) грань с контентом — выдвинута вперёд на half.
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
        {/* Торцы строятся только когда известны размеры — позиционируются от центра */}
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

// ─── Growth Chart Animation ──────────────────────────────────────────────────
function GrowthChart() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-15% 0px" });

  // SVG viewBox dimensions
  const W = 760;
  const H = 560;
  const padX = 40;
  const padTop = 60;
  const padBottom = 60;

  // Хаотичные, но растущие приращения (21 перелом) — крупные перепады
  const deltas = [
    14, -7, 20, 9, -10, 16, 24, -12, 13, 8, -6, 19,
    11, -11, 22, 14, -8, 18, 10, 25, -13,
  ];

  // Строим значения, начиная с 0
  const values: number[] = [0];
  deltas.forEach((d) => values.push(values[values.length - 1] + d));

  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const n = values.length;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const pts = values.map((v, i) => {
    const x = padX + (innerW * i) / (n - 1);
    const y = padTop + innerH - ((v - minV) / range) * innerH;
    return { x, y, v };
  });

  // Сглаженная (но с острыми углами) ломаная линия
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  // Длина линии для анимации рисования
  const pathLen = pts.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const dx = p.x - pts[i - 1].x;
    const dy = p.y - pts[i - 1].y;
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  const drawDur = 3.2; // секунд на отрисовку линии

  const last = pts[n - 1];

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "138%", height: "100%", overflow: "visible", transform: "translateX(-12%)" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="gcLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F5EDD8" />
            <stop offset="55%" stopColor="#FBF6EC" />
            <stop offset="100%" stopColor="#D4B074" />
          </linearGradient>
          <filter id="gcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Горизонтальные направляющие */}
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => {
          const y = padTop + innerH * g;
          return (
            <line
              key={`grid-${i}`}
              x1={padX}
              y1={y}
              x2={W - padX}
              y2={y}
              stroke="rgba(245,237,216,0.07)"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
          );
        })}

        {/* Базовая ось */}
        <line
          x1={padX}
          y1={padTop + innerH}
          x2={W - padX}
          y2={padTop + innerH}
          stroke="rgba(245,237,216,0.18)"
          strokeWidth="1"
        />

        {/* Линия графика */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#gcLine)"
          strokeWidth="2.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#gcGlow)"
          style={{
            strokeDasharray: pathLen,
            strokeDashoffset: inView ? 0 : pathLen,
            transition: `stroke-dashoffset ${drawDur}s cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        />

        {/* Точки перелома */}
        {pts.map((p, i) => {
          const appear = (i / (n - 1)) * drawDur;
          const isPeak = i === n - 1;
          return (
            <circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={isPeak ? 4.5 : 2.2}
              fill={isPeak ? "#FBF6EC" : "#F5EDD8"}
              style={{
                opacity: inView ? (isPeak ? 1 : 0.55) : 0,
                transform: inView ? "scale(1)" : "scale(0)",
                transformOrigin: `${p.x}px ${p.y}px`,
                transition: `opacity 0.4s ease ${appear}s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${appear}s`,
              }}
            />
          );
        })}

        {/* Пульсирующий ореол на финальной точке */}
        <circle
          cx={last.x}
          cy={last.y}
          r="4.5"
          fill="none"
          stroke="#D4B074"
          strokeWidth="1.5"
          style={{
            opacity: inView ? 1 : 0,
            transformOrigin: `${last.x}px ${last.y}px`,
            animation: inView ? `gcPulse 2.4s ease-out ${drawDur}s infinite` : "none",
          }}
        />

        {/* Итоговая метка роста */}
        <g
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(8px)",
            transition: `opacity 0.6s ease ${drawDur + 0.2}s, transform 0.6s ease ${drawDur + 0.2}s`,
          }}
        >
          <text
            x={last.x}
            y={last.y - 22}
            textAnchor="middle"
            fontFamily='"Bodoni Moda", Georgia, serif'
            fontSize="30"
            fill="#FBF6EC"
          >
            +{maxV}%
          </text>
          <text
            x={last.x}
            y={last.y - 4}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="11"
            letterSpacing="0.16em"
            fill="rgba(245,237,216,0.5)"
          >
            РОСТ ВЫРУЧКИ
          </text>
        </g>
      </svg>

      <style>{`
        @keyframes gcPulse {
          0%   { r: 4.5; opacity: 0.9; }
          70%  { r: 26;  opacity: 0; }
          100% { r: 26;  opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── AI Radar Scanner Animation ──────────────────────────────────────────────
function RadarScanner() {
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
          left: "62%",
          top: "50%",
          width: "min(128%, 880px)",
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
            filter: "blur(2px)",
            pointerEvents: "none",
            mixBlendMode: "screen",
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
            mixBlendMode: "screen",
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

// ─── Pain Cards Section ────────────────────────────────────────────────────────
function PainSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0..1

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Старт: секция только появляется снизу (rect.top = windowH)
      // Конец: верх секции достигает середины экрана — весь разворот укладывается в первую половину скролла
      const start = windowH * 1.5;
      const end = windowH * 0.4;
      const raw = (start - rect.top) / (start - end);
      setScrollProgress(Math.min(1, Math.max(0, raw)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // stagger минимальный — карточки разворачиваются почти одновременно
  const cardProgress = (_idx: number, stagger: number) => {
    const raw = (scrollProgress - stagger) / (1 - stagger);
    return Math.min(1, Math.max(0, raw));
  };

  const overlayOpacity = Math.max(0, 1 - scrollProgress * 3);

  const cards = [
    {
      num: "01",
      icon: "Phone",
      title: "Клиенты теряются\nвнутри звонков",
      problem: "Клиент готов купить, но менеджер\nтеряет его на этапе цены или возражений.",
      solution: "AI находит момент, где разговор\nпошёл не туда.",
      loss: "до 840 000 ₽ в месяц",
    },
    {
      num: "02",
      icon: "Headphones",
      title: "Руководитель не видит\nкачество диалогов",
      problem: "Прослушивать сотни звонков вручную\nневозможно и неэффективно.",
      solution: "AI автоматически анализирует 100% разговоров\nи выделяет проблемные.",
      loss: "до 1 200 000 ₽ в месяц",
    },
    {
      num: "03",
      icon: "BarChart2",
      title: "Реклама приводит лиды,\nно продажи не растут",
      problem: "Вы платите за лиды,\nно теряете клиентов из-за качества обработки.",
      solution: "AI сравнивает эффективность каналов\nне по лидам, а по выручке.",
      loss: "до 950 000 ₽ в месяц",
    },
    {
      num: "04",
      icon: "MessageSquare",
      title: "Скрипты есть,\nно менеджеры работают\nпо-разному",
      problem: "Менеджеры работают \"как чувствуют\",\nа не по системе.",
      solution: "AI отслеживает соблюдение скриптов\nи качество коммуникации.",
      loss: "до 670 000 ₽ в месяц",
    },
    {
      num: "05",
      icon: "PieChart",
      title: "CRM показывает цифры,\nно не объясняет причины",
      problem: "Цифры есть, а понимания — нет.\nВы не знаете, где теряете деньги.",
      solution: "AI объясняет причины падения конверсии\nи предлагает решения.",
      loss: "до 1 500 000 ₽ в месяц",
    },
  ];

  return (
    <section style={{ background: "#151513", padding: "100px 20px 80px" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div style={{ width: "32px", height: "1px", background: "#D4B074", opacity: 0.5 }} />
            <span style={labelStyle}>Проблемы, которые стоят вам денег</span>
            <div style={{ width: "32px", height: "1px", background: "#D4B074", opacity: 0.5 }} />
          </div>
          <h2 style={{ ...h2Style, fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.15, marginBottom: "20px" }}>
            Вы теряете клиентов внутри звонков —<br />
            и даже не видите этого.
          </h2>
          <p style={{ ...bodyText, fontSize: "15px", maxWidth: "460px", margin: "0 auto" }}>
            SalesFlow находит не просто слабые места,<br />
            а конкретные причины потери выручки.
          </p>
        </div>

        {/* Cards — scroll-driven rotateY per card */}
        <div ref={sectionRef} style={{ position: "relative" }}>
          {/* Overlay затемнения всей области */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "#0e0d0b",
              opacity: overlayOpacity,
              zIndex: 10,
              borderRadius: "20px",
            }}
          />

          {/* Row 1: 2 big cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {cards.slice(0, 2).map((c, i) => (
              <PainCard key={c.num} c={c} progress={cardProgress(i, i * 0.06)} large />
            ))}
          </div>

          {/* Row 2: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {cards.slice(2).map((c, i) => (
              <PainCard key={c.num} c={c} progress={cardProgress(i, 0.12 + i * 0.06)} />
            ))}
          </div>

          {/* Footer summary row */}
          <div
            style={{
              background: "#0f0f0f",
              border: "1px solid rgba(240,232,218,0.45)",
              boxShadow: "0 0 0 1px rgba(240,232,218,0.08), 0 0 18px rgba(240,232,218,0.06), 0 0 40px rgba(240,232,218,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
              borderRadius: "16px",
              padding: "28px 32px",
              display: "flex",
              alignItems: "center",
              gap: "40px",
              flexWrap: "wrap",
              opacity: Math.min(1, Math.max(0, (scrollProgress - 0.6) / 0.4)),
              transform: `translateY(${Math.max(0, (1 - (scrollProgress - 0.6) / 0.4)) * 20}px)`,
            }}
          >
            <div className="flex items-center gap-4" style={{ flex: "1 1 260px" }}>
              <div style={{ width: 52, height: 52, background: "rgba(212,176,116,0.08)", border: "1px solid rgba(212,176,116,0.22)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="Target" size={24} style={{ color: "#D4B074" }} />
              </div>
              <div>
                <p style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "16px", color: "#FBF6EC", fontWeight: 400, lineHeight: 1.4 }}>
                  AI уже после первых недель показывает,<br />где компания недозарабатывает:
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(251,246,236,0.45)", marginTop: "4px" }}>
                  в звонках, менеджерах, каналах трафика и скриптах.
                </p>
              </div>
            </div>
            <div style={{ width: "1px", height: "48px", background: "rgba(212,176,116,0.18)", flexShrink: 0 }} className="hidden md:block" />
            {[
              { icon: "Wallet", label: "Скрытые потери", value: "до 5 160 000 ₽", sub: "в месяц" },
              { icon: "TrendingUp", label: "Рост выручки", value: "+15–30%", sub: "после внедрения" },
              { icon: "Clock", label: "Время на анализ", value: "−90%", sub: "для руководителя" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, background: "rgba(212,176,116,0.07)", border: "1px solid rgba(212,176,116,0.18)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={stat.icon} size={16} style={{ color: "#D4B074" }} />
                </div>
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(251,246,236,0.45)", marginBottom: "2px" }}>{stat.label}</p>
                  <p style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "18px", color: "#D4B074", fontWeight: 400, lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(251,246,236,0.45)" }}>{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
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
      text: "Менеджер начал презентовать продукт, ещё не поняв, что важно клиенту. AI подсвечивает момент, где разговор свернул не туда — и подсказывает, какой вопрос вернул бы сделку в нужное русло.",
      metric: "Риск потери сделки",
      metricVal: "Высокий",
      progress: 78,
      tone: "danger" as const,
      pos: "left-top",
    },
    {
      badge: "Risk",
      title: "Возражение не обработано",
      text: "Клиент трижды сомневался, но ключевое возражение так и осталось без ответа. Интерес остывает — AI фиксирует точный момент, где сделку ещё можно было вернуть.",
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
      text: "Звонок можно было закрыть. AI разобрал его по шагам: выяви потребность в начале, сними ключевое возражение и зафиксируй следующий шаг с клиентом — и конверсия пойдёт вверх.",
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
        <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "18px" }}>
          <div style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: accentColor,
            boxShadow: active ? `0 0 11px ${accentColor}` : "none",
            transition: "all 0.4s ease",
            flexShrink: 0,
          }} />
          <span style={{
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
        <p style={{
          fontFamily: '"Bodoni Moda", Georgia, serif',
          fontSize: isLight ? "26px" : "21px",
          color: isLight ? "#16140F" : "#F7F2EA",
          fontWeight: 400,
          lineHeight: 1.22,
          marginBottom: "15px",
          letterSpacing: "0.01em",
        }}>{card.title}</p>

        {/* Body */}
        <p style={{
          fontFamily: "Inter, sans-serif",
          fontSize: isLight ? "16px" : "15px",
          color: isLight ? "#3A352C" : "#D6D3CD",
          lineHeight: 1.68,
          marginBottom: "24px",
          fontWeight: 400,
        }}>{card.text}</p>

        {/* Progress bar */}
        <div style={{ marginBottom: "16px" }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
      style={{
        background: "#151513",
        padding: "0 20px 160px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.15) 30%, rgba(200,169,106,0.15) 70%, transparent)" }} />

      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center" style={{
          paddingTop: "100px",
          paddingBottom: "0",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <div className="flex items-center justify-center gap-3 mb-5">
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: G, fontWeight: 600 }}>
              AI-аналитика звонков
            </span>
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
          </div>
          <h2 style={{
            fontFamily: '"Bodoni Moda", Georgia, serif',
            fontSize: "clamp(30px, 4.5vw, 58px)",
            color: T,
            fontWeight: 400,
            lineHeight: 1.1,
            marginBottom: "20px",
          }}>
            Что AI видит внутри разговора
          </h2>
          <p style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            color: S,
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.8,
          }}>
            SalesFlow находит моменты, где менеджеры теряют клиентов,<br />и показывает, как вернуть продажи.
          </p>
        </div>

        {/* ── Main composition: cards + robot ── */}
        {/* Spline canvas — absolute на всю зону, карточки поверх */}
        <div style={{ position: "relative", marginTop: "60px", minHeight: "680px" }}>

          {/* Spline на весь контейнер — canvas покрывает всю интерактивную область */}
          <div className="hidden lg:block" style={{
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
            <Spline
              scene="https://prod.spline.design/ftUPjjfe6wGNb2BY/scene.splinecode"
              style={{ width: "100%", height: "100%", transform: "scale(0.667)", transformOrigin: "center center" }}
            />
            {/* Fade edges — скрывают края canvas, не мешают событиям */}
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

          {/* Desktop layout — карточки поверх Spline canvas */}
          {/* pointer-events: none на всех обёртках — Spline видит мышь везде */}
          {/* pointer-events: auto только на самих карточках */}
          <div className="hidden lg:grid" style={{
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

            {/* Center: пустое пространство — Spline canvas проходит насквозь */}
            <div style={{ height: "580px", pointerEvents: "none" }} />

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", pointerEvents: "none" }}>
              <Card card={cards[2]} idx={2} />
              <Card card={cards[3]} idx={3} />
            </div>
          </div>

          {/* Bottom center card */}
          <div className="hidden lg:flex" style={{ justifyContent: "center", marginTop: "24px", position: "relative", zIndex: 3, pointerEvents: "none" }}>
            <div style={{ width: "540px", pointerEvents: "none" }}>
              <Card card={cards[4]} idx={4} />
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex lg:hidden flex-col gap-4" style={{ marginTop: "40px" }}>
            <div style={{ height: "300px", position: "relative", opacity: inView ? 1 : 0, transition: "opacity 1s ease" }}>
              <Spline
                scene="https://prod.spline.design/ftUPjjfe6wGNb2BY/scene.splinecode"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            {cards.map((card, idx) => (
              <Card key={idx} card={card} idx={idx} />
            ))}
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

// ─── AI Pipeline Section ───────────────────────────────────────────────────────
function PipelineSection() {
  // Цветовая система
  const W = "#FBF6EC";           // белый/кремовый — основной текст
  const G = "#D4B074";           // золотой — акценты, лейблы
  const B = "#F5EDD8";           // бежевый old money — вторичный текст
  const RED = "#FF6B6B";         // красный — ошибки, потери
  const GREEN = "#4ADE80";       // зелёный — рост, успех

  const pCard: React.CSSProperties = {
    background: "linear-gradient(160deg, #1c1c1c 0%, #141414 40%, #0e0e0e 70%, #161618 100%)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "28px",
    padding: "52px 48px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.4), 0 40px 100px rgba(0,0,0,0.75)",
  };

  const num = (n: string) => (
    <div className="flex items-center gap-4 mb-8">
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{n}</span>
      </div>
      <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, rgba(255,255,255,0.15), transparent)" }} />
    </div>
  );

  const dot = () => (
    <div className="hidden lg:flex w-[4%] justify-center" style={{ alignSelf: "center" }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.85)", boxShadow: "0 0 0 4px rgba(255,255,255,0.08), 0 0 20px rgba(255,255,255,0.2)", flexShrink: 0 }} />
    </div>
  );

  return (
    <section style={{ background: "#151513", padding: "120px 20px 140px" }}>
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
          <p style={{ ...bodyText, fontSize: "17px", maxWidth: "480px", margin: "0 auto", lineHeight: 1.75, color: B }}>
            Мы превращаем хаос звонков в понятные причины<br />и точки роста продаж.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 hidden lg:block" style={{ width: "1px", background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.12) 8%, rgba(255,255,255,0.12) 92%, transparent 100%)", transform: "translateX(-50%)" }} />

          <div className="flex flex-col gap-20 lg:gap-28">

            {/* ── PAIN CARDS — 3 IN A ROW ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { icon: "Headphones", text: "РОП тратит часы на прослушивание звонков вместо управления продажами и развития команды." },
                { icon: "SearchX", text: "Отдел контроля качества физически не способен проверить все разговоры и обеспечить полный контроль над качеством работы сотрудников." },
                { icon: "TrendingDown", text: "Ошибки менеджеров обнаруживаются только после того, как бизнес уже потерял деньги." },
              ].map((c, i) => (
                <div key={i} className="pc" style={{ ...pCard, padding: "40px 34px" }}>
                  <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 65%)", pointerEvents: "none" }} />
                  <div style={{ width: "54px", height: "54px", borderRadius: "16px", background: `${RED}15`, border: `1px solid ${RED}35`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "26px" }}>
                    <Icon name={c.icon} size={24} style={{ color: RED }} />
                  </div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: W, lineHeight: 1.75, fontWeight: 400 }}>
                    {c.text}
                  </p>
                </div>
              ))}
            </div>

            {/* ── PAIN ANIMATION ── */}
            <div style={{ width: "100%", height: "800px", overflow: "hidden", position: "relative", marginTop: "-180px" }}>
              <Spline scene="https://prod.spline.design/ajHrylTbUEMreEbT/scene.splinecode" style={{ width: "100%", height: "100%" }} />
            </div>

            {/* ── CARD 2 — RIGHT ── */}
            <div className="flex flex-col lg:flex-row-reverse items-start gap-10 lg:gap-0">
              <div className="pc w-full lg:w-[48%]" style={pCard}>
                <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 65%)", pointerEvents: "none" }} />
                {num("02")}
                <h3 style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(24px, 2.8vw, 32px)", color: W, fontWeight: 400, lineHeight: 1.2, marginBottom: "18px" }}>
                  AI анализирует каждый разговор
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: B, lineHeight: 1.8, marginBottom: "32px" }}>
                  Система слушает диалог и в режиме реального времени распознаёт структуру разговора, тональность речи, эмоции клиента и критические моменты, которые определяют исход сделки.
                </p>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "18px", padding: "24px 26px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "24px" }}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 600 }}>AI обнаружил сигналы возражений</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["слишком дорого", "не уверен", "нужно подумать", "скиньте КП", "посоветуюсь"].map((t) => (
                      <span key={t} style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: RED, background: `${RED}15`, border: `1px solid ${RED}35`, borderRadius: "20px", padding: "6px 16px", fontWeight: 500 }}>[ {t} ]</span>
                    ))}
                  </div>
                  <div style={{ borderTop: `1px solid ${G}18`, paddingTop: "16px" }}>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: W, lineHeight: 1.7 }}>
                      AI точно определяет момент, где менеджер теряет инициативу — и почему клиент не доходит до сделки.
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex w-[4%] justify-center" style={{ paddingTop: "120px" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: G, boxShadow: `0 0 0 5px rgba(212,176,116,0.12), 0 0 28px rgba(212,176,116,0.4)`, flexShrink: 0 }} />
              </div>
              {/* Spline */}
              <div className="hidden lg:block w-[48%]" style={{ height: "700px", overflow: "visible", position: "relative" }}>
                <Spline
                  scene="https://prod.spline.design/RlTNiUewyyrK6f47/scene.splinecode"
                  style={{ width: "260%", height: "260%", position: "absolute", top: "-80%", left: "-100%" }}
                />
              </div>
            </div>

            {/* ── CARD 3 — LEFT ── */}
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-0">
              <div className="pc w-full lg:w-[48%]" style={pCard}>
                <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 65%)", pointerEvents: "none" }} />
                {num("03")}
                <h3 style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(24px, 2.8vw, 32px)", color: W, fontWeight: 400, lineHeight: 1.2, marginBottom: "18px" }}>
                  Система находит скрытые причины потери денег
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: B, lineHeight: 1.8, marginBottom: "32px" }}>
                  SalesFlow не просто фиксирует данные — он вскрывает конкретные причины, по которым ваш отдел продаж теряет выручку каждый день. Без прослушки вручную, без субъективных оценок.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    { icon: "AlertTriangle", label: "Нарушения скрипта продаж", desc: "менеджер уходит от структуры в критический момент", color: RED },
                    { icon: "ShieldOff",     label: "Слабая обработка возражений", desc: "клиент уходит с неотработанным сомнением", color: RED },
                    { icon: "TrendingDown",  label: "Потеря интереса клиента", desc: "AI фиксирует момент, когда клиент «отключился»", color: RED },
                    { icon: "UserX",         label: "Ошибки и давление менеджера", desc: "перебивания, игнорирование потребностей", color: RED },
                    { icon: "BarChart2",     label: "Рост после устранения ошибок", desc: "конверсия растёт уже в первый месяц работы", color: GREEN },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4 px-5 py-4 rounded-2xl" style={{ background: `${item.color}0C`, border: `1px solid ${item.color}28` }}>
                      <div style={{ width: 36, height: 36, borderRadius: "10px", background: `${item.color}18`, border: `1px solid ${item.color}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                        <Icon name={item.icon} size={16} style={{ color: item.color }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: item.color, fontWeight: 600, marginBottom: "3px" }}>{item.label}</p>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: B, lineHeight: 1.55 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {dot()}
              <div className="hidden lg:block w-[48%]" style={{ height: "780px", position: "relative", overflow: "visible" }}>
                <RadarScanner />
              </div>
            </div>

            {/* ── CARD 4 — RIGHT ── */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-0">
              <div className="pc w-full lg:w-[48%]" style={pCard}>
                <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 65%)", pointerEvents: "none" }} />
                {num("04")}
                <h3 style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(24px, 2.8vw, 32px)", color: W, fontWeight: 400, lineHeight: 1.2, marginBottom: "18px" }}>
                  Вы получаете готовые точки роста выручки
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: B, lineHeight: 1.8, marginBottom: "32px" }}>
                  AI превращает разрозненные разговоры в чёткие бизнес-выводы. Вы видите не просто цифры — вы видите, что именно изменить, чтобы продавать больше уже сейчас.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: "18px", padding: "22px 24px" }}>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: GREEN, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Потенциал роста</p>
                    <p style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "44px", color: GREEN, lineHeight: 1, marginBottom: "6px" }}>+18%</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: B }}>конверсии в сделку</p>
                  </div>
                  <div style={{ background: `${RED}10`, border: `1px solid ${RED}30`, borderRadius: "18px", padding: "22px 24px" }}>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: RED, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Теряется сейчас</p>
                    <p style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "26px", color: RED, lineHeight: 1.1, marginBottom: "6px" }}>840 000 ₽</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: B }}>в месяц, выявлено AI</p>
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "18px", padding: "24px 26px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "24px" }}>
                  <div className="flex items-center gap-3 mb-5">
                    <Icon name="Sparkles" size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Конкретные рекомендации AI</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { text: "Сократить обсуждение цены в первые 3 минуты разговора", icon: "Clock" },
                      { text: "Усилить фиксацию потребности — задавать вопросы до КП", icon: "Target" },
                      { text: "Проработать скрипт обработки возражений по 5 точкам", icon: "ShieldCheck" },
                    ].map((r) => (
                      <div key={r.text} className="flex items-start gap-3">
                        <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                          <Icon name={r.icon} size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
                        </div>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: B, lineHeight: 1.65, paddingTop: "5px" }}>{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "18px 22px", background: `${GREEN}0C`, borderRadius: "14px", border: `1px solid ${GREEN}28` }}>
                  <Icon name="TrendingUp" size={20} style={{ color: GREEN, flexShrink: 0 }} />
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: GREEN, lineHeight: 1.6, fontWeight: 500 }}>
                    Клиенты SalesFlow увеличивают выручку на <strong>15–30%</strong> в первые два месяца работы.
                  </p>
                </div>
              </div>
              {dot()}
              <div className="hidden lg:block w-[48%]" style={{ height: "700px", overflow: "visible", position: "relative" }}>
                <GrowthChart />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}



/* ─────────────────────────────────────────────
   Что получает клиент — scroll-reveal section
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
            <span style={{
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
      image: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/29a644ad-f298-4373-a9b3-60b82e6b9338.png",
      label: "Оценка качества обработки заявок",
    },
    {
      side: "right" as const,
      image: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/44a9430a-21d0-4bc4-98a4-087ab5dc73aa.png",
      label: "Контроль РОПа",
    },
    {
      side: "left" as const,
      image: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/b61dd88e-b645-4a88-8f0e-3055e0be4387.png",
      label: "Точки роста конверсии",
    },
    {
      side: "right" as const,
      image: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/c8933f12-4fab-4a30-a421-f0fab1be3c5e.png",
      label: "Экономия времени отдела контроля качества",
    },
  ];

  return (
    <section
      ref={ref}
      style={{
        background: "#151513",
        padding: "0 20px 160px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* top divider */}
      <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.15) 30%, rgba(200,169,106,0.15) 70%, transparent)", marginBottom: "120px" }} />

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
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: G,
              fontWeight: 600,
            }}>Что получает клиент</span>
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
          </div>
          <h2 style={{
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
          <p style={{
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
        <div style={{ display: "flex", flexDirection: "column", gap: "120px" }}>
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
    { name: "WhatsApp", img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/d00de53c-fad6-450e-87d0-f57a9cad051c.png", href: "https://wa.me/", color: "#25D366" },
    { name: "Telegram", img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/2f700626-cd00-427d-9f0f-1cc4d3614911.png", href: "https://t.me/", color: "#229ED9" },
    { name: "Instagram", img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/07079e04-41db-4c6a-9866-3d0f7858d5c2.png", href: "https://instagram.com/", color: "#E1306C" },
    { name: "VK", img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/5bfb7468-351f-45a8-ac5b-91fdf57f4237.png", href: "https://vk.com/", color: "#0077FF" },
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
      {/* top divider */}
      <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.15) 30%, rgba(200,169,106,0.15) 70%, transparent)", marginBottom: "60px" }} />

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
          className="grid grid-cols-1 lg:grid-cols-2 items-center"
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
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: G, fontWeight: 600 }}>Бесплатный аудит</span>
            </div>

            <h2 style={{
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

            <p style={{
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
            <div className="flex flex-wrap gap-4" style={{ marginBottom: "28px" }}>
              <button
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
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(251,246,236,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" as const, marginBottom: "16px" }}>Написать нам</p>
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
                    <img src={s.img} alt={s.name} style={{ width: "56px", height: "56px", objectFit: "contain" }} />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right: Spline animation ── */}
          <div style={{
            position: "relative",
            minHeight: "440px",
            opacity: inView ? 1 : 0,
            transition: "opacity 1s ease 0.2s",
          }}>
            <div style={{
              position: "absolute",
              inset: "-15%",
              zIndex: 0,
            }}>
              <Spline
                scene="https://prod.spline.design/EEO1FK0SYvQMo8Ap/scene.splinecode"
                style={{ width: "100%", height: "100%" }}
              />
              {/* fade edges */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to right, #151513 0%, transparent 18%, transparent 82%, #151513 100%)",
                pointerEvents: "none",
              }} />
              <div style={{
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
    q: "Как SalesFlow анализирует звонки — это безопасно?",
    a: "Все данные передаются по зашифрованному каналу (TLS 1.3) и хранятся на серверах в России. Записи звонков не передаются третьим лицам и используются исключительно для анализа внутри вашего аккаунта. Мы соответствуем требованиям 152-ФЗ о персональных данных.",
  },
  {
    q: "Что такое Quick-анализ и Deep-анализ, в чём разница?",
    a: "Quick-анализ — это экспресс-разбор звонка за 30–60 секунд: тональность разговора, выявление ключевых тем, оценка вежливости и соответствия скрипту. Deep-анализ занимает 3–5 минут и даёт полный транскрипт, детальную карту возражений, оценку каждого этапа продажи и персональные рекомендации для менеджера. Quick подходит для потокового контроля, Deep — для разбора сложных или провальных сделок.",
  },
  {
    q: "Сколько времени занимает подключение к CRM?",
    a: "В большинстве случаев интеграция с amoCRM, Битрикс24, Ringostat или Aircall занимает от 3 до 15 минут: вы вставляете API-ключ, выбираете воронку и начинаете получать аналитику. Для Retell и нестандартных конфигураций мы предоставляем личного менеджера по онбордингу — он проведёт вас через весь процесс бесплатно.",
  },
  {
    q: "Можно ли попробовать перед оплатой?",
    a: "Да. Бесплатный тариф даёт 300 минут Quick-анализа и 30 минут Deep-анализа без каких-либо ограничений по времени — пользуйтесь столько, сколько нужно. Карта не требуется. Когда лимит будет исчерпан, вы сможете выбрать подходящий тариф или запросить расширение лимита для пилотного тестирования.",
  },
  {
    q: "Как SalesFlow помогает увеличить конверсию?",
    a: "Система автоматически выявляет моменты, где менеджеры теряют клиентов: слабая отработка возражений, преждевременное называние цены, отсутствие follow-up и другие паттерны. На основе реальных звонков формируются персональные рекомендации и точки роста для каждого сотрудника. Наши клиенты в среднем фиксируют рост конверсии на 12–28% в течение первых двух месяцев.",
  },
  {
    q: "Работает ли система с несколькими менеджерами и командами?",
    a: "Да. В тарифах Команда и Бизнес доступны роли: РОП видит сводную аналитику по всему отделу, менеджер — только свои показатели. Можно создавать группы, сравнивать команды между собой и настраивать индивидуальные скрипты и чек-листы для каждой роли.",
  },
  {
    q: "Поддерживает ли SalesFlow входящие звонки или только исходящие?",
    a: "Система анализирует любые звонки: входящие, исходящие и даже перезвоны по заявкам. Тип звонка фиксируется автоматически из CRM-данных. Для каждого типа можно настроить отдельный чек-лист — например, для входящих оценивать скорость ответа и выявление потребности, для исходящих — качество презентации и закрытие на следующий шаг.",
  },
  {
    q: "Что будет, если минуты в тарифе закончатся?",
    a: "Вы получите уведомление при достижении 80% лимита. После исчерпания минут новые звонки перестают анализироваться, но уже обработанные данные остаются доступны. Вы можете в любой момент перейти на более высокий тариф или докупить дополнительный пакет минут без смены тарифного плана.",
  },
  {
    q: "Есть ли API для собственных интеграций?",
    a: "Да, на тарифах Команда и Бизнес доступен REST API с полной документацией. Вы можете интегрировать SalesFlow с любой внутренней системой: ERP, BI-платформами, Slack, Telegram-ботами для уведомлений или собственными дашбордами. Технический специалист команды помогает с нестандартными сценариями.",
  },
  {
    q: "Можно ли отменить подписку в любой момент?",
    a: "Да, подписку можно отменить в личном кабинете в один клик без звонков и объяснений. Доступ сохраняется до конца оплаченного периода. Возврат средств за неиспользованные дни рассматривается индивидуально — напишите нам, и мы решим вопрос в течение 24 часов.",
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
      {/* top divider */}
      <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.15) 30%, rgba(200,169,106,0.15) 70%, transparent)", marginBottom: "60px" }} />

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
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: G, fontWeight: 600 }}>FAQ</span>
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
          </div>
          <h2 style={{
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
                <span style={{
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
                <p style={{
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
      style={{
        background: "#151513",
        padding: "0 24px 60px",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "80px",
      }}
    >
      {/* top divider */}
      <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.15) 30%, rgba(200,169,106,0.15) 70%, transparent)", marginBottom: "60px" }} />

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
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: G, fontWeight: 600 }}>Тарифы</span>
            <div style={{ width: "40px", height: "1px", background: G, opacity: 0.5 }} />
          </div>
          <h2 style={{
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
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "17px", color: "rgba(251,246,236,0.5)", fontWeight: 300 }}>
            Начните бесплатно — 300 минут Quick-анализа
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: "56px" }}>
          {plans.map((plan, i) => (
            <div
              key={plan.name}
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
                <div style={{
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
              <p style={{
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
                    <div style={{
                      fontFamily: '"Bodoni Moda", Georgia, serif',
                      fontSize: "clamp(36px, 4vw, 48px)",
                      fontWeight: 600,
                      color: "#FBF6EC",
                      lineHeight: 1,
                      letterSpacing: "-0.01em",
                    }}>
                      {plan.price} <span style={{ fontSize: "0.55em", fontWeight: 400, color: "rgba(251,246,236,0.8)" }}>₽</span>
                    </div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(251,246,236,0.4)", marginTop: "6px" }}>{plan.period}</div>
                  </>
                ) : (
                  <div style={{
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
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { icon: "⚡", label: "Quick", value: plan.quick },
                  { icon: "🔬", label: "Deep", value: plan.deep },
                  { icon: "👤", label: "Менеджеров", value: plan.managers },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(251,246,236,0.55)", display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ fontSize: "13px" }}>{row.icon}</span>
                      {row.label}
                    </span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: plan.popular ? G : "#FBF6EC" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
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
      style={{
        background: "#151513",
        padding: "0 24px 150px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* top divider */}
      <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.15) 30%, rgba(200,169,106,0.15) 70%, transparent)", marginBottom: "60px" }} />

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
          <span style={{
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
          Подключите <span style={{ color: "#FBF6EC", fontWeight: 600 }}>SalesFlow</span> к вашей CRM
          и&nbsp;телефонии — и&nbsp;начните зарабатывать больше уже сегодня.
        </p>

        {/* CRM chips */}
        <div
          className="flex flex-wrap items-center justify-center gap-3"
          style={{ marginBottom: "56px" }}
        >
          {crms.map((crm, i) => (
            <div
              key={crm}
              className="group"
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
  // По умолчанию — оригинальные оттенки дашборда
  const [bg, setBg] = useState<PickerVal>({ hue: DEFAULTS.bg.hue, light: DEFAULTS.bg.light });
  const [acc, setAcc] = useState<PickerVal>({ hue: DEFAULTS.acc.hue, light: DEFAULTS.acc.light });
  const [text, setText] = useState<PickerVal>({ hue: DEFAULTS.text.hue, light: DEFAULTS.text.light });

  // Флаги «пользователь трогал пикер» — пока false, используем exact-цвета из DEFAULTS
  const [bgTouched, setBgTouched] = useState(false);
  const [accTouched, setAccTouched] = useState(false);
  const [textTouched, setTextTouched] = useState(false);

  const [activeSlider, setActiveSlider] = useState<null | "bg" | "acc" | "text">(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Хелпер: вернуть точные CSS-значения, если пикер не трогали; иначе — pickerCSS
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

  // Слайдер 1 — основной светлый фон
  const bgVars = (() => {
    const lighter = derive(bgR.h, bgR.l + 3);
    return {
      "--db-bg-1": bgR.hsl,
      "--db-bg-3": lighter.hsl,
      "--db-bg-rgb-1": bgR.rgb,
    } as React.CSSProperties;
  })();

  // Слайдер 2 — акценты + светлые акцент-фоны (производные от того же hue)
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

  // Слайдер 3 — цвет текста
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
          <div className="w-full px-8 py-2 flex items-center">
            <a href="#" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(212,176,116,0.1)",
                  border: "1px solid rgba(212,176,116,0.25)",
                }}
              >
                <Icon name="Waves" size={16} style={{ color: "#D4B074" }} />
              </div>
              <span
                className="text-[15px] tracking-wide"
                style={{
                  fontFamily: '"Bodoni Moda", Georgia, serif',
                  fontWeight: 400,
                  color: "#FBF6EC",
                  letterSpacing: "0.08em",
                }}
              >
                SALES<span style={{ color: "#D4B074" }}>FLOW</span>
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
                  className="px-4 py-2 text-[16px] rounded-lg transition-all duration-200"
                  style={{ color: "rgba(251,246,236,0.95)", fontFamily: "Inter, sans-serif", fontWeight: 400 }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4 ml-auto">
              {/* Social icons in nav */}
              <div className="hidden lg:flex items-center gap-3">
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(251,246,236,0.8)", fontWeight: 400, whiteSpace: "nowrap", lineHeight: 1.25, textAlign: "right" as const }}>
                  Остались вопросы?<br />Напишите нам!
                </div>
                <Icon name="ArrowRight" size={20} style={{ color: "#D4B074" }} />
                {[
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/a0f299b2-a9a5-4030-955a-a78f3bef763d.png", name: "Telegram", href: "https://t.me/" },
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

              <a
                href="#cta"
                className="hidden sm:inline-flex items-center gap-2"
                style={{
                  background: "linear-gradient(160deg, #E8CC9A 0%, #D3B076 30%, #B8904A 55%, #D3B076 75%, #E8CC9A 100%)",
                  color: "#1E1500",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  fontSize: "13px",
                  padding: "9px 20px",
                  borderRadius: "2px",
                  marginRight: "8px",
                  boxShadow: "0 2px 10px rgba(180,130,50,0.25), inset 0 1px 0 rgba(255,240,190,0.4)",
                  transition: "box-shadow 0.25s ease, transform 0.25s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 18px rgba(180,130,50,0.45), inset 0 1px 0 rgba(255,240,190,0.4)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 10px rgba(180,130,50,0.25), inset 0 1px 0 rgba(255,240,190,0.4)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
              >
                Запросить демо
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
              href="#cta"
              onClick={() => setMenuOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 text-[13px]"
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
              Запросить демо
            </a>
          </motion.div>
        )}
      </header>

      <main className="relative z-10">
        {/* ═══ HERO ═══ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/e3398b6d-eb3c-4f97-b1a4-9768d29cb5d8.jpg"
              alt="Команда SalesFlow"
              className="w-full h-full object-cover object-center"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(21,21,19,0.1) 0%, rgba(21,21,19,0.05) 35%, rgba(21,21,19,0.72) 72%, rgba(21,21,19,0.97) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "rgba(21,21,19,0.15)" }}
            />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-5 py-20" style={{ marginTop: "20rem" }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-5xl"
            >
              <motion.h1
                variants={fadeUp}
                className="text-5xl lg:text-7xl xl:text-8xl mb-6 leading-none"
                style={{
                  fontFamily: '"Bodoni Moda", Georgia, serif',
                  fontWeight: 400,
                  color: "#FBF6EC",
                  letterSpacing: "-0.01em",
                }}
              >
                <span style={{ display: "block", marginLeft: "-5rem" }}>Ваши продажи</span>
                <span style={{ color: "#D4B074", display: "block", whiteSpace: "nowrap", paddingLeft: "25%", marginTop: "-0.5rem" }}>под контролем</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-[22px] mb-5"
                style={{ color: "rgba(251,246,236,0.88)", fontFamily: "Inter, sans-serif", fontWeight: 400, lineHeight: 1.6, marginLeft: "45%", width: "60vw", maxWidth: "900px", textAlign: "center" }}
              >
                ИИ прослушивает и оценивает 100% звонков: кто сливает заявки, где менеджеры не дожимают клиента, какие скрипты не работают, а какие реально приносят деньги
              </motion.p>

              <motion.div
                variants={fadeUp}
                style={{ marginLeft: "45%", width: "60vw", maxWidth: "900px", marginTop: "-0.5rem", marginBottom: "1.5rem" }}
              >
                <div className="gold-underline" />
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3" style={{ marginTop: "1.5rem" }}>
                <a
                  href="#cta"
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
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 24px rgba(180,130,50,0.5), inset 0 1px 0 rgba(255,240,190,0.4)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 18px rgba(180,130,50,0.3), inset 0 1px 0 rgba(255,240,190,0.4)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
                >
                  Запросить демо
                </a>
              </motion.div>
              <motion.p variants={fadeUp} className="mt-7" style={{ fontFamily: "Inter, sans-serif", fontSize: "15.5px", letterSpacing: "0.06em", color: "rgba(251,246,236,0.4)", fontWeight: 400 }}>
                нам доверяют лидеры рынка&nbsp;&nbsp;·&nbsp;&nbsp;amoCRM&nbsp;&nbsp;·&nbsp;&nbsp;Битрикс&nbsp;&nbsp;·&nbsp;&nbsp;Retell&nbsp;&nbsp;·&nbsp;&nbsp;Ringostat&nbsp;&nbsp;·&nbsp;&nbsp;Aircall&nbsp;&nbsp;·&nbsp;&nbsp;и многие другие
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ═══ AI PIPELINE ═══ */}
        <PipelineSection />

        {/* ═══ DASHBOARD PREVIEW ═══ */}
        <section className="pt-8 pb-20 px-5 overflow-hidden" style={{ background: "#151513" }}>
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
                  Аналитика звонков, воронка, менеджеры и AI-инсайты — единый дашборд без лишних вкладок
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
              <motion.div
                variants={fadeUp}
                className="relative mx-auto"
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
                    {/* Diagonal sheen — main reflection */}
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
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--db-text-main)", fontWeight: 500 }}>1–30 Апреля, 2024</span>
                        <Icon name="ChevronDown" size={12} style={{ color: "var(--db-text-main)" }} />
                      </div>
                      {/* Кнопка кастомизации — раскрывает палитру и пикеры */}
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
                          { label: "Выручка", value: "₽12.4M", change: "+18.7%" },
                          { label: "Конверсия в сделки", value: "24.6%", change: "+12.4%" },
                          { label: "Средний чек", value: "₽18,540", change: "+6.2%" },
                          { label: "Новые лиды", value: "1,243", change: "+14.3%" },
                        ].map((k) => (
                          <div key={k.label} className="rounded-xl p-4" style={{ background: "var(--db-bg-2)", border: "1px solid rgba(var(--db-text-rgb),0.12)" }}>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(var(--db-text-rgb),0.65)", marginBottom: "8px", fontWeight: 500 }}>{k.label}</div>
                            <div style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "28px", color: "var(--db-text-main)", marginBottom: "6px", fontWeight: 600 }}>{k.value}</div>
                            <div className="flex items-center justify-between">
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#1a8a52", fontWeight: 600 }}>↑ {k.change} за период</span>
                              <svg width="48" height="18" viewBox="0 0 60 18"><polyline points="0,15 12,12 24,13 36,7 48,9 60,2" fill="none" stroke="var(--db-text-main)" strokeWidth="1.8" opacity="0.7" strokeLinecap="round" /></svg>
                            </div>
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
                    {["Цена", "Сроки", "Интеграция", "Демо"].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-md" style={{ background: "rgba(var(--db-text-rgb),0.08)", color: "var(--db-text-main)", border: "1px solid rgba(var(--db-text-rgb),0.25)", fontSize: "12px", fontFamily: "Inter, sans-serif" }}>{tag}</span>
                    ))}
                  </div>

                </div>

                {/* ── CARD: Источники сделок (центр) ── */}
                <div
                  className="absolute rounded-2xl p-5 db-card"
                  style={{
                    width: "32%",
                    top: "465px",
                    left: "33%",
                    background: "var(--db-bg-1)",
                    border: "1px solid rgba(var(--db-bg-rgb-1),0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(var(--db-bg-rgb-1),0.1)",
                    zIndex: 22,
                  }}
                >
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "var(--db-acc-3)", fontWeight: 500, marginBottom: "18px" }}>Источники сделок</div>
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <svg width="110" height="110" viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(var(--db-acc-rgb-1),0.12)" strokeWidth="16"/>
                        {/* 40% - тёплый коричневый (Old Money) */}
                        <circle cx="55" cy="55" r="45" fill="none" stroke="#A88B5C" strokeWidth="16" strokeDasharray="113 283" strokeDashoffset="0" transform="rotate(-90 55 55)"/>
                        {/* 30% - пастельный голубой */}
                        <circle cx="55" cy="55" r="45" fill="none" stroke="#A8C5D6" strokeWidth="16" strokeDasharray="85 283" strokeDashoffset="-113" transform="rotate(-90 55 55)"/>
                        {/* 20% - пастельный синий */}
                        <circle cx="55" cy="55" r="45" fill="none" stroke="#8FA8C9" strokeWidth="16" strokeDasharray="57 283" strokeDashoffset="-198" transform="rotate(-90 55 55)"/>
                        {/* 10% - пастельный жёлтый */}
                        <circle cx="55" cy="55" r="45" fill="none" stroke="#E8D5A3" strokeWidth="16" strokeDasharray="28 283" strokeDashoffset="-255" transform="rotate(-90 55 55)"/>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(var(--db-text-rgb),0.45)" }}>Всего</span>
                        <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "22px", color: "var(--db-acc-3)" }}>128</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 flex-1">
                      {[
                        ["Холодные звонки","40%","#A88B5C"],
                        ["Рекомендации","30%","#A8C5D6"],
                        ["Партнёры","20%","#8FA8C9"],
                        ["Другое","10%","#E8D5A3"],
                      ].map(([l,v,c]) => (
                        <div key={String(l)} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: String(c) }}/>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(var(--db-text-rgb),0.7)", flex: 1, fontWeight: 500 }}>{l}</span>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--db-acc-3)", fontWeight: 600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
                      { c: "ООО ТехноПласт", d: "32:14", r: "Успешно", k: "85%", color: "#22a868" },
                      { c: "Иван Петров", d: "18:42", r: "Перезвонить", k: "40%", color: "#b8860b" },
                      { c: "АО МаркетПлейс", d: "45:30", r: "Успешно", k: "90%", color: "#22a868" },
                      { c: "Сергей Иванов", d: "22:11", r: "Не удалось", k: "20%", color: "#ef4444" },
                      { c: "ООО СтройИнвест", d: "31:05", r: "Успешно", k: "70%", color: "#22a868" },
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
                    width: "36%",
                    bottom: "80px",
                    right: "1%",
                    background: "var(--db-bg-1)",
                    border: "1px solid rgba(var(--db-bg-rgb-1),0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(var(--db-bg-rgb-1),0.1)",
                    zIndex: 25,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "var(--db-acc-3)", fontWeight: 500 }}>Топ менеджеров</span>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded" style={{ background: "rgba(var(--db-acc-rgb-2),0.1)", border: "1px solid rgba(var(--db-acc-rgb-2),0.2)" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "var(--db-acc-3)" }}>По выручке</span>
                      <Icon name="ChevronDown" size={10} style={{ color: "var(--db-acc-2)" }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Иван Петров", rev: "₽2.8M", ch: "+24.5%", a: "И" },
                      { name: "Мария Смирнова", rev: "₽2.3M", ch: "+18.7%", a: "М" },
                      { name: "Алексей Кузнецов", rev: "₽1.9M", ch: "+15.2%", a: "А" },
                      { name: "Анна Васильева", rev: "₽1.6M", ch: "+11.3%", a: "А" },
                      { name: "Дмитрий Новиков", rev: "₽1.2M", ch: "+8.6%", a: "Д" },
                    ].map((m) => (
                      <div key={m.name} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(var(--db-acc-rgb-2),0.2)", color: "var(--db-acc-2)", fontWeight: 600, fontSize: "11px", fontFamily: "Inter, sans-serif" }}>{m.a}</div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(var(--db-text-rgb),0.7)", flex: 1 }}>{m.name}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "var(--db-acc-3)", fontWeight: 500 }}>{m.rev}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#22a868", minWidth: "44px", textAlign: "right" }}>↑ {m.ch}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </Section>
          </div>
        </section>

        {/* ═══ PAIN CARDS ═══ */}
        <PainSection />

        {/* ═══ SPLINE FEATURE ═══ */}
        <SplineFeatureSection />

        {/* ═══ CLIENT VALUE ═══ */}
        <ClientValueSection />

        {/* ═══ INTEGRATION ═══ */}
        <IntegrationSection />

        {/* ═══ PRICING ═══ */}
        <PricingSection />

        {/* ═══ FAQ ═══ */}
        <FaqSection />

        {/* ═══ FINAL CTA ═══ */}
        <FinalCtaSection />

        {/* ═══ METRICS STRIPE (временно перенесено вниз) ═══ */}
        <section
          className="relative pb-6 px-5 overflow-hidden"
          style={{ background: "#151513", paddingTop: "80px" }}
        >
          <div className="max-w-7xl mx-auto">
            <Section>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/87dcfc37-c9bd-422a-a0bb-5804f4e808dc.png", num: "100%", label: "Анализ звонков" },
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/3285fd53-25c6-48fe-b5b4-4aa781d40370.png", num: "100%", label: "Контроль менеджеров" },
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/d25ff61f-0e46-418e-8a09-b8c94641fd34.png", num: "до 50%", label: "Меньше потерянных лидов" },
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/4c2610f5-d480-47ae-a2ff-f27f9861136b.png", num: "в 10 раз", label: "Быстрее контроль качества" },
                  { img: "https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/695a3f1d-16a1-4ae4-abbd-e5c226363fde.png", num: "до 35%", label: "Рост конверсии отдела продаж" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="flex flex-col items-center text-center gap-2 px-2 py-5"
                    style={{ background: "#151513", border: "none" }}
                  >
                    <div className="flex items-center justify-center shrink-0">
                      <img src={item.img} alt={item.label} style={{ width: "180px", height: "180px", objectFit: "contain" }} />
                    </div>
                    <div className="w-full">
                      <div
                        className="leading-none mb-2"
                        style={{
                          fontFamily: '"Bodoni Moda", Georgia, serif',
                          fontWeight: 400,
                          fontSize: "34px",
                          color: "#FBF6EC",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {item.num}
                      </div>
                      <div style={{ ...labelStyle, fontSize: "13px", lineHeight: 1.35, letterSpacing: "0.06em", color: "rgba(212,176,116,0.95)", textTransform: "none" as const }}>
                        {item.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer
          className="py-10 px-5"
          style={{ borderTop: "1px solid rgba(212,176,116,0.1)", background: "#151513" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(212,176,116,0.1)",
                    border: "1px solid rgba(212,176,116,0.25)",
                  }}
                >
                  <Icon name="Waves" size={14} style={{ color: "#D4B074" }} />
                </div>
                <span
                  style={{
                    fontFamily: '"Bodoni Moda", Georgia, serif',
                    fontWeight: 400,
                    fontSize: "14px",
                    letterSpacing: "0.08em",
                    color: "#FBF6EC",
                  }}
                >
                  SALES<span style={{ color: "#D4B074" }}>FLOW</span>
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
                {["Услуги", "Кейсы", "Тарифы", "Контакты"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-[12px] transition-colors"
                    style={{ color: "rgba(251,246,236,0.7)", fontFamily: "Inter, sans-serif", fontWeight: 300 }}
                  >
                    {link}
                  </a>
                ))}
              </div>
              <p style={{ fontSize: "11px", color: "rgba(251,246,236,0.3)", fontFamily: "Inter, sans-serif" }}>
                © 2025 SalesFlow. Все права защищены.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* ═══ FLOATING CTA ═══ */}
      <motion.a
        href="#cta"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2"
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
      </motion.a>

    </div>
  );
}

export default HomePage;