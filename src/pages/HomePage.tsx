import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
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

const labelStyle = {
  color: "#D4B074",
  fontSize: "10px" as const,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  fontFamily: "Inter, sans-serif",
};

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          className="relative pb-16 px-5 overflow-hidden"
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
                    className="flex items-start gap-3 p-5"
                    style={card}
                  >
                    <div
                      className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
                      style={iconBox}
                    >
                      <Icon name={item.icon} size={18} style={{ color: "#D4B074" }} />
                    </div>
                    <div>
                      <div
                        className="leading-none mb-1"
                        style={{
                          fontFamily: '"Bodoni Moda", Georgia, serif',
                          fontWeight: 400,
                          fontSize: "28px",
                          color: "#FBF6EC",
                          letterSpacing: "-0.01em",
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
        <section className="py-20 px-5 overflow-hidden" style={{ background: "#151513" }}>
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-16">
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

              {/* Dashboard Scene */}
              <motion.div
                variants={fadeUp}
                className="relative mx-auto"
                style={{ maxWidth: "1320px", height: "920px" }}
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
                  className="absolute rounded-2xl overflow-hidden"
                  style={{
                    width: "100%",
                    height: "820px",
                    top: "0px",
                    left: "0px",
                    background: "#FBF6EC",
                    border: "1px solid rgba(212,176,116,0.25)",
                    boxShadow: "0 60px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,246,236,0.08)",
                    zIndex: 1,
                  }}
                >
                  {/* Topbar */}
                  <div className="flex items-center justify-between px-7 py-4 border-b" style={{ background: "#F1E9DE", borderColor: "rgba(139,111,71,0.25)" }}>
                    <div className="flex items-center gap-3">
                      <Icon name="Waves" size={18} style={{ color: "#6B5232" }} />
                      <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "18px", color: "#0F0D0A", letterSpacing: "0.08em", fontWeight: 600 }}>SALES<span style={{ color: "#6B5232" }}>FLOW</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded" style={{ background: "rgba(107,82,50,0.12)", border: "1px solid rgba(107,82,50,0.25)" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0F0D0A", fontWeight: 500 }}>1–30 Апреля, 2024</span>
                        <Icon name="ChevronDown" size={12} style={{ color: "#6B5232" }} />
                      </div>
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded" style={{ background: "rgba(107,82,50,0.12)", border: "1px solid rgba(107,82,50,0.25)" }}>
                        <Icon name="Download" size={12} style={{ color: "#6B5232" }} />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0F0D0A", fontWeight: 500 }}>Экспорт</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex" style={{ height: "calc(100% - 61px)" }}>
                    {/* Sidebar */}
                    <div className="shrink-0 border-r py-6 px-4" style={{ width: "200px", background: "#F1E9DE", borderColor: "rgba(107,82,50,0.18)" }}>
                      {[
                        { icon: "LayoutDashboard", label: "Обзор", active: true },
                        { icon: "Phone", label: "Звонки" },
                        { icon: "Users", label: "Клиенты" },
                        { icon: "BarChart2", label: "Аналитика" },
                        { icon: "Sparkles", label: "AI-Инсайты" },
                        { icon: "FileText", label: "Отчёты" },
                        { icon: "Settings", label: "Настройки" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg mb-1.5" style={{ background: item.active ? "rgba(107,82,50,0.18)" : "transparent" }}>
                          <Icon name={item.icon} size={16} style={{ color: item.active ? "#6B5232" : "rgba(15,13,10,0.55)" }} />
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: item.active ? "#0F0D0A" : "rgba(15,13,10,0.6)", fontWeight: item.active ? 600 : 500 }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-7 overflow-hidden">
                      <div className="mb-6" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "32px", color: "#0F0D0A", fontWeight: 600 }}>Обзор</div>
                      {/* KPIs */}
                      <div className="grid grid-cols-4 gap-4 mb-5">
                        {[
                          { label: "Выручка", value: "₽12.4M", change: "+18.7%" },
                          { label: "Конверсия в сделки", value: "24.6%", change: "+12.4%" },
                          { label: "Средний чек", value: "₽18,540", change: "+6.2%" },
                          { label: "Новые лиды", value: "1,243", change: "+14.3%" },
                        ].map((k) => (
                          <div key={k.label} className="rounded-xl p-4" style={{ background: "#F1E9DE", border: "1px solid rgba(107,82,50,0.18)" }}>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(15,13,10,0.65)", marginBottom: "8px", fontWeight: 500 }}>{k.label}</div>
                            <div style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "28px", color: "#0F0D0A", marginBottom: "6px", fontWeight: 600 }}>{k.value}</div>
                            <div className="flex items-center justify-between">
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#1a8a52", fontWeight: 600 }}>↑ {k.change} за период</span>
                              <svg width="48" height="18" viewBox="0 0 60 18"><polyline points="0,15 12,12 24,13 36,7 48,9 60,2" fill="none" stroke="#6B5232" strokeWidth="1.8" opacity="0.8" strokeLinecap="round" /></svg>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Revenue chart */}
                      <div className="rounded-xl p-5 mb-5" style={{ background: "#F1E9DE", border: "1px solid rgba(107,82,50,0.18)" }}>
                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#0F0D0A", marginBottom: "14px", fontWeight: 600 }}>Динамика выручки</div>
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col justify-between" style={{ height: "140px" }}>
                            {["15M", "10M", "5M"].map(l => <span key={l} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(15,13,10,0.5)", fontWeight: 500 }}>{l}</span>)}
                          </div>
                          <div className="flex-1">
                            <svg width="100%" height="140" viewBox="0 0 400 100" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#6B5232" stopOpacity="0.35"/>
                                  <stop offset="100%" stopColor="#6B5232" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                              {/* Сетка */}
                              <line x1="0" y1="25" x2="400" y2="25" stroke="rgba(107,82,50,0.08)" strokeWidth="1" strokeDasharray="3 3"/>
                              <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(107,82,50,0.08)" strokeWidth="1" strokeDasharray="3 3"/>
                              <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(107,82,50,0.08)" strokeWidth="1" strokeDasharray="3 3"/>
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
                                    <polyline points={pointsStr} fill="none" stroke="#6B5232" strokeWidth="0.8" strokeLinecap="square" strokeLinejoin="miter"/>
                                  </>
                                );
                              })()}
                            </svg>
                            <div className="flex justify-between mt-2">
                              {["1 Апр","7 Апр","14 Апр","21 Апр","30 Апр"].map(d => <span key={d} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(15,13,10,0.55)", fontWeight: 500 }}>{d}</span>)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Bottom row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl p-4" style={{ background: "#F1E9DE", border: "1px solid rgba(107,82,50,0.18)" }}>
                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#0F0D0A", marginBottom: "14px", fontWeight: 600 }}>Последние звонки</div>
                          <div className="space-y-2.5">
                            {[
                              { c: "ООО ТехноПласт", d: "32:14", r: "Успешно" },
                              { c: "Иван Петров", d: "18:42", r: "Перезвонить" },
                              { c: "АО МаркетПлейс", d: "45:30", r: "Успешно" },
                              { c: "Сергей Иванов", d: "22:11", r: "Не удалось" },
                            ].map((c) => (
                              <div key={c.c} className="flex items-center gap-2">
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0F0D0A", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{c.c}</span>
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(15,13,10,0.6)", fontWeight: 500 }}>{c.d}</span>
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: c.r === "Успешно" ? "#1a8a52" : c.r === "Не удалось" ? "#c92a2a" : "#6B5232", fontWeight: 600 }}>{c.r}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: "#F1E9DE", border: "1px solid rgba(107,82,50,0.18)" }}>
                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#0F0D0A", marginBottom: "14px", fontWeight: 600 }}>Конверсия по этапам</div>
                          <div className="space-y-3">
                            {[["Лид","100%",1],["Квалификация","78%",0.78],["Презентация","52%",0.52],["Сделка","24%",0.24]].map(([l,v,p]) => (
                              <div key={String(l)}>
                                <div className="flex justify-between mb-1">
                                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0F0D0A", fontWeight: 500 }}>{l}</span>
                                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0F0D0A", fontWeight: 700 }}>{v}</span>
                                </div>
                                <div className="rounded-full overflow-hidden" style={{ height: "6px", background: "rgba(107,82,50,0.15)" }}>
                                  <div style={{ height: "100%", width: `${Number(p)*100}%`, background: "#6B5232" }} />
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
                  className="absolute rounded-2xl p-5"
                  style={{
                    width: "38%",
                    top: "320px",
                    right: "-3%",
                    background: "#FBF6EC",
                    border: "1px solid rgba(251,246,236,0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(251,246,236,0.1)",
                    zIndex: 21,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon name="Sparkles" size={16} style={{ color: "#8B6F47" }} />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#1A1814", fontWeight: 500 }}>AI-Инсайты</span>
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(26,24,20,0.5)", marginBottom: "18px" }}>Рекомендации для менеджера</div>
                  <div className="flex items-center gap-5">
                    <div className="flex-1">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(26,24,20,0.7)", lineHeight: 1.55, marginBottom: "14px" }}>
                        Клиенты чаще всего возражают на этапе обсуждения цены.
                      </p>
                      <button style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#8B6F47", padding: "7px 14px", border: "1px solid rgba(139,111,71,0.3)", borderRadius: "8px", background: "transparent" }}>
                        Подробнее →
                      </button>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <svg width="100" height="100" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(139,111,71,0.15)" strokeWidth="8"/>
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#8B6F47" strokeWidth="8" strokeDasharray="203 251" strokeDashoffset="63" strokeLinecap="round" transform="rotate(-90 50 50)"/>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "24px", color: "#1A1814" }}>81%</div>
                      </div>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(26,24,20,0.45)", textAlign: "center", marginTop: "6px", maxWidth: "100px", lineHeight: 1.3 }}>Вероятность успешной сделки</span>
                    </div>
                  </div>
                </div>

                {/* ── CARD: Анализ разговора (слева) ── */}
                <div
                  className="absolute rounded-2xl p-5"
                  style={{
                    width: "34%",
                    bottom: "100px",
                    left: "-3%",
                    background: "#FBF6EC",
                    border: "1px solid rgba(251,246,236,0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(251,246,236,0.1)",
                    zIndex: 20,
                  }}
                >
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#1A1814", fontWeight: 500, marginBottom: "3px" }}>Анализ разговора</div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(26,24,20,0.5)", marginBottom: "18px" }}>Этап: Работа с возражениями</div>
                  {/* Waveform */}
                  <div className="flex items-center gap-0.5 mb-4" style={{ height: "48px" }}>
                    {[5,9,15,11,21,14,8,18,12,22,9,17,6,19,10,15,8,12,18,9,13,21,10,16,6,12,19,9,15,7,18,10,13,16,8].map((h, i) => (
                      <div key={i} className="flex-1 rounded-full" style={{ height: `${h}px`, background: i < 14 ? "#8B6F47" : "rgba(139,111,71,0.3)" }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#8B6F47" }}>
                      <Icon name="Play" size={12} style={{ color: "#FBF6EC" }} />
                    </div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(26,24,20,0.55)" }}>02:37 / 05:21</span>
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(26,24,20,0.45)", marginBottom: "10px" }}>Ключевые темы</div>
                  <div className="flex flex-wrap gap-2">
                    {["Цена", "Сроки", "Интеграция", "Демо"].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-md" style={{ background: "rgba(139,111,71,0.12)", color: "#8B6F47", border: "1px solid rgba(139,111,71,0.2)", fontSize: "12px", fontFamily: "Inter, sans-serif" }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* ── CARD: Источники сделок (центр) ── */}
                <div
                  className="absolute rounded-2xl p-5"
                  style={{
                    width: "32%",
                    top: "480px",
                    left: "30%",
                    background: "#FBF6EC",
                    border: "1px solid rgba(251,246,236,0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(251,246,236,0.1)",
                    zIndex: 22,
                  }}
                >
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#1A1814", fontWeight: 500, marginBottom: "18px" }}>Источники сделок</div>
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <svg width="110" height="110" viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(107,82,50,0.12)" strokeWidth="16"/>
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
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(26,24,20,0.45)" }}>Всего</span>
                        <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "22px", color: "#1A1814" }}>128</span>
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
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(26,24,20,0.7)", flex: 1, fontWeight: 500 }}>{l}</span>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#1A1814", fontWeight: 600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── CARD: Последние звонки (центр-низ) ── */}
                <div
                  className="absolute rounded-2xl p-5"
                  style={{
                    width: "42%",
                    bottom: "20px",
                    left: "29%",
                    background: "#FBF6EC",
                    border: "1px solid rgba(251,246,236,0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(251,246,236,0.1)",
                    zIndex: 23,
                  }}
                >
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#1A1814", fontWeight: 500, marginBottom: "14px" }}>Последние звонки</div>
                  {/* Table header */}
                  <div className="grid items-center gap-3 pb-2 mb-2 border-b" style={{ gridTemplateColumns: "1.6fr 1fr 1.1fr 0.7fr 1.4fr", borderColor: "rgba(139,111,71,0.18)" }}>
                    {["Клиент","Длительность","Результат","Конверсия","Запись"].map(h => (
                      <span key={h} style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(26,24,20,0.45)", fontWeight: 500, letterSpacing: "0.04em" }}>{h}</span>
                    ))}
                  </div>
                  {/* Rows */}
                  <div className="space-y-2.5">
                    {[
                      { c: "ООО ТехноПласт", d: "32:14", r: "Успешно", k: "85%", color: "#22a868" },
                      { c: "Иван Петров", d: "18:42", r: "Перезвонить", k: "40%", color: "#8B6F47" },
                      { c: "АО МаркетПлейс", d: "45:30", r: "Успешно", k: "90%", color: "#22a868" },
                      { c: "Сергей Иванов", d: "22:11", r: "Не удалось", k: "20%", color: "#ef4444" },
                      { c: "ООО СтройИнвест", d: "31:05", r: "Успешно", k: "70%", color: "#22a868" },
                    ].map((row, idx) => (
                      <div key={row.c} className="grid items-center gap-3" style={{ gridTemplateColumns: "1.6fr 1fr 1.1fr 0.7fr 1.4fr" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(26,24,20,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.c}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(26,24,20,0.55)" }}>{row.d}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: row.color }}>{row.r}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#1A1814", fontWeight: 500 }}>{row.k}</span>
                        {/* Audio control */}
                        <div className="flex items-center gap-1.5">
                          <button className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#8B6F47" }}>
                            <Icon name="Play" size={8} style={{ color: "#FBF6EC" }} />
                          </button>
                          {/* Mini waveform */}
                          <div className="flex items-center gap-[1px] flex-1" style={{ height: "14px" }}>
                            {[4,7,10,5,12,6,9,11,5,8,7,10,4,9,6,8,5,11,7,4].map((h, i) => (
                              <div key={i} className="flex-1 rounded-full" style={{ height: `${h}px`, background: i < (idx === 3 ? 4 : idx === 1 ? 8 : 14) ? "#8B6F47" : "rgba(139,111,71,0.25)" }} />
                            ))}
                          </div>
                          <button className="shrink-0" title="Скачать">
                            <Icon name="Download" size={11} style={{ color: "rgba(139,111,71,0.7)" }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── CARD: Топ менеджеров (справа) ── */}
                <div
                  className="absolute rounded-2xl p-5"
                  style={{
                    width: "36%",
                    bottom: "80px",
                    right: "1%",
                    background: "#FBF6EC",
                    border: "1px solid rgba(251,246,236,0.2)",
                    boxShadow: "0 35px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(251,246,236,0.1)",
                    zIndex: 25,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#1A1814", fontWeight: 500 }}>Топ менеджеров</span>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded" style={{ background: "rgba(139,111,71,0.1)", border: "1px solid rgba(139,111,71,0.2)" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#1A1814" }}>По выручке</span>
                      <Icon name="ChevronDown" size={10} style={{ color: "#8B6F47" }} />
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
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(139,111,71,0.2)", color: "#8B6F47", fontWeight: 600, fontSize: "11px", fontFamily: "Inter, sans-serif" }}>{m.a}</div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(26,24,20,0.7)", flex: 1 }}>{m.name}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#1A1814", fontWeight: 500 }}>{m.rev}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#22a868", minWidth: "44px", textAlign: "right" }}>↑ {m.ch}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
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
    </div>
  );
}

export default HomePage;