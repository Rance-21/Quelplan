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
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  return (
    <div
      style={{
        overflow: "hidden",
        width: "calc(100vw - 0rem)",
        height: "calc(100vh - 0rem)",
        borderRadius: "1.4rem",
        border: "0.0625rem solid rgba(255, 255, 255, 0.1)",
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
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: currentPage === "Home" ? "none" : "blur(0.15rem)",
            transform: currentPage === "Home" ? "scale(1)" : "scale(1.05)",
            transition: "filter 0.25s ease, transform 0.25s ease",
          }}
        />
      </div>
      <Topbar isHome={currentPage === "Home"} />
      <Sidebar
        activeMenu={currentPage}
        onMenuClick={(menuName) => setCurrentPage(menuName)}
      />

      <main
        style={{ flex: 1, width: "100%", height: "100%", position: "relative" }}
      >
        {/* 哪个名字被激活，就渲染哪个组件 */}
        {currentPage === "Home" && <MainPage />}

        {currentPage === "Folder" && (
          <FolderPage
            onGameSelect={(id) => {
              setSelectedGameId(id);
              setCurrentPage("Home");
            }}
          />
        )}

        {currentPage === "Settings" && <SettingsPage />}
      </main>
    </div>
  );
}
