// src/views/profile/ProfileCompletion.vue
<template>
  <div class="profile-completion">
    <h1 class="page-title">Complete Your Profile</h1>
    
    <!-- Step Indicators -->
    <div class="step-indicators">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        :class="['step', { 'active': currentStep === index, 'completed': currentStep > index }]"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-label">{{ step.label }}</div>
      </div>
    </div>
    
    <!-- Forms -->
    <div class="completion-form">
      <!-- Personal Info Form -->
      <PersonalInfoForm 
        v-if="currentStep === 0" 
        :initial-data="registrationStore.personalInfo" 
        @submit="handlePersonalInfoSubmit"
      >
        <template #buttons>
          <div class="button-group">
            <button type="button" class="btn-secondary" @click="skipStep">Skip for Now</button>
            <button type="submit" class="btn-primary">Next</button>
          </div>
        </template>
      </PersonalInfoForm>
      
      <!-- Health Metrics Form -->
      <HealthMetricsForm 
        v-if="currentStep === 1" 
        :initial-data="registrationStore.healthMetrics" 
        @submit="handleHealthMetricsSubmit"
        @back="goBack"
      >
        <template #buttons>
          <div class="button-group">
            <button type="button" class="btn-secondary" @click="goBack">Back</button>
            <button type="button" class="btn-secondary" @click="skipStep">Skip for Now</button>
            <button type="submit" class="btn-primary">Next</button>
          </div>
        </template>
      </HealthMetricsForm>
      
      <!-- Medical Info Form -->
      <MedicalInfoForm 
        v-if="currentStep === 2" 
        :initial-data="registrationStore.medicalInfo" 
        @submit="handleMedicalInfoSubmit"
        @back="goBack"
      >
        <template #buttons>
          <div class="button-group">
            <button type="button" class="btn-secondary" @click="goBack">Back</button>
            <button type="button" class="btn-secondary" @click="skipStep">Skip for Now</button>
            <button type="submit" class="btn-primary">Finish</button>
          </div>
        </template>
      </MedicalInfoForm>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Import register components instead of profile components
import PersonalInfoForm from '@/components/register/PersonalInfoForm.vue'
import HealthMetricsForm from '@/components/register/HealthMetricsForm.vue'
import MedicalInfoForm from '@/components/register/MedicalInfoForm.vue'
import { userService } from '@/services/user'
import { healthService } from '@/services/health'
import { medicalService } from '@/services/medical'
import { registrationStore } from '@/store/registration'

export default {
  name: 'ProfileCompletion',
  components: {
    PersonalInfoForm,
    HealthMetricsForm,
    MedicalInfoForm
  },
  
  setup() {
    const router = useRouter()
    const isLoading = ref(true)
    const error = ref(null)
    const currentStep = ref(0) // Start with first step (0-indexed)
    
    const steps = [
      { label: 'Personal Information' },
      { label: 'Health Metrics' },
      { label: 'Medical History' }
    ]
    
    // Fetch existing user data and populate the registration store
    const fetchUserData = async () => {
      isLoading.value = true
      error.value = null
      
      try {
        const userId = localStorage.getItem('userId')
        console.log('Fetching profile completion data for userId:', userId)
        
        // Fetch user profile data
        try {
          const userResponse = await userService.getUserProfile(userId)
          console.log('User profile data:', userResponse.data)
          
          // Update personal info in store if available
          registrationStore.setPersonalInfo({
            firstName: userResponse.data.first_name || '',
            lastName: userResponse.data.last_name || '',
            dob: userResponse.data.dob ? new Date(userResponse.data.dob).toISOString().split('T')[0] : '',
            gender: userResponse.data.gender || '',
            country: userResponse.data.country || '',
            address: userResponse.data.address || '',
            phone: userResponse.data.phone_number || ''
          })
          console.log('Personal info set in store')
        } catch (err) {
          console.log('User profile not complete yet:', err.message)
        }
        
        // Fetch health metrics data
        try {
          const healthResponse = await healthService.getHealthMetrics(userId)
          console.log('Health metrics data:', healthResponse.data)
          
          if (healthResponse.data) {
            registrationStore.setHealthMetrics({
              height: healthResponse.data.height || '',
              weight: healthResponse.data.weight || '',
              bmi: healthResponse.data.bmi || '',
              blood_pressure: healthResponse.data.blood_pressure || '',
              heart_rate: healthResponse.data.heart_rate || '',
              max_heart_rate: healthResponse.data.max_heart_rate || '',
              skin_thickness: healthResponse.data.skin_thickness || '',
              glucose: healthResponse.data.glucose || '',
              cholesterol: healthResponse.data.cholesterol || ''
            })
            console.log('Health metrics set in store')
          }
        } catch (err) {
          console.log('Health metrics not found yet:', err.message)
        }
        
        // Fetch medical info data
        try {
          const medicalResponse = await medicalService.getMedicalInfo(userId)
          console.log('Medical info data:', medicalResponse.data)
          
          if (medicalResponse.data) {
            const medicalData = medicalResponse.data.medical || {};
            const lifestyleData = medicalResponse.data.lifestyle || {};
            
            registrationStore.setMedicalInfo({
              conditions: medicalData.conditions || '',
              medications: medicalData.medications || '',
              allergies: medicalData.allergies || '',
              bloodType: medicalData.blood_type || '',
              hypertension: medicalData.hypertension || false,
              chest_pain_type: medicalData.chest_pain_type || '',
              pregnancy: medicalData.pregnancy || '',
              lifestyle: {
                smoking: lifestyleData.smoking || false,
                alcoholConsumption: lifestyleData.alcohol_consumption || false,
                exerciseFrequency: lifestyleData.exercise_frequency || ''
              }
            })
            console.log('Medical info set in store')
          }
        } catch (err) {
          console.log('Medical info not found yet:', err.message)
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    // Handle form submissions using the store
    const handlePersonalInfoSubmit = async (data) => {
      try {
        const userId = localStorage.getItem('userId')
        console.log('Submitting personal info:', data)
        
        await userService.updateUserProfile(userId, {
          first_name: data.firstName,
          last_name: data.lastName,
          dob: data.dob,
          gender: data.gender,
          country: data.country,
          address: data.address,
          phone_number: data.phone
        })
        
        // Update registration store
        registrationStore.setPersonalInfo(data)
        console.log('Personal info updated successfully')
        
        // Move to next step
        currentStep.value++
      } catch (err) {
        console.error('Error saving personal info:', err)
        error.value = 'Failed to update personal information'
      }
    }
    
    const handleHealthMetricsSubmit = async (data) => {
      try {
        const userId = localStorage.getItem('userId')
        console.log('Submitting health metrics:', data)
        
        // Use addHealthMetrics for new users during profile completion
        await healthService.addHealthMetrics(userId, data)
        
        // Update registration store
        registrationStore.setHealthMetrics(data)
        console.log('Health metrics added successfully')
        
        // Move to next step
        currentStep.value++
      } catch (err) {
        console.error('Error saving health metrics:', err)
        error.value = 'Failed to add health metrics'
      }
    }
    
    const handleMedicalInfoSubmit = async (data) => {
      try {
        const userId = localStorage.getItem('userId');
        console.log('Received medical data in completion:', data);
        
        const formattedData = {
          conditions: data.conditions || '',
          medications: data.medications || '',
          allergies: data.allergies || '',
          bloodType: data.bloodType || '',
          hypertension: data.hypertension || false,
          chest_pain_type: data.chest_pain_type || '',
          pregnancy: data.pregnancy || '',
          lifestyle: {
            smoking: data.smoking || false,
            alcoholConsumption: data.alcoholConsumption || false,
            exerciseFrequency: data.exerciseFrequency || 'none'
          }
        };
        
        console.log('Formatted medical data:', formattedData);
        await medicalService.addMedicalInfo(userId, formattedData);
        
        // Update registration store
        registrationStore.setMedicalInfo(formattedData);
        
        // Reset the store's step counter for future use
        registrationStore.resetStore();
        
        // Redirect to home page
        router.push('/home');
      } catch (err) {
        console.error('Failed to add medical information:', err);
        error.value = 'Failed to add medical information';
      }
    };
    
    const goBack = () => {
      if (currentStep.value > 0) {
        currentStep.value--;
      }
    }
    
    const skipStep = () => {
      if (currentStep.value < steps.length - 1) {
        currentStep.value++;
      } else {
        // If on last step, redirect to home
        router.push('/home')
      }
    }
    
    onMounted(() => {
      // Reset store before initializing
      registrationStore.resetStore()
      // Then fetch data
      fetchUserData()
    })
    
    return {
      currentStep,
      steps,
      isLoading,
      error,
      registrationStore,
      handlePersonalInfoSubmit,
      handleHealthMetricsSubmit,
      handleMedicalInfoSubmit,
      goBack,
      skipStep
    }
  }
}
</script>

<style scoped>
.profile-completion {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.step-indicators {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 0 2rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step::before {
  content: '';
  position: absolute;
  top: 15px;
  width: 100%;
  height: 2px;
  background-color: #e5e7eb;
  left: -50%;
  z-index: 1;
}

.step:first-child::before {
  display: none;
}

.step.active .step-number,
.step.completed .step-number {
  background-color: #2B82E3;
  color: white;
}

.step.completed::before {
  background-color: #2B82E3;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #f3f4f6;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  z-index: 2;
}

.step-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.completion-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  min-width: 100px;
}

.btn-primary {
  background-color: #2B82E3;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}
</style>