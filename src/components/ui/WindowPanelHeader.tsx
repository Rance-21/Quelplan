interface WindowPanelHeaderProps {
  title: string;
  description: string;
}

export function WindowPanelHeader({
  title,
  description,
}: WindowPanelHeaderProps) {
  return (
    <header style={{ minWidth: 0 }}>
      <span className="qp-page-kicker" style={{ marginBottom: "0.4rem" }}>
        QUELPLAN
      </span>
      <h2
        style={{
          margin: 0,
          color: "var(--qp-text)",
          fontSize: "1.35rem",
          fontWeight: 720,
          letterSpacing: "-0.025em",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: "0.45rem 0 0",
          color: "var(--qp-muted-text)",
          fontSize: "0.86rem",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    </header>
  );
}
