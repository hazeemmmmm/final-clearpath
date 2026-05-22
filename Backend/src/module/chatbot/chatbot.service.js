import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatbotRepository } from "../../db/repo/chatbot.repository.js";
import { devConfig } from "../../config/env/dev.config.js";
import { BadRequestException } from "../../utils/error/index.js";

const chatRepo = new ChatbotRepository();

// System prompt defining ClearPath AI persona
const SYSTEM_INSTRUCTION = `
You are the ClearPath AI Travel Assistant. ClearPath is a premium travel planning and tourism platform that offers:
1. Destination discovery (cities, description, maps).
2. Custom Trip planning (users can customize and create their own custom trips).
3. Activities (tours, entertainment, hiking, hotels, food).
4. Bookings and payment options.

Your job is to:
- Be a polite, friendly, and extremely helpful travel companion.
- Guide users on how to plan their trips, recommend nice cities or activities, and explain how to use the ClearPath platform features.
- If a user asks for trip suggestions, encourage them to customize a trip or check out available destinations on the platform.
- Respond concisely, professionally, and in a travel-loving, cheerful tone.
- You can speak both Arabic and English perfectly, matching the user's preferred language.
`;

export class ChatbotService {
  /**
   * Process a message sent by the user to the chatbot
   * @param {string} userId - ID of the logged-in user
   * @param {string} userMessage - Message sent by the user
   * @param {string} [chatId] - ID of the existing chat session (if any)
   */
  async processMessage(userId, userMessage, chatId) {
    if (!userMessage || userMessage.trim() === "") {
      throw new BadRequestException("Message content cannot be empty");
    }

    let chatSession;

    // 1. Fetch or create the chat session in MongoDB
    if (chatId) {
      chatSession = await chatRepo.getOne({ _id: chatId, userId });
      if (!chatSession) {
        throw new BadRequestException("Chat session not found or does not belong to you");
      }
    } else {
      chatSession = await chatRepo.create({
        userId,
        title: "New Chat",
        messages: [],
      });
    }

    // 2. Add user's message to local database history
    chatSession.messages.push({
      role: "user",
      content: userMessage,
    });

    // 3. Update the chat title if it's the default "New Chat"
    if (chatSession.title === "New Chat" && chatSession.messages.length > 0) {
      // Set title as the first 5 words of the user's message (max 30 chars)
      const words = userMessage.split(/\s+/).slice(0, 5).join(" ");
      chatSession.title = words.length > 30 ? words.substring(0, 30) + "..." : words;
    }

    let aiReply = "";

    // 4. Check if Gemini API Key is configured
    const apiKey = devConfig.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.trim() === "") {
      aiReply = "⚠️ [System Notice]: Gemini API Key is not configured in dev.env. Please set GEMINI_API_KEY to start conversing with the AI assistant.";
    } else {
      try {
        // Initialize Gemini API Client
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-flash-latest",
          systemInstruction: SYSTEM_INSTRUCTION,
        });

        // Convert Mongoose history to Gemini-compatible history array (excluding the newly pushed message)
        // Gemini expects: { role: "user"|"model", parts: [{ text: "..." }] }
        const formattedHistory = chatSession.messages
          .slice(0, -1) // Exclude the new user message we just added
          .map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          }));

        // Start Chat Session with history
        const chat = model.startChat({
          history: formattedHistory,
        });

        // Send the new message to get response
        const result = await chat.sendMessage(userMessage);
        aiReply = result.response.text();

      } catch (error) {
        console.error("Gemini AI API Error:", error);
        aiReply = `🤖 [AI Error]: Sorry, I encountered an issue while generating a response. (${error.message || "Unknown error"})`;
      }
    }

    // 5. Add AI's reply to database history
    chatSession.messages.push({
      role: "model",
      content: aiReply,
    });

    // 6. Save back to database
    await chatSession.save();

    return chatSession;
  }

  /**
   * Get all chat sessions of a specific user
   * @param {string} userId
   */
  async getUserChats(userId) {
    // Return sessions sorted by last updated
    return await chatRepo.getAll({ userId }, null, { sort: { updatedAt: -1 } });
  }

  /**
   * Get specific chat session details
   * @param {string} userId
   * @param {string} chatId
   */
  async getChatDetails(userId, chatId) {
    const chatSession = await chatRepo.getOne({ _id: chatId, userId });
    if (!chatSession) {
      throw new BadRequestException("Chat session not found or does not belong to you");
    }
    return chatSession;
  }

  /**
   * Delete a specific chat session
   * @param {string} userId
   * @param {string} chatId
   */
  async deleteChat(userId, chatId) {
    const chatSession = await chatRepo.getOne({ _id: chatId, userId });
    if (!chatSession) {
      throw new BadRequestException("Chat session not found or does not belong to you");
    }
    await chatRepo.delete({ _id: chatId });
    return { success: true, message: "Chat session deleted successfully" };
  }
}
