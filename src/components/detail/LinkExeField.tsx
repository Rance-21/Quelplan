import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { Game, LinkExe } from "../../api/detailgame";
import { changeLinkExe } from "../../api/LinkExe";
import { useI18n } from "../../lib/i18n";
import { showToast } from "../ui/Toast";
import { DetailRow } from "./DetailRow";

export interface SelectableLinkItem {
  type: "game" | "app";
  id: number;
  name: string;
  exePath: string;
  steamId: number | null;
}

type SelectedLinkOrders = Record<string, number>;

interface LinkExeFieldProps {
  game: Game;
  selectableLinkItems: SelectableLinkItem[];
  onLinkExeChange: (linkExe: LinkExe[]) => void;
}

function getSelectableLinkItemKey(
  item: Pick<SelectableLinkItem, "type" | "id">,
) {
  return `${item.type}-${item.id}`;
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/");
}

function linkMatchesItem(linkExe: LinkExe, item: SelectableLinkItem) {
  const linkSteamId = linkExe.steam_id ?? null;
  const itemSteamId = item.steamId ?? null;

  if (linkSteamId !== null || itemSteamId !== null) {
    return linkSteamId !== null && itemSteamId !== null && linkSteamId === itemSteamId;
  }

  return normalizePath(linkExe.path) === normalizePath(item.exePath);
}

function buildLinkExeFromItem(item: SelectableLinkItem | null): LinkExe {
  return {
    path: item?.exePath ?? "",
    steam_id: item?.steamId ?? null,
  };
}

function buildSelectedLinkOrders(game: Game, items: SelectableLinkItem[]) {
  const nextOrders: SelectedLinkOrders = {};
  const usedKeys = new Set<string>();
  let nextOrder = 1;

  game.link_exe.slice(0, 3).forEach((linkExe) => {
    if (!linkExe.path && linkExe.steam_id === null) return;

    const matchedItem = items.find((item) => linkMatchesItem(linkExe, item));
    if (!matchedItem) return;

    const itemKey = getSelectableLinkItemKey(matchedItem);
    if (usedKeys.has(itemKey)) return;

    nextOrders[itemKey] = nextOrder;
    usedKeys.add(itemKey);
    nextOrder += 1;
  });

  return nextOrders;
}

function selectedLinkOrdersEqual(
  first: SelectedLinkOrders,
  second: SelectedLinkOrders,
) {
  const firstEntries = Object.entries(first);
  const secondEntries = Object.entries(second);
  return (
    firstEntries.length === secondEntries.length &&
    firstEntries.every(([key, order]) => second[key] === order)
  );
}

export function LinkExeField({
  game,
  selectableLinkItems,
  onLinkExeChange,
}: LinkExeFieldProps) {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasExpanded, setHasExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLinkOrders, setSelectedLinkOrders] = useState(() =>
    buildSelectedLinkOrders(game, selectableLinkItems),
  );

  useEffect(() => {
    if (!isExpanded) {
      const nextOrders = buildSelectedLinkOrders(game, selectableLinkItems);
      setSelectedLinkOrders((currentOrders) =>
        selectedLinkOrdersEqual(currentOrders, nextOrders)
          ? currentOrders
          : nextOrders,
      );
    }
  }, [game.link_exe, isExpanded, selectableLinkItems]);

  const handleToggleLinkItem = (item: SelectableLinkItem) => {
    const itemKey = getSelectableLinkItemKey(item);

    setSelectedLinkOrders((currentOrders) => {
      const currentOrder = currentOrders[itemKey];

      if (currentOrder) {
        return Object.fromEntries(
          Object.entries(currentOrders)
            .filter(([key]) => key !== itemKey)
            .map(([key, order]) => [
              key,
              order > currentOrder ? order - 1 : order,
            ]),
        );
      }

      const selectedCount = Object.keys(currentOrders).length;
      return selectedCount >= 3
        ? currentOrders
        : { ...currentOrders, [itemKey]: selectedCount + 1 };
    });
  };

  const handleSaveLinkExe = async () => {
    if (isSaving) return;

    const gameItem = selectableLinkItems[0];
    const gameOrder = selectedLinkOrders[getSelectableLinkItemKey(gameItem)];
    if (!gameOrder) {
      showToast(t("detail.link.requireGame"), "error");
      return;
    }

    const orderedItems: (SelectableLinkItem | null)[] = [null, null, null];
    selectableLinkItems.forEach((item) => {
      const order = selectedLinkOrders[getSelectableLinkItemKey(item)];
      if (order >= 1 && order <= 3) orderedItems[order - 1] = item;
    });

    try {
      setIsSaving(true);
      await changeLinkExe({
        first_id: orderedItems[0]?.id ?? 0,
        second_id: orderedItems[1]?.id ?? 0,
        third_id: orderedItems[2]?.id ?? 0,
        which_is_game: gameOrder,
      });

      setIsExpanded(false);
      onLinkExeChange(orderedItems.map(buildLinkExeFromItem));
      showToast(t("detail.link.saved"), "success");
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePanel = () => {
    if (!isExpanded) {
      setSelectedLinkOrders(buildSelectedLinkOrders(game, selectableLinkItems));
      setHasExpanded(true);
      setIsExpanded(true);
      return;
    }

    void handleSaveLinkExe();
  };

  const selectedCount = Object.keys(selectedLinkOrders).length;

  return (
    <DetailRow
      label={t("detail.link.label")}
      expanded={isExpanded}
      expandedContent={
        hasExpanded ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {selectableLinkItems.map((item) => {
              const itemKey = getSelectableLinkItemKey(item);
              const order = selectedLinkOrders[itemKey];
              const isDisabled = !order && selectedCount >= 3;

              return (
                <button
                  key={itemKey}
                  type="button"
                  className="qp-expanded-row"
                  disabled={isSaving || isDisabled}
                  onClick={() => handleToggleLinkItem(item)}
                  style={{
                    minHeight: "3.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1.5rem",
                    padding: "0.8rem 1.5rem",
                    border: "none",
                    background: order
                      ? "var(--qp-detail-row-active)"
                      : "transparent",
                    color: isDisabled
                      ? "var(--qp-muted-text)"
                      : "var(--qp-text)",
                    cursor:
                      isDisabled || isSaving ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.6 : 1,
                    transition:
                      "background-color 0.12s ease, opacity 0.12s ease, color 0.12s ease",
                  }}
                >
                  <span
                    style={{
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: "0.98rem",
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      width: "2rem",
                      flexShrink: 0,
                      fontSize: "1rem",
                      fontWeight: 700,
                      textAlign: "right",
                    }}
                  >
                    {order || ""}
                  </span>
                </button>
              );
            })}
          </div>
        ) : undefined
      }
    >
      <button
        type="button"
        onClick={handleTogglePanel}
        disabled={isSaving}
        className="qp-action-icon-button"
        style={{
          marginLeft: "auto",
          width: "2.4rem",
          height: "2.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          cursor: isSaving ? "not-allowed" : "pointer",
          border: "none",
        }}
      >
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
    </DetailRow>
  );
}
