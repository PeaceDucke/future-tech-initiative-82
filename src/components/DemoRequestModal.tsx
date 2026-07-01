import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface DemoRequestModalProps {
  open: boolean;
  onClose: () => void;
}

const GOLD_GRADIENT =
  "linear-gradient(160deg, #E8CC9A 0%, #D3B076 30%, #B8904A 55%, #D3B076 75%, #E8CC9A 100%)";

export default function DemoRequestModal({ open, onClose }: DemoRequestModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");

  // close on Escape + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!phone.trim() && !telegram.trim())) return;
    onClose();
    setName("");
    setPhone("");
    setTelegram("");
    navigate("/thank-you");
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(211,176,118,0.25)",
    borderRadius: "3px",
    color: "#F3ECDD",
    fontFamily: "Inter, sans-serif",
    fontSize: "17px",
    fontWeight: 500,
    padding: "13px 14px 13px 44px",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={onClose}
          style={{
            background: "rgba(8,8,7,0.78)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full"
            style={{
              maxWidth: "620px",
              background:
                "radial-gradient(120% 140% at 20% 0%, #242424 0%, #141414 45%, #090909 100%)",
              border: "1px solid rgba(211,176,118,0.2)",
              borderRadius: "6px",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
              padding: "40px 46px 40px",
              overflow: "hidden",
            }}
          >
            {/* top golden hairline */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: GOLD_GRADIENT,
                opacity: 0.9,
              }}
            />

            {/* close button */}
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute flex items-center justify-center"
              style={{
                top: "16px",
                right: "16px",
                width: "34px",
                height: "34px",
                borderRadius: "3px",
                color: "#C9B489",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(211,176,118,0.18)",
                transition: "color 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#F3ECDD";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#C9B489";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <Icon name="X" size={18} />
            </button>

            <form onSubmit={handleSubmit}>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#F3ECDD",
                    fontSize: "29px",
                    lineHeight: 1.2,
                    marginBottom: "8px",
                  }}
                >
                  Оставьте заявку
                </h3>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: "#9A917F",
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: 1.55,
                    marginBottom: "24px",
                  }}
                >
                  Заполните форму — мы покажем систему в деле на ваших звонках.
                </p>

                {/* Имя */}
                <div style={{ position: "relative", marginBottom: "14px" }}>
                  <Icon
                    name="User"
                    size={17}
                    className="pointer-events-none"
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#B8904A",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(211,176,118,0.6)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(211,176,118,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(211,176,118,0.25)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    required
                  />
                </div>

                {/* Телефон */}
                <div style={{ position: "relative", marginBottom: "14px" }}>
                  <Icon
                    name="Phone"
                    size={17}
                    className="pointer-events-none"
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#B8904A",
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="Номер телефона"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(211,176,118,0.6)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(211,176,118,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(211,176,118,0.25)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* разделитель "или" */}
                <div
                  className="flex items-center"
                  style={{ gap: "12px", margin: "6px 0 14px" }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: "rgba(211,176,118,0.18)",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      color: "#8A8171",
                      fontSize: "14px",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                    }}
                  >
                    или
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: "rgba(211,176,118,0.18)",
                    }}
                  />
                </div>

                {/* Телеграм */}
                <div style={{ position: "relative", marginBottom: "22px" }}>
                  <Icon
                    name="Send"
                    size={17}
                    className="pointer-events-none"
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#B8904A",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Телеграм (@username)"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(211,176,118,0.6)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(211,176,118,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(211,176,118,0.25)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2"
                  style={{
                    background: GOLD_GRADIENT,
                    color: "#1E1500",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    fontSize: "17.5px",
                    padding: "14px",
                    borderRadius: "3px",
                    boxShadow:
                      "0 4px 18px rgba(180,130,50,0.3), inset 0 1px 0 rgba(255,240,190,0.4)",
                    transition: "box-shadow 0.25s ease, transform 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 6px 24px rgba(180,130,50,0.5), inset 0 1px 0 rgba(255,240,190,0.4)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 18px rgba(180,130,50,0.3), inset 0 1px 0 rgba(255,240,190,0.4)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Отправить заявку
                  <Icon name="ArrowRight" size={16} />
                </button>

                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: "#6E675A",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    lineHeight: 1.5,
                    textAlign: "center",
                    marginTop: "14px",
                  }}
                >
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                </p>
              </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}