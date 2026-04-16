// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import { invoke } from "@tauri-apps/api/core";
import { Sidebar } from "./components/SideBar";
import { Topbar } from "./layouts/TopBar";
import Background from "./assets/Background.jpg";
import { useState } from "react";
import { MainPage } from "./Pages/MainPage/MainPage";
import { FolderPage } from "./Pages/FolderPage/Folder";
import { SettingsPage } from "./Pages/SettingsPage/Settings";
import "./App.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState("Home");
  return (
    <div
      style={{
        overflow: "hidden",
        width: "calc(100vw - 0px)",
        height: "calc(100vh - 0px)",
        borderRadius: "1.4rem",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        position: "relative",
        display: "flex",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0, // 确保在最底层
        }}
      >
        <img
          src={Background}
          alt="Loading"
          style={{
            objectFit: "cover",
            backgroundSize: "cover", // 自动等比缩放，直到铺满整个容器（会裁剪多余部分）
            backgroundPosition: "center", // 裁剪时以图片中心为基准，防止人物/主体的脸被切掉
            backgroundRepeat: "no-repeat", // 防止图片太小时重复平铺
          }}
        />
      </div>
      <Sidebar
        activeMenu={currentPage}
        onMenuClick={(menuName) => setCurrentPage(menuName)}
      />
      <Topbar />
      <main>
        {/* 动态渲染：哪个名字被激活，就渲染哪个组件 */}
        {currentPage === "Home" && <MainPage />}

        {currentPage === "Folder" && <FolderPage />}

        {currentPage === "Settings" && <SettingsPage />}
      </main>
    </div>
  );
}
