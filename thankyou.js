import wixLocation from 'wix-location';
import wixData from 'wix-data';

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

                // Update UI to show success
                if ($w("#messageText")) {
                    $w("#messageText").text = `Thank you! Your booking for ${bookingRecord.packageName} has been confirmed.`;
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
