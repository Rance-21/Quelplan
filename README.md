# Quelplan

[中文](README.md) | [English](README_EN.md)

> **BETA**：Quelplan 仍处于测试阶段，功能、界面和本地数据格式可能继续调整。建议定期导出并备份数据。

Quelplan 是一款面向 Windows 的本地游戏库管理与启动工具，用于整理游戏、补充游戏信息、记录游玩时间，并从一个界面启动本地或 Steam 游戏。

## 界面预览

### 游戏库

![Quelplan 游戏库](docs/screenshots/library.png)

### 游戏详情

![Quelplan 游戏详情](docs/screenshots/game-details.png)

## 功能

- 支持单个游戏、目录批量扫描和 Steam 游戏库导入。
- 从 BGM、VNDB 和 IGDB 检索游戏信息与封面。
- 浏览、搜索和排序本地游戏库。
- 编辑游戏名称、开发商、评分、发行日期、程序路径和封面。
- 标记收藏与完成状态，记录总游玩时间和最近七天的游玩情况。
- 启动本地或 Steam 游戏，并配置最多三个游戏或应用的关联启动顺序。
- 支持中文和英文界面、系统/明亮/暗色主题及自定义背景。
- 支持系统托盘、开机自启动、启动游戏后隐藏、关闭到托盘和自动更新。
- 支持本地数据导入与导出。

## 技术栈

- 桌面框架：Tauri 2
- 前端：React 19、TypeScript、Vite
- 后端：Rust、Tokio、Reqwest
- 数据存储：基于 Serde、Bincode 和 WAL 的本地存储
- 包管理器：pnpm

## 本地开发

### 环境要求

- Node.js LTS
- pnpm 10
- Rust stable
- [Tauri 2 的 Windows 开发环境](https://v2.tauri.app/start/prerequisites/)

### 运行与构建

```powershell
pnpm install
pnpm tauri dev
pnpm tauri build
```

## TODO

- 支持 Epic Games 游戏库导入。
- 重构设置界面：恢复默认设置、显示版本与手动检查更新，并改善 Token 和授权状态管理。
- 增加收藏及已完成状态筛选。
- 增加重复游戏检测。
- 提升备份恢复可靠性与后续版本的数据迁移兼容性。

## 协议

本项目基于 [MIT License](LICENSE) 开源。
