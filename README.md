# Wix Custom Hotel Booking System

This repository contains the custom Velo code for a hotel booking system integrated with Stripe. 

## 🏗️ Project Structure

- `booking.js`: Logic for the main booking page, handling the room repeater and opening the booking lightbox.
- `bookingformPopup.js`: Code for the `bookingform` lightbox. Handles user input (including dynamically showing `#guestNames`), calculates a €1000 per person deposit, and initiates the checkout process for the deposit amount.
- `stripe.web.js`: Backend module for Stripe API integration.
- `email.web.js`: Backend module containing the `sendQuoteEmailWithContact` function to create contacts and send triggered emails via Wix CRM.
- `thankyou.js`: Success page logic that updates the booking status in the database upon successful payment, updates the UI with the payment confirmation message (deposit received, remaining balance due by 7th April 2026), and triggers the confirmation email.

## 🚀 How it Works

1. **Selection**: User selects a room from the `bookingRepeater`.
2. **Booking Form**: A lightbox opens where the user enters their details, selects the number of persons, and optionally provides `#guestNames` if booking for more than one person.
3. **Calculation**: The system calculates the total price based on the `packagePrice` and number of persons. It then calculates a €1000 per person deposit amount and the remaining balance.
4. **Checkout**: Clicking "Pay Now" creates a record in `BookingSaleData` (including `guestNames`, `depositAmount`, and `remainingBalance`) and redirects to Stripe to pay the deposit.
5. **Confirmation**: After payment, the user is redirected to the `thankyou` page, which updates the record to "Paid", displays the customized confirmation message, and triggers an email using `email.web.js`.

## 🛠️ Setup Requirements

### CMS Collections
- **BookingData**: Contains room/package details (`packageName`, `packagePrice`, `numberOfRooms`, etc.).
- **BookingSaleData**: Stores user bookings. Required fields: `firstName`, `lastName`, `email`, `dob`, `phone`, `address`, `packageName`, `pricePerPerson`, `personsCount`, `guestNames`, `totalAmount`, `depositAmount`, `remainingBalance`, `bookingId`, `paymentStatus`.

### Secrets
- **stripeKey**: Your Stripe Secret Key stored in the Wix Secrets Manager.

### Element IDs
Ensure the following IDs are correctly set in the Wix Editor:
- **Repeater**: `#bookingRepeater`, `#bookNow` (button).
- **Lightbox**: `#fName`, `#lName`, `#email`, `#dob` (input), `#mobile`, `#address`, `#person` (dropdown), `#otherPerson` (input), `#guestNames` (input/text area), `#rooms` (text), `#payNow` (button), `#errorSuccessMessage` (text).
- **Thank You Page**: `#messageText` (text).

## 📄 License
Custom implementation for Padel Paradise Retreats.
