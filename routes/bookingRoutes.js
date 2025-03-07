import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getPublicBookingDetails,
  scheduleBooking,
  getEmailContentEndpoint
} from '../controllers/bookingController.js';

const router = express.Router();
// Routes for bookings
router.route('/')
        .post(protect, createBooking)
        .get(protect, getBookings);
router.route('/:id')
        .get(protect, getBookingById)
        .put(protect, updateBooking).delete(protect, deleteBooking);

// Public routes
router.get('/public/:username/:eventTitle', getPublicBookingDetails);
router.post('/schedule', scheduleBooking);
router.get('/email/:emailId', getEmailContentEndpoint);

export default router;