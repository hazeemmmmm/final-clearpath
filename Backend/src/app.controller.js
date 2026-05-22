import {connectDB} from "./db/connection.js";
import { globalErrorHandler } from "./utils/error/globalErrorHandler.js";
import authRouter from "./module/auth/auth.router.js";
import activityRouter from "./module/activity/activity.router.js";
import customTripRouter from "./module/customTrip/customTrip.router.js";
import experienceRouter from "./module/experience/experience.router.js";
import userRouter from "./module/user/user.router.js";
import chatbotRouter from "./module/chatbot/chatbot.router.js";

const bootstrap = async (app, express) => {
    app.use(express.json());
    connectDB();

    // CORS Middleware
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        if (req.method === "OPTIONS") {
            return res.sendStatus(200);
        }
        next();
    });

    app.use("/auth", authRouter);
    app.use("/activity", activityRouter);
    app.use("/customTrip", customTripRouter);
    app.use("/experience", experienceRouter);
    app.use("/user", userRouter);
    app.use("/chatbot", chatbotRouter);

    app.use(globalErrorHandler);
};

export default bootstrap;