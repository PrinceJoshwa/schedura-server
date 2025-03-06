const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware (except the ones specified)
router.use(authMiddleware.protect);

// Public routes (no authentication required)
router.get('/public/:username/:eventTitle', bookingController.getPublicBooking);
router.post('/schedule', bookingController.scheduleBooking);
router.get('/email/:emailId', bookingController.getEmailContent);

// Protected routes (authentication required)
router.route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router.route('/:id')
  .get(bookingController.getBooking)
  .put(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;