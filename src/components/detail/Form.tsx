import { useMemo } from "react";
import type { App as LinkedApp } from "../../api/App";
import { imageFileExtensions } from "../../api/Dialog";
import type { Game, LinkExe } from "../../api/detailgame";
import type { DetailFieldChangeHandler } from "../../api/UpdateGameField";
import { useI18n } from "../../lib/i18n";
import {
  EditableGameField,
  type EditableGameFieldConfig,
} from "./EditableGameField";
import { EditablePathField } from "./EditablePathField";
import { LinkExeField, type SelectableLinkItem } from "./LinkExeField";
import { PlayTimeChart } from "./PlayTimeChart";

const executableFileExtensions = ["exe"];

interface DetailFormProps {
  initialData: Game;
  apps: Record<string, LinkedApp>;
  onGameFieldChange: DetailFieldChangeHandler;
  onGameExePathChange: (oldExePath: string, newExePath: string) => void;
  onLinkExeChange: (linkExe: LinkExe[]) => void;
}

export function DetailForm({
  initialData,
  apps,
  onGameFieldChange,
  onGameExePathChange,
  onLinkExeChange,
}: DetailFormProps) {
  const { t } = useI18n();
  const appList = useMemo(() => {
    return Object.values(apps).sort((firstApp, secondApp) => {
      return firstApp.id - secondApp.id;
    });
  }, [apps]);

  const selectableLinkItems = useMemo<SelectableLinkItem[]>(() => {
    return [
      {
        type: "game",
        id: initialData.id,
        name: initialData.name,
        exePath: initialData.path,
        steamId: initialData.steam_id,
      },

      ...appList.map((app) => ({
        type: "app" as const,
        id: app.id,
        name: app.name,
        exePath: app.exe_path,
        steamId: app.steam_id,
      })),
    ];
  }, [
    appList,
    initialData.path,
    initialData.id,
    initialData.name,
    initialData.steam_id,
  ]);

  const editableFields = [
    {
      field: "name",
      initialValue: initialData.name,
      label: t("detail.name.label"),
      emptyMessage: t("detail.name.empty"),
      savedMessage: t("detail.name.saved"),
    },
    {
      field: "developer",
      initialValue: initialData.developer,
      label: t("detail.developer.label"),
      savedMessage: t("detail.developer.saved"),
    },
    {
      field: "score",
      initialValue: initialData.score,
      label: t("detail.score.label"),
      invalidMessage: t("detail.score.invalid"),
      savedMessage: t("detail.score.saved"),
    },
    {
      field: "publish_date",
      initialValue: initialData.publish_date,
      label: t("detail.publishDate.label"),
      savedMessage: t("detail.publishDate.saved"),
    },
  ] satisfies EditableGameFieldConfig[];

  return (
    <div
      className="no-scrollbar"
      style={{
        minHeight: 0,
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: "0.65rem",
        overflowY: "auto",
        padding: "0.1rem 0.15rem 1.5rem",
      }}
    >
      {editableFields.map((config) => (
        <EditableGameField
          key={config.field}
          gameId={initialData.id}
          config={config}
          onSaved={onGameFieldChange}
        />
      ))}

      <EditablePathField
        gameId={initialData.id}
        initialPath={initialData.path}
        field="exe_path"
        label={t("detail.exePath.label")}
        selectLabel={t("detail.exePath.select")}
        filterName={t("detail.exePath.fileFilter")}
        extensions={executableFileExtensions}
        emptyMessage={t("detail.exePath.empty")}
        savedMessage={t("detail.exePath.saved")}
        onSaved={onGameExePathChange}
      />

      <LinkExeField
        game={initialData}
        selectableLinkItems={selectableLinkItems}
        onLinkExeChange={onLinkExeChange}
      />

      <EditablePathField
        gameId={initialData.id}
        initialPath={initialData.cover}
        field="cover"
        label={t("detail.coverPath.label")}
        selectLabel={t("detail.coverPath.select")}
        filterName={t("detail.coverPath.fileFilter")}
        extensions={imageFileExtensions}
        emptyMessage={t("detail.coverPath.empty")}
        savedMessage={t("detail.coverPath.saved")}
        onSaved={(_, coverPath) => onGameFieldChange("cover", coverPath)}
      />

      <PlayTimeChart records={initialData.daily_play_times} />
    </div>
  );
}
