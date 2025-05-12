<!-- src/views/Insights.vue -->
<template>
  <div class="insights-page">
    <button class="btn-primary" @click="navigateToHome" style="margin-top: 1em; margin-bottom: 1em;">
      Go back Home
    </button>
    <h1 class="page-title">Health Insights</h1>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading health insights...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchUserData" class="retry-btn">Try Again</button>
    </div>

    <!-- Insights Container -->
    <div v-else-if="userData.metrics && userData.medical" class="insights-container">
      <!-- BMI Insights Section -->
      <section class="insight-card bmi-insight">
        <div class="insight-header">
          <h2>BMI Analysis</h2>
          <span class="insight-badge" :class="bmiCategory.toLowerCase().replace(' ', '-')">
            {{ bmiCategory }}
          </span>
        </div>
        <div class="insight-content">
          <div class="metric-display">
            <span class="metric-value">{{ calculateBMI }} kg/m²</span>
          </div>
          <p class="insight-description">
            {{ getBMIDescription }}
          </p>
          <div class="insight-recommendations">
            <h3>Recommendations</h3>
            <ul>
              <li v-for="(recommendation, index) in getBMIRecommendations" :key="index">
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Blood Pressure Insights Section -->
      <section class="insight-card blood-pressure-insight">
        <div class="insight-header">
          <h2>Blood Pressure Analysis</h2>
          <span class="insight-badge" :class="getBPCategory.toLowerCase().replace(' ', '-')">
            {{ getBPCategory }}
          </span>
        </div>
        <div class="insight-content">
          <div class="metric-display">
            <span class="metric-value">{{ userData.metrics.blood_pressure }} mmHg</span>
          </div>
          <p class="insight-description">
            {{ getBPDescription }}
          </p>
          <div class="insight-recommendations">
            <h3>Recommendations</h3>
            <ul>
              <li v-for="(recommendation, index) in getBPRecommendations" :key="index">
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Cholesterol Insights Section -->
      <section class="insight-card cholesterol-insight">
        <div class="insight-header">
          <h2>Cholesterol Analysis</h2>
          <span class="insight-badge" :class="getCholesterolCategory.toLowerCase().replace(' ', '-')">
            {{ getCholesterolCategory }}
          </span>
        </div>
        <div class="insight-content">
          <div class="metric-display">
            <span class="metric-value">{{ userData.metrics.cholesterol }} mg/dL</span>
          </div>
          <p class="insight-description">
            {{ getCholesterolDescription }}
          </p>
          <div class="insight-recommendations">
            <h3>Recommendations</h3>
            <ul>
              <li v-for="(recommendation, index) in getCholesterolRecommendations" :key="index">
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Hypertension Insights Section -->
      <section class="insight-card hypertension-insight">
        <div class="insight-header">
          <h2>Hypertension Status</h2>
          <span class="insight-badge" :class="userData.medical.hypertension ? 'high' : 'normal'">
            {{ userData.medical.hypertension ? 'Diagnosed' : 'Not Diagnosed' }}
          </span>
        </div>
        <div class="insight-content">
          <div class="metric-display">
            <span class="metric-value">{{ userData.medical.hypertension ? 'Hypertension Present' : 'No Hypertension' }}</span>
          </div>
          <p class="insight-description">
            {{ getHypertensionDescription }}
          </p>
          <div class="insight-recommendations">
            <h3>Recommendations</h3>
            <ul>
              <li v-for="(recommendation, index) in getHypertensionRecommendations" :key="index">
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Heart Rate Insights Section -->
      <section class="insight-card heart-rate-insight">
        <div class="insight-header">
          <h2>Heart Rate Analysis</h2>
          <span class="insight-badge" :class="getHeartRateCategory.toLowerCase().replace(' ', '-')">
            {{ getHeartRateCategory }}
          </span>
        </div>
        <div class="insight-content">
          <div class="metric-display">
            <span class="metric-value">{{ userData.metrics.heart_rate }} bpm</span>
          </div>
          <p class="insight-description">
            {{ getHeartRateDescription }}
          </p>
          <div class="insight-recommendations">
            <h3>Recommendations</h3>
            <ul>
              <li v-for="(recommendation, index) in getHeartRateRecommendations" :key="index">
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Lifestyle Insights Section -->
      <section class="insight-card lifestyle-insight">
        <div class="insight-header">
          <h2>Lifestyle Analysis</h2>
          <span class="insight-badge">Comprehensive</span>
        </div>
        <div class="insight-content">
          <div class="lifestyle-factors">
            <div class="factor">
              <span class="factor-label">Exercise Frequency:</span>
              <span>{{ formatExerciseFrequency(userData.medical.exerciseFrequency) }}</span>
            </div>
            <div class="factor">
              <span class="factor-label">Smoking Status:</span>
              <span>{{ userData.medical.smoking ? 'Yes' : 'No' }}</span>
            </div>
            <div class="factor">
              <span class="factor-label">Alcohol Consumption:</span>
              <span>{{ userData.medical.alcoholConsumption ? 'Yes' : 'No' }}</span>
            </div>
          </div>
          <p class="insight-description">
            {{ getLifestyleDescription }}
          </p>
          <div class="insight-recommendations">
            <h3>Recommendations</h3>
            <ul>
              <li v-for="(recommendation, index) in getLifestyleRecommendations" :key="index">
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Additional Health Metrics Section -->
      <section class="insight-card additional-metrics">
        <div class="insight-header">
          <h2>Additional Health Metrics</h2>
        </div>
        <div class="insight-content">
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">Max Heart Rate</span>
              <span class="metric-value">{{ userData.metrics.max_heart_rate }} bpm</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Skin Thickness</span>
              <span class="metric-value">{{ userData.metrics.skin_thickness }} mm</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Glucose Level</span>
              <span class="metric-value">{{ userData.metrics.glucose }} mg/dL</span>
            </div>
          </div>
          <p class="insight-description">
            These additional metrics provide a more comprehensive view of your health status.
          </p>
        </div>
      </section>
    </div>

    <!-- No Data State -->
    <div v-else class="no-data-state">
      <p>No health data available. Please update your health metrics.</p>
      <router-link to="/profile" class="update-btn">
        Update Profile
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '@/services/user'
import { healthService } from '@/services/health'
import { medicalService } from '@/services/medical'

export default {
  name: 'InsightsView',
  setup() {
    const router = useRouter()
    const userData = ref({
      metrics: null,
      medical: null
    })

    const isLoading = ref(true)
    const error = ref(null)

    const navigateToHome = () => {
      router.push('/home')
    }

    // Helper function to format exercise frequency
    const formatExerciseFrequency = (freq) => {
      switch(freq) {
        case 'none': return 'No Exercise'
        case 'light': return 'Light (1-2 days/week)'
        case 'moderate': return 'Moderate (3-4 days/week)'
        case 'regular': return 'Regular (5+ days/week)'
        default: return 'Not Specified'
      }
    }

    const calculateBMI = computed(() => {
      if (!userData.value.metrics?.height || !userData.value.metrics?.weight) return '-'
      const heightInMeters = userData.value.metrics.height / 100
      return (userData.value.metrics.weight / (heightInMeters * heightInMeters)).toFixed(1)
    })

    const bmiCategory = computed(() => {
      const bmi = parseFloat(calculateBMI.value)
      if (!bmi || bmi === '-') return 'Unknown'
      if (bmi < 18.5) return 'Underweight'
      if (bmi < 25) return 'Normal weight'
      if (bmi < 30) return 'Overweight'
      return 'Obese'
    })

    const getBMIDescription = computed(() => {
      const category = bmiCategory.value
      switch(category) {
        case 'Underweight':
          return 'Your BMI indicates you might have a lower body weight relative to your height. This could suggest potential nutritional deficiencies or underlying health conditions.'
        case 'Normal weight':
          return 'Your BMI is within the healthy range, indicating a balanced body composition that supports overall health and well-being.'
        case 'Overweight':
          return 'Your BMI suggests you might have excess body weight, which could increase risks of various health conditions such as heart disease and diabetes.'
        case 'Obese':
          return 'Your BMI indicates a higher body weight that may significantly impact your health and increase risks of chronic diseases.'
        default:
          return 'BMI data not available for comprehensive analysis.'
      }
    })

    const getBMIRecommendations = computed(() => {
      const category = bmiCategory.value
      switch(category) {
        case 'Underweight':
          return [
            'Consult with a nutritionist to develop a balanced diet plan.',
            'Focus on nutrient-dense foods and gradual weight gain.',
            'Consider medical check-up to rule out underlying conditions.'
          ]
        case 'Normal weight':
          return [
            'Maintain your current healthy lifestyle.',
            'Continue balanced nutrition and regular exercise.',
            'Regular health check-ups are recommended.'
          ]
        case 'Overweight':
          return [
            'Develop a balanced diet and exercise plan.',
            'Consider consulting with a nutritionist or fitness professional.',
            'Increase physical activity gradually and consistently.'
          ]
        case 'Obese':
          return [
            'Consult healthcare professionals for personalised weight management strategy.',
            'Focus on sustainable lifestyle changes.',
            'Develop a comprehensive diet and exercise plan.'
          ]
        default:
          return ['Unable to generate recommendations due to insufficient data.']
      }
    })

    const getBPCategory = computed(() => {
      if (!userData.value.metrics?.blood_pressure) return 'Unknown'
      const [systolic, diastolic] = userData.value.metrics.blood_pressure.split('/').map(Number)
      if (systolic < 120 && diastolic < 80) return 'Normal'
      if (systolic == 120 && diastolic == 80) return 'Normal'
      if (systolic < 130 && diastolic < 80) return 'Elevated'
      return 'High'
    })

    const getBPDescription = computed(() => {
      const category = getBPCategory.value
      switch(category) {
        case 'Normal':
          return 'Your blood pressure is within the optimal range, indicating good cardiovascular health and minimal risk of heart-related issues.'
        case 'Elevated':
          return 'Your blood pressure is slightly higher than optimal, which may indicate an increased risk of developing hypertension in the future.'
        case 'High':
          return 'Your blood pressure is higher than recommended, which could signify increased risk of cardiovascular diseases and requires medical attention.'
        default:
          return 'Blood pressure data not available for comprehensive analysis.'
      }
    })

    const getBPRecommendations = computed(() => {
      const category = getBPCategory.value
      switch(category) {
        case 'Normal':
          return [
            'Continue maintaining your current healthy lifestyle.',
            'Regular blood pressure monitoring is recommended.',
            'Maintain a balanced diet and regular exercise.'
          ]
        case 'Elevated':
          return [
            'Reduce sodium intake.',
            'Increase physical activity.',
            'Practice stress management techniques.',
            'Consider consulting a healthcare professional.'
          ]
        case 'High':
          return [
            'Consult a healthcare provider immediately.',
            'Consider medication and lifestyle modifications.',
            'Reduce sodium and alcohol consumption.',
            'Increase physical activity and manage stress.'
          ]
        default:
          return ['Unable to generate recommendations due to insufficient data.']
      }
    })

    const getCholesterolCategory = computed(() => {
      const cholesterol = userData.value.metrics?.cholesterol
      if (!cholesterol) return 'Unknown'
      
      if (cholesterol < 200) return 'Desirable'
      if (cholesterol >= 200 && cholesterol < 240) return 'Borderline High'
      return 'High'
    })

    const getCholesterolDescription = computed(() => {
      const category = getCholesterolCategory.value
      switch(category) {
        case 'Desirable':
          return 'Your cholesterol level is within the optimal range, indicating good cardiovascular health.'
        case 'Borderline High':
          return 'Your cholesterol level is slightly elevated, which may increase your risk of heart disease.'
        case 'High':
          return 'Your cholesterol level is significantly high, which can increase your risk of heart disease and stroke.'
        default:
          return 'Cholesterol data not available for comprehensive analysis.'
      }
    })

    const getCholesterolRecommendations = computed(() => {
      const category = getCholesterolCategory.value
      switch(category) {
        case 'Desirable':
          return [
            'Continue maintaining your current healthy lifestyle.',
            'Regular cholesterol screenings recommended.',
            'Maintain a balanced diet and exercise routine.'
          ]
        case 'Borderline High':
          return [
            'Consult with a healthcare provider.',
            'Consider dietary modifications.',
            'Increase physical activity.',
            'Reduce saturated and trans fats intake.'
          ]
        case 'High':
          return [
            'Immediate consultation with a healthcare provider.',
            'Discuss potential medication options.',
            'Implement significant lifestyle changes.',
            'Focus on heart-healthy diet.',
            'Increase regular physical activity.'
          ]
        default:
          return ['Unable to generate recommendations due to insufficient data.']
      }
    })

    const getHypertensionDescription = computed(() => {
      const hasHypertension = userData.value.medical?.hypertension
      
      if (hasHypertension) {
        return 'You have been diagnosed with hypertension (high blood pressure). This condition can increase your risk of heart disease, stroke, and other cardiovascular complications.'
      }
      
      return 'No hypertension diagnosis has been recorded. Continue maintaining a healthy lifestyle to prevent potential development of high blood pressure.'
    })

    const getHypertensionRecommendations = computed(() => {
      const hasHypertension = userData.value.medical?.hypertension
      
      if (hasHypertension) {
        return [
          'Follow your healthcare provider\'s treatment plan carefully.',
          'Monitor blood pressure regularly.',
          'Maintain a low-sodium diet.',
          'Engage in regular physical activity.',
          'Manage stress through relaxation techniques.',
          'Limit alcohol consumption.',
          'Avoid smoking.'
        ]
      }
      
      return [
        'Continue maintaining a healthy lifestyle.',
        'Regular blood pressure check-ups.',
        'Maintain a balanced diet low in sodium.',
        'Engage in regular physical activity.',
        'Manage stress effectively.'
      ]
    })

    const getHeartRateCategory = computed(() => {
      const hr = userData.value.metrics?.heart_rate
      if (!hr) return 'Unknown'
      if (hr < 60) return 'Low'
      if (hr >= 60 && hr <= 100) return 'Normal'
      return 'Elevated'
    })

    const getHeartRateDescription = computed(() => {
      const category = getHeartRateCategory.value
      switch(category) {
        case 'Low':
          return 'Your resting heart rate is below 60 bpm, which could indicate excellent cardiovascular fitness or potential underlying conditions.'
        case 'Normal':
          return 'Your resting heart rate is within the healthy range, suggesting good heart health and efficient cardiovascular function.'
        case 'Elevated':
          return 'Your resting heart rate is above 100 bpm, which may indicate stress, anxiety, or potential cardiovascular concerns.'
        default:
          return 'Heart rate data not available for comprehensive analysis.'
      }
    })

    const getHeartRateRecommendations = computed(() => {
      const category = getHeartRateCategory.value
      switch(category) {
        case 'Low':
          return [
            'If you\'re not an athlete, consult a healthcare provider.',
            'Monitor for any symptoms of dizziness or fatigue.',
            'Consider comprehensive cardiovascular evaluation.'
          ]
        case 'Normal':
          return [
            'Maintain current healthy lifestyle.',
            'Continue regular cardiovascular exercise.',
            'Periodic health check-ups recommended.'
          ]
        case 'Elevated':
          return [
            'Practice stress reduction techniques.',
            'Consult healthcare professional for comprehensive evaluation.',
            'Consider lifestyle modifications to reduce heart rate.',
            'Monitor for underlying health conditions.'
          ]
        default:
          return ['Unable to generate recommendations due to insufficient data.']
      }
    })

    const getLifestyleDescription = computed(() => {
      const exerciseFreq = userData.value.medical.exerciseFrequency
      const smoking = userData.value.medical.smoking
      const alcohol = userData.value.medical.alcoholConsumption

      let description = 'Your lifestyle factors play a crucial role in overall health. '
      
      if (exerciseFreq === 'none') {
        description += 'Currently, your exercise frequency is low, which may impact your overall health and fitness. '
      } else if (exerciseFreq === 'light') {
        description += 'You engage in light exercise, which is a good start towards maintaining an active lifestyle. '
      } else if (exerciseFreq === 'moderate') {
        description += 'Your moderate exercise routine demonstrates a commitment to maintaining good health. '
      } else if (exerciseFreq === 'regular') {
        description += 'Your regular exercise routine is excellent for maintaining optimal health and fitness. '
      }

      if (smoking) {
        description += 'Smoking can have significant negative impacts on your health and may increase risks of various diseases. '
      }

      if (alcohol) {
        description += 'Regular alcohol consumption can affect your overall health and should be moderated.'
      }

      return description
    })

    const getLifestyleRecommendations = computed(() => {
      const recommendations = []
      const exerciseFreq = userData.value.medical.exerciseFrequency
      const smoking = userData.value.medical.smoking
      const alcohol = userData.value.medical.alcoholConsumption

      if (exerciseFreq === 'none' || exerciseFreq === 'light') {
        recommendations.push('Gradually increase physical activity.')
        recommendations.push('Aim for at least 150 minutes of moderate exercise per week.')
      }

      if (smoking) {
        recommendations.push('Consider smoking cessation programs.')
        recommendations.push('Consult healthcare provider about strategies to quit smoking.')
      }

      if (alcohol) {
        recommendations.push('Moderate alcohol consumption.')
        recommendations.push('Follow recommended guidelines for alcohol intake.')
      }

      return recommendations.length ? recommendations : ['Your current lifestyle choices appear balanced.']
    })

    const fetchUserData = async () => {
      isLoading.value = true
      error.value = null
      try {
        const userId = localStorage.getItem('userId')
        
        // Fetch health metrics and medical info
        const [healthResponse, medicalResponse] = await Promise.all([
          healthService.getHealthMetrics(userId),
          medicalService.getMedicalInfo(userId)
        ])

        // Ensure we're accessing the correct data structure
        const metricsData = Array.isArray(healthResponse.data) 
          ? healthResponse.data[0] 
          : healthResponse.data

        const medicalInfo = medicalResponse.data

        // Populate user data with fetched information
        userData.value = {
          metrics: {
            ...metricsData,
            cholesterol: metricsData?.cholesterol || null
          } || null,
          medical: {
            exerciseFrequency: medicalInfo?.lifestyle?.exercise_frequency || '',
            smoking: medicalInfo?.lifestyle?.smoking || false,
            alcoholConsumption: medicalInfo?.lifestyle?.alcohol_consumption || false,
            hypertension: medicalInfo?.medical?.hypertension || false
          }
        }

        console.log('Fetched User Data:', userData.value)
      } catch (fetchError) {
        console.error('Error fetching user data:', fetchError)
        error.value = 'Failed to load health insights. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    onMounted(fetchUserData)

    return {
      userData,
      isLoading,
      error,
      formatExerciseFrequency,
      calculateBMI,
      bmiCategory,
      getBMIDescription,
      getBMIRecommendations,
      getBPCategory,
      getBPDescription,
      getBPRecommendations,
      getCholesterolCategory,
      getCholesterolDescription,
      getCholesterolRecommendations,
      getHypertensionDescription,
      getHypertensionRecommendations,
      getHeartRateCategory,
      getHeartRateDescription,
      getHeartRateRecommendations,
      getLifestyleDescription,
      getLifestyleRecommendations,
      fetchUserData,
      navigateToHome
    }
  }
}
</script>

<style scoped>
.insights-page {
  max-width: 1300px;
  margin: 0 auto;
  margin-top: 1rem;
  padding: 2rem;
  background-color: #f4f7fa;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  color: #2c3e50;
  text-align: center;
  border-bottom: 3px solid #2B82E3;
  padding-bottom: 0.5rem;
}

.insights-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
}

.insight-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 1rem;
}

.insight-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.insight-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
}

.underweight { background-color: #FDE68A; color: #92400E; }
.normal-weight { background-color: #6EE7B7; color: #065F46; }
.overweight { background-color: #FCA5A5; color: #991B1B; }
.obese { background-color: #F87171; color: #7F1D1D; }
.elevated { background-color: #FBBF24; color: #92400E; }
.high { background-color: #F87171; color: #7F1D1D; }
.normal { background-color: #6EE7B7; color: #065F46; }
.low { background-color: #FDE68A; color: #92400E; }
.desirable { background-color: #6EE7B7; color: #065F46; }
.borderline-high { background-color: #FBBF24; color: #92400E; }
.diagnosed { background-color: #F87171; color: #7F1D1D; }
.not-diagnosed { background-color: #6EE7B7; color: #065F46; }

.metric-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2B82E3;
}

.insight-description {
  color: #4A5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: justify;
}

.insight-recommendations {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
}

.insight-recommendations h3 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.insight-recommendations ul {
  list-style-type: none;
  padding: 0;
}

.insight-recommendations li {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 0.75rem;
  color: #4A5568;
}

.insight-recommendations li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2B82E3;
  font-weight: bold;
  font-size: 1.5rem;
  line-height: 1;
}

.lifestyle-factors {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.factor {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f1f5f9;
  border-radius: 8px;
}

.factor-label {
  font-weight: 600;
  color: #2c3e50;
}

.loading-state, .error-state, .no-data-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #2B82E3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn, .update-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #2B82E3;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.retry-btn:hover, .update-btn:hover {
  background-color: #1E6CB3;
}

.no-data-state p {
  color: #4A5568;
  margin-bottom: 1rem;
}

.additional-metrics .metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.metric-item {
  background-color: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.metric-item .metric-label {
  display: block;
  color: #4A5568;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.metric-item .metric-value {
  font-size: 1.5rem;
  color: #2B82E3;
}
</style>

