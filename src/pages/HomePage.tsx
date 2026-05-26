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
  border: "1px solid rgba(194,165,122,0.18)",
};

const cardHover = "hover:border-[rgba(194,165,122,0.35)] transition-colors duration-300 cursor-default";

const iconBox = {
  background: "rgba(194,165,122,0.08)",
  border: "1px solid rgba(194,165,122,0.18)",
};

const h2Style = {
  fontFamily: '"Bodoni Moda", Georgia, serif',
  fontWeight: 400,
  color: "#E7DED4",
  letterSpacing: "0.01em",
};

const bodyText = {
  color: "rgba(231,222,212,0.6)",
  fontWeight: 300,
  lineHeight: 1.7,
  fontFamily: "Inter, sans-serif",
};

const labelStyle = {
  color: "#C2A57A",
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
            borderColor: "rgba(194,165,122,0.12)",
          }}
        >
          <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
            <a href="#" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(194,165,122,0.1)",
                  border: "1px solid rgba(194,165,122,0.25)",
                }}
              >
                <Icon name="Waves" size={16} style={{ color: "#C2A57A" }} />
              </div>
              <span
                className="text-[15px] tracking-wide"
                style={{
                  fontFamily: '"Bodoni Moda", Georgia, serif',
                  fontWeight: 400,
                  color: "#E7DED4",
                  letterSpacing: "0.08em",
                }}
              >
                SALES<span style={{ color: "#C2A57A" }}>FLOW</span>
              </span>
            </a>

            <nav className="hidden lg:flex items-center gap-1">
              {["Продукт", "Решения", "Возможности", "Тарифы", "О нас"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="px-4 py-2 text-[13px] rounded-lg transition-all duration-200"
                    style={{ color: "rgba(231,222,212,0.55)", fontFamily: "Inter, sans-serif", fontWeight: 300 }}
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
                  background: "#C2A57A",
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
                style={{ color: "rgba(231,222,212,0.55)" }}
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
              borderColor: "rgba(194,165,122,0.12)",
            }}
          >
            {["Продукт", "Решения", "Возможности", "Тарифы", "О нас"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-[14px] transition-colors"
                  style={{ color: "rgba(231,222,212,0.7)", fontFamily: "Inter, sans-serif", fontWeight: 300 }}
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
                background: "#C2A57A",
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
                <div style={{ width: "40px", height: "1px", background: "#C2A57A", opacity: 0.5 }} />
                <span style={labelStyle}>Речевая аналитика и CRM-интеграции</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl lg:text-6xl xl:text-7xl mb-6 leading-none"
                style={{
                  fontFamily: '"Bodoni Moda", Georgia, serif',
                  fontWeight: 400,
                  color: "#E7DED4",
                  letterSpacing: "-0.01em",
                }}
              >
                Ваши продажи
                <br />
                <span style={{ color: "#C2A57A" }}>под контролем</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-[16px] mb-9 max-w-lg"
                style={{ color: "rgba(231,222,212,0.6)", fontFamily: "Inter, sans-serif", fontWeight: 300, lineHeight: 1.75 }}
              >
                SalesFlow анализирует каждый звонок, находит точки роста и
                помогает вашей команде продавать больше каждый день.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <a
                  href="#cta"
                  className="inline-flex items-center gap-2"
                  style={{
                    background: "#C2A57A",
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
              <motion.p variants={fadeUp} className="mt-6" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.06em", color: "rgba(231,222,212,0.3)", fontWeight: 400 }}>
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
                      <Icon name={item.icon} size={18} style={{ color: "#C2A57A" }} />
                    </div>
                    <div>
                      <div
                        className="leading-none mb-1"
                        style={{
                          fontFamily: '"Bodoni Moda", Georgia, serif',
                          fontWeight: 400,
                          fontSize: "28px",
                          color: "#E7DED4",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {item.num}
                      </div>
                      <div style={{ ...labelStyle, fontSize: "11px", letterSpacing: "0.1em", color: "rgba(194,165,122,0.6)", textTransform: "none" as const }}>
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
                  <div style={{ width: "32px", height: "1px", background: "#C2A57A", opacity: 0.5 }} />
                  <span style={labelStyle}>Платформа</span>
                  <div style={{ width: "32px", height: "1px", background: "#C2A57A", opacity: 0.5 }} />
                </div>
                <h2 className="text-3xl lg:text-5xl mb-4" style={h2Style}>
                  Всё в одном окне
                </h2>
                <p style={{ ...bodyText, fontSize: "14px", maxWidth: "480px", margin: "0 auto" }}>
                  Аналитика звонков, воронка, менеджеры и AI-инсайты — единый дашборд без лишних вкладок
                </p>
              </motion.div>

              {/* 3D Dashboard Scene */}
              <motion.div
                variants={fadeUp}
                className="relative"
                style={{ perspective: "1200px", minHeight: "680px" }}
              >
                {/* ── MAIN DASHBOARD (центр, слегка наклонён) ── */}
                <div
                  className="absolute rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    width: "62%",
                    top: "0px",
                    left: "19%",
                    background: "#E7DED4",
                    border: "1px solid rgba(231,222,212,0.25)",
                    transform: "rotateX(4deg) rotateY(-3deg)",
                    transformOrigin: "center top",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(231,222,212,0.1)",
                    zIndex: 10,
                  }}
                >
                  {/* Topbar */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ background: "#DDD2C4", borderColor: "rgba(139,111,71,0.2)" }}>
                    <div className="flex items-center gap-2">
                      <Icon name="Waves" size={12} style={{ color: "#8B6F47" }} />
                      <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "11px", color: "#1A1814", letterSpacing: "0.08em" }}>SALES<span style={{ color: "#8B6F47" }}>FLOW</span></span>
                    </div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(26,24,20,0.4)" }}>1–30 Апреля, 2024</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ background: "rgba(139,111,71,0.1)", border: "1px solid rgba(139,111,71,0.2)" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#1A1814" }}>Эксперт</span>
                    </div>
                  </div>
                  <div className="flex">
                    {/* Sidebar */}
                    <div className="shrink-0 border-r py-3 px-2.5" style={{ width: "120px", background: "#DDD2C4", borderColor: "rgba(139,111,71,0.15)" }}>
                      {[
                        { icon: "LayoutDashboard", label: "Обзор", active: true },
                        { icon: "Phone", label: "Звонки" },
                        { icon: "Users", label: "Клиенты" },
                        { icon: "BarChart2", label: "Аналитика" },
                        { icon: "Sparkles", label: "AI-Инсайты" },
                        { icon: "FileText", label: "Отчёты" },
                        { icon: "Settings", label: "Настройки" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5" style={{ background: item.active ? "rgba(139,111,71,0.15)" : "transparent" }}>
                          <Icon name={item.icon} size={12} style={{ color: item.active ? "#8B6F47" : "rgba(26,24,20,0.35)" }} />
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: item.active ? "#1A1814" : "rgba(26,24,20,0.4)", fontWeight: item.active ? 500 : 300 }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="mb-3" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "16px", color: "#1A1814" }}>Обзор</div>
                      {/* KPIs */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[
                          { label: "Выручка", value: "₽12.4M", change: "+18.7%" },
                          { label: "Конверсия", value: "24.6%", change: "+12.4%" },
                          { label: "Средний чек", value: "₽18,540", change: "+6.2%" },
                          { label: "Новые лиды", value: "1,243", change: "+14.3%" },
                        ].map((k) => (
                          <div key={k.label} className="rounded-lg p-2.5" style={{ background: "#DDD2C4", border: "1px solid rgba(139,111,71,0.12)" }}>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "rgba(26,24,20,0.4)", marginBottom: "4px" }}>{k.label}</div>
                            <div style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "15px", color: "#1A1814", marginBottom: "2px" }}>{k.value}</div>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "#22a868" }}>↑ {k.change}</div>
                            <svg width="100%" height="18" viewBox="0 0 60 18"><polyline points="0,15 12,12 24,13 36,7 48,9 60,2" fill="none" stroke="#8B6F47" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" /></svg>
                          </div>
                        ))}
                      </div>
                      {/* Chart row */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 rounded-lg p-3" style={{ background: "#DDD2C4", border: "1px solid rgba(139,111,71,0.12)" }}>
                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(26,24,20,0.5)", marginBottom: "8px" }}>Динамика выручки</div>
                          <svg width="100%" height="60" viewBox="0 0 260 60" preserveAspectRatio="none">
                            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B6F47" stopOpacity="0.2"/><stop offset="100%" stopColor="#8B6F47" stopOpacity="0"/></linearGradient></defs>
                            <path d="M0,48 C25,44 40,36 65,32 C90,28 105,40 130,28 C155,16 180,20 210,12 L260,8 L260,60 L0,60 Z" fill="url(#g1)"/>
                            <path d="M0,48 C25,44 40,36 65,32 C90,28 105,40 130,28 C155,16 180,20 210,12 L260,8" fill="none" stroke="#8B6F47" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <div className="flex justify-between"><span style={{ fontFamily: "Inter, sans-serif", fontSize: "8px", color: "rgba(26,24,20,0.3)" }}>1 Апр</span><span style={{ fontFamily: "Inter, sans-serif", fontSize: "8px", color: "rgba(26,24,20,0.3)" }}>14 Апр</span><span style={{ fontFamily: "Inter, sans-serif", fontSize: "8px", color: "rgba(26,24,20,0.3)" }}>30 Апр</span></div>
                        </div>
                        <div className="rounded-lg p-3 flex flex-col items-center justify-center" style={{ background: "#DDD2C4", border: "1px solid rgba(139,111,71,0.12)" }}>
                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "#8B6F47", marginBottom: "8px" }}>AI-Инсайты</div>
                          <div className="relative">
                            <svg width="56" height="56" viewBox="0 0 56 56">
                              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(139,111,71,0.15)" strokeWidth="7"/>
                              <circle cx="28" cy="28" r="22" fill="none" stroke="#8B6F47" strokeWidth="7" strokeDasharray="113 138" strokeDashoffset="35" strokeLinecap="round"/>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "13px", color: "#1A1814" }}>81%</div>
                          </div>
                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "8px", color: "rgba(26,24,20,0.4)", textAlign: "center", marginTop: "4px" }}>Успешная сделка</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CARD: Анализ разговора (слева, выдвинута вперёд) ── */}
                <div
                  className="absolute rounded-2xl p-4 shadow-2xl"
                  style={{
                    width: "28%",
                    bottom: "0px",
                    left: "0px",
                    background: "#E7DED4",
                    border: "1px solid rgba(231,222,212,0.2)",
                    transform: "rotateX(-2deg) rotateY(6deg) translateZ(40px)",
                    transformOrigin: "right bottom",
                    boxShadow: "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(231,222,212,0.1)",
                    zIndex: 20,
                  }}
                >
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#1A1814", fontWeight: 500, marginBottom: "2px" }}>Анализ разговора</div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(26,24,20,0.45)", marginBottom: "12px" }}>Этап: Работа с возражениями</div>
                  {/* Waveform */}
                  <div className="flex items-center gap-0.5 mb-3" style={{ height: "32px" }}>
                    {[3,6,10,7,14,9,5,12,8,15,6,11,4,13,7,10,5,8,12,6,9,14,7,11,4,8,13,6,10,5,12,7,9,11,6].map((h, i) => (
                      <div key={i} className="flex-1 rounded-full" style={{ height: `${h}px`, background: i < 12 ? "#8B6F47" : "rgba(139,111,71,0.3)" }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#8B6F47" }}>
                        <Icon name="Play" size={8} style={{ color: "#E7DED4" }} />
                      </div>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(26,24,20,0.5)" }}>02:37 / 05:21</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "rgba(26,24,20,0.4)", marginBottom: "6px" }}>Ключевые темы</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Цена", "Сроки", "Интеграция", "Демо"].map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md text-[9px]" style={{ background: "rgba(139,111,71,0.12)", color: "#8B6F47", border: "1px solid rgba(139,111,71,0.2)" }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* ── CARD: Источники сделок (центр-низ, выдвинута вперёд) ── */}
                <div
                  className="absolute rounded-2xl p-4 shadow-2xl"
                  style={{
                    width: "30%",
                    bottom: "0px",
                    left: "30%",
                    background: "#E7DED4",
                    border: "1px solid rgba(231,222,212,0.2)",
                    transform: "rotateX(-1deg) rotateY(-1deg) translateZ(50px)",
                    transformOrigin: "center bottom",
                    boxShadow: "0 30px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(231,222,212,0.1)",
                    zIndex: 20,
                  }}
                >
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#1A1814", fontWeight: 500, marginBottom: "10px" }}>Источники сделок</div>
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(139,111,71,0.12)" strokeWidth="10"/>
                        <circle cx="32" cy="32" r="26" fill="none" stroke="#8B6F47" strokeWidth="10" strokeDasharray="65 163" strokeDashoffset="41"/>
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(139,111,71,0.5)" strokeWidth="10" strokeDasharray="49 163" strokeDashoffset="-24"/>
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(139,111,71,0.25)" strokeWidth="10" strokeDasharray="33 163" strokeDashoffset="-73"/>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "8px", color: "rgba(26,24,20,0.4)" }}>Всего</span>
                        <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "13px", color: "#1A1814" }}>128</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {[["Холодные звонки","40%",1],["Рекомендации","30%",0.5],["Партнёры","20%",0.28],["Другое","10%",0.15]].map(([l,v,o]) => (
                        <div key={String(l)} className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#8B6F47", opacity: Number(o) }}/>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "rgba(26,24,20,0.5)", flex: 1 }}>{l}</span>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "#1A1814", fontWeight: 500 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── CARD: Топ менеджеров (справа, выдвинута вперёд) ── */}
                <div
                  className="absolute rounded-2xl p-4 shadow-2xl"
                  style={{
                    width: "28%",
                    bottom: "0px",
                    right: "0px",
                    background: "#E7DED4",
                    border: "1px solid rgba(231,222,212,0.2)",
                    transform: "rotateX(-2deg) rotateY(-6deg) translateZ(40px)",
                    transformOrigin: "left bottom",
                    boxShadow: "0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(231,222,212,0.1)",
                    zIndex: 20,
                  }}
                >
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#1A1814", fontWeight: 500, marginBottom: "10px" }}>Топ менеджеров</div>
                  <div className="space-y-2.5">
                    {[
                      { name: "Иван Петров", rev: "₽2.8M", ch: "+24.5%", a: "И" },
                      { name: "Мария Смирнова", rev: "₽2.3M", ch: "+18.7%", a: "М" },
                      { name: "Алексей Кузнецов", rev: "₽1.9M", ch: "+15.2%", a: "А" },
                      { name: "Анна Васильева", rev: "₽1.6M", ch: "+11.3%", a: "А" },
                      { name: "Дмитрий Новиков", rev: "₽1.2M", ch: "+8.6%", a: "Д" },
                    ].map((m) => (
                      <div key={m.name} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] shrink-0" style={{ background: "rgba(139,111,71,0.2)", color: "#8B6F47", fontWeight: 600 }}>{m.a}</div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(26,24,20,0.65)", flex: 1 }}>{m.name}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#1A1814", fontWeight: 500 }}>{m.rev}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "#22a868" }}>{m.ch}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom spacer */}
                <div style={{ paddingBottom: "320px" }} />
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer
          className="py-10 px-5"
          style={{ borderTop: "1px solid rgba(194,165,122,0.1)", background: "#151513" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(194,165,122,0.1)",
                    border: "1px solid rgba(194,165,122,0.25)",
                  }}
                >
                  <Icon name="Waves" size={14} style={{ color: "#C2A57A" }} />
                </div>
                <span
                  style={{
                    fontFamily: '"Bodoni Moda", Georgia, serif',
                    fontWeight: 400,
                    fontSize: "14px",
                    letterSpacing: "0.08em",
                    color: "#DDD2C4",
                  }}
                >
                  SALES<span style={{ color: "#C2A57A" }}>FLOW</span>
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
                {["Услуги", "Кейсы", "Тарифы", "Контакты"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-[12px] transition-colors"
                    style={{ color: "rgba(231,222,212,0.4)", fontFamily: "Inter, sans-serif", fontWeight: 300 }}
                  >
                    {link}
                  </a>
                ))}
              </div>
              <p style={{ fontSize: "11px", color: "rgba(231,222,212,0.3)", fontFamily: "Inter, sans-serif" }}>
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
          background: "#C2A57A",
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