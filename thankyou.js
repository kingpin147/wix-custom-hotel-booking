import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { sendQuoteEmailWithContact } from 'backend/email.web';

$w.onReady(async function () {
    // 1. Get the bookingId from the URL
    const query = wixLocation.query;
    const bookingId = query.bookingId;

    if (bookingId) {
        try {
            // 2. Query the BookingSaleData collection
            const results = await wixData.query("BookingSaleData")
                .eq("bookingId", bookingId)
                .find();

            if (results.items.length > 0) {
                const bookingRecord = results.items[0];

                // 3. Update the status to 'Paid'
                bookingRecord.paymentStatus = "Paid";
                await wixData.update("BookingSaleData", bookingRecord);

                // Update UI to show exact message
                if ($w("#messageText")) {
                    $w("#messageText").text = `Thank you for booking your place at our Padel Paradise Retreat from *19th to 24th May 2026*. We’re delighted to welcome you.\n\nI’m pleased to confirm that we’ve received your *deposit. The **remaining balance is due by 7th April 2026*.\nWe will send you a *MONEI payment link for the final balance once the 48‑hour cooling‑off period has passed*.`;
                }
                
                // Trigger email with contact
                try {
                    console.log("Triggering quote email for", bookingRecord.firstName);
                    await sendQuoteEmailWithContact(
                        bookingRecord.firstName,
                        bookingRecord.lastName,
                        bookingRecord.email,
                        bookingRecord.guestNames || "None specified",
                        bookingRecord.packageName
                    );
                } catch (emailErr) {
                    console.error("Error sending quote email:", emailErr);
                }

                console.log("Booking updated to Paid:", bookingId);
            } else {
                console.error("Booking record not found for ID:", bookingId);
            }
        } catch (err) {
            console.error("Error updating booking status:", err);
        }
    } else {
        console.warn("No bookingId found in URL.");
    }
});
