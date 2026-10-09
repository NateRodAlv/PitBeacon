export function setCardAutoScroll(target, enabled, speed = 30) {
  const current = target._cardAutoScroll;
  if (!enabled) {
    if (current) cancelAnimationFrame(current.frame);
    target._cardAutoScroll = null;
    return;
  }
  const scrollSpeed = Number.isFinite(Number(speed))
    ? Math.min(120, Math.max(30, Number(speed)))
    : 30;
  if (current) {
    current.speed = scrollSpeed;
    return;
  }

  const state = { frame: 0, lastTime: 0, pauseUntil: 0, speed: scrollSpeed };
  target._cardAutoScroll = state;

  const step = (time) => {
    if (!target.isConnected || target._cardAutoScroll !== state) {
      target._cardAutoScroll = null;
      return;
    }

    if (state.pauseUntil && time >= state.pauseUntil) {
      target.scrollTop = 0;
      state.pauseUntil = 0;
      state.lastTime = time;
    } else if (!state.pauseUntil && state.lastTime) {
      const maxScroll = target.scrollHeight - target.clientHeight;
      if (maxScroll > 0) {
        const elapsed = Math.min(time - state.lastTime, 50);
        target.scrollTop = Math.min(
          maxScroll,
          target.scrollTop + elapsed * state.speed / 1000,
        );
        if (target.scrollTop >= maxScroll - 1) {
          state.pauseUntil = time + 1200;
        }
      }
      state.lastTime = time;
    } else {
      state.lastTime = time;
    }

    state.frame = requestAnimationFrame(step);
  };

  state.frame = requestAnimationFrame(step);
}
