const express = require("express");
const router = express.Router();

//insert model
const Booking = require("../Model/bookingModel");

// Import controller
const BookingController = require("../Controllers/bookingController");

// Route definitions
router.get("/", BookingController.getAllBookings);       // Get all bookings
router.post("/", BookingController.addBooking);          // Create new booking
router.get("/availability/unavailable-dates", BookingController.getUnavailableDates); // Get unavailable dates
router.post("/availability/check", BookingController.checkAvailability); // Check availability
router.get("/stats", BookingController.getBookingStats); // Get booking statistics
router.get("/rooms/available", BookingController.getAvailableRooms); // Get available rooms
router.get("/pricing", BookingController.getPricing); // Get pricing information
router.get("/:id", BookingController.getBookingById);    // Get booking by ID
router.put("/:id", BookingController.updateBooking);     // Update booking by ID
router.delete("/:id", BookingController.deleteBooking);  // Delete booking by ID

// Export router
module.exports = router;
