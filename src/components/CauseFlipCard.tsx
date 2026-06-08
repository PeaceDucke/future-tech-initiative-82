import { useState } from "react";
import Icon from "@/components/ui/icon";

interface CauseFlipCardProps {
  icon: string;
  title: string;
  detail: string;
}

export default function CauseFlipCard({ icon, title, detail }: CauseFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const faceBase: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: "11px",
    border: "1px solid rgba(46,33,19,0.07)",
    boxShadow: "0 2px 10px rgba(46,33,19,0.05)",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div style={{ perspective: "1200px", minHeight: "62px" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "62px",
          transition: "transform 0.6s cubic-bezier(0.4,0.2,0.2,1)",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <div
          style={{
            ...faceBase,
            background: "#FFFFFF",
            gap: "12px",
            padding: "11px 14px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "#FBEDEA",
              border: "1px solid rgba(194,69,60,0.18)",
              flexShrink: 0,
            }}
          >
            <Icon name={icon} size={18} style={{ color: "#C2453C" }} />
          </span>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              color: "#2E2113",
              fontWeight: 700,
              lineHeight: 1.25,
            }}
          >
            {title}
          </span>
          <button
            onClick={() => setFlipped(true)}
            className="inline-flex items-center"
            style={{
              gap: "5px",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#B8893D",
              fontWeight: 600,
              flexShrink: 0,
              whiteSpace: "nowrap",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Подробнее
            <Icon name="ArrowRight" size={15} style={{ color: "#B8893D" }} />
          </button>
        </div>

        {/* BACK */}
        <div
          style={{
            ...faceBase,
            background: "#FFFFFF",
            transform: "rotateY(180deg)",
            gap: "12px",
            padding: "12px 14px",
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              borderRadius: "9px",
              background: "#FBEDEA",
              border: "1px solid rgba(194,69,60,0.18)",
              flexShrink: 0,
              marginTop: "1px",
            }}
          >
            <Icon name={icon} size={16} style={{ color: "#C2453C" }} />
          </span>
          <p
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#2E2113",
              fontWeight: 700,
              lineHeight: 1.45,
            }}
          >
            {detail}
          </p>
          <button
            onClick={() => setFlipped(false)}
            className="inline-flex items-center justify-center"
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "8px",
              background: "#FBEDEA",
              border: "1px solid rgba(194,69,60,0.18)",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
            }}
            aria-label="Свернуть"
          >
            <Icon name="X" size={14} style={{ color: "#C2453C" }} />
          </button>
        </div>
      </div>
    </div>
  );
}