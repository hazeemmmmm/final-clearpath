import Stripe from 'stripe';
import { Payment } from '../../db/models/payment.model.js';
import { Booking } from '../../db/models/booking.model.js';
import { devConfig } from '../../config/env/dev.config.js';
import * as AppError from '../../utils/error/index.js';

// ─── 1. Create Stripe Checkout Session (Mapped to createPayPalOrder for compatibility) ───

export const createPayPalOrder = async (userId, bookingId, currency = 'EGP') => {
    const booking = await Booking.findOne({ _id: bookingId, user: userId, status: 'Pending' });
    if (!booking) throw new AppError.BadRequestException('Booking not found or already processed');

    const existing = await Payment.findOne({ booking: bookingId, status: { $ne: 'Failed' } });
    if (existing) throw new AppError.conflictException('A payment has already been initiated for this booking');

    // Initialize Stripe
    const stripe = new Stripe(devConfig.STRIPE_SECRET_KEY);

    try {
        const EGP_TO_USD = 50;
        const finalCurrency = (currency || 'EGP').toLowerCase();
        let finalAmount = booking.total_amount; // Default EGP

        if (finalCurrency === 'usd') {
            finalAmount = parseFloat((booking.total_amount / EGP_TO_USD).toFixed(2));
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: finalCurrency,
                        product_data: {
                            name: `ClearPath Tour Booking #${bookingId}`,
                            description: `Seamless travel booking for ${booking.numberOfGuests || 1} guest(s)`,
                        },
                        unit_amount: Math.round(finalAmount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${devConfig.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${devConfig.CLIENT_URL}/payment/cancel`,
            metadata: {
                userId: userId.toString(),
                bookingId: bookingId.toString(),
                currency: finalCurrency,
                amount: finalAmount.toString(),
            },
        });

        // Create Payment record
        const payment = await Payment.create({
            user: userId,
            booking: bookingId,
            amount: booking.total_amount,
            method: 'Stripe',
            status: 'Pending',
            stripeSessionId: session.id,
        });

        return { orderId: session.id, approvalUrl: session.url, payment };
    } catch (err) {
        console.error('Stripe Session Creation Error:', err);
        throw new AppError.internalServerError(err.message || 'Failed to initialize Stripe payment session');
    }
};

// ─── 2. Verify / Capture Stripe Session (Mapped to capturePayPalOrder for compatibility) ───

export const capturePayPalOrder = async (userId, orderId) => {
    const payment = await Payment.findOne({ stripeSessionId: orderId, user: userId });
    if (!payment) throw new AppError.BadRequestException('Payment record not found');
    if (payment.status === 'Completed') throw new AppError.conflictException('Payment already completed');

    // Initialize Stripe
    const stripe = new Stripe(devConfig.STRIPE_SECRET_KEY);

    try {
        // Retrieve session to verify status
        const session = await stripe.checkout.sessions.retrieve(orderId);

        if (session.payment_status !== 'paid') {
            await Payment.findByIdAndUpdate(payment._id, { status: 'Failed' });
            throw new AppError.BadRequestException('Payment was not completed successfully on Stripe');
        }

        // Update payment to Completed
        const updatedPayment = await Payment.findByIdAndUpdate(
            payment._id,
            { 
                status: 'Completed', 
                stripePaymentIntentId: session.payment_intent, 
                payment_date: new Date() 
            },
            { new: true }
        );

        // Confirm booking
        await Booking.findByIdAndUpdate(payment.booking, { status: 'Confirmed' });

        return { captureId: session.payment_intent, status: 'COMPLETED', payment: updatedPayment };
    } catch (err) {
        console.error('Stripe Verification Error:', err);
        throw new AppError.BadRequestException(err.message || 'Payment verification failed');
    }
};

// ─── 3. Handle Webhooks (Placeholder) ───────────────────────────────────────────────────

export const handleWebhook = async (headers, body) => {
    // Simply acknowledge webhook trigger
    return { received: true };
};

// ─── 4. Payment History ──────────────────────────────────────────────────────────────────

export const getUserPaymentHistory = async (userId) => {
    return await Payment.find({ user: userId })
        .populate('booking')
        .sort({ createdAt: -1 });
};

// Charge a cancellation fee using the customer's previous Stripe payment method when possible.
export const chargeCancellationFee = async (userId, bookingId, amountEGP) => {
    const payment = await Payment.findOne({ booking: bookingId, user: userId, status: 'Completed', method: 'Stripe' });
    if (!payment || !payment.stripePaymentIntentId) {
        return { success: false, reason: 'No existing stripe payment to reuse' };
    }

    const stripe = new Stripe(devConfig.STRIPE_SECRET_KEY);
    try {
        // Retrieve original payment intent to get customer/payment method
        const originalIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

        const customer = originalIntent.customer || null;
        const payment_method = originalIntent.payment_method || null;

        if (!payment_method && !customer) {
            return { success: false, reason: 'No saved payment method available' };
        }

        // Amount in smallest currency unit (EGP -> cents) - Stripe uses cents for most currencies
        const amountCents = Math.round((amountEGP || 0) * 100);

        // Create a new PaymentIntent to charge the fee off-session
        const newIntent = await stripe.paymentIntents.create({
            amount: amountCents,
            currency: 'egp',
            payment_method: payment_method || undefined,
            customer: customer || undefined,
            off_session: true,
            confirm: true,
            description: `Cancellation fee for booking ${bookingId}`
        });

        // Record payment
        const feePayment = await Payment.create({
            user: userId,
            booking: bookingId,
            amount: amountEGP,
            method: 'Stripe',
            status: 'Completed',
            stripePaymentIntentId: newIntent.id
        });

        return { success: true, payment: feePayment };
    } catch (err) {
        console.error('Cancellation charge failed:', err.message || err);
        // If Stripe requires action (e.g., 3DS) or fails, return failure so frontend can prompt user
        return { success: false, reason: err.message || 'Stripe charge failed' };
    }
};

// ─── 5. Bank Transfer Payment ────────────────────────────────────────────────

export const bankPayment = async (userId, bookingId, currency = 'EGP') => {
    const booking = await Booking.findOne({ _id: bookingId, user: userId, status: 'Pending' });
    if (!booking) throw new AppError.BadRequestException('Booking not found or already processed');

    const EGP_TO_USD = 50;
    const amount_egp = booking.total_amount;
    const amount_usd = parseFloat((amount_egp / EGP_TO_USD).toFixed(2));
    const paidAmount = currency === 'USD' ? amount_usd : amount_egp;

    const payment = await Payment.create({
        user: userId,
        booking: bookingId,
        amount: paidAmount,
        amount_usd,
        currency,
        method: 'Stripe',
        status: 'Completed',
        payment_date: new Date(),
    });

    await Booking.findByIdAndUpdate(bookingId, { status: 'Confirmed' });

    return { payment, amount_egp, amount_usd };
};

// ─── 6. All Payments (Admin) ─────────────────────────────────────────────────

export const getAllPayments = async () => {
    return await Payment.find()
        .populate('user', 'firstName lastName email')
        .populate('booking')
        .sort({ createdAt: -1 });
};
