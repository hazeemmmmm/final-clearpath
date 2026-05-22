import { ChatbotService } from "./chatbot.service.js";

const chatbotService = new ChatbotService();

/**
 * Handle sending a message to the chatbot
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user._id; // Loaded from authMiddleware

    const updatedChat = await chatbotService.processMessage(userId, message, chatId);

    // Return the response containing the latest message (AI response) and other details
    const latestMessage = updatedChat.messages[updatedChat.messages.length - 1];

    return res.status(200).json({
      success: true,
      message: "Message processed successfully",
      data: {
        chatId: updatedChat._id,
        title: updatedChat.title,
        reply: latestMessage.content,
        messages: updatedChat.messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle retrieving the chat history list for the logged-in user
 */
export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const chats = await chatbotService.getUserChats(userId);

    return res.status(200).json({
      success: true,
      message: "Chat history retrieved successfully",
      data: chats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle retrieving detailed messages for a specific chat session
 */
export const getChatDetails = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chatSession = await chatbotService.getChatDetails(userId, chatId);

    return res.status(200).json({
      success: true,
      message: "Chat details retrieved successfully",
      data: chatSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle deleting a specific chat session
 */
export const deleteChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const result = await chatbotService.deleteChat(userId, chatId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
