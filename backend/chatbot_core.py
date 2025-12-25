# backend/chatbot_core.py
import nltk
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import random

# Download required NLTK data (run once)
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize

class PersonalChatbot:
    def __init__(self, data_file_path):
        self.stop_words = set(stopwords.words('english'))
        self.data_text = self.load_data(data_file_path)
        # Split data into sentences for matching
        self.sentences = sent_tokenize(self.data_text)
        # Add the full text as a potential response for general questions
        self.sentences.append(self.data_text)
        
        # Initialize TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(
            lowercase=True, 
            stop_words='english',
            ngram_range=(1, 2) # Consider single words and phrases up to 2 words
        )
        # Fit the vectorizer on all sentences
        self.tfidf_matrix = self.vectorizer.fit_transform(self.sentences)

    def load_data(self, file_path):
        """Load your personal data from a text file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except FileNotFoundError:
            print(f"Error: Could not find {file_path}")
            return "Data not available."

    def preprocess(self, text):
        """Simple preprocessing: lowercase, remove punctuation."""
        # Remove punctuation and convert to lowercase
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        return text

    def get_response(self, user_input):
        """Generate a response based on cosine similarity."""
        if not user_input.strip():
            return "Please ask me a question about John Doe's skills, experience, or projects!"

        preprocessed_input = self.preprocess(user_input)
        
        # Transform the input using the same vectorizer
        input_vector = self.vectorizer.transform([preprocessed_input])
        
        # Calculate cosine similarities between input and all sentences
        similarities = cosine_similarity(input_vector, self.tfidf_matrix).flatten()
        
        # Find the index of the most similar sentence
        best_match_idx = np.argmax(similarities)
        best_similarity = similarities[best_match_idx]

        # Set a threshold for similarity
        if best_similarity > 0.05: # Adjust threshold as needed
            response = self.sentences[best_match_idx].strip()
            # Limit response length to avoid returning the entire text
            if len(response) > 500:
                # Return a more specific part based on keywords found
                keywords = preprocessed_input.split()
                best_sentence = ""
                best_keyword_match = 0
                for sentence in self.sentences[:-1]: # Exclude the full text
                    sentence_lower = sentence.lower()
                    keyword_matches = sum(1 for keyword in keywords if keyword in sentence_lower)
                    if keyword_matches > best_keyword_match:
                        best_sentence = sentence
                        best_keyword_match = keyword_matches
                if best_sentence:
                    return best_sentence
            return response
        else:
            # Fallback response if no good match is found
            fallback_responses = [
                "I'm sorry, I don't have specific information about that in my knowledge base.",
                "Could you rephrase your question?",
                "I can tell you about my skills, experience, projects, or contact details. What would you like to know?",
                "That's an interesting question, but I don't have enough information to answer it fully."
            ]
            return random.choice(fallback_responses)

# Example usage (for testing):
# bot = PersonalChatbot('personal_data.txt')
# print(bot.get_response("What are your skills?"))