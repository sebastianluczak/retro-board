import { useEffect, useState } from "react";

export function useGridStyles(columns: number) {
  const [gridTemplateColumns, setGridTemplateColumns] = useState<string>("repeat(auto-fit, minmax(300px, 1fr))");
  const [gridGap, setGridGap] = useState<string>("16px");

  useEffect(() => {
    setGridTemplateColumns(`repeat(${columns}, minmax(300px, 1fr))`);
    setGridGap(`${columns * 4}px`);
  }, [columns]);

  return { gridTemplateColumns, gridGap };
}
