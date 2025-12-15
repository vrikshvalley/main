// Simple store for sticky header data
let stickyHeaderData = { title: null, subtitle: null };
let listeners = [];

export function setStickyHeaderData(data) {
  stickyHeaderData = data;
  listeners.forEach((listener) => listener(stickyHeaderData));
}

export function getStickyHeaderData() {
  return stickyHeaderData;
}

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
