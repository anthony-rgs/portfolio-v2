// Plain mutable flag, not React state — read/written synchronously inside
// native wheel handlers so one UI claiming the wheel (TrackRadialMenu) can
// make others (the infinite-scroll column) ignore the same event, regardless
// of listener registration order.
let locked = false;

export function setWheelLocked(value: boolean) {
  locked = value;
}

export function isWheelLocked() {
  return locked;
}
