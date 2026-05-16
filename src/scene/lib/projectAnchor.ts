export function rectToWorld(
  rect: DOMRect,
  viewportWorld: { width: number; height: number },
): { x: number; y: number } {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const ndcX = (cx / window.innerWidth) * 2 - 1;
  const ndcY = -((cy / window.innerHeight) * 2 - 1);
  return {
    x: (ndcX * viewportWorld.width) / 2,
    y: (ndcY * viewportWorld.height) / 2,
  };
}
