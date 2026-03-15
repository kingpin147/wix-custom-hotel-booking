import wixWindow from 'wix-window';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { createBookingCheckout } from 'backend/stripe';

let roomData;
let totalAmount = 0;
let personsCount = 0;
let pricePerPerson = 0;
let depositAmount = 0;
let remainingBalance = 0;

$w.onReady(function () {
    // 1. Receive data from the Lightbox context
    roomData = wixWindow.lightbox.getContext();

    if (roomData) {
        setupUI();
    }
});

function setupUI() {
    // Initialize Dropdown 'person'
    // Options: Solo (1), Pair (2), Group (3), Other
    $w("#person").options = [
        { "label": "I am booking for myself only (1,000€ deposit)", "value": "1" },
        { "label": "I am booking for 2 people (2,000€ deposit)", "value": "2" },
        { "label": "I am booking for 3 people (3,000€ deposit)", "value": "3" },
        { "label": "Other - Please Specify Below", "value": "other" }
    ];

    // Handle Dropdown Change
    $w("#person").onChange(() => {
        const value = $w("#person").value;
        if (value === "other") {
            $w("#otherPerson").show();
            // Automatically expand guest names since a group of "other" usually implies multiple people
            $w("#guestNames").expand();
            $w("#guestNames").show();
        } else {
            $w("#otherPerson").hide();
            $w("#otherPerson").value = ""; // Clear if not relevant
            
            // Show guest names field for Pair (2) and Group (3)
            if (value === "2" || value === "3") {
                $w("#guestNames").expand();
                $w("#guestNames").show();
            } else {
                $w("#guestNames").collapse();
                $w("#guestNames").hide();
                $w("#guestNames").value = ""; // Clear if solo
            }
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
    depositAmount = 1000 * personsCount; // 1000 euros per person deposit
    remainingBalance = totalAmount - depositAmount; // remaining balance
    
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
    let missingFields = [];
    if (!$w("#fName").value) missingFields.push("First Name");
    if (!$w("#lName").value) missingFields.push("Last Name");
    if (!$w("#email").value) missingFields.push("Email");
    if (!$w("#dob").value) missingFields.push("Date of Birth");
    if (!$w("#mobile").value) missingFields.push("Mobile Number");
    if (!$w("#address").value) missingFields.push("Address");
    
    // Validate if the required checkbox is checked
    if (!$w("#checkbox1").checked) missingFields.push("Terms and Conditions Agreement");
    
    if (personsCount <= 0) missingFields.push("Number of Persons");

    if (missingFields.length > 0) {
        let errorMsg = "Please fill in all required fields: " + missingFields.join(", ");
        if ($w("#errorSuccessMessage")) {
            $w("#errorSuccessMessage").text = errorMsg;
            $w("#errorSuccessMessage").show();
        }
        console.error(errorMsg);
        return;
    }

    if ($w("#errorSuccessMessage")) {
        $w("#errorSuccessMessage").text = "Redirecting to payment page...";
        $w("#errorSuccessMessage").show();
    }

    const bookingId = "BOOK-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    const bookingData = {
        firstName: $w("#fName").value,
        lastName: $w("#lName").value,
        email: $w("#email").value,
        dob: $w("#dob").value,
        phone: $w("#mobile").value,
        address: $w("#address").value,
        packageName: roomData.packageName,
        pricePerPerson: parsePrice(roomData.packagePrice),
        personsCount: personsCount,
        guestNames: $w("#guestNames").value || "",
        totalAmount: totalAmount,
        depositAmount: depositAmount,
        remainingBalance: remainingBalance,
        bookingId: bookingId,
        paymentStatus: "Pending" // Initial status
    };

    try {
        // 1. Save to BookingSaleData
        await wixData.insert("BookingSaleData", bookingData);

        // 2. Call Stripe Backend
        const successUrl = `${wixLocation.baseUrl}/thankyou?bookingId=${bookingId}`;
        const cancelUrl = "https://www.padelparadiseretreats.com/";
        
        const lineItems = [{
            name: `${roomData.packageName} (Deposit)`,
            quantity: personsCount, // Number of persons
            price: 1000   // 1000 euros deposit per person
        }];

        const checkout = await createBookingCheckout(lineItems, successUrl, cancelUrl, depositAmount, roomData.tax || 0, bookingId);
        
        if (checkout.url) {
            wixLocation.to(checkout.url);
        }

    } catch (err) {
        console.error("Booking Error:", err);
        if ($w("#errorSuccessMessage")) {
            $w("#errorSuccessMessage").text = "An error occurred during checkout. Please try again.";
            $w("#errorSuccessMessage").show();
        }
    }
}
