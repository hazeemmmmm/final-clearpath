import Joi from 'joi';

export const createBookingSchema = {
    body: Joi.object({
        customTrip: Joi.string().hex().length(24),
        experienceId: Joi.string().hex().length(24),
        travel_date: Joi.date().optional(),
        numberOfGuests: Joi.number().integer().min(1).optional(),
        parentBookingId: Joi.string().hex().length(24).optional().allow(null, ""),
        couponCode: Joi.string().optional().allow(null, ""),
        selectedAddons: Joi.array().items(Joi.string()).optional(),
        totalPrice: Joi.number().optional(),
        total_amount: Joi.number().optional()
    }).or('customTrip', 'experienceId').required()
};

export const bookingIdSchema = {
    params: Joi.object({
        bookingId: Joi.string().hex().length(24).required()
    }).required()
};
