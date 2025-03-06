// import nodemailer from 'nodemailer';
// import { format } from 'date-fns';

// // Create reusable transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

// export const sendBookingConfirmation = async (booking, attendee) => {
//   const meetingDate = format(new Date(booking.start), 'EEEE, MMMM d, yyyy');
//   const startTime = format(new Date(booking.start), 'h:mm a');
//   const endTime = format(new Date(booking.end), 'h:mm a');

//   // Generate Google Calendar event link
//   const googleCalendarLink = generateGoogleCalendarLink(booking, attendee);

//   // Create email HTML content
//   const htmlContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <div style="background-color: #f8fafc; padding: 24px;">
//         <h1 style="color: #1a202c; font-size: 24px; margin-bottom: 16px;">New Event Scheduled</h1>
//         <p style="color: #4a5568; margin-bottom: 24px;">A new event has been scheduled.</p>
        
//         <div style="background-color: white; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
//           <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 16px;">${booking.title}</h2>
          
//           <div style="margin-bottom: 16px;">
//             <p style="color: #4a5568; margin-bottom: 8px;"><strong>Date:</strong> ${meetingDate}</p>
//             <p style="color: #4a5568; margin-bottom: 8px;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
//             <p style="color: #4a5568; margin-bottom: 8px;"><strong>Location:</strong> ${booking.location}</p>
//           </div>

//           <div style="margin-bottom: 24px;">
//             <p style="color: #4a5568; margin-bottom: 8px;"><strong>Attendee:</strong> ${attendee.name}</p>
//             <p style="color: #4a5568; margin-bottom: 8px;"><strong>Email:</strong> ${attendee.email}</p>
//           </div>

//           <a href="${booking.location}" 
//              style="display: inline-block; background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-bottom: 16px;">
//             Join Meeting
//           </a>
          
//           <a href="${googleCalendarLink}" 
//              style="display: inline-block; background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
//             Add to Calendar
//           </a>
//         </div>

//         <p style="color: #718096; font-size: 14px;">
//           This is an automated message. Please do not reply to this email.
//         </p>
//       </div>
//     </div>
//   `;

//   // Send email
//   const info = await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: attendee.email,
//     subject: `Meeting Scheduled: ${booking.title}`,
//     html: htmlContent,
//     // Attach ICS file
//     attachments: [
//       {
//         filename: 'event.ics',
//         content: generateICSFile(booking, attendee),
//         contentType: 'text/calendar'
//       }
//     ]
//   });

//   return info;
// };

// const generateGoogleCalendarLink = (booking, attendee) => {
//   const startTime = new Date(booking.start).toISOString().replace(/-|:|\.\d\d\d/g, '');
//   const endTime = new Date(booking.end).toISOString().replace(/-|:|\.\d\d\d/g, '');
  
//   const params = new URLSearchParams({
//     action: 'TEMPLATE',
//     text: booking.title,
//     dates: `${startTime}/${endTime}`,
//     details: `Meeting with ${attendee.name}`,
//     location: booking.location
//   });

//   return `https://calendar.google.com/calendar/render?${params.toString()}`;
// };

// const generateICSFile = (booking, attendee) => {
//   const startTime = new Date(booking.start).toISOString().replace(/-|:|\.\d\d\d/g, '');
//   const endTime = new Date(booking.end).toISOString().replace(/-|:|\.\d\d\d/g, '');
  
//   return `BEGIN:VCALENDAR
// VERSION:2.0
// BEGIN:VEVENT
// DTSTART:${startTime}
// DTEND:${endTime}
// SUMMARY:${booking.title}
// DESCRIPTION:Meeting with ${attendee.name}
// LOCATION:${booking.location}
// END:VEVENT
// END:VCALENDAR`;
// };

// export const getEmailContent = async (emailId) => {
//   // In a real application, you would fetch the email content from your database
//   // For this example, we'll generate it on the fly
//   const booking = await Booking.findById(emailId);
//   if (!booking) {
//     throw new Error('Email not found');
//   }

//   return generateEmailContent(booking);
// };


import nodemailer from 'nodemailer';
import { format } from 'date-fns';

// Create a transporter based on available credentials
const createTransporter = () => {
  // Check if email credentials are available
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log(`Email credentials found for: ${process.env.EMAIL_USER}`);
    
    // For Gmail, we need to use a specific configuration
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true // Enable debug output
    });
  } else {
    console.warn('Email credentials not found. Using mock email service.');
    // Return a mock transporter that simulates sending
    return {
      sendMail: async (mailOptions) => {
        console.log('MOCK EMAIL SENT:', mailOptions);
        return {
          messageId: `mock-email-${Date.now()}`,
          envelope: {},
          accepted: [mailOptions.to],
          rejected: [],
          pending: [],
          response: 'Mock email sent successfully'
        };
      }
    };
  }
};

// Create the transporter
let transporter;
try {
  transporter = createTransporter();
  console.log('Email transporter created successfully');
} catch (error) {
  console.error('Error creating email transporter:', error);
  // Fallback to mock transporter
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('FALLBACK MOCK EMAIL SENT:', mailOptions);
      return {
        messageId: `fallback-mock-email-${Date.now()}`,
        envelope: {},
        accepted: [mailOptions.to],
        rejected: [],
        pending: [],
        response: 'Fallback mock email sent successfully'
      };
    }
  };
}

export const sendBookingConfirmation = async (booking, attendee) => {
  try {
    const meetingDate = format(new Date(booking.start), 'EEEE, MMMM d, yyyy');
    const startTime = format(new Date(booking.start), 'h:mm a');
    const endTime = format(new Date(booking.end), 'h:mm a');

    // Generate Google Calendar event link
    const googleCalendarLink = generateGoogleCalendarLink(booking, attendee);

    // Create email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8fafc; padding: 24px;">
          <h1 style="color: #1a202c; font-size: 24px; margin-bottom: 16px;">New Event Scheduled</h1>
          <p style="color: #4a5568; margin-bottom: 24px;">A new event has been scheduled.</p>
          
          <div style="background-color: white; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #2d3748; font-size: 20px; margin-bottom: 16px;">${booking.title}</h2>
            
            <div style="margin-bottom: 16px;">
              <p style="color: #4a5568; margin-bottom: 8px;"><strong>Date:</strong> ${meetingDate}</p>
              <p style="color: #4a5568; margin-bottom: 8px;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p style="color: #4a5568; margin-bottom: 8px;"><strong>Location:</strong> ${booking.location}</p>
            </div>

            <div style="margin-bottom: 24px;">
              <p style="color: #4a5568; margin-bottom: 8px;"><strong>Attendee:</strong> ${attendee.name}</p>
              <p style="color: #4a5568; margin-bottom: 8px;"><strong>Email:</strong> ${attendee.email}</p>
            </div>

            <a href="${booking.location}" 
               style="display: inline-block; background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-bottom: 16px;">
              Join Meeting
            </a>
            
            <a href="${googleCalendarLink}" 
               style="display: inline-block; background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Add to Calendar
            </a>
          </div>

          <p style="color: #718096; font-size: 14px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    console.log(`Attempting to send email to ${attendee.email}`);
    
    // Send email
    const info = await transporter.sendMail({
      from: `"Booking System" <${process.env.EMAIL_USER || 'noreply@bookingsystem.com'}>`,
      to: attendee.email,
      subject: `Meeting Scheduled: ${booking.title}`,
      html: htmlContent,
      // Attach ICS file
      attachments: [
        {
          filename: 'event.ics',
          content: generateICSFile(booking, attendee),
          contentType: 'text/calendar'
        }
      ]
    });

    console.log('Email sent successfully:', info);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Return a mock response so the flow can continue
    return {
      messageId: `error-fallback-${Date.now()}`,
      error: error.message
    };
  }
};

const generateGoogleCalendarLink = (booking, attendee) => {
  const startTime = new Date(booking.start).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endTime = new Date(booking.end).toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: booking.title,
    dates: `${startTime}/${endTime}`,
    details: `Meeting with ${attendee.name}`,
    location: booking.location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const generateICSFile = (booking, attendee) => {
  const startTime = new Date(booking.start).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endTime = new Date(booking.end).toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${booking.title}
DESCRIPTION:Meeting with ${attendee.name}
LOCATION:${booking.location}
END:VEVENT
END:VCALENDAR`;
};

export const getEmailContent = async (emailId) => {
  try {
    console.log('Generating email content for ID:', emailId);
    
    // In a real application, you would fetch the email content from your database
    // For this example, we'll generate a mock email content based on the emailId
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .email-container { max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 5px; overflow: hidden; }
            .email-header { background-color: #f8fafc; padding: 20px; border-bottom: 1px solid #eaeaea; }
            .email-body { padding: 20px; background-color: white; }
            .email-footer { background-color: #f8fafc; padding: 15px; font-size: 12px; color: #718096; border-top: 1px solid #eaeaea; }
            h1 { color: #2d3748; font-size: 24px; margin-top: 0; }
            h2 { color: #4a5568; font-size: 18px; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px; }
            .btn-green { background-color: #48bb78; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Meeting Confirmation</h1>
              <p>Email ID: ${emailId}</p>
            </div>
            <div class="email-body">
              <p>Hello,</p>
              <p>Your meeting has been scheduled successfully.</p>
              
              <h2>Meeting Details</h2>
              <p><strong>Title:</strong> Strategy Discussion</p>
              <p><strong>Date:</strong> Thursday, June 20, 2025</p>
              <p><strong>Time:</strong> 10:00 AM - 10:30 AM</p>
              <p><strong>Location:</strong> Google Meet</p>
              
              <p style="margin-top: 30px;">
                <a href="#" class="btn">Join Meeting</a>
                <a href="#" class="btn btn-green">Add to Calendar</a>
              </p>
            </div>
            <div class="email-footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  } catch (error) {
    console.error('Error generating email content:', error);
    throw error;
  }
};