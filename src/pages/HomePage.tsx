import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import Icon from "@/components/ui/icon"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.div>
  )
}

const darkCard = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(124,58,237,0.18)",
  backdropFilter: "blur(12px)",
}

const darkCardHover = "hover:border-violet-500/40 hover:bg-white/[0.05] transition-all duration-300 cursor-default"

function LineChart() {
  const points = "0,80 40,65 80,72 120,45 160,55 200,30 240,40 280,15 320,25"
  return (
    <svg viewBox="0 0 320 90" className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="url(#strokeGrad)" strokeWidth="2" points={points}
        style={{ filter: "drop-shadow(0 0 6px rgba(168,85,247,0.8))" }} />
      <polygon fill="url(#lineGrad)" points={`0,90 ${points} 320,90`} />
    </svg>
  )
}

function DonutChart({ pct, color }: { pct: number; color: string }) {
  const r = 28, circ = 2 * Math.PI * r, dash = (pct / 100) * circ
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 36 36)"
        style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
    </svg>
  )
}

export function HomePage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#03020a" }}>

      {/* ─── STARFIELD + CONSTELLATIONS ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7df9ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#7df9ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Constellation lines — очень тонкие, еле заметные */}
          <g stroke="#38bdf8" strokeOpacity="0.12" strokeWidth="0.7" fill="none">
            {/* Созвездие 1 — левый верх */}
            <line x1="8%" y1="12%" x2="14%" y2="8%" />
            <line x1="14%" y1="8%" x2="19%" y2="14%" />
            <line x1="19%" y1="14%" x2="24%" y2="10%" />
            <line x1="14%" y1="8%" x2="17%" y2="4%" />
            {/* Созвездие 2 — правый верх */}
            <line x1="72%" y1="6%" x2="78%" y2="11%" />
            <line x1="78%" y1="11%" x2="84%" y2="7%" />
            <line x1="84%" y1="7%" x2="90%" y2="13%" />
            <line x1="78%" y1="11%" x2="76%" y2="17%" />
            <line x1="76%" y1="17%" x2="82%" y2="21%" />
            {/* Созвездие 3 — левый низ */}
            <line x1="5%" y1="55%" x2="11%" y2="60%" />
            <line x1="11%" y1="60%" x2="9%" y2="67%" />
            <line x1="9%" y1="67%" x2="15%" y2="72%" />
            <line x1="11%" y1="60%" x2="17%" y2="58%" />
            {/* Созвездие 4 — правый низ */}
            <line x1="75%" y1="65%" x2="81%" y2="70%" />
            <line x1="81%" y1="70%" x2="88%" y2="66%" />
            <line x1="88%" y1="66%" x2="92%" y2="72%" />
            <line x1="81%" y1="70%" x2="80%" y2="78%" />
            {/* Созвездие 5 — центр верх */}
            <line x1="42%" y1="3%" x2="47%" y2="8%" />
            <line x1="47%" y1="8%" x2="53%" y2="5%" />
            <line x1="53%" y1="5%" x2="58%" y2="10%" />
            <line x1="47%" y1="8%" x2="45%" y2="14%" />
          </g>

          {/* Звёзды-узлы созвездий */}
          <g fill="#7df9ff">
            {/* Созвездие 1 */}
            <circle cx="8%" cy="12%" r="1.2" opacity="0.55" />
            <circle cx="14%" cy="8%" r="1.6" opacity="0.65" />
            <circle cx="19%" cy="14%" r="1.1" opacity="0.5" />
            <circle cx="24%" cy="10%" r="1.3" opacity="0.55" />
            <circle cx="17%" cy="4%" r="0.9" opacity="0.45" />
            {/* Созвездие 2 */}
            <circle cx="72%" cy="6%" r="1.1" opacity="0.5" />
            <circle cx="78%" cy="11%" r="1.7" opacity="0.65" />
            <circle cx="84%" cy="7%" r="1.2" opacity="0.55" />
            <circle cx="90%" cy="13%" r="1.0" opacity="0.45" />
            <circle cx="76%" cy="17%" r="1.1" opacity="0.5" />
            <circle cx="82%" cy="21%" r="1.3" opacity="0.55" />
            {/* Созвездие 3 */}
            <circle cx="5%" cy="55%" r="1.0" opacity="0.45" />
            <circle cx="11%" cy="60%" r="1.5" opacity="0.6" />
            <circle cx="9%" cy="67%" r="1.0" opacity="0.45" />
            <circle cx="15%" cy="72%" r="1.2" opacity="0.5" />
            <circle cx="17%" cy="58%" r="1.1" opacity="0.5" />
            {/* Созвездие 4 */}
            <circle cx="75%" cy="65%" r="1.1" opacity="0.5" />
            <circle cx="81%" cy="70%" r="1.6" opacity="0.62" />
            <circle cx="88%" cy="66%" r="1.2" opacity="0.52" />
            <circle cx="92%" cy="72%" r="1.0" opacity="0.45" />
            <circle cx="80%" cy="78%" r="1.1" opacity="0.48" />
            {/* Созвездие 5 */}
            <circle cx="42%" cy="3%" r="1.0" opacity="0.48" />
            <circle cx="47%" cy="8%" r="1.5" opacity="0.62" />
            <circle cx="53%" cy="5%" r="1.1" opacity="0.5" />
            <circle cx="58%" cy="10%" r="1.2" opacity="0.52" />
            <circle cx="45%" cy="14%" r="0.9" opacity="0.42" />
          </g>

          {/* Одиночные рассеянные звёзды — крошечные, еле видны */}
          <g fill="#bae6fd">
            {[
              [30,5,0.5],[55,18,0.4],[63,3,0.45],[35,22,0.35],[20,30,0.4],
              [48,28,0.38],[67,25,0.42],[85,35,0.38],[92,28,0.35],[3,38,0.4],
              [28,48,0.35],[38,55,0.38],[60,50,0.4],[70,45,0.35],[15,82,0.38],
              [32,78,0.4],[55,85,0.35],[68,80,0.42],[88,85,0.38],[96,55,0.4],
              [50,38,0.32],[22,65,0.35],[43,70,0.38],[58,62,0.33],[74,55,0.36],
            ].map(([x, y, op], i) => (
              <circle key={i} cx={`${x}%`} cy={`${y}%`} r="0.7" opacity={op} />
            ))}
          </g>

          {/* Мерцающие звёзды — чуть крупнее, анимированные через CSS */}
          <g fill="#e0f2fe">
            <circle cx="31%" cy="9%" r="1.0" opacity="0.5" className="star-twinkle-1" />
            <circle cx="66%" cy="14%" r="1.1" opacity="0.55" className="star-twinkle-2" />
            <circle cx="12%" cy="45%" r="0.9" opacity="0.45" className="star-twinkle-3" />
            <circle cx="88%" cy="50%" r="1.0" opacity="0.5" className="star-twinkle-1" />
            <circle cx="50%" cy="22%" r="0.9" opacity="0.45" className="star-twinkle-2" />
            <circle cx="25%" cy="88%" r="1.0" opacity="0.48" className="star-twinkle-3" />
            <circle cx="78%" cy="90%" r="0.9" opacity="0.45" className="star-twinkle-1" />
          </g>
        </svg>
      </div>

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="border-b border-violet-900/30" style={{ background: "rgba(8,8,16,0.85)", backdropFilter: "blur(20px)" }}>
          <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 8px rgba(168,85,247,1), 0 0 20px rgba(124,58,237,0.6)" }}>
                <Icon name="Waves" size={16} className="text-white" />
              </div>
              <span className="text-[16px] font-black text-white tracking-tight">SALES<span className="text-violet-400">FLOW</span></span>
            </a>

            <nav className="hidden lg:flex items-center gap-1">
              {["Продукт", "Решения", "Возможности", "Тарифы", "О нас"].map((item) => (
                <a key={item} href="#"
                  className="px-4 py-2 text-[13px] font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200">
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a href="#cta"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 8px rgba(168,85,247,1), 0 0 22px rgba(124,58,237,0.65), 0 0 40px rgba(124,58,237,0.25)" }}>
                Запросить демо
                <Icon name="ArrowRight" size={14} />
              </a>
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors">
                <Icon name={menuOpen ? "X" : "Menu"} size={20} />
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="border-b border-violet-900/30 px-5 py-4"
            style={{ background: "rgba(8,8,16,0.97)", backdropFilter: "blur(20px)" }}>
            {["Продукт", "Решения", "Возможности", "Тарифы", "О нас"].map((item) => (
              <a key={item} href="#" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-[14px] text-gray-300 hover:text-white transition-colors">{item}</a>
            ))}
            <a href="#cta" onClick={() => setMenuOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[14px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
              Запросить демо
            </a>
          </motion.div>
        )}
      </header>

      <main className="relative z-10 pt-16">

        {/* ═══ HERO ═══ */}
        <section className="min-h-[95vh] flex items-center px-5 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

              {/* Left text */}
              <motion.div initial="hidden" animate="visible" variants={stagger}>
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-violet-300 uppercase tracking-widest mb-7"
                  style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  AI-платформа для роста продаж
                </motion.div>

                <motion.h1 variants={fadeUp}
                  className="text-4xl lg:text-[58px] font-black text-white leading-[1.05] tracking-tight mb-6">
                  Превращаем ваши<br />
                  разговоры в{" "}
                  <span style={{ color: "#d8b4fe", textShadow: "0 0 6px rgba(216,180,254,1), 0 0 18px rgba(168,85,247,0.9), 0 0 40px rgba(124,58,237,0.55)" }}>деньги</span>
                </motion.h1>

                <motion.p variants={fadeUp} className="text-[16px] text-gray-400 leading-relaxed mb-6 max-w-lg">
                  SalesFlow анализирует каждый звонок, находит точки роста и помогает вашей команде продавать больше каждый день.
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-8">
                  {[
                    { icon: "TrendingUp", text: "Находит точки роста в каждом звонке" },
                    { icon: "BarChart2", text: "Повышает конверсию и выручку" },
                    { icon: "ShieldCheck", text: "Контролирует качество и дисциплину" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-2 text-[12px] text-gray-400">
                      <Icon name={item.icon} size={14} className="text-violet-400 shrink-0 mt-0.5" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                  <a href="#cta"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 8px rgba(168,85,247,1), 0 0 24px rgba(124,58,237,0.7), 0 0 48px rgba(124,58,237,0.3)" }}>
                    Запросить демо
                    <Icon name="ArrowRight" size={15} />
                  </a>
                  <a href="#"
                    className="inline-flex items-center gap-2.5 px-5 py-3 rounded-lg text-[14px] font-semibold text-gray-300 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                      <Icon name="Play" size={12} className="text-white ml-0.5" />
                    </div>
                    Смотреть видео <span className="text-gray-500 text-[11px]">2 минуты</span>
                  </a>
                </motion.div>
              </motion.div>

              {/* Right — Cinematic 3D holographic projection */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="relative hidden lg:block"
                style={{ minHeight: "680px" }}
              >
                {/* ─── Atmospheric ambient ─── */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 70% 50% at 50% 78%, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.10) 40%, transparent 75%)", filter: "blur(8px)" }} />



                {/* ─── Static projector device (image) ─── */}
                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{ bottom: "-20px", width: "78%" }}>
                  <img
                    src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/95921a01-2d42-4d22-b6a6-96a0605359ae.png"
                    alt=""
                    className="w-full h-auto block"
                    style={{ filter: "drop-shadow(0 0 18px rgba(168,85,247,1)) drop-shadow(0 0 40px rgba(124,58,237,0.7)) drop-shadow(0 20px 50px rgba(99,102,241,0.4))" }}
                  />
                </div>

                {/* Floor / contact glow under projector */}
                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{
                    bottom: "60px",
                    width: "80%", height: "60px",
                    background: "radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, rgba(99,102,241,0.12) 40%, transparent 75%)",
                    filter: "blur(18px)",
                  }} />

                <div className="relative w-full h-full flex flex-col items-center justify-start pt-2" style={{ perspective: "1600px", zIndex: 30 }}>

                  {/* ── Floating glass holographic dashboard ── */}
                  <motion.div
                    className="relative mx-auto"
                    style={{ width: "112%", marginLeft: "-6%", transformStyle: "preserve-3d", zIndex: 30 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                  >


                    <motion.div
                      className="relative rounded-2xl overflow-hidden"
                      style={{
                        transform: "perspective(900px) rotateY(-18deg) rotateX(4deg)",
                        transformOrigin: "left center",
                        background: "linear-gradient(140deg, rgba(10,6,26,0.18) 0%, rgba(6,3,16,0.12) 50%, rgba(12,7,28,0.18) 100%)",
                        backdropFilter: "blur(4px) saturate(1.1)",
                        WebkitBackdropFilter: "blur(4px) saturate(1.1)",
                        border: "1px solid rgba(168,85,247,0.35)",
                        boxShadow: [
                          "inset 0 1px 0 rgba(255,255,255,0.05)",
                          "inset 0 -1px 0 rgba(168,85,247,0.25)",
                          "0 0 0 1px rgba(168,85,247,0.12)",
                          "0 0 18px rgba(168,85,247,0.35)",
                          "0 0 50px rgba(124,58,237,0.18)",
                          "0 40px 80px rgba(0,0,0,0.5)",
                        ].join(", "),
                      }}
                      animate={{ opacity: [0.96, 1, 0.985, 1, 0.96] }}
                      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Neon edge top */}
                      <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
                        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(216,180,254,1) 50%, transparent 100%)", boxShadow: "0 0 8px rgba(168,85,247,1), 0 0 16px rgba(168,85,247,0.6)" }} />
                      <div className="absolute inset-x-0 top-px h-px pointer-events-none"
                        style={{ background: "linear-gradient(90deg, transparent 20%, rgba(103,232,249,0.7) 50%, transparent 80%)" }} />

                      {/* Chrome bar */}
                      <div className="flex items-center gap-2 px-4 py-2 border-b"
                        style={{
                          background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
                          borderColor: "rgba(196,181,253,0.08)",
                        }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(196,181,253,0.55)" }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(196,181,253,0.35)" }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(196,181,253,0.22)" }} />
                        <div className="flex-1" />
                        <div className="text-[8px] text-violet-200 font-mono tracking-[0.18em]">SALESFLOW · LIVE ANALYTICS</div>
                        <span className="w-1 h-1 rounded-full bg-emerald-400 ml-1" style={{ boxShadow: "0 0 8px rgba(52,211,153,0.9)" }} />
                      </div>

                    {/* Dashboard content */}
                    <div className="p-6">
                      {/* Top metrics */}
                      <div className="grid grid-cols-4 gap-3 mb-5">
                        {[
                          { label: "Выручка", value: "8 742 000 ₽", change: "+31%", up: true },
                          { label: "Конверсия", value: "32.7%", change: "+8.1%", up: true },
                          { label: "Средний чек", value: "6 430 ₽", change: "+12.2%", up: true },
                          { label: "Потерянная", value: "1 242 000 ₽", change: "Найдено WI", warn: true, up: false },
                        ].map((m) => (
                          <div key={m.label} className="rounded-xl p-4"
                            style={{ background: "rgba(0,0,0,0.08)", border: "1px solid rgba(168,85,247,0.18)" }}>
                            <div className="text-[10px] font-medium text-gray-300 mb-1.5 truncate">{m.label}</div>
                            <div className="text-[14px] font-black text-white mb-1 truncate" style={{ textShadow: "0 0 12px rgba(255,255,255,0.3)" }}>{m.value}</div>
                            <div className={`text-[11px] font-bold ${m.warn ? "text-orange-300" : m.up ? "text-emerald-300" : "text-red-400"}`}>{m.change}</div>
                          </div>
                        ))}
                      </div>

                      {/* Charts row */}
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.08)", border: "1px solid rgba(168,85,247,0.18)", minHeight: "180px" }}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-[11px] font-semibold text-gray-200">Динамика выручки</div>
                            <div className="text-[10px] text-violet-300 font-bold">По дням</div>
                          </div>
                          <div style={{ transform: "scaleY(1.5)", transformOrigin: "bottom" }}>
                            <LineChart />
                          </div>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.08)", border: "1px solid rgba(168,85,247,0.18)", minHeight: "180px" }}>
                          <div className="text-[11px] font-semibold text-gray-200 mb-3">Причины потерь</div>
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0" style={{ transform: "scale(1.25)", transformOrigin: "left center" }}>
                              <DonutChart pct={65} color="#a855f7" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-[11px] font-black text-white" style={{ textShadow: "0 0 10px rgba(255,255,255,0.4)" }}>3 245</div>
                                <div className="text-[7px] text-gray-300">упущено</div>
                              </div>
                            </div>
                            <div className="space-y-2 flex-1 ml-4">
                              {[["Цена", 30, "#a855f7"], ["Конкуренты", 25, "#7c3aed"], ["Нет потребности", 20, "#6d28d9"], ["Возражения", 12, "#5b21b6"]].map(([l, p, c]) => (
                                <div key={l as string} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c as string }} />
                                  <div className="text-[10px] text-gray-200 flex-1 truncate">{l}</div>
                                  <div className="text-[10px] font-bold text-white">{p}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.08)", border: "1px solid rgba(168,85,247,0.18)", minHeight: "160px" }}>
                          <div className="text-[11px] font-semibold text-gray-200 mb-3">Топ менеджеров</div>
                          <div className="space-y-3">
                            {[
                              { name: "Анна С.", conv: 45, qual: 92 },
                              { name: "Иван П.", conv: 38, qual: 88 },
                              { name: "Мария К.", conv: 35, qual: 85 },
                            ].map((m, i) => (
                              <div key={i} className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white"
                                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>{m.name[0]}</div>
                                <div className="text-[11px] font-medium text-white flex-1 truncate">{m.name}</div>
                                <div className="text-[10px] text-gray-300">{m.conv}%</div>
                                <div className="text-[10px] font-bold" style={{ color: m.qual >= 90 ? "#34d399" : "#fbbf24" }}>{m.qual}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.08)", border: "1px solid rgba(168,85,247,0.18)", minHeight: "160px" }}>
                          <div className="text-[11px] font-semibold text-gray-200 mb-2">Качество разговоров</div>
                          <div className="relative" style={{ transform: "scale(1.35)", transformOrigin: "center" }}>
                            <DonutChart pct={82} color="#a855f7" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[14px] font-black text-white" style={{ textShadow: "0 0 12px rgba(255,255,255,0.5)" }}>82%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-4">
                            <Icon name="TrendingUp" size={11} className="text-emerald-400" />
                            <span className="text-[10px] text-emerald-300 font-semibold">+16%</span>
                            <span className="text-[10px] text-gray-300">к прошлому</span>
                          </div>
                        </div>
                      </div>
                    </div>

                      {/* Holographic scan-line overlay (very subtle) */}
                      <div className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(196,181,253,0.018) 2px, rgba(196,181,253,0.018) 3px)",
                          mixBlendMode: "screen",
                        }} />

                      {/* Glass sheen highlight */}
                      <div className="absolute inset-0 pointer-events-none rounded-2xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 30%, transparent 70%, rgba(167,139,250,0.05) 100%)",
                        }} />

                      {/* Neon edge bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
                        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.9) 50%, transparent 100%)", boxShadow: "0 0 6px rgba(168,85,247,0.8)" }} />
                    </motion.div>


                  </motion.div>

                </div>

                {/* Spacer to let projector + beam render below dashboard */}
                <div style={{ height: "230px" }} />


              </motion.div>
            </div>

            {/* Trusted by */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7 }}
              className="mt-16 pt-8 border-t border-white/5">
              <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-widest mb-5 text-center">Нам доверяют лидеры рынка</p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
                {["amoCRM", "Битрикс24", "retell", "Ringostat", "Aircall", "MANGO OFFICE"].map((logo) => (
                  <span key={logo} className="text-[13px] font-bold text-gray-400 whitespace-nowrap">{logo}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ METRICS STRIPE ═══ */}
        <section className="py-12 px-5 border-y border-violet-900/20" style={{ background: "rgba(124,58,237,0.04)" }}>
          <div className="max-w-7xl mx-auto">
            <Section>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                {[
                  { icon: "TrendingUp", num: "+30%", label: "Рост конверсии в среднем" },
                  { icon: "DollarSign", num: "+25%", label: "Увеличение выручки у клиентов" },
                  { icon: "TrendingDown", num: "-40%", label: "Сокращение потерь сделок" },
                  { icon: "Phone", num: "100%", label: "Звонков под контролем 24/7" },
                  { icon: "Zap", num: "3–5x", label: "Быстрая окупаемость в среднем" },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
                      <Icon name={item.icon} size={18} className="text-violet-400" />
                    </div>
                    <div>
                      <div className="text-[22px] font-black text-white">{item.num}</div>
                      <div className="text-[12px] text-gray-500 leading-tight">{item.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ PROBLEMS ═══ */}
        <section className="py-24 px-5">
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-violet-300 uppercase tracking-widest mb-4"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}>
                  Знакомые ситуации?
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-3">
                  Эти проблемы<br />мешают продажам расти
                </h2>
                <p className="text-gray-500 max-w-xl mx-auto text-[14px]">Мы видели их у сотен компаний — и знаем, как решить</p>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: "AlertTriangle", title: "Теряются заявки", desc: "Лиды падают в почту, мессенджеры, звонки — менеджеры не успевают фиксировать всё", color: "#f59e0b" },
                  { icon: "Clock", title: "Долгие ответы", desc: "Клиент написал в WhatsApp, ждёт час. За это время уже купил у конкурента", color: "#ec4899" },
                  { icon: "Smartphone", title: "Личные номера", desc: "Когда менеджер уходит — уходит и база. Переписок нет, звонков нет", color: "#a855f7" },
                  { icon: "EyeOff", title: "Нет контроля", desc: "Что говорят менеджеры на звонках? Как ведут переговоры? Непрозрачно", color: "#60a5fa" },
                  { icon: "Database", title: "CRM используется хаотично", desc: "Часть сделок в CRM, часть в таблицах, часть только в голове менеджера", color: "#34d399" },
                  { icon: "BarChart2", title: "Нет аналитики", desc: "Непонятно, какой канал приводит клиентов. Деньги в рекламу вложены — результата не видно", color: "#fb923c" },
                ].map((p, i) => (
                  <motion.div key={i} variants={fadeUp} className={`rounded-2xl p-5 ${darkCardHover}`} style={darkCard}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${p.color}14`, border: `1px solid ${p.color}30` }}>
                      <Icon name={p.icon} size={20} style={{ color: p.color }} />
                    </div>
                    <h3 className="text-[15px] font-bold text-white mb-1.5">{p.title}</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{p.desc}</p>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ SOLUTIONS ═══ */}
        <section id="services" className="py-24 px-5">
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-violet-300 uppercase tracking-widest mb-4"
                    style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}>
                    Наши решения
                  </div>
                  <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight">
                    Всё для системных продаж
                  </h2>
                </div>
                <p className="text-gray-500 max-w-sm text-[14px] leading-relaxed mt-4 lg:mt-0">
                  Внедряем комплексно или по шагам — в зависимости от задач вашего бизнеса
                </p>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: "Database", title: "Внедрение CRM", desc: "Bitrix24 и AmoCRM под ваши процессы, а не «из коробки»" },
                  { icon: "MessageCircle", title: "WhatsApp в CRM", desc: "Все переписки в одном окне. История сохраняется в карточке" },
                  { icon: "Phone", title: "Телефония", desc: "Виртуальная АТС, запись звонков, контроль разговоров" },
                  { icon: "BarChart3", title: "Аналитика продаж", desc: "Дашборды по менеджерам, воронке и каналам в реальном времени" },
                  { icon: "Zap", title: "Автоматизация", desc: "Задачи, уведомления, шаблоны — убираем рутину из работы" },
                  { icon: "Mic", title: "Анализ звонков AI", desc: "Оцениваем каждый разговор. Находим точки роста конверсии" },
                  { icon: "Lock", title: "Защита базы", desc: "Клиентская база остаётся у компании при любых условиях" },
                  { icon: "Headphones", title: "Сопровождение", desc: "Поддержка и доработки после внедрения без ограничений" },
                ].map((s, i) => (
                  <motion.div key={i} variants={fadeUp} className={`group rounded-2xl p-5 ${darkCardHover}`} style={darkCard}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <Icon name={s.icon} size={20} className="text-violet-400" />
                    </div>
                    <h3 className="text-[14px] font-bold text-white mb-1.5 group-hover:text-violet-300 transition-colors">{s.title}</h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ HOW WE WORK ═══ */}
        <section className="py-24 px-5 border-y border-violet-900/20" style={{ background: "rgba(124,58,237,0.03)" }}>
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-12">
                <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-3">6 шагов от хаоса к системе</h2>
                <p className="text-gray-500 text-[14px]">Отработанный процесс внедрения — от аудита до результата</p>
              </motion.div>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                  { num: "01", icon: "Search", title: "Аудит", desc: "Изучаем процессы, инструменты и боли команды" },
                  { num: "02", icon: "PenTool", title: "Проект", desc: "Архитектура CRM под ваши воронки продаж" },
                  { num: "03", icon: "Settings", title: "Настройка", desc: "CRM, роли, поля, воронки, автоматизации" },
                  { num: "04", icon: "GitMerge", title: "Интеграции", desc: "WhatsApp, телефония, сайт, реклама" },
                  { num: "05", icon: "GraduationCap", title: "Обучение", desc: "Обучаем команду, готовим инструкции" },
                  { num: "06", icon: "Headphones", title: "Поддержка", desc: "Сопровождаем, дорабатываем, консультируем" },
                ].map((step, i) => (
                  <motion.div key={i} variants={fadeUp} className={`rounded-2xl p-4 text-center ${darkCardHover}`} style={darkCard}>
                    <div className="text-[10px] font-black text-violet-600 mb-2 tracking-widest">{step.num}</div>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <Icon name={step.icon} size={16} className="text-violet-400" />
                    </div>
                    <div className="text-[12px] font-bold text-white mb-1">{step.title}</div>
                    <div className="text-[10px] text-gray-500 leading-relaxed">{step.desc}</div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ CASES ═══ */}
        <section id="cases" className="py-24 px-5">
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-4"
                  style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                  Кейсы клиентов
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight">Реальные цифры</h2>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {[
                  { industry: "Недвижимость", color: "#a855f7", before: "Заявки терялись в 4 мессенджерах. Менеджеры с личных номеров. Нет понимания по каждому клиенту.", action: "Внедрили AmoCRM, подключили WhatsApp API, настроили автоворонки по этапам сделки.", result: "Время ответа: 2 ч → 7 мин. Конверсия в показ: +28%" },
                  { industry: "Медицинская клиника", color: "#60a5fa", before: "Запись в таблицах. Напоминания не отправлялись. 30% пациентов не приходили.", action: "Настроили Bitrix24, телефонию и автоотправку напоминаний в WhatsApp за 24 ч до визита.", result: "Неявки: 30% → 8%. Нагрузка администратора: -40%" },
                  { industry: "B2B оборудование", color: "#34d399", before: "КП вручную. Сделки зависали неделями. Нет отчётности по менеджерам.", action: "Воронка с автозадачами, шаблонами КП и дашбордом руководителя в реальном времени.", result: "Цикл сделки: 45 → 18 дней. Выручка отдела: +22% за квартал" },
                ].map((c, i) => (
                  <motion.div key={i} variants={fadeUp} className="rounded-2xl overflow-hidden" style={darkCard}>
                    <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
                    <div className="p-6">
                      <div className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: c.color }}>{c.industry}</div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-[9px] font-bold text-red-400 uppercase tracking-wider mb-1.5">Было</div>
                          <p className="text-[12px] text-gray-500 leading-relaxed">{c.before}</p>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">Что сделали</div>
                          <p className="text-[12px] text-gray-500 leading-relaxed">{c.action}</p>
                        </div>
                        <div className="rounded-xl p-3" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                          <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Результат</div>
                          <p className="text-[12px] font-bold text-white leading-relaxed">{c.result}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ FOR WHOM ═══ */}
        <section className="py-24 px-5 border-t border-violet-900/20">
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-10">
                <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-3">Для кого</h2>
                <p className="text-gray-500 text-[14px]">Работаем с компаниями, у которых есть отдел продаж и задача расти</p>
              </motion.div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { icon: "ShoppingCart", label: "Интернет-магазины" },
                  { icon: "Briefcase", label: "Услуги" },
                  { icon: "Building2", label: "Недвижимость" },
                  { icon: "Heart", label: "Медицина" },
                  { icon: "BookOpen", label: "Образование" },
                  { icon: "TrendingUp", label: "B2B продажи" },
                  { icon: "Wrench", label: "Сервис" },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className={`rounded-2xl p-4 text-center ${darkCardHover}`} style={darkCard}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2.5"
                      style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <Icon name={item.icon} size={16} className="text-violet-400" />
                    </div>
                    <div className="text-[11px] font-semibold text-gray-400 leading-tight">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ PRODUCTS ═══ */}
        <section id="products" className="py-24 px-5 border-t border-violet-900/20">
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-violet-300 uppercase tracking-widest mb-4"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}>
                  Наши продукты
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-3">Инструменты для роста</h2>
                <p className="text-gray-500 text-[14px] max-w-xl mx-auto">Подключайте отдельно или в связке — каждый продукт решает конкретную задачу</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {
                    tag: "Аналитика",
                    color: "#a855f7",
                    icon: "BarChart2",
                    title: "Онлайн-платформа для оценки эффективности отдела продаж и отдела сервиса",
                    subtitle: "С помощью неё вы автоматизируете отдел качества вашей компании",
                    features: [
                      "Показывает эффективность менеджеров в цифрах и обучает их",
                      "Находит зоны роста для каждого менеджера и всего отдела в целом",
                      "Упрощает и ускоряет работу руководителя отдела продаж до 10 раз",
                    ],
                    price: "от 2 500 ₽ / мес",
                    promo: "Неделя бесплатно",
                    promoColor: "#22c55e",
                  },
                  {
                    tag: "Колл-центр",
                    color: "#60a5fa",
                    icon: "PhoneCall",
                    title: "Удаленный колл-центр с живыми операторами",
                    subtitle: null,
                    features: [
                      "Наши операторы приветствуют клиентов вашей компании точно так же, как ваши собственные сотрудники",
                      "Даем первичную консультацию, помогаем, чтобы клиенты не ушли к конкурентам",
                      "Оплата за фактическую работу",
                    ],
                    price: "от 6 900 ₽ / мес",
                    promo: "1-ый месяц за 1490 ₽",
                    promoColor: "#22c55e",
                  },
                  {
                    tag: "WhatsApp",
                    color: "#34d399",
                    icon: "MessageCircle",
                    title: "Виджет для переписки в WhatsApp из АМО и Битрикс24",
                    subtitle: null,
                    features: [
                      "Помогают видеть, о чем общаются сотрудники с клиентом",
                      "Несколько сотрудников могут работать с одним WA-номером",
                    ],
                    price: "от 1 950 ₽ / мес",
                    promo: "3 дня бесплатно",
                    promoColor: "#22c55e",
                  },
                  {
                    tag: "Безопасность",
                    color: "#f59e0b",
                    icon: "Lock",
                    title: "Сервис для шифрования номеров телефонов в АМО и Битрикс24",
                    subtitle: null,
                    features: [
                      "Меняем реальные телефонные номера до попадания их в CRM-систему",
                      "Сотрудники не смогут увести базу, потому что не видят реальных номеров, при этом могут переписываться и созваниваться с клиентами",
                    ],
                    price: "от 60 000 ₽ / мес",
                    promo: null,
                    promoColor: null,
                  },
                ].map((product, i) => (
                  <motion.div key={i} variants={fadeUp}
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(124,58,237,0.18)", backdropFilter: "blur(12px)" }}>

                    {/* Top accent bar */}
                    <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${product.color}, transparent)` }} />

                    <div className="p-6 flex flex-col flex-1">
                      {/* Tag + icon */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: `${product.color}14`, border: `1px solid ${product.color}30`, color: product.color }}>
                          <Icon name={product.icon} size={11} />
                          {product.tag}
                        </div>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: `${product.color}12`, border: `1px solid ${product.color}25` }}>
                          <Icon name={product.icon} size={16} style={{ color: product.color }} />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-[16px] font-bold text-white leading-snug mb-2">{product.title}</h3>
                      {product.subtitle && (
                        <p className="text-[12px] mb-3" style={{ color: product.color }}>{product.subtitle}</p>
                      )}

                      {/* Features */}
                      <ul className="space-y-2 mb-6 flex-1">
                        {product.features.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-2 text-[12px] text-gray-400 leading-relaxed">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{ background: `${product.color}18` }}>
                              <Icon name="Check" size={9} style={{ color: product.color }} />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* Price row */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[18px] font-black text-white">{product.price}</span>
                        {product.promo && (
                          <span className="px-3 py-1 rounded-lg text-[11px] font-bold text-white"
                            style={{ background: product.promoColor! }}>
                            {product.promo}
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <button className="w-full py-3 rounded-xl text-[13px] font-bold transition-all duration-200 hover:opacity-90"
                        style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", color: "#c4b5fd" }}>
                        Подробнее
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-24 px-5">
          <div className="max-w-3xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-10">
                <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight">Частые вопросы</h2>
              </motion.div>
              <div className="space-y-2">
                {[
                  { q: "Какую CRM вы внедряете?", a: "Работаем с Bitrix24 и AmoCRM. Выбор зависит от специфики бизнеса, размера команды и задач. На консультации поможем определиться." },
                  { q: "Можно ли подключить WhatsApp к CRM официально?", a: "Да. Используем официальный WhatsApp Business API. Легальный способ без риска блокировок. Переписки ведутся прямо из CRM." },
                  { q: "Сколько времени занимает внедрение?", a: "Базовое внедрение CRM — от 5 рабочих дней. Комплексный проект с интеграциями и обучением — 2–4 недели." },
                  { q: "Сколько стоит внедрение?", a: "Стоимость от 30 000 ₽ за базовую настройку. Точную цену озвучиваем после аудита — без скрытых платежей. Первый разбор бесплатно." },
                  { q: "Есть ли поддержка после внедрения?", a: "Рекомендуем, но не навязываем. После передачи проекта вы получаете инструкции и обученную команду. Поддержку подключаете по желанию." },
                  { q: "Работаете с существующей CRM?", a: "Да. Если CRM уже есть, но настроена хаотично — аудируем и дорабатываем под ваши процессы." },
                ].map((faq, i) => (
                  <motion.div key={i} variants={fadeUp}
                    className="rounded-xl overflow-hidden cursor-pointer group"
                    style={darkCard}
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                    <div className="flex items-center justify-between px-5 py-4">
                      <span className="text-[14px] font-semibold text-white pr-4 group-hover:text-violet-300 transition-colors">{faq.q}</span>
                      <Icon name={faqOpen === i ? "ChevronUp" : "ChevronDown"} size={16} className="text-violet-500 shrink-0" />
                    </div>
                    {faqOpen === i && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-4">
                        <p className="text-[13px] text-gray-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section id="cta" className="py-24 px-5">
          <div className="max-w-4xl mx-auto">
            <Section>
              <motion.div variants={fadeUp}
                className="relative rounded-3xl p-8 lg:p-12 text-center overflow-hidden"
                style={{ background: "rgba(12,10,28,0.95)", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 0 60px rgba(124,58,237,0.15)" }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 60%)" }} />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-violet-300 uppercase tracking-widest mb-5"
                    style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)" }}>
                    Бесплатно
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
                    Получите бесплатный разбор CRM и продаж
                  </h2>
                  <p className="text-gray-400 mb-8 max-w-xl mx-auto text-[14px]">
                    Расскажем, что мешает вашим продажам расти, и покажем как исправить. Без продаж в лоб.
                  </p>
                  <form id="contacts" className="max-w-xl mx-auto space-y-3" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input type="text" placeholder="Ваше имя" required
                        className="w-full px-4 py-3 rounded-xl text-[14px] text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(124,58,237,0.25)" }} />
                      <input type="tel" placeholder="Телефон" required
                        className="w-full px-4 py-3 rounded-xl text-[14px] text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(124,58,237,0.25)" }} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <select className="w-full px-4 py-3 rounded-xl text-[14px] text-gray-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all appearance-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(124,58,237,0.25)" }}>
                        <option value="">Мессенджер</option>
                        <option>WhatsApp</option>
                        <option>Telegram</option>
                        <option>Позвоните мне</option>
                      </select>
                      <select className="w-full px-4 py-3 rounded-xl text-[14px] text-gray-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all appearance-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(124,58,237,0.25)" }}>
                        <option value="">Ваша CRM</option>
                        <option>Bitrix24</option>
                        <option>AmoCRM</option>
                        <option>Другая</option>
                        <option>Нет CRM</option>
                      </select>
                    </div>
                    <button type="submit"
                      className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white transition-all duration-200 hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
                      Получить бесплатный разбор
                    </button>
                    <p className="text-[11px] text-gray-700">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
                  </form>
                </div>
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="py-10 px-5 border-t border-violet-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                  <Icon name="Waves" size={14} className="text-white" />
                </div>
                <span className="text-[14px] font-black text-white">SALES<span className="text-violet-400">FLOW</span></span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
                {["Услуги", "Кейсы", "Тарифы", "Контакты"].map((link) => (
                  <a key={link} href="#" className="text-[12px] text-gray-600 hover:text-gray-300 transition-colors">{link}</a>
                ))}
              </div>
              <p className="text-[11px] text-gray-700">© 2025 SalesFlow. Все права защищены.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* ═══ FLOATING CTA ═══ */}
      <motion.a
        href="#cta"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 28px rgba(124,58,237,0.55)" }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        whileTap={{ scale: 0.95 }}>
        <Icon name="MessageCircle" size={16} />
        Запросить демо
      </motion.a>
    </div>
  )
}

export default HomePage