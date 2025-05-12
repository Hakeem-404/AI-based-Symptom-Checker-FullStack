// controllers/symptomsController.js
import db from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Get directory name for current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the symptom-condition mapping and feature importance data
const symptomsMapping = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../symptoms/symptomsMapping.json'), 'utf8')
);
const DiabetesFeatureImportance = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../symptoms/diabetes_model_feature_importance.json'), 'utf8')
);
const HeartFeatureImportance = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../symptoms/heart_model_feature_importance.json'), 'utf8')
);
const StrokeFeatureImportance = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../symptoms/stroke_model_feature_importance.json'), 'utf8')
);


// Triage levels
const TRIAGE_LEVELS = {
    EMERGENCY: 'Emergency',
    URGENT: 'Urgent',
    ROUTINE: 'Routine',
    SELF_CARE: 'Self-care'
};

// Define risk factors for each condition
const RISK_FACTORS = {
    diabetes: [
        { factor: 'High Blood Glucose', description: 'Consistently elevated blood sugar levels' },
        { factor: 'Elevated BMI', description: 'Body mass index above 25' },
        { factor: 'Previous Pregnancies', description: 'Number of times pregnant (for women)' },
        { factor: 'Family History', description: 'First-degree relatives with diabetes' },
        { factor: 'Age', description: 'Risk increases with age, especially after 45' },
        { factor: 'Sedentary Lifestyle', description: 'Low physical activity levels' }
    ],
    heart: [
        { factor: 'High Cholesterol', description: 'Total cholesterol levels above 200 mg/dL' },
        { factor: 'Age', description: 'Risk increases with age, men ≥45, women ≥55' },
        { factor: 'Gender', description: 'Men generally at higher risk than women' },
        { factor: 'Chest Pain Type', description: 'Typical angina is more concerning than other types' },
        { factor: 'Low Max Heart Rate', description: 'Maximum heart rate below expected values for age' },
        { factor: 'Hypertension', description: 'Consistently elevated blood pressure' }
    ],
    stroke: [
        { factor: 'Age', description: 'Risk increases significantly with age' },
        { factor: 'Hypertension', description: 'High blood pressure is a primary risk factor' },
        { factor: 'Smoking', description: 'Current or previous smoking history' },
        { factor: 'Diabetes', description: 'Presence of diabetes increases stroke risk' },
        { factor: 'Gender', description: 'Different risk profiles for men and women' },
        { factor: 'High Glucose', description: 'Elevated blood sugar levels' }
    ]
};

export const analyseSymptoms = async (req, res) => {
    const { userId, symptoms } = req.body;
    
    if (!userId || !symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    try {
        // Get user health metrics and medical info
        const [userMetrics] = await db.execute(
            'SELECT * FROM health_metrics WHERE user_id = ?',
            [userId]
        );
        
        const [userMedical] = await db.execute(
            'SELECT * FROM medical_information WHERE user_id = ?',
            [userId]
        );
        
        const [userProfile] = await db.execute(
            'SELECT gender, age FROM users WHERE id = ?',
            [userId]
        );
        
        const [userLifestyle] = await db.execute(
            'SELECT * FROM lifestyle_factors WHERE user_id = ?',
            [userId]
        );

        if (userMetrics.length === 0 || userProfile.length === 0) {
            return res.status(404).json({ 
                error: 'Cannot analyse symptoms without user health data',
                missingData: true
            });
        }

        // Calculate condition scores based on symptoms
        const conditionScores = await getSymptomPrediction(symptoms);
        
        // Prepare user data for model predictions
        const userData = {
            metrics: userMetrics[0],
            medical: userMedical.length > 0 ? userMedical[0] : null,
            profile: userProfile[0],
            lifestyle: userLifestyle.length > 0 ? userLifestyle[0] : null
        };
        
        // Get risk predictions from ML models
        const predictions = await getPredictions(userData);
        
        // Combine symptom analysis with ML predictions
        const combinedResults = combineResults(conditionScores, predictions);
        
        // Generate individual triage assessments for each condition
        const diabetesTriage = generateConditionTriage('diabetes', combinedResults.diabetes, symptoms, userData);
        const heartTriage = generateConditionTriage('heart', combinedResults.heart, symptoms, userData);
        const strokeTriage = generateConditionTriage('stroke', combinedResults.stroke, symptoms, userData);
        
        // Determine overall triage (highest urgency)
        const overallTriage = getHighestTriage(diabetesTriage, heartTriage, strokeTriage);
        
        // Get feature importance data
        const featureImportance = getFeatureImportance(userData, symptoms, combinedResults);
        
        // Get contributing risk factors
        const riskFactors = getContributingRiskFactors(userData, combinedResults);
        
        // Construct the complete response
        const analysisResult = {
            conditionRisks: combinedResults,
            triage: {
                overall: overallTriage,
                diabetes: diabetesTriage,
                heart: heartTriage,
                stroke: strokeTriage
            },
            riskFactors: riskFactors,
            featureImportance: featureImportance,
            recommendations: {
                general: generateGeneralRecommendations(overallTriage),
                diabetes: generateDiabetesRecommendations(combinedResults.diabetes, userData),
                heart: generateHeartRecommendations(combinedResults.heart, userData),
                stroke: generateStrokeRecommendations(combinedResults.stroke, userData)
            }
        };
        
        // Save the analysis results
        await saveAnalysisResults(userId, symptoms, analysisResult);
        
        res.status(200).json(analysisResult);
        
    } catch (error) {
        console.error('Error analysing symptoms:', error);
        res.status(500).json({ error: 'Failed to analyse symptoms' });
    }
};

// Calculate condition scores based on symptoms
async function getSymptomPrediction(symptoms) {
    try {
        // Call the ML model API endpoint
        const response = await axios.post('http://localhost:5050/predict_symptoms', {
            symptoms: symptoms
        });
        
        // Return the probabilities directly from the model
        return {
            diabetes: parseFloat(response.data.diabetes) || 0,
            heart: parseFloat(response.data.heart) || 0, 
            stroke: parseFloat(response.data.stroke) || 0
        };
    } catch (error) {
        console.error('Error calling symptom prediction service:', error);
        // Fallback to safe default values
        return {
            diabetes: 0.1,
            heart: 0.1,
            stroke: 0.1
        };
    }
}

// Get predictions from ML models
async function getPredictions(userData) {
    try {
        // Format data for each model
        const diabetesData = {
            Pregnancies: userData.medical?.pregnancy || 0,
            Glucose: userData.metrics.glucose || 0,
            BloodPressure: userData.metrics.blood_pressure?.split('/')[0] || 0,
            SkinThickness: userData.metrics.skin_thickness || 0,
            BMI: userData.metrics.bmi || 0,
            Age: userData.profile.age || 0
        };
        
        const heartData = {
            Age: userData.profile.age || 0,
            Gender: userData.profile.gender || '',
            ChestPainType: userData.medical?.chest_pain_type || 'asymptomatic',
            Cholesterol: userData.metrics.cholesterol || 0,
            MaxHR: userData.metrics.max_heart_rate || 0
        };
        
        const strokeData = {
            Gender: userData.profile.gender || '',
            Age: userData.profile.age || 0,
            Hypertension: userData.medical?.hypertension ? 1 : 0,
            GlucoseLevel: userData.metrics.glucose || 0,
            BMI: userData.metrics.bmi || 0,
            SmokingStatus: userData.lifestyle?.smoking ? 'smokes' : 'never smoked'
        };
        
        try {
            // Call Python prediction service
            const response = await axios.post('http://localhost:5050/predict', {
                diabetes: diabetesData,
                heart: heartData,
                stroke: strokeData
            });
            
            return response.data;
        } catch (error) {
            console.error('Error calling prediction service, using simulated predictions:', error);
           
        }
        
    } catch (error) {
        console.error('Error in model prediction:', error);
        // Return default values if prediction fails
        return {
            diabetes: 0.1,
            heart: 0.1,
            stroke: 0.1
        };
    }
}

// Combine symptom scores with ML predictions
function combineResults(symptomScores, predictions) {
    // Weights for combining scores
    const SYMPTOM_WEIGHT = 0.6;
    const PREDICTION_WEIGHT = 0.4;
    
    return {
        diabetes: {
            risk: (symptomScores.diabetes * SYMPTOM_WEIGHT + predictions.diabetes * PREDICTION_WEIGHT).toFixed(2),
            level: getRiskLevel(symptomScores.diabetes * SYMPTOM_WEIGHT + predictions.diabetes * PREDICTION_WEIGHT),
            symptomScore: symptomScores.diabetes.toFixed(2),
            predictionScore: predictions.diabetes.toFixed(2)
        },
        heart: {
            risk: (symptomScores.heart * SYMPTOM_WEIGHT + predictions.heart * PREDICTION_WEIGHT).toFixed(2),
            level: getRiskLevel(symptomScores.heart * SYMPTOM_WEIGHT + predictions.heart * PREDICTION_WEIGHT),
            symptomScore: symptomScores.heart.toFixed(2),
            predictionScore: predictions.heart.toFixed(2)
        },
        stroke: {
            risk: (symptomScores.stroke * SYMPTOM_WEIGHT + predictions.stroke * PREDICTION_WEIGHT).toFixed(2),
            level: getRiskLevel(symptomScores.stroke * SYMPTOM_WEIGHT + predictions.stroke * PREDICTION_WEIGHT),
            symptomScore: symptomScores.stroke.toFixed(2),
            predictionScore: predictions.stroke.toFixed(2)
        }
    };
}

// Get risk level category based on score
function getRiskLevel(score) {
    if (score < 0.2) return 'Low';
    if (score < 0.5) return 'Moderate';
    if (score < 0.75) return 'High';
    return 'Very High';
}

// Generate condition-specific triage
function generateConditionTriage(condition, riskData, symptoms, userData) {
    let triageLevel = TRIAGE_LEVELS.SELF_CARE;
    
    // Emergency symptoms specific to each condition
    const emergencySymptoms = {
        diabetes: [1], 
        heart: [3, 4],     
        stroke: [1, 15]    
    };
    
    // Check for condition-specific emergency symptoms
    const hasEmergencySymptom = symptoms.some(id => emergencySymptoms[condition].includes(Number(id)));
    
    if (hasEmergencySymptom) {
        triageLevel = TRIAGE_LEVELS.EMERGENCY;
    } else {
        // Triage based on risk level
        const risk = parseFloat(riskData.risk);
        
        if (risk >= 0.75) {
            triageLevel = TRIAGE_LEVELS.URGENT;
        } else if (risk >= 0.5) {
            triageLevel = TRIAGE_LEVELS.ROUTINE;
        }
    }
    
    return {
        level: triageLevel,
        urgency: getUrgencyFromTriage(triageLevel)
    };
}

// Get highest triage level from all conditions
function getHighestTriage(diabetesTriage, heartTriage, strokeTriage) {
    const triagePriority = {
        [TRIAGE_LEVELS.EMERGENCY]: 3,
        [TRIAGE_LEVELS.URGENT]: 2,
        [TRIAGE_LEVELS.ROUTINE]: 1,
        [TRIAGE_LEVELS.SELF_CARE]: 0
    };
    
    let highestTriage = diabetesTriage;
    
    if (triagePriority[heartTriage.level] > triagePriority[highestTriage.level]) {
        highestTriage = heartTriage;
    }
    
    if (triagePriority[strokeTriage.level] > triagePriority[highestTriage.level]) {
        highestTriage = strokeTriage;
    }
    
    return highestTriage;
}

// Get urgency description from triage level
function getUrgencyFromTriage(triageLevel) {
    switch (triageLevel) {
        case TRIAGE_LEVELS.EMERGENCY:
            return 'Seek immediate medical attention';
        case TRIAGE_LEVELS.URGENT:
            return 'Consult a healthcare provider within 24 hours';
        case TRIAGE_LEVELS.ROUTINE:
            return 'Schedule a routine appointment with your doctor';
        case TRIAGE_LEVELS.SELF_CARE:
            return 'Monitor symptoms and practice self-care';
        default:
            return 'Follow up with healthcare provider as needed';
    }
}

// Get feature importance data
function getFeatureImportance(userData, symptoms, riskResults) {
    // Calculate relative importance of each feature for visualization
    const diabetesFeatures = [
        { feature: 'Glucose Level', importance: normalizeValue(userData.metrics.glucose, 70, 200) * DiabetesFeatureImportance.Glucose},
        { feature: 'BMI', importance: normalizeValue(userData.metrics.bmi, 18, 35) * DiabetesFeatureImportance.BMI},
        { feature: 'Age', importance: normalizeValue(userData.profile.age, 20, 80) * DiabetesFeatureImportance.Age},
        { feature: 'Blood Pressure', importance: normalizeValue(parseBloodPressure(userData.metrics.blood_pressure), 80, 160) * DiabetesFeatureImportance.BloodPressure},
        { feature: 'Pregnancy History', importance: normalizeValue(userData.medical?.pregnancy || 0, 0, 5) * DiabetesFeatureImportance.Pregnancies},
        { feature: 'Skin Thickness', importance: normalizeValue(userData.metrics.skin_thickness, 10, 40) * DiabetesFeatureImportance.SkinThickness}
    ];
    
    const heartFeatures = [
        { feature: 'Age', importance: normalizeValue(userData.profile.age, 20, 80) * HeartFeatureImportance.Age},
        { feature: 'Gender', importance: (userData.profile.gender === 'male' ? 1 : 0) * HeartFeatureImportance.Gender},
        { feature: 'Chest Pain Type', importance: getChestPainValue(userData.medical?.chest_pain_type) * HeartFeatureImportance.ChestPainType},
        { feature: 'Cholesterol', importance: normalizeValue(userData.metrics.cholesterol, 130, 320) * HeartFeatureImportance.Cholesterol},
        { feature: 'Maximum Heart Rate', importance: normalizeValue(userData.metrics.max_heart_rate, 60, 220, true) * HeartFeatureImportance.MaxHR}
    ];
    
    const strokeFeatures = [
        { feature: 'Gender', importance: (userData.profile.gender === 'male' ? 1 : 0) * StrokeFeatureImportance.Gender},
        { feature: 'Age', importance: normalizeValue(userData.profile.age, 20, 80) * StrokeFeatureImportance.Age},
        { feature: 'Hypertension', importance: (userData.medical?.hypertension ? 1 : 0) * StrokeFeatureImportance.Hypertension},
        { feature: 'Glucose Level', importance: normalizeValue(userData.metrics.glucose, 70, 200) * StrokeFeatureImportance.GlucoseLevel},
        { feature: 'BMI', importance: normalizeValue(userData.metrics.bmi, 18, 35) * StrokeFeatureImportance.BMI},
        { feature: 'Smoking Status', importance: (userData.lifestyle?.smoking ? 1 : 0) * StrokeFeatureImportance.SmokingStatus}            
    ]

    // Calculate symptom importance for each condition
    const diabetesSymptoms = getSymptomFeatureImportance(symptoms, 'diabetes');
    const heartSymptoms = getSymptomFeatureImportance(symptoms, 'heart');
    const strokeSymptoms = getSymptomFeatureImportance(symptoms, 'stroke');
    
    return {
        diabetes: [...diabetesFeatures, ...diabetesSymptoms],
        heart: [...heartFeatures, ...heartSymptoms],
        stroke: [...strokeFeatures, ...strokeSymptoms]
    };
}

// Helper function to get symptom feature importance
function getSymptomFeatureImportance(symptoms, condition) {
    // Maximum percentage of importance allocated to symptoms
    const SYMPTOM_IMPORTANCE_FACTOR = 0.6;
    const symptomFeatures = [];
    
    // Get total weight of all symptoms for this condition
    let totalWeight = 0;
    symptoms.forEach(symptomId => {
        const symptom = symptomsMapping[symptomId];
        if (symptom && symptom[condition] > 0) {
            totalWeight += symptom[condition];
        }
    });
    
    // If no relevant symptoms, return empty array
    if (totalWeight === 0) return [];
    
    // Add each symptom with its proportional importance
    symptoms.forEach(symptomId => {
        const symptom = symptomsMapping[symptomId];
        if (symptom && symptom[condition] > 0) {
            // Calculate importance proportionate to total weight and overall factor
            const importance = (symptom[condition] / totalWeight) * SYMPTOM_IMPORTANCE_FACTOR;
            
            symptomFeatures.push({
                feature: `Symptom: ${symptom.name}`,
                importance: importance,
                isSymptom: true
            });
        }
    });
    
    return symptomFeatures;
}

// Helper function for mapping chest pain type to a value between 0-1
function getChestPainValue(type) {
    switch(type) {
      case 'typical angina': return 1.0;
      case 'atypical angina': return 0.67;
      case 'non-anginal': return 0.33;
      case 'asymptomatic': return 0.0;
      default: return 0.0;
    }
}

function normalizeValue(value, min, max, reverse = false) {
    if (value === null || value === undefined) return 0;

    // Parse value if it's a string
    if (typeof value === 'string') {
        value = parseFloat(value);
    }

    // Clamp value to range
    value = Math.max(min, Math.min(max, value));

    // Normalize to 0-1 scale
    const normalized = (value - min) / (max - min);

    // Reverse if needed (when lower values indicate higher risk)
    return reverse ? 1 - normalized : normalized;
}

// Helper to parse blood pressure
function parseBloodPressure(bp) {
    if (!bp) return 120; // Default value
    
    const parts = bp.split('/');
    if (parts.length === 2) {
        return parseInt(parts[0]);
    }
    
    return 120;
}

// Get contributing risk factors
function getContributingRiskFactors(userData, results) {
    const diabetesRiskFactors = [];
    const heartRiskFactors = [];
    const strokeRiskFactors = [];
    
    // Add diabetes risk factors
    if (userData.metrics.glucose > 100) {
        diabetesRiskFactors.push({
            factor: 'High Blood Glucose',
            value: `${userData.metrics.glucose} mg/dL`,
            contribution: 'High',
            description: 'Glucose levels above 100 mg/dL indicate prediabetes or diabetes'
        });
    }
    
    if (userData.metrics.bmi > 25) {
        diabetesRiskFactors.push({
            factor: 'Elevated BMI',
            value: userData.metrics.bmi,
            contribution: userData.metrics.bmi > 30 ? 'High' : 'Moderate',
            description: `BMI of ${userData.metrics.bmi} indicates ${userData.metrics.bmi > 30 ? 'obesity' : 'overweight'}`
        });
    }
    
    if (userData.profile.age > 45) {
        diabetesRiskFactors.push({
            factor: 'Age',
            value: `${userData.profile.age} years`,
            contribution: userData.profile.age > 60 ? 'High' : 'Moderate',
            description: 'Diabetes risk increases with age, especially after 45'
        });
    }
    
    if (userData.medical?.pregnancy > 0) {
        diabetesRiskFactors.push({
            factor: 'Pregnancy History',
            value: userData.medical.pregnancy,
            contribution: 'Moderate',
            description: 'Previous pregnancies can increase diabetes risk'
        });
    }
    
    // Add heart risk factors
    if (userData.metrics.cholesterol > 200) {
        heartRiskFactors.push({
            factor: 'Elevated Cholesterol',
            value: `${userData.metrics.cholesterol} mg/dL`,
            contribution: userData.metrics.cholesterol > 240 ? 'High' : 'Moderate',
            description: 'Total cholesterol above 200 mg/dL increases heart disease risk'
        });
    }
    
    if (userData.medical?.chest_pain_type && userData.medical.chest_pain_type !== 'asymptomatic') {
        heartRiskFactors.push({
            factor: 'Chest Pain',
            value: userData.medical.chest_pain_type,
            contribution: userData.medical.chest_pain_type === 'typical angina' ? 'High' : 'Moderate',
            description: 'Presence of chest pain may indicate underlying heart issues'
        });
    }
    
    if (userData.profile.age > 45 && userData.profile.gender === 'male') {
        heartRiskFactors.push({
            factor: 'Age and Gender',
            value: `${userData.profile.age} year old ${userData.profile.gender}`,
            contribution: userData.profile.age > 60 ? 'High' : 'Moderate',
            description: 'Men over 45 have increased heart disease risk'
        });
    } else if (userData.profile.age > 55 && userData.profile.gender === 'female') {
        heartRiskFactors.push({
            factor: 'Age and Gender',
            value: `${userData.profile.age} year old ${userData.profile.gender}`,
            contribution: userData.profile.age > 65 ? 'High' : 'Moderate',
            description: 'Women over 55 have increased heart disease risk'
        });
    }
    
    if (userData.metrics.max_heart_rate && userData.metrics.max_heart_rate < 100) {
        heartRiskFactors.push({
            factor: 'Low Maximum Heart Rate',
            value: `${userData.metrics.max_heart_rate} bpm`,
            contribution: 'Moderate',
            description: 'Lower max heart rate may indicate reduced cardiac capacity'
        });
    }
    
    //  stroke risk factors
    if (userData.medical?.hypertension) {
        strokeRiskFactors.push({
            factor: 'Hypertension',
            value: 'Present',
            contribution: 'High',
            description: 'Hypertension significantly increases stroke risk'
        });
    }
    
    if (userData.lifestyle?.smoking) {
        strokeRiskFactors.push({
            factor: 'Smoking',
            value: 'Active smoker',
            contribution: 'High',
            description: 'Smoking doubles the risk of stroke'
        });
    }
    
    if (userData.profile.age > 65) {
        strokeRiskFactors.push({
            factor: 'Advanced Age',
            value: `${userData.profile.age} years`,
            contribution: 'High',
            description: 'Stroke risk increases significantly after age 65'
        });
    }
    
    if (parseFloat(results.diabetes.risk) > 0.5) {
        strokeRiskFactors.push({
            factor: 'Diabetes',
            value: `${results.diabetes.level} risk`,
            contribution: 'Moderate',
            description: 'Diabetes increases stroke risk by 1.5 to 3 times'
        });
    }
    
    return {
        diabetes: diabetesRiskFactors,
        heart: heartRiskFactors,
        stroke: strokeRiskFactors
    };
}

// Generate general recommendations based on triage
function generateGeneralRecommendations(triage) {
    const recommendations = [];
    
    if (triage.level === TRIAGE_LEVELS.EMERGENCY) {
        recommendations.push('Call emergency services or go to the nearest emergency room immediately.');
    } else if (triage.level === TRIAGE_LEVELS.URGENT) {
        recommendations.push('Contact your healthcare provider within 24 hours.');
        recommendations.push('Monitor your symptoms closely and seek immediate care if they worsen.');
    } else {
        recommendations.push('Stay hydrated by drinking at least 8 glasses of water daily.');
        recommendations.push('Aim for at least 7-8 hours of quality sleep each night.');
        recommendations.push('Maintain a balanced diet rich in fruits, vegetables, and whole grains.');
        recommendations.push('Regular physical activity of at least 150 minutes per week is recommended.');
    }
    
    return recommendations;
}

// Generate diabetes recommendations
function generateDiabetesRecommendations(diabetesRisk, userData) {
    const recommendations = [];
    
    if (diabetesRisk.level === 'Low') {
        return recommendations; // No specific recommendations for low risk
    }
    
    recommendations.push('Monitor your blood glucose levels regularly.');
    
    if (userData.metrics.glucose > 100) {
        recommendations.push('Reduce intake of refined carbohydrates, sugary foods and beverages.');
        recommendations.push('Choose complex carbohydrates with low glycemic index such as whole grains.');
    }
    
    if (userData.metrics.bmi > 25) {
        recommendations.push('A 5-10% reduction in body weight can significantly improve insulin sensitivity.');
        recommendations.push('Focus on portion control and balanced meals.');
    }
    
    recommendations.push('Include fiber-rich foods in your diet like vegetables, fruits, and whole grains.');
    
    if (diabetesRisk.level === 'High' || diabetesRisk.level === 'Very High') {
        recommendations.push('Consider consulting with an endocrinologist for comprehensive diabetes risk assessment.');
        recommendations.push('Regular screening for diabetes is strongly recommended.');
    }
    
    return recommendations;
}

// Generate heart recommendations
function generateHeartRecommendations(heartRisk, userData) {
    const recommendations = [];
    
    if (heartRisk.level === 'Low') {
        return recommendations; // No specific recommendations for low risk
    }
    
    recommendations.push('Monitor your blood pressure regularly.');
    
    if (userData.metrics.cholesterol > 200) {
        recommendations.push('Consider a diet lower in saturated fats to help reduce cholesterol levels.');
        recommendations.push('Include plant sterols and fiber-rich foods that help lower cholesterol.');
    }
    
    recommendations.push('Include heart-healthy foods like fatty fish, nuts, and olive oil in your diet.');
    recommendations.push('Aim for at least 150 minutes of moderate exercise each week.');
    
    if (userData.metrics.blood_pressure) {
        const systolic = parseBloodPressure(userData.metrics.blood_pressure);
        if (systolic > 120) {
            recommendations.push('Reduce sodium intake to help manage blood pressure.');
            recommendations.push('Practice stress reduction techniques such as meditation or deep breathing.');
        }
    }
    
    if (heartRisk.level === 'High' || heartRisk.level === 'Very High') {
        recommendations.push('Consider consulting with a cardiologist for comprehensive heart health assessment.');
        recommendations.push('Discuss with your doctor about appropriate cardiac screening tests.');
    }
    
    return recommendations;
}

// Generate stroke recommendations
function generateStrokeRecommendations(strokeRisk, userData) {
    const recommendations = [];
    
    if (strokeRisk.level === 'Low') {
        return recommendations; // No specific recommendations for low risk
    }
    
    recommendations.push('Monitor your blood pressure regularly.');
    
    if (userData.medical?.hypertension) {
        recommendations.push('Take your blood pressure medication as prescribed by your doctor.');
        recommendations.push('Follow the DASH diet (Dietary Approaches to Stop Hypertension).');
    }
    
    if (userData.lifestyle?.smoking) {
        recommendations.push('Quitting smoking can significantly reduce your stroke risk.');
        recommendations.push('Consider smoking cessation programs or aids to help you quit.');
    }
    
    recommendations.push('Limit alcohol consumption.');
    
    if (userData.metrics.glucose > 100) {
        recommendations.push('Maintain good control of blood sugar levels.');
    }
    
    if (strokeRisk.level === 'High' || strokeRisk.level === 'Very High') {
        recommendations.push('Consider consulting with a neurologist for comprehensive stroke risk assessment.');
        recommendations.push('Learn to recognize the signs of stroke: face drooping, arm weakness, speech difficulty, time to call emergency services (FAST).');
    }
    
    return recommendations;
}

// Save analysis results to database
async function saveAnalysisResults(userId, symptoms, analysisResult) {
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // Convert objects to JSON for storage
            const symptomsJson = JSON.stringify(symptoms);
            const resultsJson = JSON.stringify(analysisResult.conditionRisks);
            const triageJson = JSON.stringify(analysisResult.triage);
            const riskFactorsJson = JSON.stringify(analysisResult.riskFactors);
            const featureImportanceJson = JSON.stringify(analysisResult.featureImportance);
            const recommendationsJson = JSON.stringify(analysisResult.recommendations);
            
            // Insert the analysis record
            await connection.execute(
                `INSERT INTO symptom_analysis 
                (user_id, symptoms, results, triage, risk_factors, feature_importance, recommendations, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                [userId, symptomsJson, resultsJson, triageJson, riskFactorsJson, featureImportanceJson, recommendationsJson]
            );
            
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error saving analysis results:', error);
        // Continue execution even if save fails
    }
}

// Get previous symptom analyses for a user
export const getSymptomHistory = async (req, res) => {
    const { userId } = req.params;
    
    try {
        const [results] = await db.execute(
            `SELECT id, symptoms, results, triage, risk_factors, feature_importance, recommendations, created_at 
             FROM symptom_analysis 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
            [userId]
        );
        
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching symptom history:', error);
        res.status(500).json({ error: 'Failed to fetch symptom history' });
    }
};