import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import Icon from "@/components/ui/icon";

const GOLD_GRADIENT =
  "linear-gradient(160deg, #E8CC9A 0%, #D3B076 30%, #B8904A 55%, #D3B076 75%, #E8CC9A 100%)";

export default function ThankYouPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden px-5"
      style={{ background: "#151513", minHeight: "100vh" }}
    >
      {/* ambient golden glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(760px, 90vw)",
          height: "560px",
          background:
            "radial-gradient(ellipse at center, rgba(200,169,106,0.1), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center text-center"
        style={{ maxWidth: "620px" }}
      >
        {/* check icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center"
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            background: GOLD_GRADIENT,
            marginBottom: "34px",
            boxShadow: "0 10px 40px rgba(180,130,50,0.45)",
          }}
        >
          <Icon name="Check" size={42} color="#1E1500" />
        </motion.div>

        {/* label */}
        <div
          className="flex items-center gap-3"
          style={{ marginBottom: "18px" }}
        >
          <div
            style={{ width: "34px", height: "1px", background: "#D4B074", opacity: 0.5 }}
          />
          <span
            style={{
              color: "#D4B074",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Заявка принята
          </span>
          <div
            style={{ width: "34px", height: "1px", background: "#D4B074", opacity: 0.5 }}
          />
        </div>

        <h1
          style={{
            fontFamily: '"Bodoni Moda", Georgia, serif',
            fontWeight: 400,
            color: "#FBF6EC",
            fontSize: "clamp(34px, 6vw, 52px)",
            lineHeight: 1.15,
            letterSpacing: "0.01em",
            marginBottom: "22px",
          }}
        >
          Спасибо за{" "}
          <span
            style={{
              background: "linear-gradient(105deg, #E9D29A, #C8A96A 45%, #9C7C3E)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontStyle: "italic",
            }}
          >
            заявку
          </span>
        </h1>

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            color: "rgba(251,246,236,0.7)",
            fontWeight: 300,
            fontSize: "clamp(16px, 2vw, 19px)",
            lineHeight: 1.7,
            maxWidth: "480px",
            marginBottom: "42px",
          }}
        >
          Мы получили вашу заявку. Наши менеджеры свяжутся с вами как можно
          скорее и покажут, как ИИ контролирует ваши продажи.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2"
          style={{
            background: GOLD_GRADIENT,
            color: "#1E1500",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.06em",
            fontSize: "16px",
            padding: "15px 38px",
            borderRadius: "3px",
            boxShadow:
              "0 4px 18px rgba(180,130,50,0.3), inset 0 1px 0 rgba(255,240,190,0.4)",
            transition: "box-shadow 0.25s ease, transform 0.25s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              "0 6px 24px rgba(180,130,50,0.5), inset 0 1px 0 rgba(255,240,190,0.4)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              "0 4px 18px rgba(180,130,50,0.3), inset 0 1px 0 rgba(255,240,190,0.4)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
          }}
        >
          <Icon name="ArrowLeft" size={17} />
          Вернуться на главную
        </Link>
      </motion.div>
    </div>
  );
}
