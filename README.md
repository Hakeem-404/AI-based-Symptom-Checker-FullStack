# A.I.H.S (AI-powered Health Symptom Checker)

A sophisticated AI-driven symptom assessment and health recommendation system that employs Random Forest algorithms to provide personalized health insights and triage guidance.

![A.I.H.S Screenshot](screenshots/dashboard.png)

## 🌟 Project Overview

A.I.H.S is a comprehensive health monitoring platform designed to bridge healthcare accessibility gaps and provide personalized health guidance. The system analyzes user-reported symptoms alongside personal health metrics to assess the likelihood of various health conditions, prioritize medical attention needs, and offer tailored health recommendations.

### 🎯 Key Features

- **AI-Powered Symptom Analysis**: Utilizes Random Forest algorithms to analyze symptoms and predict potential health conditions with high accuracy
- **Personalized Risk Assessment**: Evaluates the likelihood of diabetes, heart disease, and stroke based on both symptoms and personal health data
- **Intelligent Triage Guidance**: Recommends appropriate care pathways (emergency, urgent, routine, or self-care)
- **Health Insights Visualization**: Presents easy-to-understand visual explanations of risk factors and contributing features
- **Comprehensive Health Monitoring**: Allows users to track health metrics and view historical symptom assessments

## 🧠 Technical Implementation

A.I.H.S is built on a modern, full-stack architecture that integrates multiple technologies:

### Machine Learning Models

- **Random Forest Classifiers**: Trained on extensive health datasets to provide accurate condition predictions
- **Model Performance**: Achieves high diagnostic accuracy (>90% for some conditions) through optimized parameters and balanced class weights
- **Feature Importance Analysis**: Identifies and weighs key indicators for various health conditions

### Backend Architecture

- **Node.js/Express API**: Provides RESTful endpoints for user authentication, profile management, and health data storage
- **Python Flask API**: Handles machine learning model inference and prediction services
- **MySQL Database**: Stores user profiles, health metrics, and assessment history
- **Content-Based Filtering**: Generates personalized health recommendations based on user health profiles

### Frontend Implementation

- **Vue.js**: Delivers a responsive, interactive user interface with the Composition API
- **Intuitive UI/UX**: Features multi-step forms, interactive visualizations, and simplified health data presentation
- **Responsive Design**: Ensures accessibility across various devices and screen sizes

## 📊 Model Performance

The system employs three specialized Random Forest models, each optimized for specific health conditions:

| Model | Accuracy | F1 Score | Primary Features |
|-------|----------|----------|------------------|
| Diabetes | 92.5% | 0.91 | Glucose, BMI, Age, Blood Pressure |
| Heart Disease | 89.3% | 0.88 | Age, Chest Pain Type, Gender, Max Heart Rate |
| Stroke | 87.2% | 0.85 | Gender, Age, Hypertension, Glucose Level |

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- MySQL (v8.0+)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/aihs.git
   cd aihs
   ```

2. Install backend dependencies
   ```
   npm install
   ```

3. Install Python dependencies
   ```
   pip install -r requirements.txt
   ```

4. Set up the database
   ```
   mysql -u yourusername -p < database/setup.sql
   ```

5. Configure environment variables
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. Start the backend services
   ```
   npm run start:services
   ```

7. Start the frontend development server
   ```
   npm run dev
   ```

8. Navigate to `http://localhost:3000` in your browser

## 📋 Project Structure

```
aihs/
├── backend/               # Node.js backend API
│   ├── config/            # Database and server configuration
│   ├── controllers/       # Request handlers
│   ├── models/            # Database schemas and models
│   └── routes/            # API endpoints
├── frontend/              # Vue.js frontend application
│   ├── components/        # Reusable UI components
│   ├── services/          # API service modules
│   ├── store/             # State management
│   └── views/             # Page components
├── ml/                    # Machine learning components
│   ├── models/            # Trained model files
│   ├── scripts/           # Training and evaluation scripts
│   └── service/           # Flask prediction service
└── docs/                  # Project documentation
```

## 📚 Research & Development

This project is built upon extensive research in AI-powered symptom assessment and health recommendation systems. Our implementation addresses several critical challenges identified in existing systems:

- **Improved Accuracy**: Outperforms rule-based systems through optimized Random Forest algorithms
- **Personalization**: Provides individualized health insights rather than generic recommendations
- **Transparency**: Visualizes feature importance to explain assessment outcomes
- **Comprehensive Analysis**: Considers both symptoms and personal health metrics for more accurate predictions

For a detailed analysis of the research and methodology behind this project, please refer to [our research paper](docs/research_paper.pdf).

## 🌐 Impact & Applications

A.I.H.S has potential applications in various healthcare contexts:

- **Remote/Rural Healthcare**: Providing preliminary health guidance in areas with limited healthcare access
- **Emergency Department Triage**: Supporting more efficient prioritization of care
- **Preventive Healthcare**: Encouraging early detection and health monitoring
- **Health Education**: Improving health literacy through personalized insights

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

For any inquiries, please reach out to [your.email@example.com](mailto:your.email@example.com).

---

*Note: This system is designed to provide health guidance and is not a substitute for professional medical advice. Always consult with healthcare professionals for medical concerns.*
