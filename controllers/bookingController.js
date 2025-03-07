// import Booking from '../models/bookingModel.js';
// import { sendEmail } from '../utils/emailService.js';

// // @desc    Create a new booking
// // @route   POST /api/bookings
// // @access  Private
// const createBooking = async (req, res) => {
//   try {
//     const { title, start, end, duration, location, type, availability, attendeeName, attendeeEmail, notes } = req.body;
//     const host = req.user._id;

//     const booking = await Booking.create({
//       title,
//       start,
//       end,
//       duration,
//       location,
//       type,
//       availability,
//       host,
//       attendeeName,
//       attendeeEmail,
//       notes,
//     });

//     // Send email to attendee
//     const emailResponse = await sendEmail({
//       to: attendeeEmail,
//       subject: `Booking Confirmation: ${title}`,
//       text: `You have a booking scheduled for ${new Date(start).toLocaleString()} with ${req.user.name}.`, // Customize this message as needed
//     });

//     res.status(201).json({
//       ...booking._doc,
//       emailId: emailResponse.messageId,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Get all bookings
// // @route   GET /api/bookings
// // @access  Private
// const getBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ host: req.user._id }).sort({ start: -1 });
//     res.status(200).json(bookings);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Get a single booking by ID
// // @route   GET /api/bookings/:id
// // @access  Private
// const getBookingById = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id).populate('host', 'name email');

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     res.status(200).json(booking);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Update a booking
// // @route   PUT /api/bookings/:id
// // @access  Private
// const updateBooking = async (req, res) => {
//   try {
//     const { title, start, end, duration, location, type, availability, attendeeName, attendeeEmail, notes } = req.body;

//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     if (booking.host.toString() !== req.user._id) {
//       return res.status(401).json({ message: 'Not authorized to update this booking' });
//     }

//     booking.title = title || booking.title;
//     booking.start = start || booking.start;
//     booking.end = end || booking.end;
//     booking.duration = duration || booking.duration;
//     booking.location = location || booking.location;
//     booking.type = type || booking.type;
//     booking.availability = availability || booking.availability;
//     booking.attendeeName = attendeeName || booking.attendeeName;
//     booking.attendeeEmail = attendeeEmail || booking.attendeeEmail;
//     booking.notes = notes || booking.notes;

//     const updatedBooking = await booking.save();

//     res.status(200).json(updatedBooking);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Delete a booking
// // @route   DELETE /api/bookings/:id
// // @access  Private
// const deleteBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }

//     if (booking.host.toString() !== req.user._id) {
//       return res.status(401).json({ message: 'Not authorized to delete this booking' });
//     }

//     await booking.remove();

//     res.status(200).json({ message: 'Booking removed' });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// const getPublicBookingDetails = async (req, res) => {
//   try {
//     const { username, eventTitle } = req.params;

//     // Find the user by username
//     const user = await User.findOne({ 
//       email: new RegExp(`^${username}@`, 'i') 
//     });

//     if (!user) {
//       return res.status(404).json({ message: "Host not found" });
//     }

//     // Convert event title to a URL-friendly format for comparison
//     const urlFriendlyTitle = eventTitle.toLowerCase().replace(/-/g, ' ');

//     // Find the booking
//     const booking = await Booking.findOne({
//       host: user._id,
//       title: new RegExp(`^${urlFriendlyTitle}$`, 'i')
//     }).populate('host', 'name email');

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     res.json(booking);
//   } catch (error) {
//     console.error('Error fetching public booking details:', error);
//     res.status(500).json({ message: "Error fetching booking details", error: error.message });
//   }
// };

// const scheduleBooking = async (req, res) => {
//   try {
//     const { bookingId, startTime, attendeeEmail, attendeeName, notes } = req.body;

//     if (!bookingId || !startTime || !attendeeEmail) {
//       return res.status(400).json({ 
//         message: "Missing required fields: bookingId, startTime, and attendeeEmail are required" 
//       });
//     }

//     // Find the original booking template
//     const bookingTemplate = await Booking.findById(bookingId).populate('host', 'name email');
//     if (!bookingTemplate) {
//       return res.status(404).json({ message: "Booking template not found" });
//     }

//     // Calculate end time based on duration
//     const startDate = new Date(startTime);
//     const endDate = new Date(startDate.getTime() + (bookingTemplate.duration * 60000));

//     // Check if the time slot is available
//     const conflictingBooking = await Booking.findOne({
//       host: bookingTemplate.host,
//       start: { $lt: endDate },
//       end: { $gt: startDate },
//       status: 'scheduled',
//       _id: { $ne: bookingId }
//     });

//     if (conflictingBooking) {
//       return res.status(400).json({ message: "Selected time slot is not available" });
//     }

//     // Create the scheduled booking
//     const scheduledBooking = await Booking.create({
//       title: bookingTemplate.title,
//       duration: bookingTemplate.duration,
//       type: bookingTemplate.type,
//       location: bookingTemplate.location,
//       host: bookingTemplate.host,
//       start: startDate,
//       end: endDate,
//       attendeeEmail,
//       attendeeName: attendeeName || '',
//       notes: notes || '',
//       status: 'scheduled'
//     });

//     // Create a response object that includes the booking data
//     const responseData = scheduledBooking.toObject();

//     // Send confirmation email
//     try {
//       console.log('Sending booking confirmation email to:', attendeeEmail);
//       const emailInfo = await sendBookingConfirmation(scheduledBooking, {
//         name: attendeeName,
//         email: attendeeEmail
//       });
      
//       // Add emailId to the response
//       responseData.emailId = emailInfo.messageId || `mock-email-${Date.now()}`;
//       console.log('Email sent with ID:', responseData.emailId);
//     } catch (emailError) {
//       console.error('Error sending confirmation email:', emailError);
//       // Add a fallback emailId even if email sending fails
//       responseData.emailId = `fallback-email-${Date.now()}`;
//     }

//     res.status(201).json(responseData);
//   } catch (error) {
//     console.error('Error scheduling booking:', error);
//     res.status(500).json({ message: "Error scheduling booking", error: error.message });
//   }
// };

// const getEmailContentEndpoint = async (req, res) => {
//   try {
//     const { emailId } = req.params;
//     console.log('Fetching email content for ID:', emailId);
//     const emailContent = await getEmailContent(emailId);
//     res.json({ emailContent });
//   } catch (error) {
//     console.error('Error fetching email content:', error);
//     res.status(500).json({ message: "Error fetching email content", error: error.message });
//   }
// };

// export { createBooking, getBookings, getBookingById, updateBooking, deleteBooking, getPublicBookingDetails, scheduleBooking, getEmailContentEndpoint   };


import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import { sendBookingConfirmation, getEmailContent } from "../utils/emailService.js";

export const createBooking = async (req, res) => {
  try {
    const { title, duration, type, location, availability, start, end } = req.body;
    const host = req.user._id;

    if (!start || !end) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }

    // Ensure dates are properly parsed
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Validate dates
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ message: "Invalid start date format" });
    }
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid end date format" });
    }

    // Create the booking
    const booking = await Booking.create({
      title,
      duration: parseInt(duration),
      type,
      location: location || "Google Meet",
      availability: availability || "Weekdays, 9 AM - 5 PM",
      start: startDate,
      end: endDate,
      host,
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ host: req.user._id })
      .populate("host", "name email")
      .sort({ start: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("host", "name email");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ message: "Error fetching booking details", error });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { title, duration, type, location, availability, start, end } = req.body;
    const bookingId = req.params.bookingId;
    const host = req.user._id;

    // Find the booking and ensure the host matches the authenticated user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.host.toString() !== host.toString()) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    // Validate and parse dates if provided
    let updateData = { title, duration, type, location, availability };
    
    if (start) {
      const startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ message: "Invalid start date format" });
      }
      updateData.start = startDate;
    }
    
    if (end) {
      const endDate = new Date(end);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid end date format" });
      }
      updateData.end = endDate;
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const host = req.user._id;

    // Find the booking and ensure the host matches the authenticated user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.host.toString() !== host.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this booking" });
    }

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getPublicBookingDetails = async (req, res) => {
  try {
    const { username, eventTitle } = req.params;

    // Find the user by username
    const user = await User.findOne({ 
      email: new RegExp(`^${username}@`, 'i') 
    });

    if (!user) {
      return res.status(404).json({ message: "Host not found" });
    }

    // Convert event title to a URL-friendly format for comparison
    const urlFriendlyTitle = eventTitle.toLowerCase().replace(/-/g, ' ');

    // Find the booking
    const booking = await Booking.findOne({
      host: user._id,
      title: new RegExp(`^${urlFriendlyTitle}$`, 'i')
    }).populate('host', 'name email');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching public booking details:', error);
    res.status(500).json({ message: "Error fetching booking details", error: error.message });
  }
};

export const scheduleBooking = async (req, res) => {
  try {
    const { bookingId, startTime, attendeeEmail, attendeeName, notes } = req.body;

    if (!bookingId || !startTime || !attendeeEmail) {
      return res.status(400).json({ 
        message: "Missing required fields: bookingId, startTime, and attendeeEmail are required" 
      });
    }

    // Find the original booking template
    const bookingTemplate = await Booking.findById(bookingId).populate('host', 'name email');
    if (!bookingTemplate) {
      return res.status(404).json({ message: "Booking template not found" });
    }

    // Calculate end time based on duration
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + (bookingTemplate.duration * 60000));

    // Check if the time slot is available
    const conflictingBooking = await Booking.findOne({
      host: bookingTemplate.host,
      start: { $lt: endDate },
      end: { $gt: startDate },
      status: 'scheduled',
      _id: { $ne: bookingId }
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: "Selected time slot is not available" });
    }

    // Create the scheduled booking
    const scheduledBooking = await Booking.create({
      title: bookingTemplate.title,
      duration: bookingTemplate.duration,
      type: bookingTemplate.type,
      location: bookingTemplate.location,
      host: bookingTemplate.host,
      start: startDate,
      end: endDate,
      attendeeEmail,
      attendeeName: attendeeName || '',
      notes: notes || '',
      status: 'scheduled'
    });

    // Populate the host information
    await scheduledBooking.populate('host', 'name email');

    // Create a response object that includes the booking data
    const responseData = scheduledBooking.toObject();

    // Send confirmation email
    try {
      console.log('Sending booking confirmation email to:', attendeeEmail);
      const emailInfo = await sendBookingConfirmation(scheduledBooking, {
        name: attendeeName,
        email: attendeeEmail
      });
      
      // Add emailId to the response
      responseData.emailId = emailInfo.messageId || `mock-email-${Date.now()}`;
      console.log('Email sent with ID:', responseData.emailId);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Add a fallback emailId even if email sending fails
      responseData.emailId = `fallback-email-${Date.now()}`;
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error scheduling booking:', error);
    res.status(500).json({ message: "Error scheduling booking", error: error.message });
  }
};

export const getEmailContentEndpoint = async (req, res) => {
  try {
    const { emailId } = req.params;
    console.log('Fetching email content for ID:', emailId);
    const emailContent = await getEmailContent(emailId);
    res.json({ emailContent });
  } catch (error) {
    console.error('Error fetching email content:', error);
    res.status(500).json({ message: "Error fetching email content", error: error.message });
  }
};