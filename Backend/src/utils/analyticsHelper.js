import { UserActivity } from "../db/models/userActivity.model.js";

/**
 * Logs a user activity asynchronously to the database.
 * Does not block the main execution thread.
 */
export const logActivity = async ({ userId, action, destinationId, packageId, category, metadata = {} }) => {
    try {
        await UserActivity.create({
            userId,
            action,
            destinationId: destinationId || null,
            packageId: packageId || null,
            category: category || "general",
            metadata
        });
    } catch (err) {
        console.error("Failed to log user activity:", err);
    }
};
