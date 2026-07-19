import { Heart } from "lucide-react";
import { useI18n } from "../../lib/i18n";

interface LikeButtonProps {
  liked: boolean;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}

export function LikeButton({
  liked,
  disabled = false,
  onClick,
}: LikeButtonProps) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      className="qp-detail-toggle"
      aria-pressed={liked}
      title={liked ? t("detail.like.on") : t("detail.like.off")}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: liked ? "rgba(239, 68, 68, 0.14)" : "transparent",
        color: liked ? "#ef4444" : "var(--qp-text)",
      }}
    >
      <Heart
        size={22}
        strokeWidth={2.5}
        fill={liked ? "currentColor" : "none"}
      />
    </button>
  );
}
