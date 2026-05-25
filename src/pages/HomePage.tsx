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

const h3Style = {
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

const badgeStyle = {
  background: "transparent",
  border: "1px solid rgba(194,165,122,0.3)",
  color: "#C2A57A",
  fontSize: "10px",
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  fontFamily: "Inter, sans-serif",
  padding: "4px 12px",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
      <div style={{ width: "32px", height: "1px", background: "#C2A57A", opacity: 0.5 }} />
      <span style={labelStyle}>{label}</span>
    </div>
  );
}

export function HomePage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
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
                <div style={{ width: "40px", height: "1px", background: "#C2A57A", opacity: 0.6 }} />
                <span style={labelStyle}>AI-платформа для роста продаж</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl lg:text-[66px] leading-[1.05] mb-7"
                style={{
                  fontFamily: '"Bodoni Moda", Georgia, serif',
                  fontWeight: 400,
                  color: "#E7DED4",
                  letterSpacing: "0.01em",
                }}
              >
                Превращаем
                <br />
                разговоры{" "}
                <span
                  style={{
                    color: "#C2A57A",
                    fontStyle: "italic",
                  }}
                >
                  в деньги
                </span>
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
                <a
                  href="#"
                  className="inline-flex items-center gap-2.5"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(194,165,122,0.35)",
                    color: "#E7DED4",
                    borderRadius: "2px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    letterSpacing: "0.05em",
                    fontSize: "13px",
                    padding: "12px 24px",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={iconBox}
                  >
                    <Icon name="Play" size={11} className="ml-0.5" style={{ color: "#C2A57A" }} />
                  </div>
                  Смотреть видео
                  <span style={{ fontSize: "11px", opacity: 0.5 }}>2 мин</span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══ METRICS STRIPE ═══ */}
        <section
          className="relative py-16 px-5 overflow-hidden"
          style={{ borderTop: "1px solid rgba(194,165,122,0.1)", borderBottom: "1px solid rgba(194,165,122,0.1)", background: "#1A1916" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-10">
              <div style={{ width: "40px", height: "1px", background: "#C2A57A", opacity: 0.4 }} />
              <span style={labelStyle}>Результаты клиентов</span>
              <div style={{ width: "40px", height: "1px", background: "#C2A57A", opacity: 0.4 }} />
            </div>
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
                      <div style={{ ...labelStyle, fontSize: "11px", letterSpacing: "0.1em", color: "rgba(194,165,122,0.6)", textTransform: "none" }}>
                        {item.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ PROBLEMS ═══ */}
        <section className="py-24 px-5" style={{ background: "#151513" }}>
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-14">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div style={{ width: "32px", height: "1px", background: "#C2A57A", opacity: 0.5 }} />
                  <span style={labelStyle}>Знакомые ситуации?</span>
                  <div style={{ width: "32px", height: "1px", background: "#C2A57A", opacity: 0.5 }} />
                </div>
                <h2
                  className="text-3xl lg:text-5xl mb-4"
                  style={h2Style}
                >
                  Эти проблемы
                  <br />
                  мешают продажам расти
                </h2>
                <p style={{ ...bodyText, fontSize: "14px", maxWidth: "480px", margin: "0 auto" }}>
                  Мы видели их у сотен компаний — и знаем, как решить
                </p>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: "AlertTriangle",
                    title: "Теряются заявки",
                    desc: "Лиды падают в почту, мессенджеры, звонки — менеджеры не успевают фиксировать всё",
                    color: "#f59e0b",
                  },
                  {
                    icon: "Clock",
                    title: "Долгие ответы",
                    desc: "Клиент написал в WhatsApp, ждёт час. За это время уже купил у конкурента",
                    color: "#ec4899",
                  },
                  {
                    icon: "Smartphone",
                    title: "Личные номера",
                    desc: "Когда менеджер уходит — уходит и база. Переписок нет, звонков нет",
                    color: "#C2A57A",
                  },
                  {
                    icon: "EyeOff",
                    title: "Нет контроля",
                    desc: "Что говорят менеджеры на звонках? Как ведут переговоры? Непрозрачно",
                    color: "#60a5fa",
                  },
                  {
                    icon: "Database",
                    title: "CRM используется хаотично",
                    desc: "Часть сделок в CRM, часть в таблицах, часть только в голове менеджера",
                    color: "#34d399",
                  },
                  {
                    icon: "BarChart2",
                    title: "Нет аналитики",
                    desc: "Непонятно, какой канал приводит клиентов. Деньги в рекламу вложены — результата не видно",
                    color: "#fb923c",
                  },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`rounded-2xl p-5 ${cardHover}`}
                    style={card}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: `${p.color}14`,
                        border: `1px solid ${p.color}30`,
                      }}
                    >
                      <Icon
                        name={p.icon}
                        size={20}
                        style={{ color: p.color }}
                      />
                    </div>
                    <h3
                      className="text-[15px] mb-2"
                      style={{ ...h3Style, fontSize: "15px" }}
                    >
                      {p.title}
                    </h3>
                    <p style={{ ...bodyText, fontSize: "13px" }}>
                      {p.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ SOLUTIONS ═══ */}
        <section id="services" className="py-24 px-5" style={{ background: "#151513" }}>
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div
                variants={fadeUp}
                className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14"
              >
                <div>
                  <SectionLabel label="Наши решения" />
                  <h2
                    className="text-3xl lg:text-5xl"
                    style={h2Style}
                  >
                    Всё для системных продаж
                  </h2>
                </div>
                <p style={{ ...bodyText, fontSize: "14px", maxWidth: "320px", marginTop: "16px" }}>
                  Внедряем комплексно или по шагам — в зависимости от задач
                  вашего бизнеса
                </p>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: "Database",
                    title: "Внедрение CRM",
                    desc: "Bitrix24 и AmoCRM под ваши процессы, а не «из коробки»",
                  },
                  {
                    icon: "MessageCircle",
                    title: "WhatsApp в CRM",
                    desc: "Все переписки в одном окне. История сохраняется в карточке",
                  },
                  {
                    icon: "Phone",
                    title: "Телефония",
                    desc: "Виртуальная АТС, запись звонков, контроль разговоров",
                  },
                  {
                    icon: "BarChart3",
                    title: "Аналитика продаж",
                    desc: "Дашборды по менеджерам, воронке и каналам в реальном времени",
                  },
                  {
                    icon: "Zap",
                    title: "Автоматизация",
                    desc: "Задачи, уведомления, шаблоны — убираем рутину из работы",
                  },
                  {
                    icon: "Mic",
                    title: "Анализ звонков AI",
                    desc: "Оцениваем каждый разговор. Находим точки роста конверсии",
                  },
                  {
                    icon: "Lock",
                    title: "Защита базы",
                    desc: "Клиентская база остаётся у компании при любых условиях",
                  },
                  {
                    icon: "Headphones",
                    title: "Сопровождение",
                    desc: "Поддержка и доработки после внедрения без ограничений",
                  },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`group rounded-2xl p-5 ${cardHover}`}
                    style={card}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={iconBox}
                    >
                      <Icon
                        name={s.icon}
                        size={20}
                        style={{ color: "#C2A57A" }}
                      />
                    </div>
                    <h3
                      className="mb-2"
                      style={{ ...h3Style, fontSize: "14px" }}
                    >
                      {s.title}
                    </h3>
                    <p style={{ ...bodyText, fontSize: "12px" }}>
                      {s.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ HOW WE WORK ═══ */}
        <section
          className="py-24 px-5"
          style={{
            borderTop: "1px solid rgba(231,222,212,0.08)",
            borderBottom: "1px solid rgba(231,222,212,0.08)",
            background: "#1A1916",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-14">
                <SectionLabel label="Процесс работы" />
                <h2
                  className="text-3xl lg:text-5xl mb-4"
                  style={h2Style}
                >
                  6 шагов от хаоса к системе
                </h2>
                <p style={{ ...bodyText, fontSize: "14px" }}>
                  Отработанный процесс внедрения — от аудита до результата
                </p>
              </motion.div>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                  {
                    num: "01",
                    icon: "Search",
                    title: "Аудит",
                    desc: "Изучаем процессы, инструменты и боли команды",
                  },
                  {
                    num: "02",
                    icon: "PenTool",
                    title: "Проект",
                    desc: "Архитектура CRM под ваши воронки продаж",
                  },
                  {
                    num: "03",
                    icon: "Settings",
                    title: "Настройка",
                    desc: "CRM, роли, поля, воронки, автоматизации",
                  },
                  {
                    num: "04",
                    icon: "GitMerge",
                    title: "Интеграции",
                    desc: "WhatsApp, телефония, сайт, реклама",
                  },
                  {
                    num: "05",
                    icon: "GraduationCap",
                    title: "Обучение",
                    desc: "Обучаем команду, готовим инструкции",
                  },
                  {
                    num: "06",
                    icon: "Headphones",
                    title: "Поддержка",
                    desc: "Сопровождаем, дорабатываем, консультируем",
                  },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`rounded-2xl p-4 text-center ${cardHover}`}
                    style={card}
                  >
                    <div
                      className="mb-3"
                      style={{
                        color: "#C2A57A",
                        fontFamily: '"Bodoni Moda", Georgia, serif',
                        fontSize: "13px",
                        letterSpacing: "0.15em",
                        fontWeight: 400,
                      }}
                    >
                      {step.num}
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={iconBox}
                    >
                      <Icon
                        name={step.icon}
                        size={16}
                        style={{ color: "#C2A57A" }}
                      />
                    </div>
                    <div
                      className="text-[12px] mb-1.5"
                      style={{ ...h3Style, fontSize: "12px" }}
                    >
                      {step.title}
                    </div>
                    <div style={{ ...bodyText, fontSize: "10px" }}>
                      {step.desc}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ CASES ═══ */}
        <section id="cases" className="py-24 px-5" style={{ background: "#151513" }}>
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-14">
                <SectionLabel label="Кейсы клиентов" />
                <h2
                  className="text-3xl lg:text-5xl"
                  style={h2Style}
                >
                  Реальные цифры
                </h2>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {[
                  {
                    industry: "Недвижимость",
                    color: "#C2A57A",
                    before:
                      "Заявки терялись в 4 мессенджерах. Менеджеры с личных номеров. Нет понимания по каждому клиенту.",
                    action:
                      "Внедрили AmoCRM, подключили WhatsApp API, настроили автоворонки по этапам сделки.",
                    result:
                      "Время ответа: 2 ч → 7 мин. Конверсия в показ: +28%",
                  },
                  {
                    industry: "Медицинская клиника",
                    color: "#60a5fa",
                    before:
                      "Запись в таблицах. Напоминания не отправлялись. 30% пациентов не приходили.",
                    action:
                      "Настроили Bitrix24, телефонию и автоотправку напоминаний в WhatsApp за 24 ч до визита.",
                    result: "Неявки: 30% → 8%. Нагрузка администратора: -40%",
                  },
                  {
                    industry: "B2B оборудование",
                    color: "#34d399",
                    before:
                      "КП вручную. Сделки зависали неделями. Нет отчётности по менеджерам.",
                    action:
                      "Воронка с автозадачами, шаблонами КП и дашбордом руководителя в реальном времени.",
                    result:
                      "Цикл сделки: 45 → 18 дней. Выручка отдела: +22% за квартал",
                  },
                ].map((c, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="rounded-2xl overflow-hidden"
                    style={card}
                  >
                    <div
                      className="h-px w-full"
                      style={{
                        background: `linear-gradient(90deg, ${c.color}, transparent)`,
                      }}
                    />
                    <div className="p-6">
                      <div
                        className="mb-5"
                        style={{ ...labelStyle, color: c.color }}
                      >
                        {c.industry}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div style={{ ...labelStyle, color: "rgba(248,113,113,0.8)", marginBottom: "6px" }}>
                            Было
                          </div>
                          <p style={{ ...bodyText, fontSize: "12px" }}>
                            {c.before}
                          </p>
                        </div>
                        <div>
                          <div style={{ ...labelStyle, color: "rgba(96,165,250,0.8)", marginBottom: "6px" }}>
                            Что сделали
                          </div>
                          <p style={{ ...bodyText, fontSize: "12px" }}>
                            {c.action}
                          </p>
                        </div>
                        <div
                          className="rounded-xl p-3"
                          style={{
                            background: "#1E1916",
                            border: "1px solid rgba(194,165,122,0.18)",
                          }}
                        >
                          <div style={{ ...labelStyle, color: "rgba(52,211,153,0.8)", marginBottom: "6px" }}>
                            Результат
                          </div>
                          <p
                            style={{
                              fontFamily: '"Bodoni Moda", Georgia, serif',
                              fontWeight: 400,
                              fontSize: "13px",
                              color: "#E7DED4",
                              lineHeight: 1.6,
                            }}
                          >
                            {c.result}
                          </p>
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
        <section
          className="py-24 px-5"
          style={{ borderTop: "1px solid rgba(231,222,212,0.08)", background: "#1A1916" }}
        >
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-14">
                <SectionLabel label="Целевая аудитория" />
                <h2
                  className="text-3xl lg:text-5xl mb-4"
                  style={h2Style}
                >
                  Для кого
                </h2>
                <p style={{ ...bodyText, fontSize: "14px" }}>
                  Работаем с компаниями, у которых есть отдел продаж и задача
                  расти
                </p>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: "Building2",
                    title: "Малый бизнес",
                    desc: "2–10 менеджеров. Хаос растёт быстрее бизнеса. Нужна структура.",
                  },
                  {
                    icon: "TrendingUp",
                    title: "Растущий бизнес",
                    desc: "Масштабирование буксует без системы. CRM нужна уже вчера.",
                  },
                  {
                    icon: "Users",
                    title: "Отдел продаж 10+",
                    desc: "Нужны аналитика, контроль и прозрачность по каждому менеджеру.",
                  },
                  {
                    icon: "Home",
                    title: "Недвижимость",
                    desc: "Длинные сделки, много касаний, важна история общения.",
                  },
                  {
                    icon: "Heart",
                    title: "Медицина и здоровье",
                    desc: "Напоминания, запись, лояльность — всё в одном окне.",
                  },
                  {
                    icon: "Briefcase",
                    title: "B2B услуги",
                    desc: "Долгий цикл сделки требует системного ведения.",
                  },
                ].map((w, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`rounded-2xl p-5 ${cardHover}`}
                    style={card}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={iconBox}
                    >
                      <Icon
                        name={w.icon}
                        size={20}
                        style={{ color: "#C2A57A" }}
                      />
                    </div>
                    <h3
                      className="mb-2"
                      style={{ ...h3Style, fontSize: "14px" }}
                    >
                      {w.title}
                    </h3>
                    <p style={{ ...bodyText, fontSize: "12px" }}>
                      {w.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section id="pricing" className="py-24 px-5" style={{ background: "#151513" }}>
          <div className="max-w-7xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-14">
                <SectionLabel label="Продукты" />
                <h2
                  className="text-3xl lg:text-5xl mb-4"
                  style={h2Style}
                >
                  Продукты
                </h2>
                <p style={{ ...bodyText, fontSize: "14px" }}>
                  Инструменты для роста продаж и контроля команды
                </p>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {[
                  {
                    tag: "AI-анализ",
                    color: "#C2A57A",
                    icon: "Mic",
                    title: "Речевая аналитика звонков",
                    subtitle: "Анализируем 100% разговоров автоматически",
                    features: [
                      "Транскрипция и оценка каждого звонка",
                      "Выявление возражений и точек роста",
                      "Рейтинг менеджеров по качеству разговоров",
                    ],
                    price: "от 4 990 ₽ / мес",
                    promo: "7 дней бесплатно",
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
                    title:
                      "Сервис для шифрования номеров телефонов в АМО и Битрикс24",
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
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={card}
                  >
                    {/* Top accent bar */}
                    <div
                      className="h-px"
                      style={{
                        background: `linear-gradient(90deg, ${product.color}, transparent)`,
                      }}
                    />

                    <div className="p-6 flex flex-col flex-1">
                      {/* Tag + icon */}
                      <div className="flex items-center justify-between mb-5">
                        <div
                          style={{
                            ...badgeStyle,
                            color: product.color,
                            border: `1px solid ${product.color}40`,
                          }}
                        >
                          <Icon name={product.icon} size={11} />
                          {product.tag}
                        </div>
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{
                            background: `${product.color}12`,
                            border: `1px solid ${product.color}30`,
                          }}
                        >
                          <Icon
                            name={product.icon}
                            size={16}
                            style={{ color: product.color }}
                          />
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="leading-snug mb-2"
                        style={{ ...h3Style, fontSize: "15px" }}
                      >
                        {product.title}
                      </h3>
                      {product.subtitle && (
                        <p
                          className="text-[12px] mb-3"
                          style={{ color: product.color, fontFamily: "Inter, sans-serif", fontWeight: 300 }}
                        >
                          {product.subtitle}
                        </p>
                      )}

                      {/* Features */}
                      <ul className="space-y-2 mb-6 flex-1">
                        {product.features.map((f, fi) => (
                          <li
                            key={fi}
                            className="flex items-start gap-2"
                            style={{ ...bodyText, fontSize: "12px" }}
                          >
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{ background: `${product.color}18` }}
                            >
                              <Icon
                                name="Check"
                                size={9}
                                style={{ color: product.color }}
                              />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* Price row */}
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          style={{
                            fontFamily: '"Bodoni Moda", Georgia, serif',
                            fontWeight: 400,
                            fontSize: "20px",
                            color: "#E7DED4",
                            letterSpacing: "0.01em",
                          }}
                        >
                          {product.price}
                        </span>
                        {product.promo && (
                          <span
                            className="px-3 py-1 rounded-lg text-[11px] font-bold"
                            style={{ background: product.promoColor!, color: "#151513" }}
                          >
                            {product.promo}
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <button
                        className="w-full py-3 text-[13px] transition-all duration-200 hover:opacity-80"
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(194,165,122,0.35)",
                          color: "#E7DED4",
                          borderRadius: "2px",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          letterSpacing: "0.05em",
                        }}
                      >
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
        <section className="py-24 px-5" style={{ background: "#1A1916" }}>
          <div className="max-w-3xl mx-auto">
            <Section>
              <motion.div variants={fadeUp} className="text-center mb-12">
                <SectionLabel label="Вопросы и ответы" />
                <h2
                  className="text-3xl lg:text-5xl"
                  style={h2Style}
                >
                  Частые вопросы
                </h2>
              </motion.div>
              <div className="space-y-2">
                {[
                  {
                    q: "Какую CRM вы внедряете?",
                    a: "Работаем с Bitrix24 и AmoCRM. Выбор зависит от специфики бизнеса, размера команды и задач. На консультации поможем определиться.",
                  },
                  {
                    q: "Можно ли подключить WhatsApp к CRM официально?",
                    a: "Да. Используем официальный WhatsApp Business API. Легальный способ без риска блокировок. Переписки ведутся прямо из CRM.",
                  },
                  {
                    q: "Сколько времени занимает внедрение?",
                    a: "Базовое внедрение CRM — от 5 рабочих дней. Комплексный проект с интеграциями и обучением — 2–4 недели.",
                  },
                  {
                    q: "Сколько стоит внедрение?",
                    a: "Стоимость от 30 000 ₽ за базовую настройку. Точную цену озвучиваем после аудита — без скрытых платежей. Первый разбор бесплатно.",
                  },
                  {
                    q: "Есть ли поддержка после внедрения?",
                    a: "Рекомендуем, но не навязываем. После передачи проекта вы получаете инструкции и обученную команду. Поддержку подключаете по желанию.",
                  },
                  {
                    q: "Работаете с существующей CRM?",
                    a: "Да. Если CRM уже есть, но настроена хаотично — аудируем и дорабатываем под ваши процессы.",
                  },
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="rounded-xl overflow-hidden cursor-pointer"
                    style={card}
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  >
                    <div className="flex items-center justify-between px-5 py-4">
                      <span
                        className="text-[14px] pr-4"
                        style={{ color: "#E7DED4", fontFamily: "Inter, sans-serif", fontWeight: 400 }}
                      >
                        {faq.q}
                      </span>
                      <Icon
                        name={faqOpen === i ? "ChevronUp" : "ChevronDown"}
                        size={15}
                        style={{ color: "#C2A57A" }}
                        className="shrink-0"
                      />
                    </div>
                    {faqOpen === i && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-5 pb-4"
                      >
                        <div style={{ width: "100%", height: "1px", background: "rgba(194,165,122,0.12)", marginBottom: "12px" }} />
                        <p style={{ ...bodyText, fontSize: "13px" }}>
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section id="cta" className="py-24 px-5" style={{ background: "#151513" }}>
          <div className="max-w-4xl mx-auto">
            <Section>
              <motion.div
                variants={fadeUp}
                className="relative rounded-3xl p-8 lg:p-14 text-center overflow-hidden"
                style={{
                  background: "#1E1916",
                  border: "1px solid rgba(194,165,122,0.18)",
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, rgba(194,165,122,0.06) 0%, transparent 65%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-center gap-3 mb-5">
                    <div style={{ width: "32px", height: "1px", background: "#C2A57A", opacity: 0.5 }} />
                    <span style={labelStyle}>Бесплатно</span>
                    <div style={{ width: "32px", height: "1px", background: "#C2A57A", opacity: 0.5 }} />
                  </div>
                  <h2
                    className="text-3xl lg:text-4xl mb-4"
                    style={h2Style}
                  >
                    Получите бесплатный разбор CRM и продаж
                  </h2>
                  <p style={{ ...bodyText, fontSize: "14px", maxWidth: "480px", margin: "0 auto 32px" }}>
                    Расскажем, что мешает вашим продажам расти, и покажем как
                    исправить. Без продаж в лоб.
                  </p>
                  <form
                    id="contacts"
                    className="max-w-xl mx-auto space-y-3"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Ваше имя"
                        required
                        className="w-full px-4 py-3 rounded-xl text-[14px] placeholder-gray-600 outline-none transition-all"
                        style={{
                          background: "rgba(194,165,122,0.04)",
                          border: "1px solid rgba(194,165,122,0.18)",
                          color: "#E7DED4",
                          fontFamily: "Inter, sans-serif",
                        }}
                      />
                      <input
                        type="tel"
                        placeholder="Телефон"
                        required
                        className="w-full px-4 py-3 rounded-xl text-[14px] placeholder-gray-600 outline-none transition-all"
                        style={{
                          background: "rgba(194,165,122,0.04)",
                          border: "1px solid rgba(194,165,122,0.18)",
                          color: "#E7DED4",
                          fontFamily: "Inter, sans-serif",
                        }}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <select
                        className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all appearance-none"
                        style={{
                          background: "rgba(194,165,122,0.04)",
                          border: "1px solid rgba(194,165,122,0.18)",
                          color: "rgba(231,222,212,0.5)",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        <option value="">Мессенджер</option>
                        <option>WhatsApp</option>
                        <option>Telegram</option>
                        <option>Позвоните мне</option>
                      </select>
                      <select
                        className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all appearance-none"
                        style={{
                          background: "rgba(194,165,122,0.04)",
                          border: "1px solid rgba(194,165,122,0.18)",
                          color: "rgba(231,222,212,0.5)",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        <option value="">Ваша CRM</option>
                        <option>Bitrix24</option>
                        <option>AmoCRM</option>
                        <option>Другая</option>
                        <option>Нет CRM</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full transition-all duration-200 hover:opacity-85"
                      style={{
                        background: "#C2A57A",
                        color: "#151513",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        letterSpacing: "0.08em",
                        fontSize: "13px",
                        padding: "14px 28px",
                        border: "none",
                        borderRadius: "2px",
                      }}
                    >
                      Получить бесплатный разбор
                    </button>
                    <p style={{ ...bodyText, fontSize: "11px", opacity: 0.5 }}>
                      Нажимая кнопку, вы соглашаетесь с политикой
                      конфиденциальности
                    </p>
                  </form>
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
