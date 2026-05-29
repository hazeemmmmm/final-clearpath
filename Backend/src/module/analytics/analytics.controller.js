import { Interaction } from "../../db/models/interaction.model.js";

export const trackInteraction = async (req, res, next) => {
    try {
        const { experienceId, actionType, metadata } = req.body;
        
        if (!experienceId || !actionType) {
            return res.status(400).json({ success: false, message: "Experience ID and Action Type are required." });
        }

        const interaction = await Interaction.create({
            user: req.user._id,
            experience: experienceId,
            actionType,
            metadata: metadata || {}
        });

        return res.status(201).json({ success: true, message: "Interaction tracked successfully", interaction });
    } catch (error) {
        console.error("Tracking Error:", error);
        return res.status(500).json({ success: false, message: "Failed to track interaction." });
    }
};
