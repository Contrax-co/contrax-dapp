import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    server: {
        port: 3000,
        open: true,
    },
    envPrefix: "REACT_APP_",
    resolve: {
        alias: {
            src: "/src",
            jsbi: path.resolve(__dirname, "./node_modules/jsbi/dist/jsbi-cjs.js"),
            "~@fontsource/ibm-plex-mono": "@fontsource/ibm-plex-mono",
            "~@fontsource/inter": "@fontsource/inter",
        },
    },
    build: {
        outDir: "build",
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
});
