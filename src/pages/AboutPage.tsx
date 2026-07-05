import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const h2Style = {
  fontFamily: '"Bodoni Moda", Georgia, serif',
  fontWeight: 400,
  color: "#FBF6EC",
  letterSpacing: "0.01em",
};
const bodyText = {
  color: "rgba(251,246,236,0.75)",
  fontWeight: 300,
  lineHeight: 1.75,
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

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <div style={{ width: "32px", height: "1px", background: "#D4B074", opacity: 0.5 }} />
      <span style={labelStyle}>{text}</span>
      <div style={{ width: "32px", height: "1px", background: "#D4B074", opacity: 0.5 }} />
    </div>
  );
}

function AnimSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

const team = [
  {
    name: "Алексей Морозов",
    role: "CEO & Co-founder",
    icon: "User",
    desc: "10 лет в B2B-продажах. Видел, как компании теряют миллионы из-за слепых зон в звонках. Решил это исправить.",
    tags: ["B2B Sales", "Product", "Strategy"],
  },
  {
    name: "Дмитрий Козлов",
    role: "CTO & Co-founder",
    icon: "Code",
    desc: "Бывший ML-инженер Яндекса. Строил системы распознавания речи для enterprise. Теперь применяет это для роста продаж.",
    tags: ["AI / ML", "NLP", "Architecture"],
  },
  {
    name: "Мария Светлова",
    role: "Head of Product",
    icon: "Layers",
    desc: "Продукт-менеджер с опытом в SaaS. Превращает сложные AI-инсайты в простые и понятные отчёты для руководителей.",
    tags: ["Product Design", "UX", "SaaS"],
  },
  {
    name: "Иван Петров",
    role: "Head of Customer Success",
    icon: "Handshake",
    desc: "Помогает клиентам внедрить Voice-Tec без боли. Лично провёл онбординг для 50+ отделов продаж.",
    tags: ["Onboarding", "CRM", "Analytics"],
  },
];

const values = [
  { icon: "Target", title: "Результат, не функции", desc: "Нам не интересно продавать набор кнопок. Нам важно, чтобы ваша выручка выросла. Каждое решение мы принимаем через этот фильтр." },
  { icon: "Eye", title: "Прозрачность данных", desc: "AI-аналитика должна быть понятной. Мы не прячем логику за чёрным ящиком - каждый вывод объяснён и подкреплён конкретным моментом звонка." },
  { icon: "Zap", title: "Скорость внедрения", desc: "Подключение за 5 минут - не маркетинговое обещание, а технический факт. Никаких месяцев интеграции и дорогих консультантов." },
  { icon: "Shield", title: "Безопасность прежде всего", desc: "Все записи звонков обрабатываются в защищённой среде. Мы соответствуем требованиям 152-ФЗ и никогда не передаём данные третьим лицам." },
];

const milestones = [
  { year: "2022", event: "Идея родилась из боли", desc: "Основатели столкнулись с проблемой: у руководителя продаж не было инструмента, чтобы понять, почему менеджеры теряют сделки." },
  { year: "2023", event: "Первый прототип", desc: "Собрали MVP за 3 месяца. Первые 5 клиентов дали обратную связь, которая полностью изменила продукт к лучшему." },
  { year: "2024", event: "Запуск и рост", desc: "Официальный запуск Voice-Tec. 100+ компаний подключились в первый год. Средний рост конверсии у клиентов - +23%." },
  { year: "2025", event: "Масштабирование", desc: "Новые модули: AI-коучинг, предиктивная аналитика, интеграции с CRM-системами. Команда выросла до 18 человек." },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#151513", minHeight: "100vh" }}>

      {/* ─── NAVBAR ─── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="border-b" style={{ background: "rgba(21,21,19,0.95)", borderColor: "rgba(212,176,116,0.12)" }}>
          <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/62948951-d238-4d48-9ff6-c147d4136a6c.png"
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
            </Link>

            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {[
                { label: "О нас", to: "/about" },
                { label: "Тарифы", to: "/#pricing" },
                { label: "FAQ", to: "/#faq" },
                { label: "Наша команда", to: "/about#team" },
              ].map((item) => (
                <Link key={item.label} to={item.to}
                  className="px-4 py-2 text-[16px] rounded-lg transition-all duration-200"
                  style={{ color: item.label === "О нас" ? "#D4B074" : "rgba(251,246,236,0.95)", fontFamily: "Inter, sans-serif", fontWeight: 400 }}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3 mr-5">
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(251,246,236,0.8)", fontWeight: 400, whiteSpace: "nowrap", lineHeight: 1.25, textAlign: "right" }}>
                Остались вопросы?<br />Напишите нам!
              </div>
              <Icon name="ArrowRight" size={18} style={{ color: "#D4B074" }} />
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" title="Telegram"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", marginTop: "-8px", marginBottom: "-8px", borderRadius: "8px", transition: "transform 0.2s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
              >
                <img src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/ec6abbd1-8802-405a-bc41-b51fb1533a67.png" alt="Telegram" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
              </a>
              <div style={{ width: "1px", height: "20px", background: "rgba(240,230,210,0.12)" }} />
            </div>

            <Link to="/#cta"
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
                boxShadow: "0 2px 10px rgba(180,130,50,0.25), inset 0 1px 0 rgba(255,240,190,0.4)",
              }}>
              Запросить демо
              <Icon name="ArrowRight" size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section style={{ paddingTop: "140px", paddingBottom: "100px", padding: "140px 24px 100px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "min(700px,90vw)", height: "500px", background: "radial-gradient(ellipse at center, rgba(200,169,106,0.07), transparent 70%)", pointerEvents: "none" }} />
        <div className="max-w-4xl mx-auto text-center" style={{ position: "relative" }}>
          <AnimSection>
            <motion.div variants={fadeUp}>
              <SectionLabel text="О компании" />
            </motion.div>
            <motion.img
              variants={fadeUp}
              src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/55554d4d-b45c-4cbf-b30c-26720d97d9ce.png"
              alt="VICE-TEC AI"
              style={{ width: "min(50vw, 620px)", height: "auto", margin: "12px auto 32px", display: "block" }}
            />
            <motion.h1 variants={fadeUp}
              style={{ ...h2Style, fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1.1, marginBottom: "28px" }}>
              Мы строим будущее<br />отделов продаж
            </motion.h1>
            <motion.p variants={fadeUp}
              style={{ ...bodyText, fontSize: "18px", maxWidth: "580px", margin: "0 auto 48px" }}>
              Voice-Tec - это команда инженеров, продуктовых дизайнеров и специалистов по продажам,
              объединённых одной целью: дать каждому бизнесу суперсилу видеть то, что происходит внутри звонков.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-10">
              {[
                { num: "100+", label: "Клиентов" },
                { num: "+23%", label: "Средний рост конверсии" },
                { num: "5 мин", label: "Время подключения" },
                { num: "2022", label: "Год основания" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "clamp(32px,4vw,48px)", color: "#D4B074", fontWeight: 400, lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(251,246,236,0.5)", marginTop: "6px", letterSpacing: "0.05em" }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </AnimSection>
        </div>
      </section>

      {/* ─── МИССИЯ ─── */}
      <section style={{ padding: "0 24px 100px" }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.2) 30%, rgba(200,169,106,0.2) 70%, transparent)", marginBottom: "80px" }} />
          <AnimSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div variants={fadeUp}><SectionLabel text="Наша миссия" /></motion.div>
                <motion.h2 variants={fadeUp} style={{ ...h2Style, fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.2, marginBottom: "24px" }}>
                  Каждый звонок -<br />это данные. Мы их читаем.
                </motion.h2>
                <motion.p variants={fadeUp} style={{ ...bodyText, fontSize: "16px", marginBottom: "20px" }}>
                  Ежедневно по всей России тысячи менеджеров проводят миллионы разговоров с клиентами.
                  Большинство из них остаются без анализа - руководитель просто не успевает всё прослушать.
                </motion.p>
                <motion.p variants={fadeUp} style={{ ...bodyText, fontSize: "16px", marginBottom: "20px" }}>
                  Мы убеждены: бизнес не должен управлять продажами вслепую. Каждый потерянный клиент -
                  это не просто неудача, это конкретный момент в разговоре, который можно найти, изучить и исправить.
                </motion.p>
                <motion.p variants={fadeUp} style={{ ...bodyText, fontSize: "16px" }}>
                  VOICE–TEC AI делает именно это - превращает звуковые волны в точные инсайты,
                  которые помогают командам продавать лучше каждый день.
                </motion.p>
              </div>
              <motion.div variants={fadeUp}>
                <div>
                  <div>
                    <img
                      src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/579ade31-6290-4309-b31c-415668de8fc8.png"
                      alt="Алексей Морозов"
                      style={{ width: "88%", maxWidth: "none", height: "auto", display: "block", margin: "0 auto" }}
                    />
                  </div>
                  <div style={{ position: "relative", marginTop: "-90px", background: "#0f0f0f", border: "1px solid rgba(240,230,210,0.18)", borderRadius: "20px", padding: "36px 40px" }}>
                    <div style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "22px", color: "#FBF6EC", fontWeight: 400, marginBottom: "24px", lineHeight: 1.4 }}>
                      "Мы не просто строим продукт. Мы исправляем системную проблему рынка."
                    </div>
                    <div>
                      <div style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#FBF6EC", fontWeight: 500 }}>Алексей Морозов</div>
                      <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(251,246,236,0.45)", marginTop: "2px" }}>CEO & Co-founder, VOICE–TEC AI</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ─── ЦЕННОСТИ ─── */}
      <section style={{ padding: "0 24px 100px" }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.2) 30%, rgba(200,169,106,0.2) 70%, transparent)", marginBottom: "80px" }} />
          <AnimSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <SectionLabel text="Наши ценности" />
              <h2 style={{ ...h2Style, fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.2 }}>
                Принципы, которые<br />определяют каждое решение
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((v) => (
                <motion.div key={v.title} variants={fadeUp}
                  style={{ background: "#0f0f0f", border: "1px solid rgba(240,230,210,0.15)", borderRadius: "16px", padding: "32px" }}>
                  <div style={{ width: "48px", height: "48px", background: "rgba(212,176,116,0.08)", border: "1px solid rgba(212,176,116,0.18)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                    <Icon name={v.icon} size={22} style={{ color: "#D4B074" }} />
                  </div>
                  <h3 style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "20px", color: "#FBF6EC", fontWeight: 400, marginBottom: "12px" }}>{v.title}</h3>
                  <p style={{ ...bodyText, fontSize: "14px" }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ─── КОМАНДА ─── */}
      <section id="team" style={{ padding: "0 24px 100px" }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.2) 30%, rgba(200,169,106,0.2) 70%, transparent)", marginBottom: "80px" }} />
          <AnimSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <SectionLabel text="Наша команда" />
              <h2 style={{ ...h2Style, fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.2, marginBottom: "16px" }}>
                Люди за продуктом
              </h2>
              <p style={{ ...bodyText, fontSize: "16px", maxWidth: "520px", margin: "0 auto" }}>
                Небольшая команда с большим опытом. Каждый из нас прошёл через боль,
                которую решает VOICE–TEC AI - на собственной шкуре.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {team.map((member) => (
                <motion.div key={member.name} variants={fadeUp}
                  style={{ background: "#0f0f0f", border: "1px solid rgba(240,230,210,0.15)", borderRadius: "16px", padding: "32px", display: "flex", gap: "20px" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(212,176,116,0.08)", border: "1px solid rgba(212,176,116,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={member.icon} size={26} style={{ color: "#D4B074" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "20px", color: "#FBF6EC", fontWeight: 400, marginBottom: "4px" }}>{member.name}</div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#D4B074", fontWeight: 500, letterSpacing: "0.08em", marginBottom: "14px" }}>{member.role}</div>
                    <p style={{ ...bodyText, fontSize: "14px", marginBottom: "16px" }}>{member.desc}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {member.tags.map((tag) => (
                        <span key={tag} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(212,176,116,0.8)", background: "rgba(212,176,116,0.08)", border: "1px solid rgba(212,176,116,0.15)", borderRadius: "4px", padding: "3px 10px", letterSpacing: "0.04em" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ─── ИСТОРИЯ ─── */}
      <section style={{ padding: "0 24px 100px" }}>
        <div className="max-w-4xl mx-auto">
          <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.2) 30%, rgba(200,169,106,0.2) 70%, transparent)", marginBottom: "80px" }} />
          <AnimSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <SectionLabel text="Наш путь" />
              <h2 style={{ ...h2Style, fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.2 }}>
                Как мы здесь оказались
              </h2>
            </motion.div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "24px", top: 0, bottom: 0, width: "1px", background: "linear-gradient(to bottom, transparent, rgba(212,176,116,0.3) 10%, rgba(212,176,116,0.3) 90%, transparent)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "48px", paddingLeft: "64px" }}>
                {milestones.map((m, i) => (
                  <motion.div key={m.year} variants={fadeUp} style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "-49px", top: "4px", width: "12px", height: "12px", borderRadius: "50%", background: "#D4B074", boxShadow: "0 0 12px rgba(212,176,116,0.5)" }} />
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#D4B074", fontWeight: 600, letterSpacing: "0.15em", marginBottom: "6px" }}>{m.year}</div>
                    <h3 style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontSize: "22px", color: "#FBF6EC", fontWeight: 400, marginBottom: "10px" }}>{m.event}</h3>
                    <p style={{ ...bodyText, fontSize: "15px" }}>{m.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="cta" style={{ padding: "0 24px 120px" }}>
        <div className="max-w-3xl mx-auto">
          <div style={{ width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(200,169,106,0.2) 30%, rgba(200,169,106,0.2) 70%, transparent)", marginBottom: "80px" }} />
          <AnimSection>
            <motion.div variants={fadeUp}
              style={{ background: "#0f0f0f", border: "1px solid rgba(240,230,210,0.18)", borderRadius: "24px", padding: "60px 48px", textAlign: "center" }}>
              <SectionLabel text="Начать работу" />
              <h2 style={{ ...h2Style, fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.2, marginBottom: "20px" }}>
                Готовы увидеть,<br />где теряется выручка?
              </h2>
              <p style={{ ...bodyText, fontSize: "16px", maxWidth: "460px", margin: "0 auto 36px" }}>
                Подключите VOICE–TEC AI за 5 минут и получите первые инсайты уже сегодня.
                Бесплатный аудит для новых клиентов.
              </p>
              <Link to="/#cta"
                className="inline-flex items-center gap-2"
                style={{
                  background: "linear-gradient(160deg, #E8CC9A 0%, #D3B076 30%, #B8904A 55%, #D3B076 75%, #E8CC9A 100%)",
                  color: "#1E1500",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  fontSize: "14px",
                  padding: "14px 32px",
                  borderRadius: "2px",
                  boxShadow: "0 4px 18px rgba(180,130,50,0.3), inset 0 1px 0 rgba(255,240,190,0.4)",
                }}>
                Запросить демо
                <Icon name="ArrowRight" size={15} />
              </Link>
            </motion.div>
          </AnimSection>
        </div>
      </section>

      {/* Floating CTA */}
      <Link to="/#cta"
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
        }}>
        <Icon name="MessageCircle" size={15} />
        Запросить демо
      </Link>

    </div>
  );
}