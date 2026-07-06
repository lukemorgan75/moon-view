/** Run after DOM layout settles (current frame + two animation frames). */
export function afterLayout(run: () => void): void {
  run();
  requestAnimationFrame(() => {
    run();
    requestAnimationFrame(run);
  });
}