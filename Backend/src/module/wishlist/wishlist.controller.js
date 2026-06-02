import * as wishlistService from './wishlist.service.js';
import { logActivity } from '../../utils/analyticsHelper.js';

export const getWishlist = async (req, res) => {
    const wishlist = await wishlistService.getUserWishlist(req.user.id);
    return res.status(200).json({ message: "Wishlist retrieved", wishlist });
};

export const addToWishlist = async (req, res) => {
    const { experienceId } = req.body;
    const wishlist = await wishlistService.addToWishlist(req.user.id, experienceId);
    
    // Log wishlist addition activity
    logActivity({
      userId: req.user.id || req.user._id,
      action: "wishlist_add",
      packageId: experienceId
    });

    return res.status(200).json({ message: "Added to wishlist", wishlist });
};

export const removeFromWishlist = async (req, res) => {
    const { experienceId } = req.params;
    const wishlist = await wishlistService.removeFromWishlist(req.user.id, experienceId);
    return res.status(200).json({ message: "Removed from wishlist", wishlist });
};