const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Add this function at the top of your file
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://schedura-landing-page.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

// Configure email transporter (replace with your actual email service)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Get all bookings for the logged-in user
exports.getAllBookings = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const bookings = await Booking.find({ host: req.user.id });
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
};

// Get a single booking by ID
exports.getBooking = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }

    // Check if the booking belongs to the logged-in user
    if (booking.host.id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to access this booking'
      });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking'
    });
  }
};

// Create a new booking
exports.createBooking = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const {
      title,
      duration,
      type,
      location,
      availability,
      start,
      end,
      host,
      attendeeName,
      attendeeEmail,
      notes
    } = req.body;

    // Validate that the host is the logged-in user or the user has admin privileges
    if (host !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only create bookings for yourself'
      });
    }

    const newBooking = await Booking.create({
      title,
      duration,
      type,
      location,
      availability,
      start,
      end,
      host,
      attendeeName,
      attendeeEmail,
      notes
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Failed to create booking'
    });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }

    // Check if the booking belongs to the logged-in user
    if (booking.host.id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this booking'
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Failed to update booking'
    });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }

    // Check if the booking belongs to the logged-in user
    if (booking.host.id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this booking'
      });
    }

    await Booking.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete booking'
    });
  }
};

// Get public booking by username and event title
exports.getPublicBooking = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { username, eventTitle } = req.params;
    
    // Find the user by username (assuming username is the part before @ in email)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${username}@`, 'i') } 
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Convert event title slug to regex pattern
    const titleSlug = eventTitle.replace(/-/g, ' ');
    const titleRegex = new RegExp(titleSlug, 'i');
    
    // Find the booking
    const booking = await Booking.findOne({
      host: user._id,
      title: { $regex: titleRegex }
    });
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching public booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking'
    });
  }
};

// Schedule a booking (for attendees)
exports.scheduleBooking = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { bookingId, attendeeName, attendeeEmail, selectedDate, selectedTime, notes } = req.body;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }
    
    // Create a new date object from the selected date and time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startDate = new Date(selectedDate);
    startDate.setHours(hours, minutes, 0, 0);
    
    // Calculate end time based on duration
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + booking.duration);
    
    // Update the booking with attendee information and scheduled time
    booking.attendeeName = attendeeName;
    booking.attendeeEmail = attendeeEmail;
    booking.start = startDate;
    booking.end = endDate;
    booking.notes = notes;
    
    await booking.save();
    
    // Send confirmation emails
    const emailId = uuidv4();
    await sendConfirmationEmails(booking, emailId);
    
    res.status(200).json({
      status: 'success',
      data: {
        booking,
        emailId
      }
    });
  } catch (error) {
    console.error('Error scheduling booking:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Failed to schedule booking'
    });
  }
};

// Get email content by ID
exports.getEmailContent = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { emailId } = req.params;
    
    // In a real application, you would store email content in a database
    // For this example, we'll just return a mock email
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Booking Confirmation</h2>
        <p>Your booking has been confirmed. Here are the details:</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Event:</strong> ${req.query.title || 'Meeting'}</p>
          <p><strong>Date:</strong> ${req.query.date || 'Upcoming'}</p>
          <p><strong>Time:</strong> ${req.query.time || 'Scheduled'}</p>
          <p><strong>Location:</strong> ${req.query.location || 'Online'}</p>
        </div>
        <p>Thank you for using our service!</p>
        <p>The Schedura Team</p>
      </div>
    `;
    
    res.status(200).json({
      status: 'success',
      emailContent
    });
  } catch (error) {
    console.error('Error fetching email content:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch email content'
    });
  }
};

// Helper function to send confirmation emails
async function sendConfirmationEmails(booking, emailId) {
  try {
    const host = await User.findById(booking.host);
    
    if (!host || !booking.attendeeEmail) {
      console.error('Missing host or attendee email');
      return;
    }
    
    // Format date and time for email
    const date = booking.start.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const startTime = booking.start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const endTime = booking.end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Email to attendee
    const attendeeMailOptions = {
      from: process.env.EMAIL_FROM || 'schedura@example.com',
      to: booking.attendeeEmail,
      subject: `Booking Confirmation: ${booking.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Booking Confirmation</h2>
          <p>Your booking with ${host.name} has been confirmed.</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Event:</strong> ${booking.title}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p><strong>Duration:</strong> ${booking.duration} minutes</p>
            <p><strong>Location:</strong> ${booking.location}</p>
          </div>
          <p>Thank you for using our service!</p>
          <p>The Schedura Team</p>
        </div>
      `
    };
    
    // Email to host
    const hostMailOptions = {
      from: process.env.EMAIL_FROM || 'schedura@example.com',
      to: host.email,
      subject: `New Booking: ${booking.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">New Booking</h2>
          <p>${booking.attendeeName} has booked a session with you.</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Event:</strong> ${booking.title}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p><strong>Duration:</strong> ${booking.duration} minutes</p>
            <p><strong>Location:</strong> ${booking.location}</p>
            <p><strong>Attendee:</strong> ${booking.attendeeName} (${booking.attendeeEmail})</p>
          </div>
          <p>Thank you for using our service!</p>
          <p>The Schedura Team</p>
        </div>
      `
    };
    
    // Send emails
    await transporter.sendMail(attendeeMailOptions);
    await transporter.sendMail(hostMailOptions);
    
    console.log('Confirmation emails sent successfully');
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
  }
}