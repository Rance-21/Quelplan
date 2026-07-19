import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./lib/theme";
import { BackgroundProvider } from "./lib/background";
import { ToastViewport } from "./components/ui/Toast";
import { I18nProvider } from "./lib/i18n";
import { AppSettingsProvider } from "./lib/appSettings";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <BackgroundProvider>
          <AppSettingsProvider>
            <App />
            <ToastViewport />
          </AppSettingsProvider>
        </BackgroundProvider>
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>,
);
