import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

console.log("🏗️  Building FitQuest...");

// 1. Build frontend with Vite
console.log("📦 Building frontend...");
execSync("npx vite build", { stdio: "inherit", cwd: root });

// 2. Build backend with esbuild
console.log("⚙️  Building backend...");
if (!existsSync(path.join(root, "dist"))) {
  mkdirSync(path.join(root, "dist"), { recursive: true });
}

execSync(
  `npx esbuild server/index.ts \
    --bundle \
    --platform=node \
    --format=cjs \
    --outfile=dist/index.cjs \
    --external:pg \
    --external:pg-native \
    --external:bcrypt \
    --external:fsevents \
    --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"`,
  { stdio: "inherit", cwd: root }
);

console.log("✅ Build complete!");
