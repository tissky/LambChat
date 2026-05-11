import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("reveal artifacts summary mirrors the file tree view row details", () => {
  const summarySource = readFileSync(
    new URL("../RevealArtifactsSummary.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    summarySource,
    /const imageSrc = isImageFile\(ext\)/,
    "file rows should detect image thumbnails the same way FileTreeView does",
  );
  assert.match(
    summarySource,
    /<img[\s\S]*src=\{imageSrc\}/,
    "image file rows should render a thumbnail from the artifact preview URL",
  );
  assert.match(
    summarySource,
    /formatSize\(dirSize\)/,
    "directory rows should show the aggregated size like FileTreeView",
  );
});
