# Wix Custom Hotel Booking System

This repository contains the custom Velo code for a hotel booking system integrated with Stripe. 

## 🏗️ Project Structure

- `booking.js`: Logic for the main booking page, handling the room repeater and opening the booking lightbox.
- `bookingformPopup.js`: Code for the `bookingform` lightbox. Handles user input, dynamic price calculation, and initiates the checkout process.
- `stripe.web.js`: Backend module for Stripe API integration.
- `thankyou.js`: Success page logic that updates the booking status in the database upon successful payment.

## 🚀 How it Works

1. **Selection**: User selects a room from the `bookingRepeater`.
2. **Booking Form**: A lightbox opens where the user enters their details and selects the number of persons.
3. **Calculation**: The system calculates the total price based on the `packagePrice` and number of persons.
4. **Checkout**: Clicking "Pay Now" creates a record in `BookingSaleData` and redirects to Stripe.
5. **Confirmation**: After payment, the user is redirected to the `thankyou` page, which updates the record to "Paid" and displays the booked package name.

## 🛠️ Setup Requirements

### CMS Collections
- **BookingData**: Contains room/package details (`packageName`, `packagePrice`, `numberOfRooms`, etc.).
- **BookingSaleData**: Stores user bookings. Required fields: `firstName`, `lastName`, `email`, `phone`, `address`, `packageName`, `pricePerPerson`, `personsCount`, `totalAmount`, `bookingId`, `paymentStatus`.

### Secrets
- **stripeKey**: Your Stripe Secret Key stored in the Wix Secrets Manager.

### Element IDs
Ensure the following IDs are correctly set in the Wix Editor:
- **Repeater**: `#bookingRepeater`, `#bookNow` (button).
- **Lightbox**: `#fName`, `#lName`, `#email`, `#mobile`, `#address`, `#person` (dropdown), `#otherPerson` (input), `#rooms` (text), `#payNow` (button).
- **Thank You Page**: `#messageText` (text).

## 📄 License
Custom implementation for Padel Paradise Retreats.
