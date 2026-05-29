import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    experience: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Experience",
        required: true
    },
    actionType: {
        type: String,
        enum: ["VIEW", "WISHLIST_ADD", "WISHLIST_REMOVE", "BOOKING_INITIATED", "BOOKING_COMPLETED"],
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

export const Interaction = mongoose.model("Interaction", interactionSchema);
