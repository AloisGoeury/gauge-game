import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@gauge-game/shared": path.resolve(__dirname, "shared/src/index.ts")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./client/src/test/setup.ts"],
    include: ["shared/src/**/*.test.ts", "server/src/**/*.test.ts", "client/src/**/*.test.tsx"]
  }
});
