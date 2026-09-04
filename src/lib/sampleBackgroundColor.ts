// Reads the rendered pixel color behind a screen point, so UI can react to
// whatever photo is actually underneath it. One canvas per image src, cached
// (drawImage is too costly to repeat on every sample).
const canvasCache = new Map<string, CanvasRenderingContext2D | null>();

function getCanvasCtx(img: HTMLImageElement): CanvasRenderingContext2D | null {
  const cached = canvasCache.get(img.src);
  if (cached !== undefined) return cached;

  if (!img.complete || img.naturalWidth === 0) return null;

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    canvasCache.set(img.src, null);
    return null;
  }
  try {
    ctx.drawImage(img, 0, 0);
  } catch {
    // Tainted canvas (cross-origin image).
    canvasCache.set(img.src, null);
    return null;
  }
  canvasCache.set(img.src, ctx);
  return ctx;
}

// Luminance (0 = black, 255 = white) of the <img> at this screen point, or
// null if there's no image there — callers should fall back to their own
// default, not treat null as "dark" or "light".
export function sampleLuminanceAtPoint(
  clientX: number,
  clientY: number,
): number | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  const img = stack.find(
    (el): el is HTMLImageElement => el instanceof HTMLImageElement,
  );
  if (!img) return null;

  const ctx = getCanvasCtx(img);
  if (!ctx) return null;

  const rect = img.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  // object-fit: cover, object-position 50% 50% — scales to fill the box on
  // its shorter axis, crops evenly on both sides of the longer one.
  const scale = Math.max(
    rect.width / img.naturalWidth,
    rect.height / img.naturalHeight,
  );
  const cropX = (img.naturalWidth * scale - rect.width) / 2;
  const cropY = (img.naturalHeight * scale - rect.height) / 2;

  const natX = (clientX - rect.left + cropX) / scale;
  const natY = (clientY - rect.top + cropY) / scale;
  const x = Math.max(0, Math.min(img.naturalWidth - 1, Math.round(natX)));
  const y = Math.max(0, Math.min(img.naturalHeight - 1, Math.round(natY)));

  try {
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  } catch {
    return null;
  }
}
