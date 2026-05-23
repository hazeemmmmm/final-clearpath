import { Booking } from '../../db/models/booking.model.js';
import { CustomTrip } from '../../db/models/customtrip.model.js';
import { Experience } from '../../db/models/experience.model.js';

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
    const booking = await Booking.findOneAndUpdate(
        { _id: bookingId, user: userId, status: 'Pending' }, 
        { status: 'Cancelled' },
        { new: true }
    );
    
    if (!booking) throw new Error("Booking not found or already processed");
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
