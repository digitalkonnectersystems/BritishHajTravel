"use client";

import type { ReactNode } from "react";

/** All packages on non-home Hajj listing pages; no pagination/slider controls. */
export default function HajjPackagePager<T>({
  items,
  renderCard,
}: {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
}) {
  return (
    <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => renderCard(item, index))}
    </div>
  );
}
