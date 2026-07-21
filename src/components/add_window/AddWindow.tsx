import type { FolderGame } from "../../api/foldergames";
import { useAddWindow } from "../../hooks/useAddWindow";
import { AnimatedWindowFrame } from "../ui/AnimatedWindowFrame";
import { AddNamingPanel } from "./AddNamingPanel";
import { AddProgressPanel } from "./AddProgressPanel";
import { AddSetupPanel } from "./AddSetupPanel";

interface AddWindowProps {
  onClose: () => void;
  isClosing: boolean;
  onGamesCommitted: () => void;
  onGameAdded: (game: FolderGame) => void;
  onFlowActiveChange: (active: boolean) => void;
}

export function AddWindow({
  onClose,
  isClosing,
  onGamesCommitted,
  onGameAdded,
  onFlowActiveChange,
}: AddWindowProps) {
  const addWindow = useAddWindow({
    onClose,
    onGamesCommitted,
    onGameAdded,
    onFlowActiveChange,
  });

  return (
    <AnimatedWindowFrame isClosing={isClosing}>
      <div
        style={{
          width: "100%",
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flex: 1,
          flexDirection: addWindow.phase === "setup" ? "column" : undefined,
          alignItems:
            addWindow.phase === "setup" || addWindow.phase === "naming"
              ? "center"
              : undefined,
          justifyContent:
            addWindow.phase === "setup" || addWindow.phase === "naming"
              ? "center"
              : undefined,
          color: "var(--qp-text)",
        }}
      >
        {addWindow.phase === "setup" ? (
          <AddSetupPanel
            addMode={addWindow.addMode}
            sources={addWindow.sources}
            onAddModeChange={addWindow.setAddMode}
            onSourceChange={addWindow.handleSourceChange}
            onPathSelected={addWindow.handlePathSelected}
            onDirectorySelected={addWindow.handleDirectorySelected}
            onSteamImport={addWindow.handleSteamImport}
          />
        ) : addWindow.phase === "naming" ? (
          <AddNamingPanel
            path={addWindow.pendingSingleGamePath}
            name={addWindow.singleGameName}
            onNameChange={addWindow.setSingleGameName}
            onBack={addWindow.handleNamingBack}
            onSearch={addWindow.handleSingleGameSearch}
          />
        ) : (
          <AddProgressPanel
            phase={addWindow.phase}
            searchItems={addWindow.searchItems}
            expandedIndex={addWindow.expandedIndex}
            isCancelling={addWindow.isCancelling}
            selectionCount={addWindow.selectionCount}
            onExpandedIndexChange={addWindow.setExpandedIndex}
            onCandidateSelect={addWindow.handleCandidateSelect}
            onResultDelete={addWindow.handleResultDelete}
            onCancel={addWindow.handleCancel}
            onConfirm={addWindow.handleConfirm}
          />
        )}
      </div>
    </AnimatedWindowFrame>
  );
}
