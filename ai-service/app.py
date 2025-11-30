'''import os
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import logging
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://localhost:5000'])

class EventRecommendationEngine:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95
        )
        self.scaler = StandardScaler()
        
    def preprocess_text_features(self, events):
        """Combine event text features for TF-IDF analysis"""
        text_features = []
        
        for event in events:
            # Combine name, description, category, and tags
            combined_text = f"{event.get('name', '')} {event.get('description', '')} {event.get('category', '')} "
            combined_text += " ".join(event.get('tags', []))
            combined_text += f" {event.get('target_audience', '')}"
            text_features.append(combined_text.lower())
            
        return text_features
    
    def content_based_filtering(self, user_profile, all_events, past_events):
        """Content-based recommendation using TF-IDF and cosine similarity"""
        try:
            if not all_events:
                return []
            
            # Prepare text features for all events
            event_texts = self.preprocess_text_features(all_events)
            
            # Create user profile text from interests and skills
            user_interests = user_profile.get('interests', [])
            user_skills = user_profile.get('skills', [])
            user_text = " ".join(user_interests + user_skills).lower()
            
            # Add user profile to the texts for TF-IDF calculation
            all_texts = event_texts + [user_text]
            
            # Fit TF-IDF vectorizer
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(all_texts)
            
            # Get user profile vector (last one)
            user_vector = tfidf_matrix[-1]
            
            # Calculate cosine similarity between user and events
            event_vectors = tfidf_matrix[:-1]
            similarities = cosine_similarity(user_vector, event_vectors).flatten()
            
            # Create event-similarity pairs
            event_scores = []
            for i, event in enumerate(all_events):
                score = similarities[i]
                
                # Boost score for matching categories
                if event.get('category', '').lower() in [interest.lower() for interest in user_interests]:
                    score += 0.2
                
                # Boost score for matching tags
                event_tags = [tag.lower() for tag in event.get('tags', [])]
                user_interests_lower = [interest.lower() for interest in user_interests]
                matching_tags = set(event_tags).intersection(set(user_interests_lower))
                if matching_tags:
                    score += 0.1 * len(matching_tags)
                
                event_scores.append((event['event_id'], score))
            
            # Sort by score descending
            event_scores.sort(key=lambda x: x[1], reverse=True)
            
            return event_scores
            
        except Exception as e:
            logger.error(f"Content-based filtering error: {str(e)}")
            return []
    
    def collaborative_filtering(self, user_profile, all_events, past_events):
        """Simple collaborative filtering based on event ratings and categories"""
        try:
            if not past_events:
                return []
            
            # Get categories of highly rated past events
            preferred_categories = []
            for event in past_events:
                if event.get('rating', 0) >= 4:  # High rating
                    preferred_categories.append(event.get('category', ''))
            
            if not preferred_categories:
                return []
            
            # Score events based on category preferences
            event_scores = []
            category_counts = {}
            for cat in preferred_categories:
                category_counts[cat] = category_counts.get(cat, 0) + 1
            
            for event in all_events:
                event_category = event.get('category', '')
                if event_category in category_counts:
                    # Higher score for more frequently liked categories
                    score = category_counts[event_category] / len(preferred_categories)
                    event_scores.append((event['event_id'], score))
                else:
                    event_scores.append((event['event_id'], 0.0))
            
            # Sort by score descending
            event_scores.sort(key=lambda x: x[1], reverse=True)
            
            return event_scores
            
        except Exception as e:
            logger.error(f"Collaborative filtering error: {str(e)}")
            return []
    
    def hybrid_recommendation(self, user_profile, all_events, past_events, top_k=5):
        """Combine content-based and collaborative filtering"""
        try:
            # Get scores from both methods
            content_scores = self.content_based_filtering(user_profile, all_events, past_events)
            collab_scores = self.collaborative_filtering(user_profile, all_events, past_events)
            
            # Convert to dictionaries for easy lookup
            content_dict = {event_id: score for event_id, score in content_scores}
            collab_dict = {event_id: score for event_id, score in collab_scores}
            
            # Combine scores with weights
            content_weight = 0.7
            collab_weight = 0.3
            
            final_scores = []
            all_event_ids = set([event['event_id'] for event in all_events])
            
            for event_id in all_event_ids:
                content_score = content_dict.get(event_id, 0.0)
                collab_score = collab_dict.get(event_id, 0.0)
                
                # Weighted combination
                final_score = (content_weight * content_score) + (collab_weight * collab_score)
                final_scores.append((event_id, final_score))
            
            # Sort by final score
            final_scores.sort(key=lambda x: x[1], reverse=True)
            
            # Filter out events user has already registered for
            past_event_ids = set([event['event_id'] for event in past_events])
            filtered_scores = [(event_id, score) for event_id, score in final_scores 
                             if event_id not in past_event_ids]
            
            # Return top K recommendations
            top_recommendations = [event_id for event_id, score in filtered_scores[:top_k]]
            
            logger.info(f"Generated {len(top_recommendations)} recommendations")
            return top_recommendations
            
        except Exception as e:
            logger.error(f"Hybrid recommendation error: {str(e)}")
            # Fallback: return first few events
            return [event['event_id'] for event in all_events[:top_k]]

# Initialize recommendation engine
recommendation_engine = EventRecommendationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Event Recommendation Engine',
        'version': '1.0.0'
    })

@app.route('/recommend', methods=['POST'])
def recommend_events():
    """Generate event recommendations for a user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_profile = data.get('user_profile', {})
        past_events = data.get('past_events', [])
        all_events = data.get('all_events', [])
        
        # Validate input data
        if not all_events:
            return jsonify({'recommendations': []})
        
        # Generate recommendations
        recommendations = recommendation_engine.hybrid_recommendation(
            user_profile, all_events, past_events
        )
        
        return jsonify({
            'recommendations': recommendations,
            'method': 'hybrid',
            'total_events': len(all_events),
            'past_events': len(past_events)
        })
        
    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}")
        return jsonify({'error': 'Failed to generate recommendations'}), 500

@app.route('/explain', methods=['POST'])
def explain_recommendation():
    """Explain why an event was recommended"""
    try:
        data = request.get_json()
        
        user_profile = data.get('user_profile', {})
        event = data.get('event', {})
        
        explanation = {
            'event_id': event.get('event_id'),
            'reasons': []
        }
        
        # Check interest matches
        user_interests = [interest.lower() for interest in user_profile.get('interests', [])]
        event_tags = [tag.lower() for tag in event.get('tags', [])]
        event_category = event.get('category', '').lower()
        
        # Find matching interests and tags
        matching_tags = set(user_interests).intersection(set(event_tags))
        if matching_tags:
            explanation['reasons'].append(f"Matches your interests: {', '.join(matching_tags)}")
        
        # Check category match
        if event_category in user_interests:
            explanation['reasons'].append(f"You're interested in {event.get('category')} events")
        
        # Check target audience match
        user_dept = user_profile.get('department', '').lower()
        target_audience = event.get('target_audience', '').lower()
        if user_dept and user_dept in target_audience:
            explanation['reasons'].append(f"Targeted for {user_profile.get('department')} students")
        
        if not explanation['reasons']:
            explanation['reasons'].append("Recommended based on overall profile similarity")
        
        return jsonify(explanation)
        
    except Exception as e:
        logger.error(f"Explanation error: {str(e)}")
        return jsonify({'error': 'Failed to generate explanation'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting AI Recommendation Service on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
    #------------------------------------------------------------------------------------------------------'''

'''import os
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import logging
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://localhost:5000'])

class EventRecommendationEngine:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95
        )
        self.scaler = StandardScaler()
        
    def preprocess_text_features(self, events):
        """Combine event text features for TF-IDF analysis"""
        text_features = []
        for event in events:
            combined_text = f"{event.get('name', '')} {event.get('description', '')} {event.get('category', '')} "
            combined_text += " ".join(event.get('tags', []))
            combined_text += f" {event.get('target_audience', '')}"
            text_features.append(combined_text.lower())
        return text_features

    def content_based_filtering(self, user_profile, all_events, past_events, min_similarity=0.2):
        """Content-based recommendation using TF-IDF and relevance filtering"""
        try:
            if not all_events:
                return []

            event_texts = self.preprocess_text_features(all_events)
            user_interests = user_profile.get('interests', [])
            user_skills = user_profile.get('skills', [])
            user_text = " ".join(user_interests + user_skills).lower()
            all_texts = event_texts + [user_text]

            tfidf_matrix = self.tfidf_vectorizer.fit_transform(all_texts)
            user_vector = tfidf_matrix[-1]
            event_vectors = tfidf_matrix[:-1]

            similarities = cosine_similarity(user_vector, event_vectors).flatten()
            event_scores = []

            for i, event in enumerate(all_events):
                score = similarities[i]

                # Boost for matching categories
                if event.get('category', '').lower() in [interest.lower() for interest in user_interests]:
                    score += 0.2

                # Boost for matching tags
                event_tags = [tag.lower() for tag in event.get('tags', [])]
                matching_tags = set(event_tags).intersection([interest.lower() for interest in user_interests + user_skills])
                if matching_tags:
                    score += 0.1 * len(matching_tags)

                # Include only relevant events
                if score >= min_similarity or matching_tags or (event.get('category', '').lower() in [i.lower() for i in user_interests]):
                    event_scores.append((event['event_id'], score))

            event_scores.sort(key=lambda x: x[1], reverse=True)
            return event_scores

        except Exception as e:
            logger.error(f"Content-based filtering error: {str(e)}")
            return []

    def collaborative_filtering(self, user_profile, all_events, past_events):
        """Collaborative filtering based on past events"""
        try:
            if not past_events:
                return []

            preferred_categories = [event.get('category', '') for event in past_events if event.get('rating', 0) >= 4]
            if not preferred_categories:
                return []

            category_counts = {}
            for cat in preferred_categories:
                category_counts[cat] = category_counts.get(cat, 0) + 1

            event_scores = []
            for event in all_events:
                event_category = event.get('category', '')
                if event_category in category_counts:
                    score = category_counts[event_category] / len(preferred_categories)
                    event_scores.append((event['event_id'], score))
                else:
                    event_scores.append((event['event_id'], 0.0))

            event_scores.sort(key=lambda x: x[1], reverse=True)
            return event_scores

        except Exception as e:
            logger.error(f"Collaborative filtering error: {str(e)}")
            return []

    def hybrid_recommendation(self, user_profile, all_events, past_events, top_k=5):
        """Combine content-based and collaborative filtering with relevance check"""
        try:
            content_scores = self.content_based_filtering(user_profile, all_events, past_events)

            if not past_events:
                # Only use content-based if no past events
                top_recommendations = [event_id for event_id, score in content_scores[:top_k]]
                logger.info(f"Generated {len(top_recommendations)} recommendations (content-only)")
                return top_recommendations

            collab_scores = self.collaborative_filtering(user_profile, all_events, past_events)
            content_dict = {event_id: score for event_id, score in content_scores}
            collab_dict = {event_id: score for event_id, score in collab_scores}

            content_weight = 0.7
            collab_weight = 0.3
            final_scores = []

            for event_id in content_dict:
                final_score = (content_weight * content_dict.get(event_id, 0)) + (collab_weight * collab_dict.get(event_id, 0))
                final_scores.append((event_id, final_score))

            final_scores.sort(key=lambda x: x[1], reverse=True)

            past_event_ids = set([event['event_id'] for event in past_events])
            filtered_scores = [(event_id, score) for event_id, score in final_scores if event_id not in past_event_ids]

            top_recommendations = [event_id for event_id, score in filtered_scores[:top_k]]
            logger.info(f"Generated {len(top_recommendations)} recommendations (hybrid)")
            return top_recommendations

        except Exception as e:
            logger.error(f"Hybrid recommendation error: {str(e)}")
            # Fallback: only relevant events from content
            return [event_id for event_id, score in content_scores[:top_k]]

# Initialize recommendation engine
recommendation_engine = EventRecommendationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'AI Event Recommendation Engine',
        'version': '1.0.0'
    })

@app.route('/recommend', methods=['POST'])
def recommend_events():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        user_profile = data.get('user_profile', {})
        past_events = data.get('past_events', [])
        all_events = data.get('all_events', [])

        if not all_events:
            return jsonify({'recommendations': []})

        recommendations = recommendation_engine.hybrid_recommendation(user_profile, all_events, past_events)

        return jsonify({
            'recommendations': recommendations,
            'method': 'hybrid',
            'total_events': len(all_events),
            'past_events': len(past_events)
        })

    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}")
        return jsonify({'error': 'Failed to generate recommendations'}), 500

@app.route('/explain', methods=['POST'])
def explain_recommendation():
    try:
        data = request.get_json()
        user_profile = data.get('user_profile', {})
        event = data.get('event', {})

        explanation = {'event_id': event.get('event_id'), 'reasons': []}
        user_interests = [i.lower() for i in user_profile.get('interests', [])]
        event_tags = [tag.lower() for tag in event.get('tags', [])]
        event_category = event.get('category', '').lower()

        matching_tags = set(user_interests).intersection(set(event_tags))
        if matching_tags:
            explanation['reasons'].append(f"Matches your interests: {', '.join(matching_tags)}")
        if event_category in user_interests:
            explanation['reasons'].append(f"You're interested in {event.get('category')} events")
        user_dept = user_profile.get('department', '').lower()
        target_audience = event.get('target_audience', '').lower()
        if user_dept and user_dept in target_audience:
            explanation['reasons'].append(f"Targeted for {user_profile.get('department')} students")
        if not explanation['reasons']:
            explanation['reasons'].append("Recommended based on overall profile similarity")

        return jsonify(explanation)

    except Exception as e:
        logger.error(f"Explanation error: {str(e)}")
        return jsonify({'error': 'Failed to generate explanation'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_ENV') == 'development'

    logger.info(f"Starting AI Recommendation Service on port {port}")
    logger.info(f"Debug mode: {debug}")

    app.run(host='0.0.0.0', port=port, debug=debug)'''
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
from datetime import datetime

app = Flask(__name__)

# Load model once
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route("/recommend", methods=["POST"])
def recommend_events():
    try:
        data = request.json
        print("hello")
        user_profile = data.get("user_profile", {})
        keywords = (user_profile.get("interests", []) +
                    user_profile.get("skills", []))
        all_events = data.get("all_events", [])
        relevant_event_ids = []

        if not all_events or not keywords:
            return jsonify({"recommendations": []})

        # Combine user keywords
        user_text = " ".join(keywords)
        user_embedding = model.encode(user_text, convert_to_tensor=True)

        for event in all_events:
            if not event.get("isActive", False):
                continue

            # Skip past events
            event_date_str = event.get("date")
            try:
                if event_date_str:
                    event_date = datetime.fromisoformat(event_date_str.replace("Z", "+00:00"))
                    if event_date < datetime.now():
                        continue
            except Exception:
                pass

            # Combine all important fields
            event_text = " ".join([
                str(event.get("name", "")),
                str(event.get("description", "")),
                str(event.get("category", "")),
                str(event.get("location", "")),
                str(event.get("targetAudience", "")),
                " ".join(event.get("tags", [])),
                str(event.get("createdBy", "")),
                str(event.get("maxAttendees", "")),
            ])

            # Compute similarity
            event_embedding = model.encode(event_text, convert_to_tensor=True)
            similarity = util.cos_sim(user_embedding, event_embedding).item()

            if similarity >= 0.2:  # threshold can be adjusted
                relevant_event_ids.append(event.get("event_id"))

        # Sort by date of the events (optional)
        relevant_event_ids.sort(key=lambda eid: next(
            (e.get("date", "9999-12-31T00:00:00") for e in all_events if e.get("event_id") == eid),
            "9999-12-31T00:00:00"
        ))

        # Return only IDs
        return jsonify({"recommendations": relevant_event_ids})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
    #app.run(debug=True, port=8000)
