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

    // FETCH FRESH DB DATA FOR CONTEXT INJECTION (Booking Assistant, Itinerary Helper, Booking & Supervisor Support)
    const DestinationModel = (await import("../../db/models/destination.model.js")).Destination;
    const ExperienceModel = (await import("../../db/models/experience.model.js")).Experience;
    const BookingModel = (await import("../../db/models/booking.model.js")).Booking;

    const allExperiences = await ExperienceModel.find({}).populate("destination").populate("supervisor");
    const userBookings = await BookingModel.find({ user: userId }).populate({
      path: "experience",
      populate: { path: "supervisor" }
    });

    // Prepare experiences context
    const experiencesContext = allExperiences.map(e => {
      const supervisorName = e.supervisor ? `${e.supervisor.firstName} ${e.supervisor.lastName}` : "None";
      const supervisorEmail = e.supervisor ? e.supervisor.email : "";
      return `- Package/Experience Name: "${e.name}" (ID: ${e._id})\n  Type: ${e.type}\n  Destination: ${e.destination?.name || "Unknown"}\n  Price: ${e.price || e.base_price || 0} EGP\n  Duration: ${e.duration_days} days\n  Supervisor/Guide: ${supervisorName} (Email: ${supervisorEmail})`;
    }).join("\n");

    // Prepare bookings context
    const bookingsContext = userBookings.map(b => {
      const expName = b.experience ? b.experience.name : (b.snapshot?.title || "Custom Itinerary");
      const supervisor = b.experience?.supervisor ? `${b.experience.supervisor.firstName} ${b.experience.supervisor.lastName} (${b.experience.supervisor.email})` : "Not assigned yet";
      return `- Booking ID: ${b._id}\n  Package: "${expName}"\n  Status: ${b.status}\n  Total Paid/Amount: ${b.total_amount || 0} EGP\n  Date: ${b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "N/A"}\n  Supervisor: ${supervisor}`;
    }).join("\n") || "No active bookings found for this user.";

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
          new Promise((_, reject) => setTimeout(() => reject(new Error("Extraction timed out")), 3000))
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
        sokhna: "Sokhna",
        sharm: "Sharm El Sheikh",
        القاهرة: "Cairo",
        الجيزة: "Cairo",
        الأقصر: "Luxor",
        الغردقة: "Hurghada",
        دهب: "Dahab",
        الإسكندرية: "Alexandria",
        الاسكندرية: "Alexandria",
        السخنة: "Sokhna",
        سخنة: "Sokhna",
        سخنه: "Sokhna",
        "العين السخنة": "Sokhna",
        "شرم الشيخ": "Sharm El Sheikh",
        شرم: "Sharm El Sheikh"
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

      recommendedPackages = await ExperienceModel.find(query).limit(3);
    }

    let aiReply = "";

    // 6. Generate reply with Gemini or fallback
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.trim() === "") {
        // MOCK MODE with database package integration!
        const isArabic = userMessage.match(/[\u0600-\u06FF]/);
        
        // Check if user is asking about booking status or supervisor
        const askBooking = userMessage.toLowerCase().match(/(booking|hagez|حجز|رحلتي|مشرف|مسؤول|supervisor|guide|مرشد)/gi);
        if (askBooking) {
          if (userBookings.length > 0) {
            if (isArabic) {
              const bookingListStr = userBookings.map(b => {
                const expName = b.experience ? b.experience.name : (b.snapshot?.title || "رحلة مخصصة");
                const supervisor = b.experience?.supervisor ? `${b.experience.supervisor.firstName} ${b.experience.supervisor.lastName}` : "لم يتم التعيين بعد";
                return `- حجز رقم **${b._id}** لرحلة **${expName}**، الحالة: **${b.status === 'confirmed' ? 'مؤكد ✅' : 'قيد الانتظار ⏳'}**، المشرف المسؤول: **${supervisor}**`;
              }).join("\n");
              aiReply = `أهلاً بك! لقد فحصت الحجوزات الخاصة بك في النظام ووجدت الآتي:\n\n${bookingListStr}\n\nهل هناك أي شيء آخر يمكنني مساعدتك به بخصوص رحلتك؟`;
            } else {
              const bookingListStr = userBookings.map(b => {
                const expName = b.experience ? b.experience.name : (b.snapshot?.title || "Custom Itinerary");
                const supervisor = b.experience?.supervisor ? `${b.experience.supervisor.firstName} ${b.experience.supervisor.lastName}` : "Not assigned yet";
                return `- Booking ID **${b._id}** for **${expName}**, Status: **${b.status}**, Responsible Guide: **${supervisor}**`;
              }).join("\n");
              aiReply = `Hello! I checked your active bookings in our system:\n\n${bookingListStr}\n\nIs there anything else I can help you with?`;
            }
          } else {
            if (isArabic) {
              aiReply = "لم أعثر على أي حجوزات نشطة مسجلة باسمك حالياً في النظام. يمكنك تصفح باقاتنا وحجز رحلتك الأولى للبدء!";
            } else {
              aiReply = "I couldn't find any active bookings registered under your account in our system. Browse our packages to book your first trip!";
            }
          }
        } else if (recommendedPackages.length > 0) {
          if (isArabic) {
            aiReply = `لقد بحثت في قاعدة البيانات ووجدت لك ${recommendedPackages.length} من الرحلات الفاخرة المميزة المناسبة لطلبك في ${extractedDestination}. يمكنك استعراض تفاصيلها وحجزها مباشرة عبر البطاقات التفاعلية أدناه:`;
          } else {
            aiReply = `I have successfully queried our database and found ${recommendedPackages.length} luxury experiences matching your request for ${extractedDestination}. Take a look at these exclusive choices:`;
          }
        } else {
          if (isArabic) {
            aiReply = "أنا مساعد ClearPath الذكي. يمكنني مساعدتك في التخطيط للرحلات، ومعرفة تفاصيل حجوزاتك، أو اقتراح وجهات سياحية فاخرة. جرب أن تسألني عن 'رحلات في السخنة' أو 'حالة حجزي'!";
          } else {
            aiReply = "I am the ClearPath AI travel assistant! I can help you plan trips, track bookings, and recommend premium packages. Try asking me for 'trips in Sokhna' or 'my booking status'!";
          }
        }
      } else {
        try {
          // If packages are found, inject them into Gemini system context
          let systemInstructionText = SYSTEM_INSTRUCTION;
          
          systemInstructionText += `\n\n[REAL-TIME DATABASE CONTEXT]:
AVAILABLE TRIP PACKAGES ON CLEARPATH:
${experiencesContext}

CURRENT USER'S BOOKINGS:
${bookingsContext}

INSTRUCTIONS FOR THE BOT:
1. Dynamic Booking Assistant: Recommend packages from the AVAILABLE TRIP PACKAGES list above. If the user asks for a recommendation, ask about their desired city and budget, then search the context list and suggest matching ones.
2. Custom Itinerary Helper: If a user wants to build a custom trip, guide them on how to click "Start Customization" or "Extend Your Journey" in the UI, and suggest activities/days in destinations like Cairo or Sokhna.
3. Booking & Supervisor Support: If the user asks "what is my booking status?" or "who is my guide/supervisor?", check the CURRENT USER'S BOOKINGS list above, find their bookings, and tell them the exact status (e.g. pending, confirmed) and name of the supervisor responsible for that booking.
4. Keep the response in the user's language (Arabic if they speak Arabic, English if English). Avoid generic replies. Reference specific IDs or details from the database context when answering.`;

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
              role: msg.role === 'model' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            }));

          // Start Chat Session with history
          const chat = model.startChat({
            history: formattedHistory,
          });

          // Send the new message with an increased 8 seconds timeout for better reliability
          const result = await Promise.race([
            chat.sendMessage(userMessage),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini response timed out")), 8000))
          ]);
          aiReply = result.response.text();

        } catch (error) {
          console.error("Gemini AI API Error (falling back to local AI rules):", error);
          
          // GRACEFUL FALLBACK: Use smart local rule-based system so the chat NEVER crashes!
          const isArabic = userMessage.match(/[\u0600-\u06FF]/);
          const askBooking = userMessage.toLowerCase().match(/(booking|hagez|حجز|رحلتي|مشرف|مسؤول|supervisor|guide|مرشد)/gi);
          
          if (askBooking) {
            if (userBookings.length > 0) {
              if (isArabic) {
                const bookingListStr = userBookings.map(b => {
                  const expName = b.experience ? b.experience.name : (b.snapshot?.title || "رحلة مخصصة");
                  const supervisor = b.experience?.supervisor ? `${b.experience.supervisor.firstName} ${b.experience.supervisor.lastName}` : "لم يتم التعيين بعد";
                  return `- حجز رقم **${b._id}** لرحلة **${expName}**، الحالة: **${b.status === 'confirmed' ? 'مؤكد ✅' : 'قيد الانتظار ⏳'}**، المشرف المسؤول: **${supervisor}**`;
                }).join("\n");
                aiReply = `أهلاً بك! لقد فحصت الحجوزات الخاصة بك في النظام ووجدت الآتي:\n\n${bookingListStr}\n\nهل هناك أي شيء آخر يمكنني مساعدتك به بخصوص رحلتك؟`;
              } else {
                const bookingListStr = userBookings.map(b => {
                  const expName = b.experience ? b.experience.name : (b.snapshot?.title || "Custom Itinerary");
                  const supervisor = b.experience?.supervisor ? `${b.experience.supervisor.firstName} ${b.experience.supervisor.lastName}` : "Not assigned yet";
                  return `- Booking ID **${b._id}** for **${expName}**, Status: **${b.status}**, Responsible Guide: **${supervisor}**`;
                }).join("\n");
                aiReply = `Hello! I checked your active bookings in our system:\n\n${bookingListStr}\n\nIs there anything else I can help you with?`;
              }
            } else {
              if (isArabic) {
                aiReply = "لم أعثر على أي حجوزات نشطة مسجلة باسمك حالياً في النظام. يمكنك تصفح باقاتنا وحجز رحلتك الأولى للبدء!";
              } else {
                aiReply = "I couldn't find any active bookings registered under your account in our system. Browse our packages to book your first trip!";
              }
            }
          } else if (recommendedPackages.length > 0) {
            if (isArabic) {
              aiReply = `لقد بحثت في قاعدة البيانات ووجدت لك ${recommendedPackages.length} من الرحلات الفاخرة المميزة المناسبة لطلبك في ${extractedDestination}. يمكنك استعراض تفاصيلها وحجزها مباشرة عبر البطاقات التفاعلية أدناه:`;
            } else {
              aiReply = `I have successfully checked our database and found ${recommendedPackages.length} matching premium travel experiences for you in ${extractedDestination}! You can view their details or book them directly using the interactive cards below.`;
            }
          } else {
            if (isArabic) {
              aiReply = `مرحباً بك! أنا مساعد ClearPath الذكي. لمساعدتك في التخطيط لرحلتك المميزة في مصر، يمكنك:\n1. استكشاف الوجهات الرائعة المتوفرة على منصتنا.\n2. تصميم رحلتك الخاصة بالكامل (Custom Trip) وإضافة الفنادق والأنشطة التي تفضلها.\n3. تصفح وحجز الرحلات الفاخرة الجاهزة.\n\nما هي المدينة التي ترغب في زيارتها، أو ما هي ميزانيتك المتوقعة بالجنيه المصري؟`;
            } else {
              aiReply = `Welcome! I am your ClearPath AI Assistant. To help you plan your premium experience in Egypt, you can:\n1. Explore our hand-picked destinations.\n2. Design your own custom itinerary by adding activities, hotels, and tours.\n3. Book pre-planned luxury packages directly.\n\nTell me which city you would like to explore or share your budget in EGP, and I will find the perfect packages for you!`;
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
