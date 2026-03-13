import wixWindow from 'wix-window';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { createBookingCheckout } from 'backend/stripe';

let roomData;
let totalAmount = 0;
let personsCount = 0;
let pricePerPerson = 0;

$w.onReady(function () {
    // 1. Receive data from the Lightbox context
    roomData = wixWindow.lightbox.getContext();

    if (roomData) {
        setupUI();
    }
});

function setupUI() {
    // Populate Number of Rooms (Occupancy)
    $w("#rooms").text = `number of available rooms for occupancy = ${roomData.numberOfRooms}`;

    // Initialize Dropdown 'person'
    // Options: Solo (1), Pair (2), Group (3), Other
    $w("#person").options = [
        { "label": "I am a solo guest", "value": "1" },
        { "label": "I am booking as part of a pair (2 people)", "value": "2" },
        { "label": "I am booking as part of a group (3+ people)", "value": "3" },
        { "label": "Other - Please Specify Below", "value": "other" }
    ];

    // Handle Dropdown Change
    $w("#person").onChange(() => {
        const value = $w("#person").value;
        if (value === "other") {
            $w("#otherPerson").show();
        } else {
            $w("#otherPerson").hide();
            $w("#otherPerson").value = ""; // Clear if not relevant
        }
        calculatePrice();
    });

    // Handle Other Person Input Change
    $w("#otherPerson").onInput(() => {
        calculatePrice();
    });

    // Handle Pay Now Button
    $w("#payNow").onClick(async () => {
        await processBooking();
    });
}

function calculatePrice() {
    const personValue = $w("#person").value;
    pricePerPerson = parsePrice(roomData.packagePrice);

    if (personValue === "other") {
        personsCount = parseInt($w("#otherPerson").value) || 0;
    } else {
        personsCount = parseInt(personValue) || 0;
    }

    totalAmount = pricePerPerson * personsCount;
    
    // Optional: display total price on UI if there is a field like #totalDisplay
    // if ($w("#totalDisplay")) $w("#totalDisplay").text = `Total: €${totalAmount.toLocaleString()}`;
}

function parsePrice(priceStr) {
    // Extracts numeric value from strings like "3,850 Euros per person"
    if (typeof priceStr === 'number') return priceStr;
    const numericPart = priceStr.replace(/[^0-9.]/g, '').replace(',', '');
    return parseFloat(numericPart) || 0;
}

async function processBooking() {
    // Basic Validation
    if (!$w("#fName").value || !$w("#email").value || personsCount <= 0) {
        // Show error message
        console.error("Please fill in all required fields.");
        return;
    }

    const bookingId = "BOOK-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    const bookingData = {
        firstName: $w("#fName").value,
        lastName: $w("#lName").value,
        email: $w("#email").value,
        phone: $w("#mobile").value,
        address: $w("#address").value,
        packageName: roomData.packageName,
        pricePerPerson: parsePrice(roomData.packagePrice),
        personsCount: personsCount,
        totalAmount: totalAmount,
        bookingId: bookingId,
        paymentStatus: "Pending" // Initial status
    };

    try {
        // 1. Save to BookingSaleData
        await wixData.insert("BookingSaleData", bookingData);

        // 2. Call Stripe Backend
        const successUrl = `${wixLocation.baseUrl}/thankyou?bookingId=${bookingId}`;
        const cancelUrl = wixLocation.url;
        
        const lineItems = [{
            name: roomData.packageName,
            quantity: personsCount, // Number of persons
            price: pricePerPerson   // Price per person
        }];

        const checkout = await createBookingCheckout(lineItems, successUrl, cancelUrl, totalAmount, roomData.tax || 0, bookingId);
        
        if (checkout.url) {
            wixLocation.to(checkout.url);
        }

    } catch (err) {
        console.error("Booking Error:", err);
    }
}
