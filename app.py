from flask import Flask, request, jsonify, send_from_directory
import os
from zxcvbn import zxcvbn

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return "File not found", 404

@app.route('/api/password_strength', methods=['POST'])
def password_strength():
    data = request.get_json()
    password = data.get('password', '')
    result = zxcvbn(password)
    score = result['score']  # 0-4
    feedback = result['feedback']
    
    strength_levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    strength = strength_levels[score]
    
    suggestions = feedback.get('suggestions', [])
    warning = feedback.get('warning', '')
    
    return jsonify({
        'strength': strength,
        'score': score,
        'suggestions': suggestions,
        'warning': warning
    })

if __name__ == '__main__':
    app.run(debug=True)
