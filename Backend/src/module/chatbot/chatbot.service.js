import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatbotRepository } from "../../db/repo/chatbot.repository.js";
import { devConfig } from "../../config/env/dev.config.js";
import { BadRequestException } from "../../utils/error/index.js";

const chatRepo = new ChatbotRepository();

// System prompt defining ClearPath AI persona
const SYSTEM_INSTRUCTION = `
You are the ClearPath AI Travel Assistant. ClearPath is a premium travel planning and tourism platform that offers:
1. Destination discovery (cities, descriptions, maps).
2. Custom Trip planning (users can customize and create their own trips).
3. Activities (tours, entertainment, hiking, hotels, food).
4. Bookings and payment options.

Your job is to:
- Be polite, friendly, and extremely helpful.
- Guide users on planning trips, recommend cities/activities, and explain ClearPath platform features.
- When a user asks for trips on a specific date or in a specific month, look at the "Available Dates" listed for each package in the context and suggest only packages that have available seats on or near that date.
- When recommending packages, always mention the available dates and remaining seats so the user knows when they can book.
- If no packages are available for the requested date, suggest the closest available dates.
- Respond concisely and professionally in the user's language (Arabic or English).
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

    // Prepare experiences context (includes available dates)
    const experiencesContext = allExperiences.map(e => {
      const supervisorName = e.supervisor ? `${e.supervisor.firstName} ${e.supervisor.lastName}` : "None";
      const supervisorEmail = e.supervisor ? e.supervisor.email : "";
      const availableDatesStr = (e.availableDates || [])
        .filter(d => d.availableSeats > 0 && new Date(d.date) >= new Date())
        .map(d => new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ` (${d.availableSeats} seats)`)
        .join(', ') || 'No upcoming dates';
      return `- Package/Experience Name: "${e.name}" (ID: ${e._id})\n  Type: ${e.type}\n  Destination: ${e.destination?.name || "Unknown"}\n  Price: ${e.price || e.base_price || 0} EGP\n  Duration: ${e.duration_days} days\n  Available Dates: ${availableDatesStr}\n  Supervisor/Guide: ${supervisorName} (Email: ${supervisorEmail})`;
    }).join("\n");

    // Prepare bookings context
    const bookingsContext = userBookings.map(b => {
      const expName = b.experience ? b.experience.name : (b.snapshot?.title || "Custom Itinerary");
      const supervisor = b.experience?.supervisor ? `${b.experience.supervisor.firstName} ${b.experience.supervisor.lastName} (${b.experience.supervisor.email})` : "Not assigned yet";
      return `- Booking ID: ${b._id}\n  Package: "${expName}"\n  Status: ${b.status}\n  Total Paid/Amount: ${b.total_amount || 0} EGP\n  Date: ${b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "N/A"}\n  Supervisor: ${supervisor}`;
    }).join("\n") || "No active bookings found for this user.";

    // 4. Extract Date, Destination, and Budget
    let extractedDate = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
Analyze the following travel message from a tourist. Today's date is ${today.toISOString().split('T')[0]}. Extract:
1. "destination": The destination name in English (Cairo, Luxor, Hurghada, Dahab, Alexandria, Sharm El Sheikh, Ain Sokhna). Translate Arabic names. Return null if none.
2. "budget": Max budget as a number in EGP. Convert USD at 1 USD = 50 EGP. Return null if none.
3. "date": If the user mentions a specific date, day, or time period (e.g. "today", "tomorrow", "15 June", "في يونيو", "الأسبوع القادم"), return it as an ISO date string (YYYY-MM-DD). Return null if none.

Respond ONLY with a JSON object with keys "destination", "budget", "date".

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
        if (parsed.date && !extractedDate) {
          const d = new Date(parsed.date);
          if (!isNaN(d)) extractedDate = d;
        }
      } catch (err) {
        console.error("Gemini extraction error or timeout:", err);
      }
    }

    // --- Date extraction from user message ---
    // Arabic/English day keywords
    if (/اليوم|today/i.test(userMessage)) {
      extractedDate = new Date(today);
    } else if (/غداً|غدا|بكرا|tomorrow/i.test(userMessage)) {
      extractedDate = new Date(today);
      extractedDate.setDate(extractedDate.getDate() + 1);
    } else {
      // Try DD/MM, DD-MM, or month names (Arabic + English)
      const dmMatch = userMessage.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
      if (dmMatch) {
        const d = parseInt(dmMatch[1]), m = parseInt(dmMatch[2]) - 1;
        const y = dmMatch[3] ? parseInt(dmMatch[3]) : today.getFullYear();
        extractedDate = new Date(y < 100 ? 2000 + y : y, m, d);
      } else {
        const monthMapAR = { 'يناير':0,'فبراير':1,'مارس':2,'ابريل':3,'أبريل':3,'مايو':4,'يونيو':5,'يوليو':6,'أغسطس':7,'اغسطس':7,'سبتمبر':8,'أكتوبر':9,'اكتوبر':9,'نوفمبر':10,'ديسمبر':11 };
        const monthMapEN = { 'jan':0,'feb':1,'mar':2,'apr':3,'may':4,'jun':5,'jul':6,'aug':7,'sep':8,'oct':9,'nov':10,'dec':11,'january':0,'february':1,'march':2,'april':3,'june':5,'july':6,'august':7,'september':8,'october':9,'november':10,'december':11 };
        let foundMonth = false;
        for (const [name, idx] of Object.entries({...monthMapAR,...monthMapEN})) {
          const re = new RegExp(`(\\d{1,2})\\s*${name}`, 'i');
          const m2 = userMessage.match(re);
          if (m2) {
            extractedDate = new Date(today.getFullYear(), idx, parseInt(m2[1]));
            if (extractedDate < today) extractedDate.setFullYear(today.getFullYear() + 1);
            foundMonth = true;
            break;
          }
        }
        
        // If no full date is matched, search for a plain day number (e.g. "27" or "يوم 27")
        if (!foundMonth) {
          const dayOnlyMatch = userMessage.match(/(?:يوم\s*)?\b([1-9]|[12]\d|3[01])\b/);
          if (dayOnlyMatch) {
            const day = parseInt(dayOnlyMatch[1]);
            extractedDate = new Date(today.getFullYear(), today.getMonth(), day);
            if (extractedDate < today) {
              // If it has already passed this month, look in the next month
              extractedDate.setMonth(today.getMonth() + 1);
            }
          }
        }
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

    // 5. Query experiences based on destination / budget / date
    let recommendedPackages = [];
    if (extractedDestination || extractedBudget || extractedDate) {
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

      if (extractedDate) {
        // Match experiences that have an available date within ±3 days of the requested date
        const from = new Date(extractedDate); from.setDate(from.getDate() - 3);
        const to   = new Date(extractedDate); to.setDate(to.getDate() + 3);
        query['availableDates'] = {
          $elemMatch: {
            date: { $gte: from, $lte: to },
            availableSeats: { $gt: 0 }
          }
        };
      }

      recommendedPackages = await ExperienceModel.find(query).limit(3);

      // If date filter returned nothing, widen the search to the same month
      if (extractedDate && recommendedPackages.length === 0) {
        const monthStart = new Date(extractedDate.getFullYear(), extractedDate.getMonth(), 1);
        const monthEnd   = new Date(extractedDate.getFullYear(), extractedDate.getMonth() + 1, 0);
        const relaxedQuery = { ...query };
        relaxedQuery['availableDates'] = {
          $elemMatch: { date: { $gte: monthStart, $lte: monthEnd }, availableSeats: { $gt: 0 } }
        };
        recommendedPackages = await ExperienceModel.find(relaxedQuery).limit(3);
      }
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
