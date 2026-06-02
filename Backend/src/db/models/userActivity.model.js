import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    action: {
        type: String,
        required: true,
        enum: [
            "search",
            "view_destination",
            "view_package",
            "wishlist_add",
            "customize_trip",
            "book_trip",
            "cancel_booking",
            "submit_review"
        ]
    },
    destinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination",
        required: false
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Experience",
        required: false
    },
    category: {
        type: String,
        required: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

export const UserActivity = mongoose.model("UserActivity", userActivitySchema);
