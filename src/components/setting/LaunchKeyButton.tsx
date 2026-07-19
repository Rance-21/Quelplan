import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../lib/i18n";
import { showToast } from "../ui/Toast";

interface LaunchKeyButtonProps {
  launchKey: string;
  onLaunchKeyChange: (launchKey: string) => void;
}

const keyboardCodeAliases: Record<string, string> = {
  Escape: "Escape",
  Space: "Space",
  ControlLeft: "LControl",
  ControlRight: "RControl",
  ShiftLeft: "LShift",
  ShiftRight: "RShift",
  AltLeft: "LAlt",
  AltRight: "RAlt",
  MetaLeft: "LMeta",
  MetaRight: "RMeta",
  Enter: "Enter",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Backspace: "Backspace",
  CapsLock: "CapsLock",
  Tab: "Tab",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Insert: "Insert",
  Delete: "Delete",
  NumpadSubtract: "NumpadSubtract",
  NumpadAdd: "NumpadAdd",
  NumpadDivide: "NumpadDivide",
  NumpadMultiply: "NumpadMultiply",
  NumpadEqual: "NumpadEquals",
  // device_query reports both Enter keys as Enter on Windows.
  NumpadEnter: "Enter",
  NumpadDecimal: "NumpadDecimal",
  Backquote: "Grave",
  Minus: "Minus",
  Equal: "Equal",
  BracketLeft: "LeftBracket",
  BracketRight: "RightBracket",
  Backslash: "BackSlash",
  Semicolon: "Semicolon",
  Quote: "Apostrophe",
  Comma: "Comma",
  Period: "Dot",
  Slash: "Slash",
};

const modifierKeyboardCodes = new Set([
  "ControlLeft",
  "ControlRight",
  "ShiftLeft",
  "ShiftRight",
  "AltLeft",
  "AltRight",
  "MetaLeft",
  "MetaRight",
]);

function mapKeyboardCode(keyboardCode: string): string | null {
  if (/^Key[A-Z]$/.test(keyboardCode)) {
    return keyboardCode.slice(3);
  }

  if (/^Digit[0-9]$/.test(keyboardCode)) {
    return `Key${keyboardCode.slice(5)}`;
  }

  if (/^F(?:[1-9]|1[0-9]|20)$/.test(keyboardCode)) {
    return keyboardCode;
  }

  if (/^Numpad[0-9]$/.test(keyboardCode)) {
    return keyboardCode;
  }

  return keyboardCodeAliases[keyboardCode] ?? null;
}

export function LaunchKeyButton({
  launchKey,
  onLaunchKeyChange,
}: LaunchKeyButtonProps) {
  const { t } = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const buttonReference = useRef<HTMLButtonElement>(null);
  const pendingModifierReference = useRef<{
    keyboardCode: string;
    launchKey: string;
  } | null>(null);

  useEffect(() => {
    if (!isRecording) return;

    const finishRecording = (nextLaunchKey: string) => {
      pendingModifierReference.current = null;
      setIsRecording(false);
      onLaunchKeyChange(nextLaunchKey);
    };

    const rejectCombination = () => {
      pendingModifierReference.current = null;
      showToast(t("settings.launch.nextKey.combinationUnsupported"), "error");
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.repeat) return;

      const nextLaunchKey = mapKeyboardCode(event.code);
      if (!nextLaunchKey) {
        if (
          pendingModifierReference.current ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.metaKey
        ) {
          rejectCombination();
        } else {
          showToast(t("settings.launch.nextKey.unsupported"), "error");
        }
        return;
      }

      if (modifierKeyboardCodes.has(event.code)) {
        const pendingModifier = pendingModifierReference.current;
        if (pendingModifier && pendingModifier.keyboardCode !== event.code) {
          rejectCombination();
          return;
        }

        pendingModifierReference.current = {
          keyboardCode: event.code,
          launchKey: nextLaunchKey,
        };
        return;
      }

      if (
        pendingModifierReference.current ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.metaKey
      ) {
        rejectCombination();
        return;
      }

      finishRecording(nextLaunchKey);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const pendingModifier = pendingModifierReference.current;
      if (!pendingModifier || pendingModifier.keyboardCode !== event.code) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      finishRecording(pendingModifier.launchKey);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (buttonReference.current?.contains(event.target as Node)) return;

      pendingModifierReference.current = null;
      setIsRecording(false);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [isRecording, onLaunchKeyChange, t]);

  const handleButtonClick = () => {
    pendingModifierReference.current = null;
    setIsRecording((currentValue) => !currentValue);
  };

  return (
    <button
      ref={buttonReference}
      type="button"
      aria-pressed={isRecording}
      aria-label={t("settings.launch.nextKey.action")}
      title={t("settings.launch.nextKey.action")}
      onClick={handleButtonClick}
      className="qp-action-button"
      style={{
        minWidth: "7.5rem",
        minHeight: "2.4rem",
        padding: "0.45rem 1rem",
        borderRadius: "999rem",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: 700,
      }}
    >
      {isRecording ? t("settings.launch.nextKey.recording") : launchKey}
    </button>
  );
}
