import { motion } from "framer-motion";
import Icon from "@/components/ui/icon";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const h2Style = {
  fontFamily: '"Bodoni Moda", Georgia, serif',
  fontWeight: 400,
  color: "#FBF6EC",
  letterSpacing: "0.01em",
};

export interface LegalBlock {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export default function LegalLayout({
  label,
  title,
  updated,
  blocks,
}: {
  label: string;
  title: string;
  updated: string;
  blocks: LegalBlock[];
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "#151513", minHeight: "100vh" }}>
      {/* ─── NAVBAR ─── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="border-b" style={{ background: "rgba(21,21,19,0.95)", borderColor: "rgba(212,176,116,0.12)" }}>
          <div className="max-w-7xl mx-auto px-5 py-3 flex items-center">
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
                <span style={{ fontWeight: 400, fontSize: "1.25em", margin: "0 0.02em", verticalAlign: "-0.04em" }}>–</span>
                TEC
              </span>
            </Link>

            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-2 text-[14px]"
              style={{ color: "rgba(251,246,236,0.85)", fontFamily: "Inter, sans-serif", fontWeight: 400 }}
            >
              <Icon name="ArrowLeft" size={16} style={{ color: "#D4B074" }} />
              На главную
            </Link>
          </div>
        </div>
      </header>

      {/* ─── CONTENT ─── */}
      <section style={{ padding: "150px 24px 90px", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
            width: "min(700px,90vw)", height: "420px",
            background: "radial-gradient(ellipse at center, rgba(200,169,106,0.06), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="max-w-3xl mx-auto" style={{ position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: "32px", height: "1px", background: "#D4B074", opacity: 0.5 }} />
              <span
                style={{
                  color: "#D4B074", fontSize: "10px", fontWeight: 500, letterSpacing: "0.2em",
                  textTransform: "uppercase", fontFamily: "Inter, sans-serif",
                }}
              >
                {label}
              </span>
            </div>
            <h1 style={{ ...h2Style, fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1.15, marginBottom: "16px" }}>
              {title}
            </h1>
            <div
              style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(251,246,236,0.4)", marginBottom: "48px" }}
            >
              Последнее обновление: {updated}
            </div>
          </motion.div>

          {blocks.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.05 }}
              style={{ marginBottom: "36px" }}
            >
              {b.heading && (
                <h2 style={{ ...h2Style, fontSize: "22px", marginBottom: "14px" }}>{b.heading}</h2>
              )}
              {b.paragraphs?.map((p, j) => (
                <p
                  key={j}
                  style={{
                    fontFamily: "Inter, sans-serif", fontSize: "16px", color: "rgba(251,246,236,0.75)",
                    fontWeight: 300, lineHeight: 1.75, marginBottom: "14px",
                  }}
                >
                  {p}
                </p>
              ))}
              {b.list && (
                <ul style={{ margin: "6px 0 0", paddingLeft: "0", listStyle: "none" }}>
                  {b.list.map((li, k) => (
                    <li
                      key={k}
                      style={{
                        position: "relative", paddingLeft: "22px", marginBottom: "10px",
                        fontFamily: "Inter, sans-serif", fontSize: "16px", color: "rgba(251,246,236,0.75)",
                        fontWeight: 300, lineHeight: 1.7,
                      }}
                    >
                      <span style={{ position: "absolute", left: 0, top: "9px", width: "6px", height: "6px", borderRadius: "50%", background: "#D4B074" }} />
                      {li}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-5" style={{ borderTop: "1px solid rgba(212,176,116,0.1)", background: "#151513" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src="https://cdn.poehali.dev/projects/37dcdff6-620e-46de-9c90-6860a1bec235/bucket/62948951-d238-4d48-9ff6-c147d4136a6c.png"
                alt="VOICE-TEC"
                className="w-9 h-9 object-contain"
              />
              <span style={{ fontFamily: '"Bodoni Moda", Georgia, serif', fontWeight: 400, fontSize: "14px", letterSpacing: "0.08em", color: "#FBF6EC" }}>
                VOICE<span style={{ color: "#D4B074" }}>-TEC</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              <Link to="/user-agreement" className="text-[12px] transition-colors" style={{ color: "rgba(251,246,236,0.7)", fontFamily: "Inter, sans-serif", fontWeight: 300 }}>
                Пользовательское соглашение
              </Link>
              <Link to="/privacy" className="text-[12px] transition-colors" style={{ color: "rgba(251,246,236,0.7)", fontFamily: "Inter, sans-serif", fontWeight: 300 }}>
                Политика конфиденциальности
              </Link>
            </div>
            <p style={{ fontSize: "11px", color: "rgba(251,246,236,0.3)", fontFamily: "Inter, sans-serif" }}>
              © 2026 VOICE-TEC AI. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
