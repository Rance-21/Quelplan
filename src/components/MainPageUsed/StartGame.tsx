export function StartGame() {
  return (
    <button
      style={{
        padding: "0.8rem 2.5rem",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        //之后会有夜间模式
        borderRadius: "1.6rem",
        border: "none",
        color: "#333",
        fontSize: "1.3rem",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 0.4rem 1rem rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      开始游戏
    </button>
  );
}
