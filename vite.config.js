import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Version stamp shown in the header. CI can pin it with APP_VERSION; otherwise
// it is derived from the build date as YY.M.D (same format as before).
function appVersion() {
  if (process.env.APP_VERSION) return process.env.APP_VERSION;
  const now = new Date();
  return `${String(now.getFullYear()).slice(2)}.${now.getMonth() + 1}.${now.getDate()}`;
}

export default defineConfig({
  // Relative base so the same build works at the site root and in the /test/ preview folder on GitHub Pages.
  base: "./",
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      // The 3D viewer is its own page, loaded into the Robot Viewer card's iframe.
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        viewer: fileURLToPath(new URL("viewer.html", import.meta.url)),
      },
    },
  },
  plugins: [
    VitePWA({
      // "prompt": a new version waits until the user confirms a reload, so an
      // update can never replace the running app in the middle of a match.
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        name: "PitBeacon",
        short_name: "PitBeacon",
        description: "FRC pit display: match alerts, rankings, pit notes and a 3D robot viewer.",
        start_url: "./",
        scope: "./",
        display: "standalone",
        background_color: "#1a1a1a",
        theme_color: "#1a1a1a",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,mp3,png,svg,wasm,json,urdf,glb,webmanifest}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/googlef.*\.html$/, /viewer\.html$/, /\/test\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
