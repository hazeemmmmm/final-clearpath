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

    // 4. Extract Destination and Budget
    let extractedDestination = null;
    let extractedBudget = null;

    // Use Gemini for extraction if API Key is configured
    const apiKey = devConfig.GEMINI_API_KEY;
    if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const extractionModel = genAI.getGenerativeModel({
          model: "gemini-flash-latest",
          generationConfig: { responseMimeType: "application/json" }
        });

        const extractionPrompt = `
Analyze the following travel message from a tourist. Extract:
1. The destination name in English (e.g. Cairo, Giza, Luxor, Hurghada, Dahab, Alexandria). If mentioned in Arabic (e.g. القاهرة, الغردقة, دهب, الاقصر, الاسكندرية), translate it to the English name. If no destination is mentioned, return null.
2. The maximum budget as a number (representing EGP). If the budget is mentioned in USD (e.g. $100, 100 USD), convert it to EGP assuming 1 USD = 50 EGP. If no budget is mentioned, return null.

Respond ONLY with a JSON object containing keys "destination" and "budget".

User message: "${userMessage}"
`;
        const extractionResult = await Promise.race([
          extractionModel.generateContent(extractionPrompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Extraction timed out")), 1500))
        ]);
        const responseText = extractionResult.response.text().trim();
        const parsed = JSON.parse(responseText);
        extractedDestination = parsed.destination;
        extractedBudget = parsed.budget;
      } catch (err) {
        console.error("Gemini extraction error or timeout:", err);
      }
    }

    // Robust Fallback: Regex-based extraction (essential for Mock mode / fallback)
    if (!extractedDestination || !extractedBudget) {
      const destMapping = {
        cairo: "Cairo",
        giza: "Cairo",
        luxor: "Luxor",
        hurghada: "Hurghada",
        dahab: "Dahab",
        alexandria: "Alexandria",
        القاهرة: "Cairo",
        الجيزة: "Cairo",
        الأقصر: "Luxor",
        الغردقة: "Hurghada",
        دهب: "Dahab",
        الإسكندرية: "Alexandria",
        الاسكندرية: "Alexandria"
      };

      const lowerMessage = userMessage.toLowerCase();
      if (!extractedDestination) {
        for (const [key, value] of Object.entries(destMapping)) {
          if (lowerMessage.includes(key)) {
            extractedDestination = value;
            break;
          }
        }
      }

      if (!extractedBudget) {
        const usdMatch = userMessage.match(/(\d+(?:\.\d+)?)\s*(?:usd|\$|دولار)/i) || userMessage.match(/(?:\$)\s*(\d+(?:\.\d+)?)/i);
        const egpMatch = userMessage.match(/(\d+(?:\.\d+)?)\s*(?:egp|le|جنيه|ج.م)/i);
        
        if (usdMatch) {
          extractedBudget = Math.floor(parseFloat(usdMatch[1]) * 50);
        } else if (egpMatch) {
          extractedBudget = Math.floor(parseFloat(egpMatch[1]));
        } else {
          // Look for any 3-5 digit number in the string as budget if not matched with currency
          const numberMatch = userMessage.match(/\b(\d{3,5})\b/);
          if (numberMatch) {
            extractedBudget = parseInt(numberMatch[1]);
          }
        }
      }
    }

    // 5. Query experiences database based on extracted destination/budget
    let recommendedPackages = [];
    if (extractedDestination || extractedBudget) {
      let query = {};
      if (extractedDestination) {
        const DestinationModel = (await import("../../db/models/destination.model.js")).Destination;
        const destDoc = await DestinationModel.findOne({
          name: { $regex: new RegExp(`^${extractedDestination}$`, "i") }
        });
        if (destDoc) {
          query.destination = destDoc._id;
        } else {
          query.$or = [
            { name: { $regex: new RegExp(extractedDestination, "i") } },
            { description: { $regex: new RegExp(extractedDestination, "i") } }
          ];
        }
      }

      if (extractedBudget) {
        query.price = { $lte: Number(extractedBudget) };
      }

      const ExperienceModel = (await import("../../db/models/experience.model.js")).Experience;
      recommendedPackages = await ExperienceModel.find(query).limit(3);
    }

    let aiReply = "";

    // MOCK SIMULATION FOR NEGOTIATION (Graduation Project Demo)
    const negotiationRegex = /(discount|expensive|offer|coupon|too high|cheaper|خصم|غالي|كوبون)/gi;
    
    // Count how many times the user mentioned negotiation words in the entire session
    let negotiationCount = 0;
    chatSession.messages.forEach(msg => {
      if (msg.role === 'user') {
        const matches = msg.content.match(negotiationRegex);
        if (matches) negotiationCount += matches.length;
      }
    });
    
    if (negotiationCount >= 3) {
      // User has negotiated hard enough! Generate a coupon (Max 15%)
      const Coupon = (await import("../../db/models/coupon.model.js")).Coupon;
      const discountPercent = Math.floor(Math.random() * 6) + 10; // 10% to 15%
      const code = "LUXURY" + discountPercent + "X" + Math.floor(100 + Math.random() * 900);
      
      const newCoupon = await Coupon.create({
        code: code,
        discount_percentage: discountPercent,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        is_active: true
      });

      aiReply = `I understand that pricing is very important to you. Because you are planning your premium trip with ClearPath AI, I've managed to negotiate a special ${discountPercent}% discount just for you. 🎉\n\nPlease use the promo code **${code}** at checkout. It is valid for the next 24 hours. Let me know if you need help planning your itinerary!`;
    } else if (userMessage.toLowerCase().match(negotiationRegex)) {
      // Mentioned but not enough times yet
      aiReply = "I understand you're looking for the best value! Our packages are priced to ensure premium quality and dedicated service. However, if you have a specific budget in mind, I can help you find the best options.";
    } else {
      // 6. Generate reply with Gemini or Mock fallback
      if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.trim() === "") {
        // MOCK MODE with database package integration!
        if (recommendedPackages.length > 0) {
          aiReply = `I have successfully queried our database and found ${recommendedPackages.length} luxury experiences matching your request. Take a look at these exclusive choices:`;
        } else {
          aiReply = "I am the ClearPath AI assistant! (Mock Mode active). I can help you plan trips, find activities, and recommend packages. Try asking me for 'trips in Hurghada under 3000 EGP'!";
        }
      } else {
        try {
          // If packages are found, inject them into Gemini system context
          let systemInstructionText = SYSTEM_INSTRUCTION;
          if (recommendedPackages.length > 0) {
            const pkgListStr = recommendedPackages.map(p => `"${p.name}" (Price: ${p.price || p.base_price} EGP, Duration: ${p.duration_days} days)`).join(", ");
            systemInstructionText += `\n\n[DATABASE RECOMMENDATION CONTEXT]: We found these actual trips/packages in our database matching the user's search: ${pkgListStr}. In your response, politely mention that you have found these matching premium packages (which will be displayed as interactive cards below the chat bubble) and briefly describe them to get the user excited to book. Do not invent any other packages. Keep the response friendly and aligned with their preferred language.`;
          }

          // Initialize Gemini API Client
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: systemInstructionText,
          });

          // Convert Mongoose history to Gemini-compatible history array (excluding the newly pushed message)
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

          // Send the new message with a 2.2 seconds timeout
          const result = await Promise.race([
            chat.sendMessage(userMessage),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini response timed out")), 2200))
          ]);
          aiReply = result.response.text();

        } catch (error) {
          console.error("Gemini AI API Error (falling back to local AI rules):", error);
          
          // GRACEFUL FALLBACK: Use smart local rule-based system so the chat NEVER crashes!
          if (recommendedPackages.length > 0) {
            aiReply = `I have successfully checked our database and found ${recommendedPackages.length} matching premium travel experiences for you! You can view their details or book them directly using the interactive cards below. Let me know if you would like to adjust your destination or budget!`;
          } else {
            // General friendly fallback response that answers in a helpful way
            const isArabic = userMessage.match(/[\u0600-\u06FF]/);
            if (isArabic) {
              aiReply = `مرحباً بك! أنا مساعد ClearPath الذكي. لمساعدتك في التخطيط لرحلتك المميزة في مصر، يمكنك:\n1. استكشاف الوجهات الرائعة المتوفرة على منصتنا.\n2. تصميم رحلتك الخاصة بالكامل (Custom Trip) وإضافة الفنادق والأنشطة التي تفضلها.\n3. تصفح وحجز الرحلات الفاخرة الجاهزة.\n\nما هي المدينة التي ترغب في زيارتها، أو ما هي ميزانيتك المتوقعة بالجنيه المصري؟`;
            } else {
              aiReply = `Welcome! I am your ClearPath AI Assistant. To help you plan your premium experience in Egypt, you can:\n1. Explore our hand-picked destinations.\n2. Design your own custom itinerary by adding activities, hotels, and tours.\n3. Book pre-planned luxury packages directly.\n\nTell me which city you would like to explore or share your budget in EGP, and I will find the perfect packages for you!`;
            }
          }
        }
      }
    }

    // 7. Add AI's reply to database history
    chatSession.messages.push({
      role: "model",
      content: aiReply,
      packages: recommendedPackages.map(pkg => pkg._id),
    });

    // 8. Save back to database
    await chatSession.save();

    // Populate packages so the frontend gets full details!
    await chatSession.populate({
      path: "messages.packages",
      model: "Experience"
    });

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
    await chatSession.populate({
      path: "messages.packages",
      model: "Experience"
    });
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
