// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import { invoke } from "@tauri-apps/api/core";
import { Sidebar } from "./components/SideBar";
import { Topbar } from "./layouts/TopBar";
import Background from "./assets/Background.jpg";
import "./App.css";

export default function App() {
  return (
    <div
      style={{
        overflow: "hidden",
        borderRadius: "4rem", // 12px
        display: "flex",
      }}
    >
      <div
        style={{
          position: "absolute",
        }}
      >
        <img
          src={Background}
          alt="Loading"
          style={{
            objectFit: "cover",
          }}
        />
      </div>
      <Sidebar />
      <Topbar />
    </div>
  );
}
