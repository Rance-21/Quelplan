interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      className="qp-segmented-control"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.18rem",
        padding: "0.2rem",
        border: "1px solid var(--qp-input-border)",
        borderRadius: "999rem",
        background: "var(--qp-input-bg)",
      }}
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={isActive ? "is-active" : ""}
            style={{
              height: "1.95rem",
              padding: "0 0.8rem",
              border: "none",
              borderRadius: "999rem",
              background: isActive ? "var(--qp-panel-hover)" : "transparent",
              color: isActive ? "var(--qp-text)" : "var(--qp-muted-text)",
              boxShadow: isActive ? "0 0.2rem 0.7rem rgba(0, 0, 0, 0.12)" : "none",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: isActive ? 720 : 620,
              transition:
                "background-color 0.12s ease, color 0.12s ease, box-shadow 0.12s ease",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface SettingSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

export function SettingSwitch({
  checked,
  onChange,
  label,
}: SettingSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        width: "2.75rem",
        height: "1.65rem",
        padding: "0.18rem",
        border: `1px solid ${
          checked
            ? "color-mix(in srgb, var(--qp-text) 38%, transparent)"
            : "var(--qp-input-border)"
        }`,
        borderRadius: "999rem",
        background: checked ? "var(--qp-panel-hover)" : "var(--qp-input-bg)",
        boxShadow: "none",
        cursor: "pointer",
        transition: "background-color 0.12s ease, border-color 0.12s ease",
      }}
    >
      <span
        style={{
          width: "1.15rem",
          height: "1.15rem",
          display: "block",
          borderRadius: "999rem",
          background: checked ? "var(--qp-text)" : "var(--qp-muted-text)",
          transform: checked ? "translateX(1.08rem)" : "translateX(0)",
          transition: "background-color 0.12s ease, transform 0.12s ease",
        }}
      />
    </button>
  );
}
