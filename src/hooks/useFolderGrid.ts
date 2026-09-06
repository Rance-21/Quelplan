import { useLayoutEffect, useState, RefObject } from "react";

export interface FolderGridLayout {
  columns: number;
  rootFontSize: number;
  cardHeight: number;
  rowStride: number;
}

export function calculateFolderGridLayout(
  contentWidth: number,
  rootFontSize: number = 16,
  cardWidthRem: number = 10,
  gapRem: number = 2.25,
): FolderGridLayout {
  const safeContentWidth = Math.max(0, contentWidth);
  const safeRootFontSize = rootFontSize > 0 ? rootFontSize : 16;
  const cardMinWidthPx = cardWidthRem * safeRootFontSize;
  const gapPx = gapRem * safeRootFontSize;
  const computedColumns = Math.floor(
    (safeContentWidth + gapPx) / (cardMinWidthPx + gapPx),
  );
  const columns = Math.max(1, computedColumns);
  const totalGapWidth = Math.max(0, columns - 1) * gapPx;
  const cardWidth = Math.max(
    0,
    (safeContentWidth - totalGapWidth) / columns,
  );
  const cardHeight = (cardWidth * 4) / 3;

  return {
    columns,
    rootFontSize: safeRootFontSize,
    cardHeight,
    rowStride: cardHeight + gapPx,
  };
}

export function useFolderGrid(
  containerRef: RefObject<HTMLDivElement | null>,
  cardWidthRem: number = 10,
  gapRem: number = 2.25,
) {
  const [layout, setLayout] = useState<FolderGridLayout | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateLayout = (containerWidth: number) => {
      const rootFontSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const nextLayout = calculateFolderGridLayout(
        containerWidth,
        rootFontSize,
        cardWidthRem,
        gapRem,
      );

      setLayout((currentLayout) => {
        if (
          currentLayout?.columns === nextLayout.columns &&
          currentLayout.rootFontSize === nextLayout.rootFontSize &&
          currentLayout.cardHeight === nextLayout.cardHeight &&
          currentLayout.rowStride === nextLayout.rowStride
        ) {
          return currentLayout;
        }
        return nextLayout;
      });
    };

    const getContentWidth = () => {
      const styles = getComputedStyle(container);
      const paddingLeft = parseFloat(styles.paddingLeft) || 0;
      const paddingRight = parseFloat(styles.paddingRight) || 0;

      return Math.max(0, container.clientWidth - paddingLeft - paddingRight);
    };

    updateLayout(getContentWidth());

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      updateLayout(entry.contentRect.width);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [cardWidthRem, gapRem, containerRef]);

  return layout;
}
