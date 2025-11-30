import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['Technology', 'Business', 'Arts', 'Science', 'Sports', 'Workshop', 'Seminar', 'Conference', 'Social']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  targetAudience: {
    type: String,
    trim: true,
    default: 'All Students'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxAttendees: {
    type: Number,
    min: 1,
    default: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for registered count
eventSchema.virtual('registeredCount', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'event',
  count: true
});

// Virtual for average rating
eventSchema.virtual('averageRating', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'event',
  match: { rating: { $exists: true, $ne: null } },
  options: { 
    aggregate: [
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]
  }
});

// Index for search functionality
eventSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});

// Index for filtering
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ isActive: 1 });

export default mongoose.model('Event', eventSchema);