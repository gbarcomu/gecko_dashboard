"use client";

import { useState } from "react";
import { toPng } from "html-to-image";

export default function DownloadButton({
  targetId,
  fileName,
}: {
  targetId: string;
  fileName: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    const node = document.getElementById(targetId);
    if (!node) return;
    setBusy(true);
    try {
      // Capture the canvas at its exact fixed size (keeps a true 16:9 ratio).
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const options = {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width,
        height,
        style: { margin: "0" },
      };
      // Render twice: the first pass primes fonts/images so the second is clean.
      await toPng(node, options);
      const dataUrl = await toPng(node, { ...options, cacheBust: true });
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={handleDownload} disabled={busy}>
      {busy ? "Generating…" : "⬇ Download PNG"}
    </button>
  );
}
