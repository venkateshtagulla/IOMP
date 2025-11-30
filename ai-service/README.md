# AI Event Recommendation Service

A Python Flask microservice that provides AI-powered event recommendations using content-based filtering, collaborative filtering, and hybrid approaches.

## Features

- **Content-Based Filtering**: Uses TF-IDF vectorization to match events with user interests
- **Collaborative Filtering**: Analyzes past event ratings and preferences
- **Hybrid Approach**: Combines both methods for optimal recommendations
- **RESTful API**: Easy integration with the main application
- **Scalable Architecture**: Can be deployed independently

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Service

```bash
python app.py
```

The service will run on `http://localhost:8000`

## API Endpoints

### POST /recommend
Generate event recommendations for a user.

**Request Body:**
```json
{
  "user_profile": {
    "interests": ["AI", "Programming"],
    "skills": ["Python", "Machine Learning"],
    "department": "Computer Science",
    "year": 3
  },
  "past_events": [
    {
      "event_id": "event123",
      "name": "ML Workshop",
      "category": "Technology",
      "rating": 5
    }
  ],
  "all_events": [
    {
      "event_id": "event456",
      "name": "React Masterclass",
      "description": "Learn React.js",
      "category": "Technology",
      "tags": ["react", "javascript"]
    }
  ]
}
```

**Response:**
```json
{
  "recommendations": ["event456", "event789"],
  "method": "hybrid",
  "total_events": 10,
  "past_events": 1
}
```

### POST /explain
Get explanation for why an event was recommended.

### GET /health
Health check endpoint.

## Algorithm Details

### Content-Based Filtering
- Uses TF-IDF vectorization on event descriptions, names, categories, and tags
- Calculates cosine similarity between user interests and events
- Boosts scores for category matches and tag overlaps

### Collaborative Filtering
- Analyzes user's past event ratings
- Identifies preferred event categories
- Recommends events in similar categories

### Hybrid Approach
- Combines content-based (70%) and collaborative (30%) scores
- Filters out already attended events
- Returns top-K recommendations

## Environment Variables

- `PORT`: Service port (default: 8000)
- `FLASK_ENV`: Set to 'development' for debug mode

## Error Handling

The service includes comprehensive error handling and logging for production use.