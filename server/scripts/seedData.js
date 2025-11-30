import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-event-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connection successful!');
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err);
});

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    year: 3,
    interests: ['Programming', 'AI', 'Web Development', 'Machine Learning'],
    skills: ['JavaScript', 'Python', 'React', 'Data Analysis']
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'student',
    department: 'Information Technology',
    year: 2,
    interests: ['Cybersecurity', 'Networking', 'Cloud Computing', 'DevOps'],
    skills: ['Linux', 'AWS', 'Docker', 'Security Analysis']
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    role: 'student',
    department: 'Business Administration',
    year: 4,
    interests: ['Entrepreneurship', 'Marketing', 'Finance', 'Leadership'],
    skills: ['Project Management', 'Public Speaking', 'Data Analysis', 'Strategic Planning']
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'student',
    department: 'Arts',
    year: 1,
    interests: ['Design', 'Photography', 'Digital Art', 'Creative Writing'],
    skills: ['Photoshop', 'Illustrator', 'UI/UX Design', 'Creative Thinking']
  }
];

const seedEvents = [
  {
    name: 'Introduction to Machine Learning',
    description: 'A comprehensive workshop covering the fundamentals of machine learning, including supervised and unsupervised learning algorithms, practical applications, and hands-on coding sessions with Python and scikit-learn.',
    category: 'Technology',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    location: 'Computer Lab A - Building 3',
    targetAudience: 'Computer Science and IT Students',
    tags: ['machine learning', 'python', 'ai', 'data science', 'programming'],
    maxAttendees: 50
  },
  {
    name: 'React.js Masterclass',
    description: 'Deep dive into React.js development with modern hooks, context API, performance optimization, and best practices. Build a complete web application from scratch.',
    category: 'Technology',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    location: 'Tech Auditorium - Building 1',
    targetAudience: 'Web Development Enthusiasts',
    tags: ['react', 'javascript', 'web development', 'frontend', 'programming'],
    maxAttendees: 75
  },
  {
    name: 'Cybersecurity Fundamentals',
    description: 'Learn essential cybersecurity concepts including threat analysis, network security, ethical hacking basics, and industry best practices for protecting digital assets.',
    category: 'Technology',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    location: 'Security Lab - Building 2',
    targetAudience: 'IT and Cybersecurity Students',
    tags: ['cybersecurity', 'networking', 'ethical hacking', 'security', 'it'],
    maxAttendees: 40
  },
  {
    name: 'Entrepreneurship Bootcamp',
    description: 'A hands-on workshop for aspiring entrepreneurs covering business model development, market research, funding strategies, and pitch presentation skills.',
    category: 'Business',
    date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    location: 'Business Center - Hall B',
    targetAudience: 'Business and Management Students',
    tags: ['entrepreneurship', 'business', 'startup', 'marketing', 'leadership'],
    maxAttendees: 60
  },
  {
    name: 'Digital Marketing Strategies',
    description: 'Explore modern digital marketing techniques including SEO, social media marketing, content strategy, analytics, and conversion optimization.',
    category: 'Business',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    location: 'Marketing Lab - Building 4',
    targetAudience: 'Business and Marketing Students',
    tags: ['digital marketing', 'seo', 'social media', 'analytics', 'business'],
    maxAttendees: 45
  },
  {
    name: 'UI/UX Design Workshop',
    description: 'Learn user interface and user experience design principles, prototyping tools like Figma, user research methods, and design thinking processes.',
    category: 'Arts',
    date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    location: 'Design Studio - Arts Building',
    targetAudience: 'Design and Arts Students',
    tags: ['ui design', 'ux design', 'design thinking', 'prototyping', 'figma'],
    maxAttendees: 35
  },
  {
    name: 'Data Science with Python',
    description: 'Comprehensive introduction to data science using Python, covering pandas, numpy, matplotlib, data visualization, and statistical analysis techniques.',
    category: 'Science',
    date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    location: 'Data Lab - Science Building',
    targetAudience: 'Science and Engineering Students',
    tags: ['data science', 'python', 'statistics', 'data analysis', 'visualization'],
    maxAttendees: 55
  },
  {
    name: 'Cloud Computing with AWS',
    description: 'Introduction to Amazon Web Services, cloud architecture, serverless computing, database management, and deployment strategies for scalable applications.',
    category: 'Technology',
    date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
    location: 'Cloud Lab - IT Building',
    targetAudience: 'IT and Computer Science Students',
    tags: ['aws', 'cloud computing', 'devops', 'serverless', 'deployment'],
    maxAttendees: 50
  },
  {
    name: 'Photography Masterclass',
    description: 'Advanced photography techniques covering composition, lighting, post-processing, portrait photography, and building a professional portfolio.',
    category: 'Arts',
    date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    location: 'Photography Studio - Arts Building',
    targetAudience: 'Arts and Media Students',
    tags: ['photography', 'composition', 'lighting', 'portfolio', 'arts'],
    maxAttendees: 25
  },
  {
    name: 'Public Speaking & Leadership',
    description: 'Develop confident public speaking skills, leadership techniques, presentation design, and effective communication strategies for professional success.',
    category: 'Workshop',
    date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    location: 'Main Auditorium - Central Building',
    targetAudience: 'All Students',
    tags: ['public speaking', 'leadership', 'communication', 'presentation', 'professional development'],
    maxAttendees: 100
  }
];

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create(seedUsers);
    console.log('👥 Created users:', users.length);

    // Find admin user for creating events
    const adminUser = users.find(user => user.role === 'admin');
    
    // Create events
    const eventsWithAdmin = seedEvents.map(event => ({
      ...event,
      createdBy: adminUser._id
    }));

    const events = await Event.create(eventsWithAdmin);
    console.log('📅 Created events:', events.length);

    // Create some sample registrations
    const studentUsers = users.filter(user => user.role === 'student');
    const registrations = [];

    // Register students for random events
    for (const student of studentUsers) {
      const numRegistrations = Math.floor(Math.random() * 4) + 1; // 1-4 registrations per student
      const selectedEvents = events
        .sort(() => Math.random() - 0.5)
        .slice(0, numRegistrations);

      for (const event of selectedEvents) {
        registrations.push({
          user: student._id,
          event: event._id,
          registrationDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date in last 30 days
          attended: Math.random() > 0.3, // 70% attendance rate
          rating: Math.random() > 0.5 ? Math.floor(Math.random() * 2) + 4 : undefined // Some ratings 4-5 stars
        });
      }
    }

    await Registration.create(registrations);
    console.log('📝 Created registrations:', registrations.length);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length} (1 admin, ${studentUsers.length} students)`);
    console.log(`📅 Events: ${events.length}`);
    console.log(`📝 Registrations: ${registrations.length}`);
    
    console.log('\n🔐 Login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Student: john@example.com / password123');
    console.log('Student: jane@example.com / password123');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();