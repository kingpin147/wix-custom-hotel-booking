import { getSecret } from 'wix-secrets-backend';
import Stripe from 'stripe';

/**
 * Creates a Stripe Checkout Session for a package booking.
 * 
 * @param {Array} lineItems - Array of items to be displayed.
 * @param {string} successUrl - Redirect URL after successful payment.
 * @param {string} cancelUrl - Redirect URL if payment is cancelled.
 * @param {number} totalPrice - The total price of the package in Euros.
 * @param {number} taxRate - The tax percentage.
 * @param {string} bookingId - Unique identifier for the booking.
 * @returns {Promise<Object>} The Stripe Checkout Session object.
 */
export async function createBookingCheckout(lineItems, successUrl, cancelUrl, totalPrice, taxRate, bookingId) {
    try {
        const apiKey = await getSecret("stripeKey");
        const stripe = new Stripe(apiKey);

        // We use the total price for full payment as requested
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100), // Stripe uses cents
                    tax_behavior: 'inclusive',
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                bookingId: bookingId,
                total_package_price: totalPrice.toString(),
                tax_rate_percentage: taxRate.toString()
            },
            customer_creation: 'always',
            adaptive_pricing: {
                enabled: false,
            },
        });

        return {
            id: session.id,
            url: session.url
        };

    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        throw new Error("Failed to create Stripe Checkout Session: " + error.message);
    }
}
