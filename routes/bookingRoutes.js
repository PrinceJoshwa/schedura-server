import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createBooking, 
  getBookings, 
  getBookingDetails, 
  updateBooking, 
  deleteBooking,
  getPublicBookingDetails,
  scheduleBooking,
  getEmailContentEndpoint
} from '../controllers/bookingController.js';

const router = express.Router();

// Protected routes
router.route('/')
  .post(protect, createBooking)
  .get(protect, getBookings);

router.route('/:bookingId')
  .get(protect, getBookingDetails)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

// Public routes
router.get('/public/:username/:eventTitle', getPublicBookingDetails);
router.post('/schedule', scheduleBooking);
router.get('/email/:emailId', getEmailContentEndpoint);

export default router;