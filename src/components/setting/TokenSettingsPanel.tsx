import { useState } from "react";
import { startBgmOAuth } from "../../api/OAuth2";
import { updateToken, type TokenPlatform } from "../../api/Token";
import { useI18n, type TranslationKey } from "../../lib/i18n";
import { EnterHintInput } from "../ui/EnterHintInput";
import { showToast } from "../ui/Toast";

interface TokenPlatformConfig {
  which: TokenPlatform;
  labelKey: TranslationKey;
  placeholderKey: TranslationKey;
}

const tokenPlatforms: TokenPlatformConfig[] = [
  {
    which: "Bgm",
    labelKey: "settings.tokens.bgm.label",
    placeholderKey: "settings.tokens.bgm.placeholder",
  },
  {
    which: "Vndb",
    labelKey: "settings.tokens.vndb.label",
    placeholderKey: "settings.tokens.vndb.placeholder",
  },
];

const avatarUpdatedEvent = "quelplan-avatar-updated";

export function TokenSettingsPanel() {
  const { t } = useI18n();
  const [tokens, setTokens] = useState<Record<TokenPlatform, string>>({
    Bgm: "",
    Vndb: "",
  });
  const [savingPlatform, setSavingPlatform] = useState<TokenPlatform | null>(
    null,
  );
  const [isAuthorizingBgm, setIsAuthorizingBgm] = useState(false);

  const handleTokenChange = (which: TokenPlatform, token: string) => {
    setTokens((currentTokens) => ({ ...currentTokens, [which]: token }));
  };

  const handleSaveToken = async (which: TokenPlatform) => {
    if (savingPlatform || isAuthorizingBgm) return;

    const nextToken = tokens[which].trim();
    if (!nextToken) {
      showToast(t("settings.tokens.empty"), "error");
      return;
    }

    try {
      setSavingPlatform(which);
      await updateToken(which, nextToken);
      if (which === "Bgm") {
        window.dispatchEvent(new Event(avatarUpdatedEvent));
      }
      setTokens((currentTokens) => ({ ...currentTokens, [which]: "" }));
      showToast(t("settings.tokens.saved"), "success");
    } catch {
      return;
    } finally {
      setSavingPlatform(null);
    }
  };

  const handleBgmOAuth = async () => {
    if (savingPlatform || isAuthorizingBgm) return;

    try {
      setIsAuthorizingBgm(true);
      await startBgmOAuth();
      window.dispatchEvent(new Event(avatarUpdatedEvent));
      showToast(t("settings.tokens.bgm.oauth.success"), "success");
    } catch {
      return;
    } finally {
      setIsAuthorizingBgm(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {tokenPlatforms.map((platform) => {
        const isDisabled = savingPlatform !== null || isAuthorizingBgm;

        return (
          <div
            key={platform.which}
            className="qp-expanded-row"
            style={{
              minHeight: "3.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              padding: "0.8rem 1.4rem",
              color: "var(--qp-text)",
            }}
          >
            <span
              style={{
                width: "8rem",
                flexShrink: 0,
                fontSize: "0.98rem",
                fontWeight: 700,
              }}
            >
              {t(platform.labelKey)}
            </span>

            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <EnterHintInput
                type="password"
                className="qp-form-input"
                value={tokens[platform.which]}
                disabled={isDisabled}
                placeholder={t(platform.placeholderKey)}
                onChange={(event) =>
                  handleTokenChange(platform.which, event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSaveToken(platform.which);
                  }
                }}
              />

              {platform.which === "Bgm" && (
                <button
                  type="button"
                  className="qp-action-button"
                  disabled={isDisabled}
                  onClick={() => void handleBgmOAuth()}
                  style={{
                    minWidth: "8.5rem",
                    height: "2.2rem",
                    padding: "0 1rem",
                    border: "none",
                    borderRadius: "999rem",
                    cursor: isDisabled ? "default" : "pointer",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isAuthorizingBgm
                    ? t("settings.tokens.bgm.oauth.authorizing")
                    : t("settings.tokens.bgm.oauth.action")}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
