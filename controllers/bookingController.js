import Booking from '../models/bookingModel';
import { sendEmail } from '../utils/email';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { title, start, end, duration, location, type, availability, attendeeName, attendeeEmail, notes } = req.body;
    const host = req.user._id;

    const booking = await Booking.create({
      title,
      start,
      end,
      duration,
      location,
      type,
      availability,
      host,
      attendeeName,
      attendeeEmail,
      notes,
    });

    // Send email to attendee
    const emailResponse = await sendEmail({
      to: attendeeEmail,
      subject: `Booking Confirmation: ${title}`,
      text: `You have a booking scheduled for ${new Date(start).toLocaleString()} with ${req.user.name}.`, // Customize this message as needed
    });

    res.status(201).json({
      ...booking._doc,
      emailId: emailResponse.messageId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ host: req.user._id }).sort({ start: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('host', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a booking
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res) => {
  try {
    const { title, start, end, duration, location, type, availability, attendeeName, attendeeEmail, notes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.host.toString() !== req.user._id) {
      return res.status(401).json({ message: 'Not authorized to update this booking' });
    }

    booking.title = title || booking.title;
    booking.start = start || booking.start;
    booking.end = end || booking.end;
    booking.duration = duration || booking.duration;
    booking.location = location || booking.location;
    booking.type = type || booking.type;
    booking.availability = availability || booking.availability;
    booking.attendeeName = attendeeName || booking.attendeeName;
    booking.attendeeEmail = attendeeEmail || booking.attendeeEmail;
    booking.notes = notes || booking.notes;

    const updatedBooking = await booking.save();

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.host.toString() !== req.user._id) {
      return res.status(401).json({ message: 'Not authorized to delete this booking' });
    }

    await booking.remove();

    res.status(200).json({ message: 'Booking removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { createBooking, getBookings, getBookingById, updateBooking, deleteBooking };