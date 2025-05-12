# prediction_service.py
from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)

# Define the absolute path to the models directory
models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../models'))

# Load models
diabetes_model = joblib.load(os.path.join(models_dir, 'diabetes_model.joblib'))
heart_model = joblib.load(os.path.join(models_dir, 'heart_model.joblib'))
stroke_model = joblib.load(os.path.join(models_dir, 'stroke_model.joblib'))
symptoms_model = joblib.load(os.path.join(models_dir, 'symptoms_model.joblib'))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    
    # Prepare data for each model
    diabetes_data = pd.DataFrame([data['diabetes']])
    heart_data = pd.DataFrame([data['heart']])
    stroke_data = pd.DataFrame([data['stroke']])
    
    # Make predictions
    diabetes_risk = float(diabetes_model.predict_proba(diabetes_data)[0][1])
    heart_risk = float(heart_model.predict_proba(heart_data)[0][1])
    stroke_risk = float(stroke_model.predict_proba(stroke_data)[0][1])
    
    return jsonify({
        'diabetes': diabetes_risk,
        'heart': heart_risk,
        'stroke': stroke_risk
    })

@app.route('/predict_symptoms', methods=['POST'])
def predict_symptoms():
    data = request.json
    symptoms_list = data.get('symptoms', [])
    
    # Create a feature vector (all zeros initially)
    feature_vector = np.zeros(16)  # Assuming 16 symptoms total
    
    # Set 1 for symptoms that are present (using 0-based indexing)
    for symptom_id in symptoms_list:
        idx = int(symptom_id) - 1  # Convert from 1-indexed to 0-indexed
        if 0 <= idx < 16:  # Ensure valid index
            feature_vector[idx] = 1
    
    # Convert to DataFrame with same column names used during training
    columns = [
        'Confusion/Hallucination', 'Blurred vision', 'Shortness of breath',
        'Chest pain', 'Excessive hunger', 'Fatigue', 'Headache',
        'Increased appetite', 'Lethargy', 'Obesity', 'Frequent urination',
        'Insomnia/Restlessness', 'Sweating', 'Vomiting',
        'Weakness on one side of body', 'Weight loss'
    ]
    symptoms_df = pd.DataFrame([feature_vector], columns=columns)
    
    # Get prediction probabilities
    predictions = symptoms_model.predict_proba(symptoms_df)[0]
    
    # Create response with class probabilities
    # Order must match your model's classes_ attribute
    class_order = symptoms_model.classes_
    result = {}
    
    for i, condition in enumerate(class_order):
        condition_name = condition.strip().lower()  # Clean up condition name
        if condition_name == 'diabetes' or condition_name.startswith('diabetes'):
            result['diabetes'] = float(predictions[i])
        elif condition_name == 'heart disease' or condition_name.startswith('heart'):
            result['heart'] = float(predictions[i])
        elif condition_name == 'stroke':
            result['stroke'] = float(predictions[i])
    
    return jsonify(result)


if __name__ == '__main__':
    app.run(port=5050)