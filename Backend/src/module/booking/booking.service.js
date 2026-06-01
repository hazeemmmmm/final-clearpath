import { Booking } from '../../db/models/booking.model.js';
import { CustomTrip } from '../../db/models/customtrip.model.js';
import { Experience } from '../../db/models/experience.model.js';
import * as paymentService from '../payment/payment.service.js';

// 1. Create Booking
export const createNewBooking = async (userId, data) => {
    const { customTrip, experienceId, travel_date, numberOfGuests } = data;

    const User = (await import('../../db/models/user.model.js')).User;
    const userDoc = await User.findById(userId);
    if (userDoc && userDoc.isFlagged) {
        throw new Error("Your account has been restricted due to unusual activity flags. Please contact support. / تم تقييد حسابك بسبب أنشطة مشبوهة، يرجى التواصل مع الدعم.");
    }

    let bookingData = { user: userId, status: 'Pending' };
    let basePrice = 0;
    let extraActivitiesCount = 0;
    let originalAmount = 0;
    let snapshot = {};

    if (customTrip) {
        const trip = await CustomTrip.findById(customTrip)
            .populate("experience")
            .populate("combinedExperiences")
            .populate("itinerary.activities.activity")
            .populate("extra_activities.activity");
        if (!trip) throw new Error("Custom Trip not found");
        bookingData.customTrip = customTrip;
        bookingData.booking_type = 'Trip';
        
        // Sum up experience base_price, custom trip's activities total_price and combinedExperiences base prices
        const expBase = trip.experience ? (trip.experience.base_price || 0) : 0;
        let combinedBaseTotal = 0;
        if (trip.combinedExperiences && trip.combinedExperiences.length > 0) {
            combinedBaseTotal = trip.combinedExperiences.reduce((sum, item) => sum + (item.base_price || item.price || 0), 0);
        }
        basePrice = trip.total_price + expBase + combinedBaseTotal;
        originalAmount = (trip.original_price || trip.total_price) + expBase + combinedBaseTotal;
        if (trip.ai_discount_applied) {
            bookingData.discount_amount = trip.discount_amount;
            bookingData.ai_discount_applied = true;
        }
        extraActivitiesCount += trip.extra_activities ? trip.extra_activities.length : 0;
 
        snapshot = {
            title: trip.experience?.name || "Customized Trip",
            description: trip.experience?.description || "",
            image: trip.experience?.image || "",
            duration_days: trip.experience?.duration_days || 1,
            priceBreakdown: trip.experience?.priceBreakdown || [],
            combinedPackages: (trip.combinedExperiences || []).map(exp => ({
                packageId: exp._id,
                title: exp.name,
                description: exp.description || "",
                image: exp.image || exp.images?.[0] || "",
                duration_days: exp.duration_days || 1,
                base_price: exp.base_price || exp.price || 0
            })),
            itinerary: (trip.itinerary || []).map(day => ({
                day_number: day.day_number,
                title: day.title,
                description: day.description,
                activities: (day.activities || []).map(act => ({
                    name: act.activity?.name || act.name || "",
                    price: act.price || 0,
                    image: act.image || act.activity?.image || "",
                    activityId: act.activity?._id?.toString() || ""
                }))
            })),
            addons: (trip.experience?.addons || []).map(add => ({
                name: add.name,
                price: add.price,
                description: add.description
            })),
            selectedAddons: data.selectedAddons || [],
            hotel: trip.hotel || trip.experience?.hotel || "5-Star Premium Hotel",
            transportation: trip.transportation || trip.experience?.transportation || "Private AC Sedan"
        };
    } else if (experienceId) {
        const exp = await Experience.findById(experienceId).populate("itinerary.activities.activity");
        if (!exp) throw new Error("Experience not found");
        bookingData.experience = experienceId;
        bookingData.booking_type = 'Package';
        
        // Directly use base_price since it already represents the computed Total Price (including activities and breakdown)
        basePrice = exp.base_price;
        originalAmount = exp.base_price;

        snapshot = {
            title: exp.name,
            description: exp.description || "",
            image: exp.image || "",
            duration_days: exp.duration_days || 1,
            priceBreakdown: exp.priceBreakdown || [],
            itinerary: (exp.itinerary || []).map(day => ({
                day_number: day.day_number,
                title: day.title,
                description: day.description,
                activities: (day.activities || []).map(act => ({
                    name: act.activity?.name || act.name || "",
                    price: act.price || 0,
                    image: act.image || act.activity?.image || "",
                    activityId: act.activity?._id?.toString() || ""
                }))
            })),
            addons: (exp.addons || []).map(add => ({
                name: add.name,
                price: add.price,
                description: add.description
            })),
            selectedAddons: data.selectedAddons || [],
            hotel: exp.hotel || "5-Star Premium Hotel",
            transportation: exp.transportation || "Private AC Sedan"
        };
    }

    bookingData.snapshot = snapshot;

    if (travel_date) {
        bookingData.travel_date = new Date(travel_date);
    }

    if (numberOfGuests) {
        bookingData.numberOfGuests = Number(numberOfGuests);
    }

    // Process Addons
    let addonsTotal = 0;
    if (data.selectedAddons && data.selectedAddons.length > 0) {
        // Fetch original package to find addon prices
        let targetExpId = experienceId;
        if (customTrip && bookingData.customTrip) {
            const cTrip = await CustomTrip.findById(customTrip);
            if (cTrip) targetExpId = cTrip.experience;
        }
        
        if (targetExpId) {
            const expWithAddons = await Experience.findById(targetExpId);
            if (expWithAddons && expWithAddons.addons) {
                data.selectedAddons.forEach(addonId => {
                    const addon = expWithAddons.addons.find(a => a._id.toString() === addonId.toString());
                    if (addon) {
                        addonsTotal += addon.price;
                        extraActivitiesCount++;
                    }
                });
            }
        }
    }

    let subtotal = (basePrice * (bookingData.numberOfGuests || 1)) + addonsTotal;
    originalAmount = (originalAmount * (bookingData.numberOfGuests || 1)) + addonsTotal;

    // AI-Based Fixed-Price Package Optimization (Bundle Discount check for frontend Addons)
    // DISABLED by request: Do not make discounts without entering the code.
    /*
    if (!bookingData.ai_discount_applied && extraActivitiesCount >= 3) {
        bookingData.ai_discount_applied = true;
        bookingData.discount_amount = subtotal * 0.10; // 10%
        subtotal -= bookingData.discount_amount;
    } else if (bookingData.ai_discount_applied) {
        // If CustomTrip already had discount, just apply it to addons too maybe? 
        // We'll keep it simple and just apply a flat discount on everything if they qualify.
        // Actually, just let the subtotal be discounted
    }
    */
    bookingData.ai_discount_applied = false;
    bookingData.discount_amount = 0;

    bookingData.total_amount = subtotal;
    bookingData.original_amount = originalAmount; // Need to add original_amount to schema if we want, or just let frontend rely on total

    // AI Fraud & Risk Detection Heuristic
    let riskScore = 0;
    let fraudAlert = false;
    
    if (bookingData.numberOfGuests > 8) riskScore += 35; // Unusually large group
    
    // Simulate AI behavior pattern analysis
    const aiConfidencePenalty = Math.floor(Math.random() * 40); // 0-40 random risk from AI signals
    riskScore += aiConfidencePenalty;
    
    if (riskScore > 60) {
        fraudAlert = true;
    }
    
    bookingData.riskScore = Math.min(riskScore, 100);
    bookingData.fraudAlert = fraudAlert;

    if (data.parentBookingId) {
        bookingData.parentBooking = data.parentBookingId;
    }

    const booking = await Booking.create(bookingData);

    if (data.parentBookingId) {
        await Booking.findByIdAndUpdate(data.parentBookingId, {
            $push: { sequentialBookings: booking._id }
        });
    }

    return booking;
};

// 2. Get User Bookings
export const getMyBookings = async (userId) => {
    return await Booking.find({ user: userId })
        .populate({
            path: 'customTrip',
            populate: [
                { path: 'experience' },
                { path: 'combinedExperiences' },
                { path: 'itinerary.activities.activity' },
                { path: 'itinerary.activities.provider' },
                { path: 'extra_activities.activity' }
            ]
        })
        .populate('experience')
        .populate({
            path: 'sequentialBookings',
            populate: [
                { path: 'experience' },
                { path: 'customTrip', populate: { path: 'experience' } }
            ]
        })
        .sort({ createdAt: -1 });
};

// 3. Get One Booking
export const getBookingById = async (bookingId, userId) => {
    const booking = await Booking.findOne({ _id: bookingId, user: userId })
        .populate({
            path: 'customTrip',
            populate: [
                { path: 'experience' },
                { path: 'combinedExperiences' },
                { path: 'itinerary.activities.activity' },
                { path: 'itinerary.activities.provider' },
                { path: 'extra_activities.activity' }
            ]
        })
        .populate('experience')
        .populate({
            path: 'sequentialBookings',
            populate: [
                { path: 'experience' },
                { path: 'customTrip', populate: { path: 'experience' } }
            ]
        });
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

        // Cascade cancellation to sequential bookings
        const cascadeCancel = async (bId) => {
            const b = await Booking.findById(bId);
            if (b) {
                b.status = 'Cancelled';
                b.cancellationInfo = {
                    canceledAt: now,
                    feePercent: 0,
                    feeAmount: 0,
                    refundedAmount: 0,
                    autoCharged: false,
                    chargeReason: 'Cancelled due to parent chain cancellation'
                };
                await b.save();
                if (b.sequentialBookings && b.sequentialBookings.length > 0) {
                    for (const seqId of b.sequentialBookings) {
                        await cascadeCancel(seqId);
                    }
                }
            }
        };

        if (booking.sequentialBookings && booking.sequentialBookings.length > 0) {
            for (const seqId of booking.sequentialBookings) {
                await cascadeCancel(seqId);
            }
        }

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
    const cascadeUpdateBookingStatus = async (bId, newStatus) => {
        const b = await Booking.findByIdAndUpdate(
            bId,
            { status: newStatus },
            { new: true }
        );
        if (b && b.sequentialBookings && b.sequentialBookings.length > 0) {
            for (const seqId of b.sequentialBookings) {
                await cascadeUpdateBookingStatus(seqId, newStatus);
            }
        }
        return b;
    };

    const booking = await cascadeUpdateBookingStatus(bookingId, status);
    if (!booking) throw new Error("Booking not found");

    const populatedBooking = await Booking.findById(booking._id)
        .populate('user', 'firstName lastName email')
        .populate({
            path: 'customTrip',
            populate: [
                { path: 'experience' },
                { path: 'itinerary.activities.activity' },
                { path: 'itinerary.activities.provider' }
            ]
        })
        .populate('experience');

    return populatedBooking;
};
