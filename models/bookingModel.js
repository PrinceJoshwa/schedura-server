const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A booking must have a title'],
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'A booking must have a duration'],
      min: 1
    },
    type: {
      type: String,
      enum: ['one-on-one', 'group', 'round-robin', 'standard'],
      default: 'standard'
    },
    location: {
      type: String,
      default: 'Google Meet'
    },
    availability: {
      type: String,
      default: 'Weekdays, 9 am - 5 pm'
    },
    start: {
      type: Date,
      required: [true, 'A booking must have a start time']
    },
    end: {
      type: Date,
      required: [true, 'A booking must have an end time']
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A booking must belong to a host']
    },
    attendeeName: {
      type: String
    },
    attendeeEmail: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
bookingSchema.index({ host: 1, start: 1 });
bookingSchema.index({ attendeeEmail: 1 });

// Automatically populate host field
bookingSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'host',
    select: 'name email'
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;