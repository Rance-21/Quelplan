interface DataTransferButtonProps {
  label: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function DataTransferButton({
  label,
  busy,
  disabled,
  onClick,
}: DataTransferButtonProps) {
  return (
    <button
      type="button"
      aria-busy={busy}
      disabled={disabled}
      onClick={onClick}
      className="qp-action-button"
      style={{
        minWidth: "5.6rem",
        height: "2.2rem",
        padding: "0 1rem",
        borderRadius: "999rem",
        cursor: disabled ? "wait" : "pointer",
        fontSize: "0.9rem",
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  );
}
