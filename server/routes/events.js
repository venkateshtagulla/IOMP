import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all events with filtering and search
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      category,
      search,
      dateFrom,
      dateTo,
      sort = '-date'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    // Execute query with population
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .populate('registeredCount')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get average ratings for each event
    const eventsWithRatings = await Promise.all(
      events.map(async (event) => {
        const ratings = await Registration.find({
          event: event._id,
          rating: { $exists: true, $ne: null }
        }).select('rating');

        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, reg) => sum + reg.rating, 0) / ratings.length
          : null;

        return {
          ...event.toObject(),
          averageRating
        };
      })
    );

    const total = await Event.countDocuments(query);

    res.json({
      events: eventsWithRatings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Failed to get events' });
  }
});

// Get single event by ID
router.get('/:id', authenticate, async (req, res) => {
  console.log('called id api',req.params.id);
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('registeredCount');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get average rating
    const ratings = await Registration.find({
      event: event._id,
      rating: { $exists: true, $ne: null }
    }).select('rating');

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, reg) => sum + reg.rating, 0) / ratings.length
      : null;
    

   /* res.json({
      ...event.toObject(),
      averageRating
    });*/

    const response = {
  ...event.toObject(),
  averageRating
};
console.log('Response to send:', response);
res.json(response);

  } catch (error) {
    console.error('Get event error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    res.status(500).json({ message: 'Failed to get event' });
  }
});

// Create event (admin only)
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Event name is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required and must be less than 2000 characters'),
  body('category').isIn(['Technology', 'Business', 'Arts', 'Science', 'Sports', 'Workshop', 'Seminar', 'Conference', 'Social']).withMessage('Invalid category'),
  body('date').isISO8601().custom(value => {
    if (new Date(value) <= new Date()) {
      throw new Error('Event date must be in the future');
    }
    return true;
  }),
  body('location').trim().isLength({ min: 1, max: 200 }).withMessage('Location is required and must be less than 200 characters'),
  body('tags').optional().isArray(),
  body('maxAttendees').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const eventData = {
      ...req.body,
      createdBy: req.user._id,
      tags: req.body.tags || []
    };

    const event = new Event(eventData);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// Update event (admin only)
router.put('/:id', authenticate, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ min: 1, max: 2000 }),
  body('category').optional().isIn(['Technology', 'Business', 'Arts', 'Science', 'Sports', 'Workshop', 'Seminar', 'Conference', 'Social']),
  body('date').optional().isISO8601().custom((value, { req }) => {
    if (new Date(value) <= new Date()) {
      throw new Error('Event date must be in the future');
    }
    return true;
  }),
  body('location').optional().trim().isLength({ min: 1, max: 200 }),
  body('tags').optional().isArray(),
  body('maxAttendees').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update event
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        event[key] = req.body[key];
      }
    });

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// Delete event (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Soft delete - mark as inactive instead of removing
    event.isActive = false;
    await event.save();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

export default router;