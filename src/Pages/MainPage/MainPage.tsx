import { StartGame } from "../../components/MainPageUsed/StartGame";
import { More } from "../../components/MainPageUsed/More";

export function MainPage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* 底部按钮组区域 */}
      <div
        style={{
          position: "absolute",
          bottom: "4rem",
          right: "4rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <More />
        <StartGame />
      </div>

      {/* 这里以后可以放主页的游戏封面图、简介等内容 */}
    </div>
  );
}
