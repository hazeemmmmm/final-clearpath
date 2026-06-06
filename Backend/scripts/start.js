import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

if (args.includes("dev")) {
    console.log("[START] Starting backend in development mode with nodemon...");
    const child = spawn("npx", ["nodemon", "--signal", "SIGINT", "src/index.js"], {
        stdio: "inherit",
        shell: true,
        cwd: path.resolve(__dirname, "..")
    });
    child.on("exit", (code) => {
        process.exit(code);
    });
} else {
    console.log("[START] Starting backend in production mode...");
    const child = spawn("node", ["src/index.js"], {
        stdio: "inherit",
        shell: true,
        cwd: path.resolve(__dirname, "..")
    });
    child.on("exit", (code) => {
        process.exit(code);
    });
}
