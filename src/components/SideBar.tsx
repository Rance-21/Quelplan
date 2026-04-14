import { Home, FolderHeart, Settings, Gamepad2 } from "lucide-react";

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[72px] flex flex-col items-center py-6 gap-8 z-50
                 bg-gradient-to-b from-slate-200/40 to-slate-100/10 
                 backdrop-blur-md border-r border-white/20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* 顶部 Logo 区域 */}
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/40 shadow-sm border border-white/30 text-slate-700">
        <Gamepad2 size={28} strokeWidth={1.5} />
      </div>

      {/* 中间导航图标 */}
      <nav className="flex flex-col gap-4 mt-4 w-full px-3">
        {/* 激活状态的按钮 (比如当前在主页) */}
        <button className="w-full aspect-square flex items-center justify-center rounded-xl bg-white/50 text-slate-800 shadow-sm border border-white/40 transition-all hover:bg-white/60">
          <Home size={24} strokeWidth={1.5} />
        </button>

        {/* 未激活状态的按钮 */}
        <button className="w-full aspect-square flex items-center justify-center rounded-xl text-slate-500 hover:bg-white/30 hover:text-slate-700 transition-all">
          <FolderHeart size={24} strokeWidth={1.5} />
        </button>

        {/* 假设这是设置按钮，放在底部 */}
        <div className="mt-auto pt-4 flex w-full">
          <button className="w-full aspect-square flex items-center justify-center rounded-xl text-slate-500 hover:bg-white/30 hover:text-slate-700 transition-all">
            <Settings size={24} strokeWidth={1.5} />
          </button>
        </div>
      </nav>
    </aside>
  );
}
