import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// The app shell (<div id="root">) has no visible content until React mounts,
// so there is nothing for the stylesheet to "flash" past — loading it as a
// non-blocking preload lets the browser fetch CSS and JS in parallel instead
// of the CSS gating first paint, without risking a styled/unstyled flash.
function nonBlockingStylesheet(): Plugin {
  return {
    name: "non-blocking-stylesheet",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html.replace(
          /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g,
          (_match, href) =>
            `<link rel="preload" as="style" crossorigin href="${href}" onload="this.onload=null;this.rel='stylesheet'">` +
            `<noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`
        );
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "/", // Laravel serves from root, not /TailAdmin/
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
    nonBlockingStylesheet(),
  ],
  build: {
    outDir: "../public/react", // Laravel public folder
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
    "/api": "http://127.0.0.1:8000",
    "/storage": "http://127.0.0.1:8000",
  },
  },
});
