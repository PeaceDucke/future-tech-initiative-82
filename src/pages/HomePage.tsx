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
              <motion.div variants={fadeUp} className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div style={{ width: "32px", height: "1px", background: "#8B6F47", opacity: 0.5 }} />
                  <span style={{ ...labelStyle, color: "#8B6F47" }}>Платформа</span>
                  <div style={{ width: "32px", height: "1px", background: "#8B6F47", opacity: 0.5 }} />
                </div>
                <h2 className="text-3xl lg:text-5xl mb-4" style={{ ...h2Style, color: "#1A1814" }}>
                  Всё в одном окне
                </h2>
                <p style={{ ...bodyText, color: "rgba(26,24,20,0.55)", fontSize: "14px", maxWidth: "480px", margin: "0 auto" }}>
                  Аналитика звонков, воронка, менеджеры и AI-инсайты — единый дашборд без лишних вкладок
                </p>
              </motion.div>

              {/* Dashboard mock */}
              <motion.div
                variants={fadeUp}
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: "#E7DED4", border: "1px solid rgba(139,111,71,0.15)" }}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: "#DDD2C4", borderColor: "rgba(139,111,71,0.2)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(139,111,71,0.15)" }}>
                      <Icon name="Waves" size={11} style={{ color: "#8B6F47" }} />
                    </div>
                    <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "12px", color: "#1A1814", letterSpacing: "0.08em" }}>
                      SALES<span style={{ color: "#8B6F47" }}>FLOW</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(26,24,20,0.45)" }}>1–30 Апреля, 2024</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded" style={{ background: "rgba(139,111,71,0.1)", border: "1px solid rgba(139,111,71,0.2)" }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: "#8B6F47", color: "#E7DED4" }}>И</div>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#1A1814" }}>Эксперт</span>
                    </div>
                  </div>
                </div>

                <div className="flex" style={{ minHeight: "540px" }}>
                  {/* Sidebar */}
                  <div className="w-40 shrink-0 border-r py-4 px-3" style={{ background: "#DDD2C4", borderColor: "rgba(139,111,71,0.15)" }}>
                    {[
                      { icon: "LayoutDashboard", label: "Обзор", active: true },
                      { icon: "Phone", label: "Звонки", active: false },
                      { icon: "Users", label: "Клиенты", active: false },
                      { icon: "BarChart2", label: "Аналитика", active: false },
                      { icon: "Sparkles", label: "AI-Инсайты", active: false },
                      { icon: "FileText", label: "Отчёты", active: false },
                      { icon: "Settings", label: "Настройки", active: false },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5"
                        style={{
                          background: item.active ? "rgba(139,111,71,0.15)" : "transparent",
                          cursor: "default",
                        }}
                      >
                        <Icon name={item.icon} size={14} style={{ color: item.active ? "#8B6F47" : "rgba(26,24,20,0.4)" }} />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: item.active ? "#1A1814" : "rgba(26,24,20,0.45)", fontWeight: item.active ? 500 : 300 }}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-5 overflow-hidden">
                    <div className="mb-4">
                      <h3 style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "20px", color: "#1A1814", fontWeight: 400 }}>Обзор</h3>
                    </div>

                    {/* KPI cards */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Выручка", value: "₽12.4M", change: "+18.7%", color: "#22a868" },
                        { label: "Конверсия в сделки", value: "24.6%", change: "+12.4%", color: "#22a868" },
                        { label: "Средний чек", value: "₽18,540", change: "+6.2%", color: "#22a868" },
                        { label: "Новые лиды", value: "1,243", change: "+14.3%", color: "#22a868" },
                      ].map((kpi) => (
                        <div key={kpi.label} className="rounded-xl p-3" style={{ background: "#DDD2C4", border: "1px solid rgba(139,111,71,0.12)" }}>
                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(26,24,20,0.45)", marginBottom: "6px" }}>{kpi.label}</div>
                          <div style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "18px", color: "#1A1814", fontWeight: 400, marginBottom: "4px" }}>{kpi.value}</div>
                          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: kpi.color }}>↑ {kpi.change} за период</div>
                          {/* Mini sparkline */}
                          <svg width="100%" height="24" viewBox="0 0 80 24" style={{ marginTop: "6px" }}>
                            <polyline points="0,20 15,16 30,18 45,10 60,12 80,4" fill="none" stroke="#8B6F47" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                          </svg>
                        </div>
                      ))}
                    </div>

                    {/* Second row */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {/* Revenue chart */}
                      <div className="col-span-2 rounded-xl p-4" style={{ background: "#DDD2C4", border: "1px solid rgba(139,111,71,0.12)" }}>
                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(26,24,20,0.55)", marginBottom: "12px", fontWeight: 500 }}>Динамика выручки</div>
                        <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8B6F47" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#8B6F47" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,60 C30,55 50,45 80,40 C110,35 130,50 160,35 C190,20 220,25 260,15 L300,10 L300,80 L0,80 Z" fill="url(#revenueGrad)" />
                          <path d="M0,60 C30,55 50,45 80,40 C110,35 130,50 160,35 C190,20 220,25 260,15 L300,10" fill="none" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <div className="flex justify-between mt-2">
                          {["1 Апр", "7 Апр", "14 Апр", "21 Апр", "30 Апр"].map(d => (
                            <span key={d} style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "rgba(26,24,20,0.35)" }}>{d}</span>
                          ))}
                        </div>
                      </div>

                      {/* AI Insights */}
                      <div className="rounded-xl p-4 flex flex-col" style={{ background: "#DDD2C4", border: "1px solid rgba(139,111,71,0.12)" }}>
                        <div className="flex items-center gap-1.5 mb-3">
                          <Icon name="Sparkles" size={12} style={{ color: "#8B6F47" }} />
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#8B6F47", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>AI-Инсайты</span>
                        </div>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(26,24,20,0.6)", lineHeight: 1.6, marginBottom: "12px" }}>
                          Клиенты чаще всего возражают на этапе обсуждения цены.
                        </p>
                        {/* Donut */}
                        <div className="flex items-center justify-center flex-1">
                          <div className="relative">
                            <svg width="64" height="64" viewBox="0 0 64 64">
                              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(139,111,71,0.15)" strokeWidth="8" />
                              <circle cx="32" cy="32" r="26" fill="none" stroke="#8B6F47" strokeWidth="8" strokeDasharray="130 163" strokeDashoffset="41" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "14px", color: "#1A1814", fontWeight: 400 }}>81%</span>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "rgba(26,24,20,0.4)", textAlign: "center", marginTop: "6px" }}>Вероятность успешной сделки</p>
                      </div>
                    </div>

                    {/* Third row */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* Sources donut */}
                      <div className="rounded-xl p-4" style={{ background: "#DDD2C4", border: "1px solid rgba(139,111,71,0.12)" }}>
                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(26,24,20,0.55)", marginBottom: "10px", fontWeight: 500 }}>Источники сделок</div>
                        <div className="flex items-center gap-3">
                          <svg width="52" height="52" viewBox="0 0 52 52">
                            <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(139,111,71,0.12)" strokeWidth="10" />
                            <circle cx="26" cy="26" r="20" fill="none" stroke="#8B6F47" strokeWidth="10" strokeDasharray="50 125" strokeDashoffset="31" />
                            <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(139,111,71,0.4)" strokeWidth="10" strokeDasharray="37 125" strokeDashoffset="-19" />
                            <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(139,111,71,0.25)" strokeWidth="10" strokeDasharray="25 125" strokeDashoffset="-56" />
                            <text x="26" y="30" textAnchor="middle" style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "10px", fill: "#1A1814" }}>128</text>
                          </svg>
                          <div className="space-y-1.5">
                            {[["Холодные звонки", "40%"], ["Рекомендации", "30%"], ["Партнёры", "20%"], ["Другое", "10%"]].map(([l, v]) => (
                              <div key={l} className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#8B6F47", opacity: l === "Рекомендации" ? 0.6 : l === "Партнёры" ? 0.35 : l === "Другое" ? 0.2 : 1 }} />
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "rgba(26,24,20,0.5)" }}>{l}</span>
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "#1A1814", fontWeight: 500 }}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Top managers */}
                      <div className="rounded-xl p-4" style={{ background: "#DDD2C4", border: "1px solid rgba(139,111,71,0.12)" }}>
                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(26,24,20,0.55)", marginBottom: "10px", fontWeight: 500 }}>Топ менеджеров</div>
                        <div className="space-y-2">
                          {[
                            { name: "Иван Петров", rev: "₽2.8M", change: "+24.5%", avatar: "И" },
                            { name: "Мария Смирнова", rev: "₽2.3M", change: "+18.7%", avatar: "М" },
                            { name: "Алексей Кузнецов", rev: "₽1.9M", change: "+15.2%", avatar: "А" },
                            { name: "Анна Васильева", rev: "₽1.6M", change: "+11.3%", avatar: "А" },
                          ].map((m) => (
                            <div key={m.name} className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0" style={{ background: "rgba(139,111,71,0.2)", color: "#8B6F47" }}>{m.avatar}</div>
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "rgba(26,24,20,0.7)", flex: 1 }}>{m.name}</span>
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#1A1814", fontWeight: 500 }}>{m.rev}</span>
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "#22a868" }}>{m.change}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Last calls */}
                      <div className="rounded-xl p-4" style={{ background: "#DDD2C4", border: "1px solid rgba(139,111,71,0.12)" }}>
                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(26,24,20,0.55)", marginBottom: "10px", fontWeight: 500 }}>Последние звонки</div>
                        <div className="space-y-2">
                          {[
                            { client: "ООО ТехноПласт", dur: "32:14", res: "Успешно", conv: "85%" },
                            { client: "Иван Петров", dur: "18:42", res: "Перезвонить", conv: "40%" },
                            { client: "АО МаркетПлейс", dur: "45:30", res: "Успешно", conv: "90%" },
                            { client: "Сергей Иванов", dur: "22:11", res: "Не удалось", conv: "20%" },
                          ].map((c) => (
                            <div key={c.client} className="flex items-center gap-2">
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "rgba(26,24,20,0.6)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.client}</span>
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: "rgba(26,24,20,0.4)" }}>{c.dur}</span>
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", color: c.res === "Успешно" ? "#22a868" : c.res === "Не удалось" ? "#ef4444" : "#8B6F47" }}>{c.res}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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