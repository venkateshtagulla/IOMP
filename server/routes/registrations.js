import express from 'express';
import { body, validationResult } from 'express-validator';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { authenticate } from '../middleware/auth.js';
import { sendRegistrationEmail } from '../utils/emailService.js';

const router = express.Router();

// Register for an event
router.post('/', authenticate, [
  body('eventId').isMongoId().withMessage('Valid event ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId } = req.body;

    // Check if event exists and is active
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is in the future
    if (event.date <= new Date()) {
      return res.status(400).json({ message: 'Cannot register for past events' });
    }

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      user: req.user._id,
      event: eventId,
      isActive: true
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    const registrationCount = await Registration.countDocuments({
      event: eventId,
      isActive: true
    });

    if (registrationCount >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Create registration
    const registration = new Registration({
      user: req.user._id,
      event: eventId
    });

    await registration.save();

    // Populate registration data
    const populatedRegistration = await Registration.findById(registration._id)
      .populate('user', 'name email')
      .populate('event', 'name date location');

    // Send confirmation email
    try {
      await sendRegistrationEmail(req.user.email, req.user.name, event);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      message: 'Successfully registered for event',
      registration: populatedRegistration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register for event' });
  }
});

// Get user's registrations
router.get('/user', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, upcoming = false } = req.query;

    const query = {
      user: req.user._id,
      isActive: true
    };

    if (upcoming === 'true') {
      const now = new Date();
      query['event.date'] = { $gt: now };
    }

    const registrations = await Registration.find(query)
      .populate('event')
      .sort({ registrationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Registration.countDocuments(query);

    res.json({
      registrations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Failed to get registrations' });
  }
});

// Cancel registration
router.delete('/:eventId', authenticate, async (req, res) => {
  try {
    const registration = await Registration.findOne({
      user: req.user._id,
      event: req.params.eventId,
      isActive: true
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if event hasn't started yet
    const event = await Event.findById(req.params.eventId);
    if (event.date <= new Date()) {
      return res.status(400).json({ message: 'Cannot cancel registration for ongoing or past events' });
    }

    // Soft delete registration
    registration.isActive = false;
    await registration.save();

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Failed to cancel registration' });
  }
});

// Rate an event
router.post('/rate', authenticate, [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isLength({ max: 1000 }).withMessage('Feedback must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, rating, feedback } = req.body;

    // Find registration
    const registration = await Registration.findOne({
      user: req.user._id,
      event: eventId,
      isActive: true
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if event has ended
    const event = await Event.findById(eventId);
    if (event.date > new Date()) {
      return res.status(400).json({ message: 'Can only rate events that have ended' });
    }

    // Update registration with rating
    registration.rating = rating;
    registration.feedback = feedback;
    registration.attended = true;
    await registration.save();

    res.json({
      message: 'Event rated successfully',
      registration
    });
  } catch (error) {
    console.error('Rate event error:', error);
    res.status(500).json({ message: 'Failed to rate event' });
  }
});

// Get event registrations (admin only)
router.get('/event/:eventId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 10 } = req.query;

    const registrations = await Registration.find({
      event: req.params.eventId,
      isActive: true
    })
      .populate('user', 'name email department year')
      .sort({ registrationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Registration.countDocuments({
      event: req.params.eventId,
      isActive: true
    });

    res.json({
      registrations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ message: 'Failed to get event registrations' });
  }
});

export default router;