
## 🏗️ Architecture

```
├── client/          # React.js frontend
├── server/          # Node.js + Express backend
├── ai-service/      # Python Flask AI microservice
└── README.md
```

### Technology Stack
- **Frontend**: React.js, TypeScript, Tailwind CSS, React Query
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **AI Service**: Python, Flask, scikit-learn, pandas
- **Authentication**: JWT with secure password hashing
- **Email**: Nodemailer with SMTP support
- **Security**: Helmet.js, CORS, rate limiting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB 4.4+

### 1. Clone and Setup
```bash
git clone <repository-url>
cd ai-event-recommendation-system
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```

### 3. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure your MongoDB URI and other settings in .env
npm run dev
```

### 4. AI Service Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 5. Seed Sample Data
```bash
cd server
npm run seed
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
MONGODB_URI=mongodb://localhost:27017/ai-event-system
JWT_SECRET=your-super-secret-jwt-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

#### AI Service
```bash
PORT=8000
FLASK_ENV=development
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Event Endpoints
- `GET /api/events` - Get all events (with filtering)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Recommendation Endpoints
- `GET /api/recommendations` - Get AI recommendations
- `POST /ai-service/recommend` - Generate recommendations
- `POST /ai-service/explain` - Explain recommendation

### Registration Endpoints
- `POST /api/registrations` - Register for event
- `GET /api/registrations/user` - Get user registrations
- `POST /api/registrations/rate` - Rate an event

## 🤖 AI Recommendation Algorithm

### Content-Based Filtering
1. **Text Analysis**: Uses all-MiniLM-L6-v2 on event descriptions, names, and tags
2. **User Profiling**: Creates vectors from user interests and skills
3. **Similarity Calculation**: Computes cosine similarity between user and events
4. **Score Boosting**: Enhances scores for category matches and tag overlaps

### Collaborative Filtering
1. **Rating Analysis**: Examines user's past event ratings
2. **Preference Extraction**: Identifies preferred event categories
3. **Similar User Detection**: Finds users with similar preferences
4. **Recommendation Generation**: Suggests events liked by similar users

### Hybrid Approach
- **Weight Distribution**: 70% content-based, 30% collaborative
- **Score Combination**: Weighted sum of individual method scores
- **Filtering**: Removes already attended events
- **Ranking**: Returns top-K recommendations

## 📱 User Roles & Permissions

### Students
- Register and manage profile
- Browse and search events
- Register for events
- Receive AI recommendations
- Rate and review attended events

### Admins
- All student permissions
- Create, edit, and delete events
- View registration analytics
- Manage user accounts
- Access admin dashboard

## 🎯 Sample Data

The system includes comprehensive seed data:
- **Users**: 5 sample users (1 admin, 4 students)
- **Events**: 10 diverse events across categories
- **Registrations**: Sample registration data with ratings

### Login Credentials
- **Admin**: admin@example.com / admin123
- **Student**: john@example.com / password123

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured cross-origin policies
- **Security Headers**: Helmet.js security middleware

## 📧 Email Integration

- **Registration Confirmation**: Automated emails upon event registration
- **Event Reminders**: Optional reminder emails before events
- **HTML Templates**: Rich, responsive email templates
- **SMTP Support**: Gmail, Outlook, and custom SMTP servers

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
# Configure production environment variables
# Deploy server/ folder
```

### AI Service (Docker)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### AI Service Testing
```bash
cd ai-service
python -m pytest tests/
```

## 📈 Performance Optimizations

- **Database Indexing**: Optimized MongoDB indexes for search
- **Query Optimization**: Efficient database queries with pagination
- **Caching**: React Query for frontend caching
- **Image Optimization**: Responsive images with lazy loading
- **Code Splitting**: Dynamic imports for reduced bundle size

## 🔮 Future Enhancements

- **Real-time Notifications**: WebSocket integration
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Event attendance analytics dashboard
- **Social Features**: Event sharing and social interactions
- **ML Improvements**: Deep learning recommendation models
- **Multi-language**: Internationalization support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@example.com
- Documentation: [Wiki](wiki-link)

---

Built with ❤️ using modern web technologies and AI/ML algorithms.