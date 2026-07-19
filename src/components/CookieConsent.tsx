import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const STORAGE_KEY = "vt-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const decide = (value: "accepted" | "declined") => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="vt-cookie-bar"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "24px",
        zIndex: 9999,
        width: "min(920px, calc(100vw - 40px))",
        display: "flex",
        alignItems: "center",
        gap: "22px",
        borderRadius: "18px",
        padding: "16px 24px",
        background: "linear-gradient(135deg, #1c1c1d 0%, #141414 55%, #0f0f10 100%)",
        border: "1px solid rgba(212,176,116,0.28)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,236,200,0.06)",
        animation: "vt-cookie-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      <style>{`
        .vt-cookie-bar { transform: translateX(-50%); }
        @keyframes vt-cookie-in {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (max-width: 640px) {
          .vt-cookie-bar { flex-direction: column; align-items: stretch; gap: 14px; }
          .vt-cookie-actions { width: 100%; }
        }
      `}</style>

      <div
        className="flex items-center justify-center"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          flexShrink: 0,
          background: "linear-gradient(135deg, #FBF6EC, #E9D29A 45%, #C8A96A)",
        }}
      >
        <Icon name="Cookie" size={21} style={{ color: "#141312" }} />
      </div>

      <p
        style={{
          flex: 1,
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          lineHeight: 1.55,
          color: "#C9C2B2",
          margin: 0,
        }}
      >
        Чтобы улучшить работу сайта, мы используем{" "}
        <Link
          to="/privacy"
          style={{ color: "#D4B074", textDecoration: "underline", textUnderlineOffset: "2px" }}
        >
          файлы cookie
        </Link>
        . Продолжая, вы соглашаетесь с их использованием.
      </p>

      <div className="vt-cookie-actions flex items-center gap-2.5" style={{ flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => decide("accepted")}
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "#1E1500",
            padding: "10px 26px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            background: "linear-gradient(160deg, #E8CC9A 0%, #D3B076 35%, #B8904A 60%, #D3B076 80%, #E8CC9A 100%)",
            boxShadow: "0 4px 14px rgba(180,130,50,0.28), inset 0 1px 0 rgba(255,240,190,0.4)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          Принять
        </button>
        <button
          type="button"
          onClick={() => decide("declined")}
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            color: "#C9C2B2",
            padding: "10px 26px",
            borderRadius: "999px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            border: "1px solid rgba(212,176,116,0.35)",
            background: "transparent",
            transition: "border-color 0.2s ease, color 0.2s ease",
          }}
        >
          Отклонить
        </button>
      </div>
    </div>
  );
}