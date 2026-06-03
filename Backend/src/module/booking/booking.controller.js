import * as bookingService from './booking.service.js';
import { logActivity } from '../../utils/analyticsHelper.js';

export const createBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.createNewBooking(req.user._id, req.body);
        if (booking) {
            logActivity({
                userId: req.user._id,
                action: "book_trip",
                packageId: booking.experience || null,
                category: booking.booking_type === "Package" ? "Package" : "Trip",
                metadata: {
                    totalAmount: booking.total_amount,
                    bookingType: booking.booking_type
                }
            });
        }
        return res.status(201).json({ message: "Booking created successfully", booking });
    } catch (error) {
        return next(new Error(error.message, { cause: 400 }));
    }
};

export const getUserBookings = async (req, res, next) => {
    try {
        const bookings = await bookingService.getMyBookings(req.user._id);
        return res.status(200).json({ message: "Done", bookings });
    } catch (error) {
        return next(new Error(error.message, { cause: 500 }));
    }
};

export const getOneBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.getBookingById(req.params.bookingId, req.user._id);
        return res.status(200).json({ message: "Done", booking });
    } catch (error) {
        return next(new Error(error.message, { cause: 404 }));
    }
};

export const cancelBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.cancelBookingById(req.params.bookingId, req.user._id);
        if (booking) {
            logActivity({
                userId: req.user._id,
                action: "cancel_booking",
                packageId: booking.experience || null,
                category: booking.booking_type === "Package" ? "Package" : "Trip",
                metadata: {
                    totalAmount: booking.total_amount
                }
            });
        }
        return res.status(200).json({ message: "Booking has been cancelled", booking });
    } catch (error) {
        return next(new Error(error.message, { cause: 400 }));
    }
};

export const deleteBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.deleteBookingById(req.params.bookingId, req.user._id);
        return res.status(200).json({ message: "Booking deleted successfully", booking });
    } catch (error) {
        return next(new Error(error.message, { cause: 400 }));
    }
};

export const getAllBookingsAdmin = async (req, res, next) => {
    try {
        const bookings = await bookingService.getAllBookings();
        return res.status(200).json({ message: "All bookings retrieved successfully", bookings });
    } catch (error) {
        return next(new Error(error.message, { cause: 500 }));
    }
};

export const updateBookingStatusAdmin = async (req, res, next) => {
    try {
        const booking = await bookingService.updateBookingStatus(req.params.bookingId, req.body.status);
        return res.status(200).json({ message: "Booking status updated successfully", booking });
    } catch (error) {
        return next(new Error(error.message, { cause: 400 }));
    }
};

export const applyCoupon = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { code } = req.body;
        
        const booking = await bookingService.getBookingById(bookingId, req.user._id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const mongoose = (await import('mongoose')).default;
        const Coupon = mongoose.model("Coupon");
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), is_active: true });
        if (!coupon || coupon.expires_at < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid or expired coupon code" });
        }

        // Revert old discount if applied
        let subtotal = booking.total_amount + (booking.discount_amount || 0);
        
        const discountAmount = (subtotal * coupon.discount_percentage) / 100;
        booking.couponCode = code.toUpperCase();
        booking.discount_amount = discountAmount;
        booking.total_amount = subtotal - discountAmount;
        
        // Save coupon usage
        if (!coupon.used_by.includes(req.user._id)) {
            coupon.used_by.push(req.user._id);
            await coupon.save();
        }

        await booking.save();

        return res.status(200).json({ 
            success: true, 
            message: "Coupon applied successfully", 
            booking 
        });
    } catch (error) {
        return next(new Error(error.message, { cause: 500 }));
    }
};

export const calculatePrice = async (req, res, next) => {
    try {
        const pricing = await bookingService.calculateBookingTotal(req.body);
        return res.status(200).json({
            success: true,
            pricing
        });
    } catch (error) {
        return next(new Error(error.message, { cause: 400 }));
    }
};

