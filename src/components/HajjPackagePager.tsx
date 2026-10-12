"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Two landscape cards per desktop row, four packages per page. Arrows only when >4 items. */
export default function HajjPackagePager<T>({
  items,
  renderCard,
}: {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
}) {
  const [requestedPage, setRequestedPage] = useState(0);
  const totalPages = Math.ceil(items.length / 4);
  const page = Math.min(requestedPage, Math.max(0, totalPages - 1));
  const showControls = items.length > 4;
  const pageItems = items.slice(page * 4, page * 4 + 4);

  return (
    <div className="min-w-0">
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        {pageItems.map((item, index) => renderCard(item, page * 4 + index))}
      </div>
      {showControls && (
        <nav className="mt-7 flex items-center justify-center gap-5" aria-label="Hajj packages pages">
          <button
            type="button"
            aria-label="Previous four packages"
            onClick={() => setRequestedPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-primary bg-white text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-primary"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <span className="text-sm font-bold text-primary" aria-live="polite">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            aria-label="Next four packages"
            onClick={() => setRequestedPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-primary bg-white text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-primary"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </nav>
      )}
    </div>
  );
}
