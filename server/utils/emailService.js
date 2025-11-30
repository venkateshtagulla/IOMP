import nodemailer from 'nodemailer';

// Create transporter
/*const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};*/
// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};


// Send registration confirmation email
export const sendRegistrationEmail = async (userEmail, userName, event) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Skipping email send.');
      return;
    }

    const transporter = createTransporter();

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: `"EduEvents" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Registration Confirmation - ${event.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              
              <p>Thank you for registering for <strong>${event.name}</strong>! We're excited to have you join us.</p>
              
              <div class="event-details">
                <h3>📅 Event Details</h3>
                <p><strong>Event:</strong> ${event.name}</p>
                <p><strong>Date & Time:</strong> ${formatDate(event.date)}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Category:</strong> ${event.category}</p>
              </div>
              
              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Mark your calendar for the event date</li>
                <li>Arrive 15 minutes early for check-in</li>
                <li>Bring a valid student ID</li>
                <li>Check your email for any updates</li>
              </ul>
              
              <p>If you need to cancel your registration, please log into your account and manage your registrations.</p>
              
              <p>We look forward to seeing you there!</p>
              
              <p>Best regards,<br>
              The EduEvents Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Registration confirmation email sent to ${userEmail}`);

  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send event reminder email
export const sendReminderEmail = async (userEmail, userName, event) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return;
    }

    const transporter = createTransporter();

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: `"EduEvents" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Reminder: ${event.name} is tomorrow!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>⏰ Event Reminder</h2>
          <p>Hi ${userName},</p>
          <p>This is a friendly reminder that <strong>${event.name}</strong> is scheduled for tomorrow!</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Event Details</h3>
            <p><strong>Date & Time:</strong> ${formatDate(event.date)}</p>
            <p><strong>Location:</strong> ${event.location}</p>
          </div>
          
          <p>Don't forget to attend!</p>
          <p>Best regards,<br>The EduEvents Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${userEmail}`);

  } catch (error) {
    console.error('Reminder email error:', error);
    throw error;
  }
};