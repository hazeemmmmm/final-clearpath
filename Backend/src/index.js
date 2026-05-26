import express from "express";
import bootstrap from "./app.controller.js";
import { devConfig } from "./config/env/dev.config.js";
import { exec } from "child_process";

const app = express();

function freePortAndStart(port) {
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
        if (stdout) {
            const pid = parseInt(stdout.trim().split(/\s+/).pop());
            if (pid > 0) {
                console.log(`Port ${port} is in use by PID ${pid}. Killing process...`);
                exec(`taskkill /PID ${pid} /F`, (killErr) => {
                    if (killErr) {
                        console.error("Failed to kill process:", killErr);
                    } else {
                        console.log(`Process ${pid} killed. Starting server...`);
                        startServer(port);
                    }
                });
            } else {
                console.log(`No valid PID found for port ${port}, starting server...`);
                startServer(port);
            }
        } else {
            startServer(port);
        }
    });
}

function startServer(port) {
    app.listen(port, () => console.log(`Server is running on port ${port}`));
}

(async () => {
    await bootstrap(app, express);
    
    const PORT = devConfig.PORT || 3000;
    freePortAndStart(PORT);
})();

// Nodemon reload trigger: updated complete Stripe keys, USD/EGP support, client port 5173, and JWT refresh handler successfully!