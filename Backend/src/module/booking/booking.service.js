import { Booking } from '../../db/models/booking.model.js';
import { CustomTrip } from '../../db/models/customtrip.model.js';
import { Experience } from '../../db/models/experience.model.js';
import * as paymentService from '../payment/payment.service.js';

// 1. Create Booking
export const createNewBooking = async (userId, data) => {
    const { customTrip, experienceId, travel_date, numberOfGuests } = data;

    let bookingData = { user: userId, status: 'Pending' };

    if (customTrip) {
        const trip = await CustomTrip.findById(customTrip);
        if (!trip) throw new Error("Custom Trip not found");
        bookingData.customTrip = customTrip;
        bookingData.booking_type = 'Trip';
    } else if (experienceId) {
        const exp = await Experience.findById(experienceId);
        if (!exp) throw new Error("Experience not found");
        bookingData.experience = experienceId;
        bookingData.booking_type = 'Package';
    }

    if (travel_date) {
        bookingData.travel_date = new Date(travel_date);
    }

    if (numberOfGuests) {
        bookingData.numberOfGuests = Number(numberOfGuests);
    }

    const booking = await Booking.create(bookingData);
    return booking;
};

// 2. Get User Bookings
export const getMyBookings = async (userId) => {
    return await Booking.find({ user: userId })
        .populate({
            path: 'customTrip',
            populate: [
                { path: 'experience' },
                { path: 'itinerary.activities.activity' },
                { path: 'itinerary.activities.provider' }
            ]
        })
        .populate('experience')
        .sort({ createdAt: -1 });
};

// 3. Get One Booking
export const getBookingById = async (bookingId, userId) => {
    const booking = await Booking.findOne({ _id: bookingId, user: userId })
        .populate({
            path: 'customTrip',
            populate: [
                { path: 'experience' },
                { path: 'itinerary.activities.activity' },
                { path: 'itinerary.activities.provider' }
            ]
        })
        .populate('experience');
    if (!booking) throw new Error("Booking not found");
    return booking;
};

// 4. Cancel Booking
export const cancelBookingById = async (bookingId, userId) => {
        // Allow cancelling Pending or Confirmed bookings
        const booking = await Booking.findOne({ _id: bookingId, user: userId, status: { $in: ['Pending', 'Confirmed'] } });
        if (!booking) throw new Error("Booking not found or already processed");

        const now = new Date();
        const createdAt = booking.createdAt || booking.booking_date || booking._id.getTimestamp?.();

        // Time since booking creation in hours
        const hoursSinceBooking = createdAt ? (now - new Date(createdAt)) / (1000 * 60 * 60) : Infinity;

        // Days until travel (if travel_date not set, assume far in future)
        let daysUntilTravel = Infinity;
        if (booking.travel_date) {
            daysUntilTravel = (new Date(booking.travel_date) - now) / (1000 * 60 * 60 * 24);
        }

        let feePercent = 0;
        if (hoursSinceBooking <= 24) {
            feePercent = 0; // first 24 hours free
        } else if (daysUntilTravel <= 2) {
            feePercent = 50; // within 2 days before travel -> 50%
        } else if (daysUntilTravel <= 7) {
            feePercent = 10; // within a week before travel -> 10%
        } else {
            feePercent = 5; // after 24 hours and more than a week before travel -> 5%
        }

        const feeAmount = Number(((booking.total_amount || 0) * (feePercent / 100)).toFixed(2));
        const refundedAmount = Number(((booking.total_amount || 0) - feeAmount).toFixed(2));

        // Attempt automatic charge if fee > 0
        let chargeResult = { success: false, reason: 'Not attempted' };
        if (feeAmount > 0) {
            try {
                chargeResult = await paymentService.chargeCancellationFee(userId, bookingId, feeAmount);
            } catch (err) {
                console.error('Error attempting to charge cancellation fee:', err.message || err);
                chargeResult = { success: false, reason: err.message || 'Charge attempt error' };
            }
        }

        booking.status = 'Cancelled';
        booking.cancellationInfo = {
            canceledAt: now,
            feePercent,
            feeAmount,
            refundedAmount,
            autoCharged: chargeResult.success || false,
            chargeReason: chargeResult.success ? 'Charged via Stripe' : (chargeResult.reason || 'Not charged')
        };

        await booking.save();

        return booking;
};

// 5. Delete Booking
export const deleteBookingById = async (bookingId, userId) => {
    const booking = await Booking.findOneAndDelete({ _id: bookingId, user: userId });
    if (!booking) throw new Error("Booking not found");
    return booking;
};

// 6. Get All Bookings (Admin)
export const getAllBookings = async () => {
    return await Booking.find()
        .populate('user', 'firstName lastName email')
        .populate({
            path: 'customTrip',
            populate: [
                { path: 'experience' },
                { path: 'itinerary.activities.activity' },
                { path: 'itinerary.activities.provider' }
            ]
        })
        .populate('experience')
        .sort({ createdAt: -1 });
};

// 7. Update Booking Status (Admin)
export const updateBookingStatus = async (bookingId, status) => {
    if (!['Confirmed', 'Pending', 'Cancelled'].includes(status)) {
        throw new Error("Invalid status type");
    }
    const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true }
    ).populate('user', 'firstName lastName email')
     .populate({
         path: 'customTrip',
         populate: [
             { path: 'experience' },
             { path: 'itinerary.activities.activity' },
             { path: 'itinerary.activities.provider' }
         ]
     })
     .populate('experience');

    if (!booking) throw new Error("Booking not found");
    return booking;
};
