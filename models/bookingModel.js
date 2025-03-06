const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    default: 'Google Meet',
  },
  type: {
    type: String,
    enum: ['one-on-one', 'group', 'round-robin'],
    default: 'one-on-one',
  },
  availability: {
    type: String,
    default: 'Weekdays, 9 am - 5 pm',
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendeeName: {
    type: String,
  },
  attendeeEmail: {
    type: String,
  },
  notes: {
    type: String,
  },
  emailId: {
    type: String,
  },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;