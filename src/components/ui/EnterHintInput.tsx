import { CornerDownLeft } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type EnterHintInputProps = InputHTMLAttributes<HTMLInputElement>;

export function EnterHintInput({
  className,
  value,
  ...inputProps
}: EnterHintInputProps) {
  const hasValue = String(value ?? "").length > 0;

  return (
    <div
      className={`qp-enter-hint-input${hasValue ? " has-value" : ""}`}
      style={{ position: "relative", flex: 1, minWidth: 0 }}
    >
      <input
        {...inputProps}
        value={value}
        className={`${className ?? ""} qp-enter-hint-field`.trim()}
        style={{ ...inputProps.style, width: "100%", boxSizing: "border-box" }}
      />
      <CornerDownLeft
        className="qp-enter-hint-icon"
        size={17}
        strokeWidth={1.8}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          right: "0.85rem",
          color: "var(--qp-muted-text)",
          pointerEvents: "none",
          transition: "opacity 0.12s ease, transform 0.12s ease",
        }}
      />
    </div>
  );
}
