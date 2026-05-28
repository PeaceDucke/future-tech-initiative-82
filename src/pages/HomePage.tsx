import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

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
  border: "1px solid rgba(212,176,116,0.18)",
};

const cardHover = "hover:border-[rgba(212,176,116,0.35)] transition-colors duration-300 cursor-default";

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
  // rotateY: от -88deg (ребром) до 0deg (лицом) — clamp 0..1
  const p = Math.min(1, Math.max(0, progress));
  const rotateY = (1 - p) * -72;
  const opacity = 0.15 + p * 0.85;

  const cardBase: React.CSSProperties = {
    background: "#0f0f0f",
    border: "1px solid rgba(196,158,84,0.55)",
    borderRadius: "16px",
    padding: large ? "28px 24px 24px" : "24px 20px 20px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    height: "100%",
    transformOrigin: "50% 50%",
    transform: `perspective(900px) rotateY(${rotateY}deg)`,
    opacity,
    transition: "none",
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
    boxShadow: "0 0 0 1px rgba(196,158,84,0.12), 0 0 18px rgba(196,158,84,0.18), 0 0 40px rgba(196,158,84,0.08), inset 0 1px 0 rgba(255,235,160,0.06)",
  };

  const iconSize = 52;

  return (
    <div style={cardBase}>
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
              border: "1px solid rgba(196,158,84,0.55)",
              boxShadow: "0 0 0 1px rgba(196,158,84,0.12), 0 0 18px rgba(196,158,84,0.18), 0 0 40px rgba(196,158,84,0.08), inset 0 1px 0 rgba(255,235,160,0.06)",
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

// ─── AI Pipeline Section ───────────────────────────────────────────────────────
function PipelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [svgPath, setSvgPath] = useState("");
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const recalc = () => {
    const container = containerRef.current;
    const cards = [card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current];
    if (!container || cards.some((c) => !c)) return;
    const cr = container.getBoundingClientRect();
    const toLocal = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return {
        left:   r.left   - cr.left,
        right:  r.right  - cr.left,
        top:    r.top    - cr.top,
        bottom: r.bottom - cr.top,
        midY:   r.top    - cr.top + r.height / 2,
        h:      r.height,
        w:      r.width,
      };
    };
    const [c1, c2, c3, c4] = cards.map((c) => toLocal(c as HTMLElement));
    const W = cr.width;
    const H = cr.height;

    // Якорные точки — у края карточки, не внутри
    // К1 (слева): нить стартует у правого края, на 65% высоты
    const a1 = { x: c1.right,  y: c1.top + c1.h * 0.65 };
    // К2 (справа): нить приходит к левому краю, на 35% высоты
    const a2 = { x: c2.left,   y: c2.top + c2.h * 0.35 };
    // К3 (слева): нить касается правого края, на 65% высоты
    const a3 = { x: c3.right,  y: c3.top + c3.h * 0.65 };
    // К4 (справа): нить приходит к левому краю, на 35% высоты
    const a4 = { x: c4.left,   y: c4.top + c4.h * 0.35 };

    // Пространство между карточками
    const gap12mid = (c1.bottom + c2.top) / 2;
    const gap23mid = (c2.bottom + c3.top) / 2;
    const gap34mid = (c3.bottom + c4.top) / 2;

    // Петли уходят в свободное пространство справа/слева от карточек
    // Правая петля: между К1 и К2 — уходит вправо за карточку К2
    const rFar = W * 0.92;   // далеко вправо
    const lFar = W * 0.08;   // далеко влево

    // Органичный continuous path — единая кривая без разрывов
    // Используем кубические Безье с ручками далеко от карточек
    const d = [
      // Старт у правого края К1
      `M ${a1.x} ${a1.y}`,

      // К1 → большая петля вправо → К2
      // Выходим горизонтально вправо, закручиваемся вниз, возвращаемся к К2 слева
      `C ${rFar} ${a1.y},`,
      `  ${rFar} ${gap12mid - c1.h * 0.1},`,
      `  ${rFar} ${gap12mid}`,

      `C ${rFar} ${gap12mid + c2.h * 0.15},`,
      `  ${a2.x + W * 0.18} ${a2.y + c2.h * 0.08},`,
      `  ${a2.x} ${a2.y}`,

      // К2 → петля влево → К3
      // От левого края К2 уходим влево, вниз через зазор, возвращаемся к К3
      `C ${lFar} ${a2.y},`,
      `  ${lFar} ${gap23mid - c2.h * 0.05},`,
      `  ${lFar} ${gap23mid}`,

      `C ${lFar} ${gap23mid + c3.h * 0.12},`,
      `  ${a3.x - W * 0.16} ${a3.y - c3.h * 0.06},`,
      `  ${a3.x} ${a3.y}`,

      // К3 → петля вправо → К4
      `C ${rFar} ${a3.y},`,
      `  ${rFar} ${gap34mid - c3.h * 0.08},`,
      `  ${rFar} ${gap34mid}`,

      `C ${rFar} ${gap34mid + c4.h * 0.1},`,
      `  ${a4.x + W * 0.2} ${a4.y + c4.h * 0.05},`,
      `  ${a4.x} ${a4.y}`,
    ].join(" ");

    setSvgPath(d);
    setDots([a1, a2, a3, a4]);
    setSvgSize({ w: W, h: H });
  };

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const wh = window.innerHeight;
      const raw = (wh * 1.1 - rect.top) / (wh * 0.9);
      setProgress(Math.min(1, Math.max(0, raw)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Небольшая задержка чтобы DOM успел отрисоваться
    const t1 = setTimeout(recalc, 100);
    const t2 = setTimeout(recalc, 500);
    window.addEventListener("resize", recalc);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", recalc);
    };
  }, []);

  const cp = (idx: number) => Math.min(1, Math.max(0, (progress - idx * 0.22) / 0.4));

  const cardStyle = (p: number): React.CSSProperties => ({
    background: "#111110",
    border: "1px solid rgba(212,176,116,0.22)",
    borderRadius: "24px",
    padding: "64px 32px",
    opacity: 0.08 + p * 0.92,
    transform: `translateY(${(1 - p) * 40}px)`,
    transition: "none",
    width: "52%",
    minHeight: 720,
    boxSizing: "border-box",
    position: "relative",
    zIndex: 1,        // карточки ПОВЕРХ нити
    isolation: "isolate",
  });

  const numBadge = (n: string) => (
    <div style={{ width: 38, height: 38, borderRadius: "50%", border: "2px solid #D4B074", display: "flex", alignItems: "center", justifyContent: "center", background: "#151513", flexShrink: 0, boxShadow: "0 0 14px rgba(212,176,116,0.25)" }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#D4B074", fontWeight: 700 }}>{n}</span>
    </div>
  );

  const sub = (s: string) => <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(251,246,236,0.48)", lineHeight: 1.6, marginBottom: 0 }}>{s}</p>;
  const h3s: React.CSSProperties = { fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "26px", color: "#FBF6EC", fontWeight: 400, lineHeight: 1.3, marginBottom: "8px" };
  const inner: React.CSSProperties = { background: "#0d0d0c", borderRadius: "14px", padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)" };
  const lbl: React.CSSProperties = { fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(251,246,236,0.38)", marginBottom: "12px" };

  return (
    <section style={{ background: "#151513", padding: "110px 20px 100px" }}>
      <style>{`
        @keyframes waveAnim { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
        @keyframes aiPulse { 0%,100%{ opacity:0.55; transform:scale(1);} 50%{ opacity:1; transform:scale(1.07);} }
        @keyframes threadDraw { from { stroke-dashoffset: 2400; } to { stroke-dashoffset: 0; } }
      `}</style>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div style={{ width: "32px", height: "1px", background: "#D4B074", opacity: 0.5 }} />
            <span style={labelStyle}>Как работает SalesFlow</span>
            <div style={{ width: "32px", height: "1px", background: "#D4B074", opacity: 0.5 }} />
          </div>
          <h2 style={{ ...h2Style, fontSize: "clamp(32px, 5vw, 60px)", lineHeight: 1.1, marginBottom: "20px" }}>
            AI видит то, что невозможно<br />контролировать вручную
          </h2>
          <p style={{ ...bodyText, fontSize: "16px", maxWidth: "460px", margin: "0 auto", lineHeight: 1.7 }}>
            Мы превращаем хаос звонков в понятные причины<br />и точки роста продаж.
          </p>
        </div>

        {/* Зигзаг */}
        <div ref={containerRef} style={{ position: "relative" }}>

          {/* SVG золотая нить — ЗА карточками (zIndex 0) */}
          {svgPath && (
            <svg
              style={{ position: "absolute", top: 0, left: 0, width: svgSize.w, height: svgSize.h, pointerEvents: "none", zIndex: 0, overflow: "visible" }}
            >
              <defs>
                {/* Широкий bloom */}
                <filter id="bloom" x="-120%" y="-120%" width="340%" height="340%">
                  <feGaussianBlur stdDeviation="18" result="b1" />
                  <feMerge><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Средний glow */}
                <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="5" result="b2" />
                  <feMerge><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Тонкий sharp glow */}
                <filter id="sharp" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.5" result="b3" />
                  <feMerge><feMergeNode in="b3" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Слой 1 — широкий bloom, почти невидимый */}
              <path d={svgPath} fill="none" stroke="#c8a050" strokeWidth="20" strokeLinecap="round" filter="url(#bloom)" opacity="0.07" />
              {/* Слой 2 — мягкое свечение */}
              <path d={svgPath} fill="none" stroke="#D4B074" strokeWidth="8" strokeLinecap="round" filter="url(#glow)" opacity="0.18" />
              {/* Слой 3 — medium glow */}
              <path d={svgPath} fill="none" stroke="#e0be78" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" opacity="0.35" />
              {/* Слой 4 — основная нить */}
              <path d={svgPath} fill="none" stroke="#f0d080" strokeWidth="1.4" strokeLinecap="round" filter="url(#sharp)" opacity="0.92" />

              {/* Якорные точки-частицы у карточек */}
              {dots.map((pt, i) => (
                <g key={i}>
                  {/* bloom вокруг точки */}
                  <circle cx={pt.x} cy={pt.y} r="22" fill="#D4B074" filter="url(#bloom)" opacity="0.12" />
                  <circle cx={pt.x} cy={pt.y} r="10" fill="none" stroke="#D4B074" strokeWidth="1" opacity="0.3" filter="url(#glow)" />
                  <circle cx={pt.x} cy={pt.y} r="5"  fill="#D4B074" opacity="0.9" filter="url(#sharp)" />
                  <circle cx={pt.x} cy={pt.y} r="2"  fill="#fffbe8" opacity="1" />
                </g>
              ))}

              {/* Subtle particles вдоль кривой — статичные spark-точки */}
              {dots.map((pt, i) => [
                { dx: 18, dy: -12, r: 1.2, o: 0.5 },
                { dx: -14, dy: 20, r: 0.8, o: 0.35 },
                { dx: 30, dy: 8,   r: 1.0, o: 0.4 },
              ].map((p, j) => (
                <circle key={`spark-${i}-${j}`} cx={pt.x + p.dx} cy={pt.y + p.dy} r={p.r} fill="#e8c870" opacity={p.o} filter="url(#sharp)" />
              )))}
            </svg>
          )}

          {/* ─── Блок 1 — большое фото слева ─── */}
          <div style={{ position: "relative", zIndex: 1, paddingBottom: "100px", display: "flex", justifyContent: "flex-start", opacity: 0.08 + cp(0) * 0.92, transform: `translateY(${(1 - cp(0)) * 40}px)` }}>
            <div ref={card1Ref} style={{ width: "95%", marginLeft: "-60px" }}>
              <img
                src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/0b4f35e6-d587-4318-9fee-9e731d9127cc.png"
                alt="Подключаем записи звонков"
                style={{ width: "100%", display: "block", borderRadius: "0" }}
              />
            </div>
          </div>

          {/* ─── Карточка 2 — справа ─── */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "flex-end", paddingBottom: "100px" }}>
            <div ref={card2Ref} style={cardStyle(cp(1))}>
              <div className="flex items-center gap-3 mb-4">
                <h3 style={h3s}>AI анализирует разговоры</h3>
                {numBadge("2")}
              </div>
              {sub("Распознаём речь, выделяем ключевые моменты и эмоции.")}
              <div style={{ marginTop: 18, ...inner }}>
                <p style={lbl}>Анализ разговора</p>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {["слишком дорого", "нужно подумать", "скиньте КП", "не уверен", "перезвоните позже", "..."].map((t) => (
                        <span key={t} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(212,176,116,0.8)", background: "rgba(212,176,116,0.07)", border: "1px solid rgba(212,176,116,0.16)", borderRadius: "20px", padding: "4px 10px" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", border: "2px solid rgba(212,176,116,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 24px rgba(212,176,116,0.2)", animation: "aiPulse 2.8s ease-in-out infinite" }}>
                    <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(212,176,116,0.06)", border: "1px solid rgba(212,176,116,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "14px", color: "#D4B074", lineHeight: 1 }}>AI</span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "8px", color: "rgba(212,176,116,0.55)", letterSpacing: "0.08em", marginTop: 2 }}>Анализ...</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, ...inner }}>
                <p style={lbl}>Эмоции клиента</p>
                <div className="flex items-center gap-3">
                  {["😟", "😟", "😕", "😐"].map((e, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 20, filter: "grayscale(0.3) sepia(0.5)" }}>{e}</span>
                      {i < 3 && <div style={{ width: 28, height: 1, background: "rgba(212,176,116,0.3)" }} />}
                    </div>
                  ))}
                  <div style={{ flex: 1, height: 1, background: "rgba(212,176,116,0.18)", position: "relative" }}>
                    <div style={{ position: "absolute", right: 0, top: -3, width: 6, height: 6, borderRadius: "50%", background: "#D4B074", opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Карточка 3 — слева ─── */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "flex-start", paddingBottom: "100px" }}>
            <div ref={card3Ref} style={cardStyle(cp(2))}>
              <div className="flex items-center gap-3 mb-4">{numBadge("3")}<h3 style={h3s}>Система выявляет причины потери клиентов</h3></div>
              {sub("Находим ошибки, нарушения скриптов и слабые места менеджеров.")}
              <div style={{ marginTop: 18, ...inner }}>
                <p style={lbl}>Выявленные проблемы</p>
                {[
                  { icon: "AlertTriangle", label: "Обсуждение цены в первые 2 минуты", sev: "Высокий риск", sc: "#ef4444" },
                  { icon: "VolumeX", label: "Менеджер перебивает клиента", sev: "Средний риск", sc: "#f59e0b" },
                  { icon: "FileX", label: "Скрипт не соблюдается (3 момента)", sev: "Средний риск", sc: "#f59e0b" },
                  { icon: "Target", label: "Слабая фиксация потребностей", sev: "Средний риск", sc: "#f59e0b" },
                  { icon: "Clock", label: "Нет следующего шага в конце звонка", sev: "Низкий риск", sc: "#22c55e" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 mb-3">
                    <div style={{ width: 28, height: 28, borderRadius: "8px", background: `${item.sc}18`, border: `1px solid ${item.sc}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={item.icon} size={13} style={{ color: item.sc }} />
                    </div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(251,246,236,0.7)", flex: 1 }}>{item.label}</span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: item.sc, fontWeight: 600, whiteSpace: "nowrap" }}>{item.sev}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Карточка 4 — справа ─── */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "flex-end", paddingBottom: "20px" }}>
            <div ref={card4Ref} style={cardStyle(cp(3))}>
              <div className="flex items-center gap-3 mb-4">
                <h3 style={h3s}>Вы получаете готовый отчёт и точки роста продаж</h3>
                {numBadge("4")}
              </div>
              {sub("Понятные рекомендации, прогноз и зоны роста выручки.")}
              <div style={{ marginTop: 18, ...inner, marginBottom: 10 }}>
                <p style={lbl}>Потенциал роста конверсии</p>
                <div className="flex items-end justify-between">
                  <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "42px", color: "#D4B074", fontWeight: 400, lineHeight: 1 }}>+18%</span>
                  <Sparkline />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: "Потенциальная выручка", val: "до 840 000 ₽ / мес" },
                  { label: "Проанализировано звонков", val: "1 152" },
                ].map((s) => (
                  <div key={s.label} style={{ ...inner }}>
                    <p style={{ ...lbl, marginBottom: 4 }}>{s.label}</p>
                    <p style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "15px", color: "#D4B074" }}>{s.val}</p>
                  </div>
                ))}
              </div>
              <div style={{ ...inner, borderColor: "rgba(212,176,116,0.18)", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ ...lbl, marginBottom: 4 }}>Рекомендация AI</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(251,246,236,0.65)", lineHeight: 1.55 }}>Сократить обсуждение цены в первые 3 минуты разговора и усилить выявление потребностей.</p>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(212,176,116,0.1)", border: "1px solid rgba(212,176,116,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "center" }}>
                  <Icon name="ArrowRight" size={14} style={{ color: "#D4B074" }} />
                </div>
              </div>
            </div>
          </div>

        </div>
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

  // Hover на карточке "Анализ разговора" — печатающаяся подсказка
  const [analysisHover, setAnalysisHover] = useState(false);
  const [analysisTyped, setAnalysisTyped] = useState("");
  const analysisFullText = `AI находит моменты,
в которых менеджер теряет клиента.

Например:
— слишком раннее обсуждение цены
— отсутствие фиксации потребности
— слабая обработка возражений

Это помогает повысить конверсию
без увеличения рекламного бюджета.`;

  useEffect(() => {
    if (!analysisHover) {
      setAnalysisTyped("");
      return;
    }
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startDelay = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setAnalysisTyped(analysisFullText.slice(0, i));
        if (i >= analysisFullText.length && intervalId) clearInterval(intervalId);
      }, 28);
    }, 1000);
    return () => {
      clearTimeout(startDelay);
      if (intervalId) clearInterval(intervalId);
    };
  }, [analysisHover]);

  // Hover на карточке "Топ менеджеров" — печатающаяся подсказка
  const [topMgrHover, setTopMgrHover] = useState(false);
  const [topMgrTyped, setTopMgrTyped] = useState("");
  const topMgrFullText = `AI выявляет поведенческие паттерны
менеджеров с максимальной конверсией.

Система анализирует:
— структуру диалога
— скорость реакции
— эмоциональный тон
— успешные формулировки

Это позволяет масштабировать
лучшие практики на весь отдел продаж.`;

  useEffect(() => {
    if (!topMgrHover) {
      setTopMgrTyped("");
      return;
    }
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startDelay = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setTopMgrTyped(topMgrFullText.slice(0, i));
        if (i >= topMgrFullText.length && intervalId) clearInterval(intervalId);
      }, 28);
    }, 1000);
    return () => {
      clearTimeout(startDelay);
      if (intervalId) clearInterval(intervalId);
    };
  }, [topMgrHover]);

  // Hover на карточке "Последние звонки" — печатающаяся подсказка
  const [callsHover, setCallsHover] = useState(false);
  const [callsTyped, setCallsTyped] = useState("");
  const callsFullText = `Система автоматически выявляет
проблемные разговоры,
требующие внимания руководителя.

AI определяет:
— потерянные сделки
— конфликтные диалоги
— нарушения скрипта
— слабую обработку возражений

Без необходимости вручную
прослушивать звонки.`;

  useEffect(() => {
    if (!callsHover) {
      setCallsTyped("");
      return;
    }
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startDelay = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setCallsTyped(callsFullText.slice(0, i));
        if (i >= callsFullText.length && intervalId) clearInterval(intervalId);
      }, 28);
    }, 1000);
    return () => {
      clearTimeout(startDelay);
      if (intervalId) clearInterval(intervalId);
    };
  }, [callsHover]);

  // Hover на карточке "AI-Инсайты" — печатающаяся подсказка
  const [insightsHover, setInsightsHover] = useState(false);
  const [insightsTyped, setInsightsTyped] = useState("");
  const insightsFullText = `AI автоматически находит
скрытые точки потери прибыли.

Например:
— клиенты уходят после обсуждения цены
— менеджеры перебивают клиента
— лиды из Instagram закрываются хуже
— сделки теряются после второго звонка

Система превращает хаотичные данные
в конкретные рекомендации для роста.`;

  useEffect(() => {
    if (!insightsHover) {
      setInsightsTyped("");
      return;
    }
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startDelay = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setInsightsTyped(insightsFullText.slice(0, i));
        if (i >= insightsFullText.length && intervalId) clearInterval(intervalId);
      }, 28);
    }, 1000);
    return () => {
      clearTimeout(startDelay);
      if (intervalId) clearInterval(intervalId);
    };
  }, [insightsHover]);

  // Hover на карточке "Источники сделок" — печатающаяся подсказка
  const [sourcesHover, setSourcesHover] = useState(false);
  const [sourcesTyped, setSourcesTyped] = useState("");
  const sourcesFullText = `AI показывает,
какие каналы действительно приносят прибыль,
а какие только создают видимость активности.

Это помогает сократить
неэффективные рекламные расходы
и перераспределить бюджет туда,
где бизнес реально зарабатывает.`;

  useEffect(() => {
    if (!sourcesHover) {
      setSourcesTyped("");
      return;
    }
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startDelay = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setSourcesTyped(sourcesFullText.slice(0, i));
        if (i >= sourcesFullText.length && intervalId) clearInterval(intervalId);
      }, 28);
    }, 1000);
    return () => {
      clearTimeout(startDelay);
      if (intervalId) clearInterval(intervalId);
    };
  }, [sourcesHover]);

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
          <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
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

            <nav className="hidden lg:flex items-center gap-1">
              {["Продукт", "Решения", "Возможности", "Тарифы", "О нас"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="px-4 py-2 text-[13px] rounded-lg transition-all duration-200"
                    style={{ color: "rgba(251,246,236,0.78)", fontFamily: "Inter, sans-serif", fontWeight: 300 }}
                  >
                    {item}
                  </a>
                ),
              )}
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="#cta"
                className="hidden sm:inline-flex items-center gap-2"
                style={{
                  background: "#D4B074",
                  color: "#151513",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  fontSize: "13px",
                  padding: "9px 20px",
                  borderRadius: "2px",
                }}
              >
                Запросить демо
                <Icon name="ArrowRight" size={13} />
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
            {["Продукт", "Решения", "Возможности", "Тарифы", "О нас"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-[14px] transition-colors"
                  style={{ color: "rgba(251,246,236,0.7)", fontFamily: "Inter, sans-serif", fontWeight: 300 }}
                >
                  {item}
                </a>
              ),
            )}
            <a
              href="#cta"
              onClick={() => setMenuOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 text-[13px]"
              style={{
                background: "#D4B074",
                color: "#151513",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                letterSpacing: "0.08em",
                borderRadius: "2px",
              }}
            >
              Запросить демо
            </a>
          </motion.div>
        )}
      </header>

      <main className="relative z-10 pt-16">
        {/* ═══ HERO ═══ */}
        <section className="relative min-h-screen flex flex-col items-center justify-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://cdn.poehali.dev/files/c81f350b-bf64-401f-9a16-2fe9c24c0074.png"
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

          <div className="relative z-10 w-full max-w-7xl mx-auto px-5 pb-20 pt-32">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-2xl"
            >
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
                <div style={{ width: "40px", height: "1px", background: "#D4B074", opacity: 0.5 }} />
                <span style={labelStyle}>Речевая аналитика и CRM-интеграции</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl lg:text-6xl xl:text-7xl mb-6 leading-none"
                style={{
                  fontFamily: '"Bodoni Moda", Georgia, serif',
                  fontWeight: 400,
                  color: "#FBF6EC",
                  letterSpacing: "-0.01em",
                }}
              >
                Ваши продажи
                <br />
                <span style={{ color: "#D4B074" }}>под контролем</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-[16px] mb-9 max-w-lg"
                style={{ color: "rgba(251,246,236,0.6)", fontFamily: "Inter, sans-serif", fontWeight: 300, lineHeight: 1.75 }}
              >
                SalesFlow анализирует каждый звонок, находит точки роста и
                помогает вашей команде продавать больше каждый день.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <a
                  href="#cta"
                  className="inline-flex items-center gap-2"
                  style={{
                    background: "#D4B074",
                    color: "#151513",
                    borderRadius: "2px",
                    letterSpacing: "0.08em",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "13px",
                    padding: "12px 28px",
                  }}
                >
                  Запросить демо
                  <Icon name="ArrowRight" size={14} />
                </a>
              </motion.div>
              <motion.p variants={fadeUp} className="mt-6" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.06em", color: "rgba(251,246,236,0.3)", fontWeight: 400 }}>
                нам доверяют лидеры рынка&nbsp;&nbsp;·&nbsp;&nbsp;amoCRM&nbsp;&nbsp;·&nbsp;&nbsp;Битрикс&nbsp;&nbsp;·&nbsp;&nbsp;Retell&nbsp;&nbsp;·&nbsp;&nbsp;Ringostat&nbsp;&nbsp;·&nbsp;&nbsp;Aircall&nbsp;&nbsp;·&nbsp;&nbsp;и многие другие
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ═══ METRICS STRIPE ═══ */}
        <section
          className="relative pb-6 px-5 overflow-hidden"
          style={{ background: "#151513" }}
        >
          <div className="max-w-7xl mx-auto">
            <Section>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { icon: "TrendingUp", num: "+30%", label: "Рост конверсии в среднем" },
                  { icon: "DollarSign", num: "+25%", label: "Увеличение выручки у клиентов" },
                  { icon: "TrendingDown", num: "-40%", label: "Сокращение потерь сделок" },
                  { icon: "Phone", num: "100%", label: "Звонков под контролем 24/7" },
                  { icon: "Zap", num: "3–5x", label: "Быстрая окупаемость в среднем" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="flex items-start gap-4 p-5"
                    style={{ background: "#151513", border: "none" }}
                  >
                    <div
                      className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
                      style={iconBox}
                    >
                      <Icon name={item.icon} size={18} style={{ color: "#D4B074" }} />
                    </div>
                    <div>
                      <div
                        className="leading-none mb-2"
                        style={{
                          fontFamily: '"Bodoni Moda", Georgia, serif',
                          fontWeight: 400,
                          fontSize: "36px",
                          color: "#FBF6EC",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {item.num}
                      </div>
                      <div style={{ ...labelStyle, fontSize: "11px", letterSpacing: "0.1em", color: "rgba(212,176,116,0.6)", textTransform: "none" as const }}>
                        {item.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

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
                          style={{ background: "var(--db-bg-2)", border: "1px solid rgba(var(--db-acc-rgb-1),0.18)", cursor: "default", transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)", transform: callsHover ? "translateY(-4px)" : "translateY(0)" }}
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

                {/* ── Hitbox для "Последние звонки" (ловит hover поверх всех слоёв) ── */}
                <div
                  onMouseEnter={() => setCallsHover(true)}
                  onMouseLeave={() => setCallsHover(false)}
                  className="absolute"
                  style={{
                    top: "595px",
                    left: "228px",
                    width: "calc((100% - 256px) / 2 - 8px)",
                    height: "175px",
                    zIndex: 200,
                    cursor: "default",
                    background: "transparent",
                  }}
                />

                {/* ── CARD: AI-Инсайты (справа сверху) ── */}
                <div
                  className="absolute rounded-2xl p-6 db-card"
                  onMouseEnter={() => setInsightsHover(true)}
                  onMouseLeave={() => setInsightsHover(false)}
                  style={{
                    width: "38%",
                    top: "320px",
                    right: "-3%",
                    background: "linear-gradient(135deg, var(--db-bg-3) 0%, var(--db-bg-4) 100%)",
                    border: "1px solid rgba(212,176,116,0.55)",
                    boxShadow:
                      "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,176,116,0.3), 0 0 36px rgba(212,176,116,0.22)",
                    transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                    transform: insightsHover ? "translateY(-6px)" : "translateY(0)",
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
                  onMouseEnter={() => setAnalysisHover(true)}
                  onMouseLeave={() => setAnalysisHover(false)}
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
                          animation: analysisHover ? `wf-pulse 1.1s ease-in-out ${i * 40}ms infinite` : "none",
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
                  onMouseEnter={() => setSourcesHover(true)}
                  onMouseLeave={() => setSourcesHover(false)}
                  style={{
                    width: "32%",
                    top: "465px",
                    left: "33%",
                    background: "var(--db-bg-1)",
                    border: "1px solid rgba(var(--db-bg-rgb-1),0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(var(--db-bg-rgb-1),0.1)",
                    transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                    transform: sourcesHover ? "translateY(-6px)" : "translateY(0)",
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
                  onMouseEnter={() => setTopMgrHover(true)}
                  onMouseLeave={() => setTopMgrHover(false)}
                  style={{
                    width: "36%",
                    bottom: "80px",
                    right: "1%",
                    background: "var(--db-bg-1)",
                    border: "1px solid rgba(var(--db-bg-rgb-1),0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(var(--db-bg-rgb-1),0.1)",
                    transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                    transform: topMgrHover ? "translateY(-6px)" : "translateY(0)",
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

        {/* ═══ AI PIPELINE ═══ */}
        <PipelineSection />

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
          background: "#D4B074",
          color: "#151513",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          letterSpacing: "0.08em",
          fontSize: "13px",
          padding: "11px 22px",
          borderRadius: "2px",
        }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon name="MessageCircle" size={15} />
        Запросить демо
      </motion.a>

      {/* ═══ FULLSCREEN HOVER OVERLAY (для всех 5 dashboard карточек) ═══ */}
      {(() => {
        const anyHover = analysisHover || sourcesHover || insightsHover || callsHover || topMgrHover;
        const activeText = analysisHover
          ? analysisFullText
          : sourcesHover
          ? sourcesFullText
          : insightsHover
          ? insightsFullText
          : callsHover
          ? callsFullText
          : topMgrHover
          ? topMgrFullText
          : "";
        const activeTyped = analysisHover
          ? analysisTyped
          : sourcesHover
          ? sourcesTyped
          : insightsHover
          ? insightsTyped
          : callsHover
          ? callsTyped
          : topMgrHover
          ? topMgrTyped
          : "";
        return (
          <>
            <div
              className="fixed inset-0 pointer-events-none"
              style={{
                background: "rgba(8,6,3,0.78)",
                opacity: anyHover ? 1 : 0,
                transition: anyHover ? "opacity 0.6s ease 0.8s" : "opacity 0.3s ease",
                zIndex: 9000,
              }}
            />
            <div
              className="fixed inset-0 pointer-events-none flex items-center justify-center px-6"
              style={{
                opacity: anyHover ? 1 : 0,
                transform: anyHover ? "translateY(0)" : "translateY(8px)",
                transition: anyHover
                  ? "opacity 0.5s ease 1s, transform 0.6s ease 1s"
                  : "opacity 0.2s ease, transform 0.2s ease",
                zIndex: 9100,
              }}
            >
              <div
                style={{
                  position: "relative",
                  fontFamily: '"Bodoni Moda", Georgia, serif',
                  fontSize: "clamp(20px, 3vw, 34px)",
                  lineHeight: 1.5,
                  letterSpacing: "0.01em",
                  maxWidth: "820px",
                  width: "100%",
                  textShadow: "0 4px 24px rgba(0,0,0,0.7)",
                  textAlign: "left",
                  color: "#FBF6EC",
                }}
              >
                <span aria-hidden style={{ visibility: "hidden", whiteSpace: "pre-wrap", display: "block" }}>
                  {activeText}
                </span>
                <span style={{ position: "absolute", inset: 0, whiteSpace: "pre-wrap", color: "#FBF6EC" }}>
                  {activeTyped}
                  {anyHover && activeTyped.length < activeText.length && (
                    <span
                      style={{
                        display: "inline-block",
                        width: "0.5ch",
                        color: "#D4B074",
                        animation: "tw-caret 0.9s steps(1) infinite",
                      }}
                    >
                      ▍
                    </span>
                  )}
                </span>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

export default HomePage;