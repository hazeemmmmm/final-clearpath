import { Chat } from "../models/chatbot.model.js";
import { AbstractRepository } from "./abstract.repository.js";

export class ChatbotRepository extends AbstractRepository {
  constructor() {
    super(Chat);
  }
}
