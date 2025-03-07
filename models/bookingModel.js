// import mongoose from 'mongoose';

// const bookingSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   start: {
//     type: Date,
//     required: true,
//   },
//   end: {
//     type: Date,
//     required: true,
//   },
//   duration: {
//     type: Number,
//     required: true,
//   },
//   location: {
//     type: String,
//     default: 'Google Meet',
//   },
//   type: {
//     type: String,
//     enum: ['one-on-one', 'group', 'round-robin'],
//     default: 'one-on-one',
//   },
//   availability: {
//     type: String,
//     default: 'Weekdays, 9 am - 5 pm',
//   },
//   host: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   attendeeName: {
//     type: String,
//   },
//   attendeeEmail: {
//     type: String,
//     validate: {
//       validator: function(v) {
//         return !v || /\S+@\S+\.\S+/.test(v);
//       },
//       message: props => `${props.value} is not a valid email address!`
//     }
//   },
//   notes: String,
//   status: {
//     type: String,
//     enum: ['available', 'scheduled', 'cancelled'],
//     default: 'available'
//   },
//   emailId: {
//     type: String,
//   },
// }, { timestamps: true });


// // Add a pre-save middleware to ensure end time is after start time
// bookingSchema.pre('save', function(next) {
//   if (this.start && this.end) {
//     if (this.end <= this.start) {
//       next(new Error('End time must be after start time'));
//     }
//   }
//   next();
// });

// const Booking = mongoose.model('Booking', bookingSchema);

// export default Booking;


import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["one-on-one", "group", "round-robin"],
    required: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  location: {
    type: String,
    default: "Google Meet",
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  availability: {
    type: String,
    default: "Weekdays, 9 AM - 5 PM",
  },
  maxParticipants: {
    type: Number,
    default: 1,
  },
  attendeeEmail: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /\S+@\S+\.\S+/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  attendeeName: String,
  notes: String,
  status: {
    type: String,
    enum: ['available', 'scheduled', 'cancelled'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});