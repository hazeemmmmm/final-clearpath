import mongoose from 'mongoose';

/**
 * Single pricing authority for the entire application.
 * Calculates totals, taxes, service fees, transport, and handles recursion for sequential/chained bookings.
 */
export const calculateBookingTotal = async (bookingOrData) => {
    let data = bookingOrData;
    let isDoc = false;

    // Resolve booking if ObjectId, string, or bookingId property is passed
    if (
        typeof bookingOrData === 'string' || 
        (bookingOrData && (
            bookingOrData instanceof mongoose.Types.ObjectId ||
            (bookingOrData.constructor && (bookingOrData.constructor.name === 'ObjectId' || bookingOrData.constructor.name === 'ObjectID'))
        )) || 
        (bookingOrData && bookingOrData.bookingId)
    ) {
        const targetId = bookingOrData.bookingId || bookingOrData;
        const Booking = mongoose.model("Booking");
        data = await Booking.findById(targetId)
            .populate('customTrip')
            .populate('experience');
        isDoc = true;
    } else if (bookingOrData && bookingOrData._id && typeof bookingOrData.save === 'function') {
        isDoc = true;
    }

    if (!data) {
        throw new Error("Invalid booking data for total calculation");
    }

    let packagePrice = 0;
    let activeActivitiesPrice = 0;
    let transportCost = 150; // default transport fee fallback
    let extraActivitiesCount = 0;
    let stdActPriceBackend = 0;

    const numberOfGuests = Number(data.numberOfGuests || 1);
    const bookingType = data.booking_type || (data.customTrip ? 'Trip' : 'Package');

    if (bookingType === 'Trip' && (data.customTrip || data.customTripId)) {
        const customTripId = data.customTrip?._id || data.customTrip || data.customTripId;
        const CustomTrip = mongoose.model("CustomTrip");
        const trip = await CustomTrip.findById(customTripId)
            .populate("experience")
            .populate("combinedExperiences")
            .populate("itinerary.activities.activity")
            .populate("extra_activities.activity");

        if (trip) {
            let combinedPrice = 0;
            if (trip.combinedExperiences && trip.combinedExperiences.length > 0) {
                combinedPrice = trip.combinedExperiences.reduce((sum, item) => sum + (item.price || 0), 0);
            }
            packagePrice = (trip.experience ? (trip.experience.price || 0) : 0) + combinedPrice;

            // Calculate sum of active activities in custom itinerary & extra activities
            if (trip.itinerary) {
                trip.itinerary.forEach(day => {
                    if (day.status !== "removed" && day.activities) {
                        day.activities.forEach(act => {
                            if (act.status === "active") {
                                activeActivitiesPrice += act.price || 0;
                            }
                        });
                    }
                });
            }
            if (trip.extra_activities) {
                trip.extra_activities.forEach(act => {
                    if (act.status === "active") {
                        activeActivitiesPrice += act.price || 0;
                        extraActivitiesCount++;
                    }
                });
            }

            // Transport fees keywords check
            const breakdownItems = trip.experience?.priceBreakdown || [];
            let transportSum = 0;
            const transportKeywords = ['transport', 'transit', 'transfer', 'commute', 'pickup', 'bus', 'yacht', 'felucca', 'cruise', 'flight', 'انتقال', 'توصيل', 'طيران', 'أتوبيس', 'يخت', 'فلوكة'];
            breakdownItems.forEach(item => {
                const lbl = item.label.toLowerCase();
                if (transportKeywords.some(kw => lbl.includes(kw))) {
                    transportSum += item.amount;
                }
            });
            if (transportSum > 0) {
                transportCost = transportSum;
            }

            // Standard activities sum
            stdActPriceBackend = (trip.experience?.itinerary || []).reduce((acc, day) => {
                return acc + (day.activities || []).reduce((sum, act) => sum + (act.price || 0), 0);
            }, 0);
            if (trip.combinedExperiences && trip.combinedExperiences.length > 0) {
                trip.combinedExperiences.forEach(compExp => {
                    const compActSum = (compExp.itinerary || []).reduce((acc, day) => {
                        return acc + (day.activities || []).reduce((sum, act) => sum + (act.price || 0), 0);
                    }, 0);
                    stdActPriceBackend += compActSum;
                });
            }
        }
    } else if (bookingType === 'Package' && (data.experience || data.experienceId)) {
        const expId = data.experience?._id || data.experience || data.experienceId;
        const Experience = mongoose.model("Experience");
        const exp = await Experience.findById(expId);
        if (exp) {
            packagePrice = exp.price || 0;
        }
    }

    // Base subtotal calculation:
    // For custom: standard package price + activity price difference
    // For package: standard package price
    let basePrice = packagePrice;
    let extraActivitiesCost = 0;
    if (bookingType === 'Trip') {
        basePrice = packagePrice + (activeActivitiesPrice - stdActPriceBackend);
        extraActivitiesCost = activeActivitiesPrice;
    }
    
    let subtotal = basePrice * numberOfGuests;

    // Process selected addons if any
    let addonsTotal = 0;
    const selectedAddons = data.selectedAddons || (data.snapshot?.selectedAddons) || [];
    const addonsSource = data.snapshot?.addons || [];
    selectedAddons.forEach(addonName => {
        const found = addonsSource.find(a => a.name === addonName);
        if (found) {
            addonsTotal += (found.price || 0) * numberOfGuests;
        }
    });
    subtotal += addonsTotal;

    // bookingTotal is the subtotal (inclusive of taxes and service fees)
    let bookingTotal = subtotal;

    // Fixed % taxes (10% of total)
    const taxes = Math.round(bookingTotal * 0.10);

    // Fixed % service fees (5% of total)
    const serviceFees = Math.round(bookingTotal * 0.05);

    // Net subtotal (before taxes and service fees)
    subtotal = bookingTotal - taxes - serviceFees;

    // Apply Coupon Code discount if any
    let discountAmount = 0;
    if (data.couponCode) {
        const Coupon = mongoose.model("Coupon");
        const coupon = await Coupon.findOne({ code: data.couponCode.toUpperCase(), is_active: true });
        if (coupon && coupon.expires_at > new Date()) {
            discountAmount = Math.round((bookingTotal * coupon.discount_percentage) / 100);
            bookingTotal -= discountAmount;
        }
    }

    // Handle chained bookings recursively if this is a DB document
    let sequentialTotal = 0;
    let chainedBreakdown = [];
    if (isDoc && data.sequentialBookings && data.sequentialBookings.length > 0) {
        for (const seqId of data.sequentialBookings) {
            const seqResult = await calculateBookingTotal(seqId);
            sequentialTotal += seqResult.totalAmount;
            chainedBreakdown.push(seqResult);
        }
    }

    return {
        bookingId: data._id || null,
        bookingType,
        numberOfGuests,
        basePrice,
        transportCost,
        subtotal,
        addonsTotal,
        taxes,
        serviceFees,
        extraActivitiesCost,
        discountAmount,
        bookingTotalOnly: bookingTotal,
        totalAmount: bookingTotal + sequentialTotal,
        chainedBreakdown
    };
};
