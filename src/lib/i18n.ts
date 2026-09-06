import {
  createContext,
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRequiredContext } from "./context";
import { addGameTranslations } from "./addGameTranslations";

export type Locale = "zh" | "en";
export type LocaleMode = "system" | Locale;
export type TranslationParams = Record<string, string | number>;

const localeStorageKey = "quelplan-locale-mode";

const translations = {
  zh: {
    ...addGameTranslations.zh,
    "common.language.system": "跟随系统",
    "common.language.zh": "中文",
    "common.language.en": "English",
    "common.theme.system": "跟随系统",
    "common.theme.light": "白天",
    "common.theme.dark": "夜间",
    "common.action.set": "设置",
    "common.action.startGame": "开始游戏",
    "common.action.detail": "详情页面",
    "common.action.gameFolder": "游戏目录",
    "common.action.fileFolder": "文件目录",
    "common.action.deleteGame": "删除游戏",
    "common.mode.game": "游戏",
    "common.mode.app": "应用",
    "settings.page.title": "设置",
    "settings.page.description": "按你的使用习惯调整外观、启动方式与数据管理。",
    "settings.group.appearance": "外观",
    "settings.group.launchWindow": "启动与窗口",
    "settings.group.dataServices": "数据与服务",
    "settings.group.about": "关于",
    "settings.language.title": "语言",
    "settings.language.description.system": "当前跟随系统，正在使用{language}",
    "settings.language.description.manual": "手动切换界面语言",
    "settings.theme.title": "外观模式",
    "settings.theme.description.system": "当前跟随系统，正在使用{mode}模式",
    "settings.theme.description.manual": "手动切换白天或夜间模式",
    "settings.tokens.title": "数据源 Token",
    "settings.tokens.description": "设置 BGM 和 VNDB 的访问 Token",
    "settings.tokens.bgm.label": "BGM Token",
    "settings.tokens.vndb.label": "VNDB Token",
    "settings.tokens.bgm.placeholder": "输入 BGM Token",
    "settings.tokens.vndb.placeholder": "输入 VNDB Token",
    "settings.tokens.bgm.oauth.action": "OAuth2 登录授权",
    "settings.tokens.bgm.oauth.authorizing": "授权中…",
    "settings.tokens.bgm.oauth.success": "BGM OAuth2 授权成功",
    "settings.tokens.empty": "Token 不能为空",
    "settings.tokens.saved": "Token 已保存",
    "settings.tokens.toggle": "展开或收起 Token 设置",
    "settings.background.dark.title": "夜间模式背景",
    "settings.background.light.title": "白天模式背景",
    "settings.background.default": "未设置，使用默认背景",
    "settings.launch.nextKey.title": "启动下一个关联程序按键",
    "settings.launch.nextKey.description":
      "点击右侧按键后，按下要使用的单个按键",
    "settings.launch.nextKey.action": "录入启动下一个关联程序的按键",
    "settings.launch.nextKey.recording": "请按一个键…",
    "settings.launch.nextKey.unsupported": "该按键不受支持，请按其他单键",
    "settings.launch.nextKey.combinationUnsupported":
      "不支持组合键，请只按一个按键",
    "settings.launch.hideOnLaunch.title": "启动游戏隐藏到托盘",
    "settings.launch.hideOnLaunch.description.on":
      "启动游戏后自动隐藏主窗口到托盘",
    "settings.launch.hideOnLaunch.description.off": "启动游戏后保持主窗口显示",
    "settings.launch.autoStart.title": "开机自启动",
    "settings.launch.autoStart.description.on": "应用会在系统启动时自动启动",
    "settings.launch.autoStart.description.off": "应用不会随系统启动自动启动",
    "settings.close.closeToTray.title": "点击关闭时最小化到托盘",
    "settings.close.closeToTray.description.on":
      "点击关闭按钮时隐藏主窗口到托盘",
    "settings.close.closeToTray.description.off":
      "点击关闭按钮时保存数据并彻底退出",
    "settings.data.export.title": "导出数据",
    "settings.data.export.description":
      "选择保存位置，将在其中生成 quelplan_byfen 备份文件夹",
    "settings.data.export.action": "导出",
    "settings.data.export.working": "导出中…",
    "settings.data.import.title": "导入数据",
    "settings.data.import.description":
      "选择包含 data 和 cover 的 quelplan_byfen 备份文件夹",
    "settings.data.import.action": "导入",
    "settings.data.import.working": "导入中…",
    "settings.fileFilter.image": "图片文件",
    "settings.project.title": "项目地址",
    "settings.project.description": "在 GitHub 上查看项目源码与信息",
    "settings.project.action": "Rance-21/Quelplan",
    "settings.placeholder.launch.title": "启动设置",
    "folder.search.placeholder": "搜索本地游戏...",
    "folder.sort.title": "排序游戏",
    "folder.sort.description": "选择排序依据和排列顺序",
    "folder.sort.name": "按首字母排序",
    "folder.sort.time": "按游玩时间",
    "folder.sort.score": "按游戏评分",
    "folder.sort.asc": "升序",
    "folder.sort.desc": "降序",
    "update.window.title": "发现新版本",
    "update.window.description": "当前版本 v{current}，可更新到 v{next}",
    "update.version.current": "当前版本",
    "update.version.available": "可用版本",
    "update.notes.title": "更新说明",
    "update.notes.empty": "本次更新没有提供说明。",
    "update.status.downloading": "正在下载更新：{percentage}%",
    "update.status.downloadingBytes": "正在下载更新：已下载 {downloaded}",
    "update.status.installing": "正在安装更新，请不要关闭应用",
    "update.status.readyToRestart": "更新已安装，重新启动后生效",
    "update.action.cancel": "取消",
    "update.action.update": "更新",
    "update.action.downloading": "下载中",
    "update.action.installing": "安装中",
    "update.action.restart": "重启应用",
    "update.toast.checkFailed": "检查更新失败：{error}",
    "update.toast.downloadFailed": "下载更新失败：{error}",
    "update.toast.installFailed": "安装更新失败：{error}",
    "update.toast.restartFailed": "重启应用失败：{error}",
    "update.toast.closeFailed": "释放更新资源失败：{error}",
    "add.dataSource.bgm.title": "启用 BGM 数据源",
    "add.dataSource.vndb.title": "启用 VNDB 数据源",
    "add.dataSource.igdb.title": "启用 IGDB 数据源",
    "add.fileFilter.game": "游戏程序",
    "add.fileFilter.app": "应用程序",
    "add.button.game": "添加游戏",
    "add.button.app": "添加应用",
    "add.button.batchGames": "批量添加",
    "add.button.steamGames": "Steam 游戏",
    "add.page.title": "添加到游戏库",
    "add.page.description": "选择添加方式和用于检索游戏信息的数据源",
    "add.name.title": "确认游戏名称",
    "add.name.description": "该名称将用于搜索游戏信息，你可以在搜索前修改。",
    "add.name.label": "游戏名称",
    "add.name.path": "已选择的程序",
    "add.name.placeholder": "输入游戏名称",
    "add.name.empty": "游戏名称不能为空",
    "add.status.searching": "正在搜索游戏信息",
    "add.status.review": "选择要添加的游戏信息",
    "add.status.committing": "正在写入游戏库",
    "add.status.resultCount": "共 {count} 个搜索结果",
    "add.status.waitingForResults": "正在等待搜索结果…",
    "add.status.noResults": "没有找到可添加的游戏",
    "add.status.appAdding": "正在添加应用程序",
    "add.action.cancel": "取消",
    "add.action.back": "返回",
    "add.action.continueSearch": "继续搜索",
    "add.action.confirm": "确认添加 {count} 个游戏",
    "add.action.removeResult": "从待添加列表中移除",
    "add.candidate.unknownDeveloper": "未知开发商",
    "detail.like.on": "取消喜欢",
    "detail.like.off": "喜欢",
    "detail.finished.on": "取消完成",
    "detail.finished.off": "标记完成",
    "detail.load.failed": "无法加载游戏详情",
    "detail.load.failedDescription": "请检查游戏数据后重试。",
    "detail.load.retry": "重试",
    "detail.metrics.lastPlayed": "最后游玩",
    "detail.metrics.playTime": "总时长",
    "detail.metrics.addedTime": "添加时间",
    "detail.metrics.score": "评分",
    "detail.metrics.developer": "开发商",
    "detail.metrics.publishDate": "发行时间",
    "detail.playTimeChart.title": "最近游玩时间",
    "detail.playTimeChart.hourUnit": "小时",
    "detail.name.label": "修改游戏名称",
    "detail.name.empty": "游戏名称不能为空",
    "detail.name.saved": "游戏名称已保存",
    "detail.developer.label": "修改游戏开发商",
    "detail.developer.saved": "游戏开发商已保存",
    "detail.score.label": "修改游戏评分",
    "detail.score.invalid": "游戏评分必须在 0 到 100 之间",
    "detail.score.saved": "游戏评分已保存",
    "detail.publishDate.label": "修改发行时间",
    "detail.publishDate.saved": "发行时间已保存",
    "detail.exePath.label": "修改游戏路径",
    "detail.exePath.empty": "游戏路径不能为空",
    "detail.exePath.saved": "游戏路径已保存",
    "detail.exePath.select": "选择游戏程序",
    "detail.exePath.fileFilter": "游戏程序",
    "detail.coverPath.label": "更改封面路径",
    "detail.coverPath.empty": "封面路径不能为空",
    "detail.coverPath.saved": "封面路径已保存",
    "detail.coverPath.select": "选择封面图片",
    "detail.coverPath.fileFilter": "图片文件",
    "detail.link.label": "关联启动顺序",
    "detail.link.requireGame": "必须选择游戏本体",
    "detail.link.saved": "关联启动顺序已保存",
    "confirm.deleteGame": "确定要删除这款游戏吗？",
    "confirm.importByfen": "导入会覆盖当前本地数据，确定继续吗？",
    "toast.readMainGameFailed": "读取主界面游戏失败",
    "toast.getGameListFailed": "获取游戏列表失败",
    "toast.addGameSuccess": "游戏添加成功",
    "toast.searchGamesLoading": "正在搜索游戏信息",
    "toast.addGamesLoading": "正在批量添加",
    "toast.addGamesSuccess": "批量添加完成，共添加 {count} 个游戏",
    "toast.addSteamGamesSuccess": "Steam 游戏添加完成，共添加 {count} 个游戏",
    "toast.addSteamGamesLoading": "正在导入 Steam 游戏",
    "toast.gameImportInProgress": "正在导入游戏，请等待当前任务完成",
    "toast.addAppSuccess": "应用添加成功",
    "toast.deleteGameSuccess": "游戏删除成功",
    "toast.deleteAppSuccess": "应用删除成功",
    "toast.openFolderFailed": "打开文件目录失败",
    "toast.exportByfenSuccess": "数据导出完成",
    "toast.importByfenSuccess": "数据导入完成，正在刷新界面",
  },
  en: {
    ...addGameTranslations.en,
    "common.language.system": "Use system",
    "common.language.zh": "Chinese",
    "common.language.en": "English",
    "common.theme.system": "Use system",
    "common.theme.light": "Light",
    "common.theme.dark": "Dark",
    "common.action.set": "Set",
    "common.action.startGame": "Start Game",
    "common.action.detail": "Details",
    "common.action.gameFolder": "Game Folder",
    "common.action.fileFolder": "File Folder",
    "common.action.deleteGame": "Delete Game",
    "common.mode.game": "Game",
    "common.mode.app": "App",
    "settings.page.title": "Settings",
    "settings.page.description":
      "Tune the appearance, launch behavior, and data management to your workflow.",
    "settings.group.appearance": "Appearance",
    "settings.group.launchWindow": "Launch & Window",
    "settings.group.dataServices": "Data & Services",
    "settings.group.about": "About",
    "settings.language.title": "Language",
    "settings.language.description.system":
      "Following system language, currently using {language}",
    "settings.language.description.manual":
      "Switch the interface language manually",
    "settings.theme.title": "Appearance",
    "settings.theme.description.system":
      "Following system appearance, currently using {mode} mode",
    "settings.theme.description.manual": "Switch light or dark mode manually",
    "settings.tokens.title": "Data Source Token",
    "settings.tokens.description": "Set access tokens for BGM and VNDB",
    "settings.tokens.bgm.label": "BGM Token",
    "settings.tokens.vndb.label": "VNDB Token",
    "settings.tokens.bgm.placeholder": "Enter BGM token",
    "settings.tokens.vndb.placeholder": "Enter VNDB token",
    "settings.tokens.bgm.oauth.action": "OAuth2 Login",
    "settings.tokens.bgm.oauth.authorizing": "Authorizing…",
    "settings.tokens.bgm.oauth.success": "BGM OAuth2 authorization succeeded",
    "settings.tokens.empty": "Token cannot be empty",
    "settings.tokens.saved": "Token saved",
    "settings.tokens.toggle": "Expand or collapse token settings",
    "settings.background.dark.title": "Dark Mode Background",
    "settings.background.light.title": "Light Mode Background",
    "settings.background.default": "Not set, using the default background",
    "settings.launch.nextKey.title": "Launch Next Linked Program Key",
    "settings.launch.nextKey.description":
      "Click the key button, then press the single key you want to use",
    "settings.launch.nextKey.action":
      "Record the key used to launch the next linked program",
    "settings.launch.nextKey.recording": "Press one key…",
    "settings.launch.nextKey.unsupported":
      "That key is not supported. Press another single key",
    "settings.launch.nextKey.combinationUnsupported":
      "Key combinations are not supported. Press only one key",
    "settings.launch.hideOnLaunch.title": "Hide to Tray After Launch",
    "settings.launch.hideOnLaunch.description.on":
      "Hide the main window to the tray after starting a game",
    "settings.launch.hideOnLaunch.description.off":
      "Keep the main window visible after starting a game",
    "settings.launch.autoStart.title": "Start on Boot",
    "settings.launch.autoStart.description.on":
      "Start the app automatically when the system starts",
    "settings.launch.autoStart.description.off":
      "Do not start the app automatically when the system starts",
    "settings.close.closeToTray.title": "Close Button Hides to Tray",
    "settings.close.closeToTray.description.on":
      "Hide the main window to the tray when clicking close",
    "settings.close.closeToTray.description.off":
      "Save data and fully quit when clicking close",
    "settings.data.export.title": "Export Data",
    "settings.data.export.description":
      "Choose a location where the quelplan_byfen backup folder will be created",
    "settings.data.export.action": "Export",
    "settings.data.export.working": "Exporting…",
    "settings.data.import.title": "Import Data",
    "settings.data.import.description":
      "Choose the quelplan_byfen backup folder containing data and cover",
    "settings.data.import.action": "Import",
    "settings.data.import.working": "Importing…",
    "settings.fileFilter.image": "Image Files",
    "settings.project.title": "Project",
    "settings.project.description": "View the source code and project information on GitHub",
    "settings.project.action": "Rance-21/Quelplan",
    "settings.placeholder.launch.title": "Launch Settings",
    "folder.search.placeholder": "Search local games...",
    "folder.sort.title": "Sort Games",
    "folder.sort.description": "Choose a sort field and order",
    "folder.sort.name": "Sort by name",
    "folder.sort.time": "Sort by play time",
    "folder.sort.score": "Sort by score",
    "folder.sort.asc": "Ascending",
    "folder.sort.desc": "Descending",
    "update.window.title": "Update Available",
    "update.window.description":
      "Version v{current} is installed. Version v{next} is available.",
    "update.version.current": "Current Version",
    "update.version.available": "Available Version",
    "update.notes.title": "Release Notes",
    "update.notes.empty": "No release notes were provided for this update.",
    "update.status.downloading": "Downloading update: {percentage}%",
    "update.status.downloadingBytes":
      "Downloading update: {downloaded} downloaded",
    "update.status.installing": "Installing update. Do not close the app.",
    "update.status.readyToRestart":
      "The update is installed and will apply after restart.",
    "update.action.cancel": "Cancel",
    "update.action.update": "Update",
    "update.action.downloading": "Downloading",
    "update.action.installing": "Installing",
    "update.action.restart": "Restart App",
    "update.toast.checkFailed": "Failed to check for updates: {error}",
    "update.toast.downloadFailed": "Failed to download update: {error}",
    "update.toast.installFailed": "Failed to install update: {error}",
    "update.toast.restartFailed": "Failed to restart the app: {error}",
    "update.toast.closeFailed": "Failed to release update resources: {error}",
    "add.dataSource.bgm.title": "Enable BGM data source",
    "add.dataSource.vndb.title": "Enable VNDB data source",
    "add.dataSource.igdb.title": "Enable IGDB data source",
    "add.fileFilter.game": "Game Program",
    "add.fileFilter.app": "Application",
    "add.button.game": "Add Game",
    "add.button.app": "Add App",
    "add.button.batchGames": "Batch Add",
    "add.button.steamGames": "Steam Games",
    "add.page.title": "Add to Library",
    "add.page.description": "Choose how to add items and which sources to search",
    "add.name.title": "Confirm Game Name",
    "add.name.description": "This name is used to search for game information. You can edit it first.",
    "add.name.label": "Game Name",
    "add.name.path": "Selected Executable",
    "add.name.placeholder": "Enter a game name",
    "add.name.empty": "Game name cannot be empty",
    "add.status.searching": "Searching for game information",
    "add.status.review": "Choose the game information to add",
    "add.status.committing": "Adding games to the library",
    "add.status.resultCount": "{count} search results",
    "add.status.waitingForResults": "Waiting for search results…",
    "add.status.noResults": "No games are available to add",
    "add.status.appAdding": "Adding application",
    "add.action.cancel": "Cancel",
    "add.action.back": "Back",
    "add.action.continueSearch": "Continue Search",
    "add.action.confirm": "Add {count} games",
    "add.action.removeResult": "Remove from the add list",
    "add.candidate.unknownDeveloper": "Unknown developer",
    "detail.like.on": "Unlike",
    "detail.like.off": "Like",
    "detail.finished.on": "Mark Unfinished",
    "detail.finished.off": "Mark Finished",
    "detail.load.failed": "Unable to load game details",
    "detail.load.failedDescription": "Check the game data and try again.",
    "detail.load.retry": "Retry",
    "detail.metrics.lastPlayed": "Last Played",
    "detail.metrics.playTime": "Play Time",
    "detail.metrics.addedTime": "Added",
    "detail.metrics.score": "Score",
    "detail.metrics.developer": "Developer",
    "detail.metrics.publishDate": "Release Date",
    "detail.playTimeChart.title": "Recent Play Time",
    "detail.playTimeChart.hourUnit": "h",
    "detail.name.label": "Edit Game Name",
    "detail.name.empty": "Game name cannot be empty",
    "detail.name.saved": "Game name saved",
    "detail.developer.label": "Edit Developer",
    "detail.developer.saved": "Developer saved",
    "detail.score.label": "Edit Score",
    "detail.score.invalid": "Score must be between 0 and 100",
    "detail.score.saved": "Score saved",
    "detail.publishDate.label": "Edit Release Date",
    "detail.publishDate.saved": "Release date saved",
    "detail.exePath.label": "Edit Game Path",
    "detail.exePath.empty": "Game path cannot be empty",
    "detail.exePath.saved": "Game path saved",
    "detail.exePath.select": "Select game executable",
    "detail.exePath.fileFilter": "Game Executable",
    "detail.coverPath.label": "Edit Cover Path",
    "detail.coverPath.empty": "Cover path cannot be empty",
    "detail.coverPath.saved": "Cover path saved",
    "detail.coverPath.select": "Select cover image",
    "detail.coverPath.fileFilter": "Image Files",
    "detail.link.label": "Linked Launch Order",
    "detail.link.requireGame": "Select the game executable",
    "detail.link.saved": "Linked launch order saved",
    "confirm.deleteGame": "Delete this game?",
    "confirm.importByfen":
      "Importing will overwrite the current local data. Continue?",
    "toast.readMainGameFailed": "Failed to read the main screen game",
    "toast.getGameListFailed": "Failed to get the game list",
    "toast.addGameSuccess": "Game added",
    "toast.searchGamesLoading": "Searching for game information",
    "toast.addGamesLoading": "Batch adding games",
    "toast.addGamesSuccess": "Batch add complete: {count} games added",
    "toast.addSteamGamesSuccess": "Steam import complete: {count} games added",
    "toast.addSteamGamesLoading": "Importing Steam games",
    "toast.gameImportInProgress":
      "A game import is already running. Wait for it to finish.",
    "toast.addAppSuccess": "App added",
    "toast.deleteGameSuccess": "Game deleted",
    "toast.deleteAppSuccess": "App deleted",
    "toast.openFolderFailed": "Failed to open the file folder",
    "toast.exportByfenSuccess": "Data exported",
    "toast.importByfenSuccess": "Data imported. Refreshing the interface",
  },
} as const;

export type TranslationKey = keyof typeof translations.zh;

interface I18nContextValue {
  localeMode: LocaleMode;
  locale: Locale;
  setLocaleMode: (localeMode: LocaleMode) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

let activeLocale: Locale = resolveLocale(readStoredLocaleMode());

function isLocaleMode(value: string | null): value is LocaleMode {
  return value === "system" || value === "zh" || value === "en";
}

function readStoredLocaleMode(): LocaleMode {
  const storedMode = window.localStorage.getItem(localeStorageKey);
  return isLocaleMode(storedMode) ? storedMode : "system";
}

function getSystemLocale(): Locale {
  const languages =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const language of languages) {
    const normalizedLanguage = language.toLowerCase();
    if (normalizedLanguage.startsWith("zh")) return "zh";
    if (normalizedLanguage.startsWith("en")) return "en";
  }

  return "zh";
}

function resolveLocale(localeMode: LocaleMode): Locale {
  return localeMode === "system" ? getSystemLocale() : localeMode;
}

function interpolate(value: string, params?: TranslationParams) {
  if (!params) return value;

  return value.replace(/\{(\w+)\}/g, (match, key: string) => {
    const paramValue = params[key];
    return paramValue === undefined ? match : String(paramValue);
  });
}

function translateWithLocale(
  locale: Locale,
  key: TranslationKey,
  params?: TranslationParams,
) {
  return interpolate(translations[locale][key] ?? translations.zh[key], params);
}

export function translate(key: TranslationKey, params?: TranslationParams) {
  return translateWithLocale(activeLocale, key, params);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [localeMode, setLocaleModeState] =
    useState<LocaleMode>(readStoredLocaleMode);
  const [systemLocale, setSystemLocale] = useState<Locale>(getSystemLocale);

  const locale = localeMode === "system" ? systemLocale : localeMode;

  useEffect(() => {
    activeLocale = locale;
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const handleLanguageChange = () => setSystemLocale(getSystemLocale());

    window.addEventListener("languagechange", handleLanguageChange);
    return () => {
      window.removeEventListener("languagechange", handleLanguageChange);
    };
  }, []);

  const setLocaleMode = useCallback((nextLocaleMode: LocaleMode) => {
    window.localStorage.setItem(localeStorageKey, nextLocaleMode);
    setLocaleModeState(nextLocaleMode);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) =>
      translateWithLocale(locale, key, params),
    [locale],
  );

  const value = useMemo(
    () => ({ localeMode, locale, setLocaleMode, t }),
    [localeMode, locale, setLocaleMode, t],
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  return useRequiredContext(I18nContext, "I18nProvider");
}
