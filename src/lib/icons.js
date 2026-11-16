// Small inline SVG icons (24x24, stroke-based) so nothing depends on an icon font or CDN.

const PATHS = {
  tool: '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 17l-4 4-5.7-1.3a4 4 0 0 0-5-5L5 8l4-4z"/>',
  battery: '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 11v2m4-2v2"/>',
  package: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  checklist: '<path d="m4 6 1.5 1.5L8 5m-4 8 1.5 1.5L8 12m-4 8 1.5 1.5L8 19"/><path d="M12 6h8m-8 7h8m-8 7h8"/>',
  flag: '<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
  upload: '<path d="M12 16V4m0 0 4 4m-4-4L8 8M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"/>',
  play: '<path d="m6 4 14 8-14 8z"/>',
  pause: '<path d="M7 4h3v16H7zm7 0h3v16h-3z"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8m0-5v5h-5"/>',
  trash: '<path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
};

export function icon(name, size = 16) {
  const body = PATHS[name] ?? "";
  return `<svg class="pb-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}
