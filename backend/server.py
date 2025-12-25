# backend/server.py
from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
from chatbot_core import PersonalChatbot
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize the chatbot with your data file
chatbot = PersonalChatbot('personal_data.txt')

@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    bot_response = chatbot.get_response(user_message)
    
    return jsonify({'response': bot_response})

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'message': 'Backend is working!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)