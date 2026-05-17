export function rectToWorld(
  rect: DOMRect,
  viewportWorld: { width: number; height: number },
): { x: number; y: number } {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const vv = window.visualViewport;
  const vpW = vv?.width ?? window.innerWidth;
  const vpH = vv?.height ?? window.innerHeight;
  const ndcX = (cx / vpW) * 2 - 1;
  const ndcY = -((cy / vpH) * 2 - 1);
  return {
    x: (ndcX * viewportWorld.width) / 2,
    y: (ndcY * viewportWorld.height) / 2,
  };
}
