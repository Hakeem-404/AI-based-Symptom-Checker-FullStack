// src/views/Home.vue
<template>
  <div class="home">

    <!-- Profile Completion Banner (show if profile is incomplete) -->
    <div v-if="isProfileIncomplete" class="profile-completion-banner">
      <div class="banner-content">
        <div class="banner-text">
          <h3>Complete Your Profile</h3>
          <p>To get personalised health insights and recommendations, please complete your profile information.</p>
        </div>
        <router-link to="/profile/complete" class="complete-profile-btn">
          Complete Profile
        </router-link>
      </div>
    </div>
    
    <h1 class="text-left pl-2 pb-4 font-medium">Welcome, {{ userData.first_name || 'User'}}</h1>
    <main v-if="userData.metrics">
      <section class="insights-section">
        <div class="insights-container">
          <div class="user-image-container">
            <img src="../assets/profile.png" alt="Health app illustration" class="user-image">
          </div>
         
          <div class="health-insights">
            <h2>Health Insights</h2>
            <p class="user-info">Age: {{ userData.age }} years old</p>
            <p class="py-4">Based on your latest health stats. Remember these are AI generated insights and not professional medical advice.</p>
            <button class="learn-more-btn" @click="$router.push('/insights')">Get Insights</button>
          </div>
        </div>
      </section>

      <section class="metrics-grid mt-4">
        <div class="metric-card">
          <h3>Height</h3>
          <p>{{ userData.metrics.height || 'N/A' }} cm</p>
        </div>
        <div class="metric-card">
          <h3>Weight</h3>
          <p>{{ userData.metrics.weight || 'N/A' }} kg</p>
        </div>
        <div class="metric-card">
          <h3>BMI</h3>
          <p>{{ userData.metrics.bmi || 'N/A' }} kg/m²</p>
        </div>
        <div class="metric-card">
          <h3>Blood Pressure</h3>
          <p>{{ userData.metrics.blood_pressure || 'N/A' }} mmHg</p>
        </div>
        <div class="metric-card">
          <h3>Heart Rate</h3>
          <p>{{ userData.metrics.heart_rate || 'N/A' }} bpm</p>
        </div>
        <div class="metric-card">
          <h3>Max Heart Rate</h3>
          <p>{{ userData.metrics.max_heart_rate || 'N/A' }} bpm</p>
        </div>
        <div class="metric-card">
          <h3>Skin Thickness</h3>
          <p>{{ userData.metrics.skin_thickness || 'N/A' }} mm</p>
        </div>
        <div class="metric-card">
          <h3>Glucose Level</h3>
          <p>{{ userData.metrics.glucose || 'N/A' }} mg/dL</p>
        </div>
        <div class="metric-card">
          <h3>Cholesterol Level</h3>
          <p>{{ userData.metrics.cholesterol || 'N/A' }} mg/dL</p>
        </div>
        <div class="view-history" style="margin-top: 2rem;">
          <router-link to="/history" class="history-link">
            <button class="history-btn">
              View Health History
              <i class="fas fa-chart-line ml-2"></i>
            </button>
          </router-link>
        </div>
      </section>
    </main>
    <div v-else class="loading text-center py-8">
      Loading health metrics...
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { userService } from '@/services/user'
import { healthService } from '@/services/health'

export default {
  name: 'HomeView',
  setup() {
    const userData = ref({
      first_name: 'User',
      age: '',
      metrics: null
    })
    
    const isProfileIncomplete = ref(false)

    const checkProfileCompletion = (data) => {
      // Check if essential profile data is missing
      if (!data.first_name || !data.last_name || !data.dob) {
        return true;
      }
      return false;
    }

    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId')
        
        // Fetch user profile
        const userResponse = await userService.getUserProfile(userId)
        
        // Update user data
        userData.value = {
          first_name: userResponse.data.first_name || 'User',
          age: userResponse.data.age || '',
          metrics: null // Will be populated later
        }
        
        // Check if profile is incomplete
        isProfileIncomplete.value = checkProfileCompletion(userResponse.data)
        
        // Fetch health metrics only if we have a user profile
        try {
          const healthResponse = await healthService.getHealthMetrics(userId)
          userData.value.metrics = healthResponse.data || null
        } catch (healthError) {
          console.log('Health metrics not found, likely not set yet')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    onMounted(fetchUserData)

    return {
      userData,
      isProfileIncomplete
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.insights-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.insights-container {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.user-image {
  width: 200px;
  height: auto;
}

.health-insights {
  flex: 1;
}

.learn-more-btn {
  background: #2B82E3;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 500;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-card h3 {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.metric-card p {
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
}

.view-history {
  grid-column: span 4;
  text-align: center;
  padding-left: 1rem;
}

.view-history :hover {
  background-color: #F0F2F5;
  color: black;
}

/* incomplete profile banner */
.profile-completion-banner {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-text h3 {
  font-size: 1.25rem;
  color: #0369a1;
  margin-bottom: 0.5rem;
}

.banner-text p {
  color: #0c4a6e;
}

.complete-profile-btn {
  background-color: #0ea5e9;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
}

.complete-profile-btn:hover {
  background-color: #0284c7;
}
</style>