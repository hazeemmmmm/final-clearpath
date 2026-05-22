import { Router } from "express";
import * as chatbotController from "./chatbot.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

// Protect all chatbot routes with authMiddleware
router.use(authMiddleware);

// Send message to chatbot (creates new session if chatId is not provided)
router.post("/message", chatbotController.sendMessage);

// Get chatbot history list
router.get("/history", chatbotController.getHistory);

// Get specific chat details
router.get("/session/:chatId", chatbotController.getChatDetails);

// Delete specific chat session
router.delete("/session/:chatId", chatbotController.deleteChat);

export default router;
