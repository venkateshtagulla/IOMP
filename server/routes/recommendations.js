import express from 'express';
import axios from 'axios';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get AI recommendations for user
router.get('/', authenticate, async (req, res) => {
  console.log('📩 GET /api/recommendations triggered');
  try {
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Recommendations are only available for students' });
    }

    // Get user's past registrations
    
    const userRegistrations = await Registration.find({
      user: req.user._id,
      isActive: true
    }).populate('event');

    // Get all active events
    const allEvents = await Event.find({
      isActive: true,
      date: { $gt: new Date() } // Only future events
    });
    

    // Check if user has any interactions
    if (userRegistrations.length === 0 || !req.user.interests || req.user.interests.length === 0) {
      // Return popular events as fallback
      const popularEvents = await Event.aggregate([
        { $match: { isActive: true, date: { $gt: new Date() } } },
        {
          $lookup: {
            from: 'registrations',
            localField: '_id',
            foreignField: 'event',
            as: 'registrations'
          }
        },
        {
          $addFields: {
            registrationCount: { $size: '$registrations' }
          }
        },
        { $sort: { registrationCount: -1 } },
        { $limit: 5 }
      ]);
      req.fallbackEvents = popularEvents;

     // return res.json(popularEvents);
    }
    // Merge skills into interests if interests are empty
const effectiveInterests =
  req.user.interests && req.user.interests.length > 0
    ? req.user.interests
    : req.user.skills || [];

// Prepare data for AI service
/*const recommendationData = {
  user_profile: {
    interests: effectiveInterests,
    skills: req.user.skills || [],
    department: req.user.department,
    year: req.user.year
  },
  past_events: userRegistrations.map(reg => ({
    event_id: reg.event._id.toString(),
    name: reg.event.name,
    description: reg.event.description,
    category: reg.event.category,
    tags: reg.event.tags,
    rating: reg.rating || null
  })),
  all_events: allEvents.map(event => ({
    event_id: event._id.toString(),
    name: event.name,
    description: event.description,
    category: event.category,
    tags: event.tags,
    target_audience: event.targetAudience
  }))
};*/
// Prepare data for AI service
const recommendationData = {
  user_profile: {
    interests: effectiveInterests,
    skills: req.user.skills || [],
    department: req.user.department,
    year: req.user.year
  },
  past_events: userRegistrations.map(reg => {
    // Include all fields from the event
    const eventObj = reg.event.toObject(); // converts Mongoose doc to plain object
    eventObj.event_id = reg.event._id.toString(); // ensure ID is included
    eventObj.rating = reg.rating || null; // add rating if available
    return eventObj;
  }),
  all_events: allEvents.map(event => {
    const eventObj = event.toObject(); // all fields
    eventObj.event_id = event._id.toString(); // add event_id for consistency
    return eventObj;
  })
};



    try {
      /*// Call AI service
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiResponse = await axios.post(`${aiServiceUrl}/recommend`, recommendationData, {
        timeout: 10000 // 10 second timeout
      });

      const recommendedEventIds = aiResponse.data.recommendations;*/
      // Call AI service
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
      console.log(`🔍 Calling AI Service at: ${aiServiceUrl}/recommend`);  // <-- debug log
      // console.log('📤 Sending payload:', JSON.stringify(recommendationData, null, 2)); // log request data

      const aiResponse = await axios.post(`${aiServiceUrl}/recommend`, recommendationData, {
        timeout: 30000 // 10 second timeout
      });

      // console.log('✅ AI Service response:', aiResponse.data); // <-- debug log

      const recommendedEventIds = aiResponse.data.recommendations;
      console.log("🛠 Checking fallback condition");

      if (!recommendedEventIds || recommendedEventIds.length === 0) {
        // Fallback to popular events
        const popularEvents = await Event.find({
          isActive: true,
          date: { $gt: new Date() }
        }).sort({ createdAt: -1 }).limit(5);

        return res.json(req.fallbackEvents || []);
      }

      // Get the recommended events from database
      const recommendedEvents = await Event.find({
        _id: { $in: recommendedEventIds },
        isActive: true,
        date: { $gt: new Date() }
      });

      // Sort events by the order returned by AI
      const sortedEvents = recommendedEventIds.map(id => 
        recommendedEvents.find(event => event._id.toString() === id)
      ).filter(Boolean);

      res.json(sortedEvents);

    } catch (aiError) {
      console.error('AI service error:', aiError.message);
      
      // Fallback: Content-based filtering using user interests
      const userInterestsLower = req.user.interests.map(i => i.toLowerCase());
      
      const fallbackEvents = await Event.find({
        isActive: true,
        date: { $gt: new Date() },
        $or: [
          { tags: { $in: userInterestsLower } },
          { category: { $in: req.user.interests } },
          { 
            $text: { 
              $search: userInterestsLower.join(' ') 
            } 
          }
        ]
      }).limit(5);

      if (fallbackEvents.length === 0) {
        // Ultimate fallback: recent events
        const recentEvents = await Event.find({
          isActive: true,
          date: { $gt: new Date() }
        }).sort({ createdAt: -1 }).limit(5);

        return res.json(recentEvents);
      }

      res.json(fallbackEvents);
    }

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

// Get recommendation explanation
router.get('/explain/:eventId', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Simple explanation based on matching interests and tags
    const userInterests = req.user.interests || [];
    const matchingTags = event.tags.filter(tag => 
      userInterests.some(interest => 
        interest.toLowerCase().includes(tag.toLowerCase()) || 
        tag.toLowerCase().includes(interest.toLowerCase())
      )
    );

    const explanation = {
      event_name: event.name,
      reasons: []
    };

    if (matchingTags.length > 0) {
      explanation.reasons.push(`Matches your interests: ${matchingTags.join(', ')}`);
    }

    if (event.category && userInterests.includes(event.category)) {
      explanation.reasons.push(`You're interested in ${event.category} events`);
    }

    if (req.user.department && event.targetAudience && 
        event.targetAudience.toLowerCase().includes(req.user.department.toLowerCase())) {
      explanation.reasons.push(`Targeted for ${req.user.department} students`);
    }

    if (explanation.reasons.length === 0) {
      explanation.reasons.push('Popular event among students with similar profiles');
    }

    res.json(explanation);
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ message: 'Failed to get explanation' });
  }
});

export default router;
