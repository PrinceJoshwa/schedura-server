import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} from '../controllers/bookingController.js';

const router = express.Router();
// Routes for bookings
router.route('/')
        .post(protect, createBooking)
        .get(protect, getBookings);
router.route('/:id')
        .get(protect, getBookingById)
        .put(protect, updateBooking).delete(protect, deleteBooking);

export default router;