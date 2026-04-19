export function StartGame() {
  return (
    <button
      style={{
        padding: "0.8rem 2.5rem",
        backgroundColor: "rgba(82, 211, 211, 1)", // 纯色青绿
        borderRadius: "1.6rem",
        border: "none",
        color: "#fff",
        fontSize: "1.3rem",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 0.4rem 1rem rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-0.1rem)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      开始游戏
    </button>
  );
}
