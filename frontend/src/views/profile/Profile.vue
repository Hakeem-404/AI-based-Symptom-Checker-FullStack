// src/views/profile/Profile.vue
<template>
  <div class="profile-page1">
    <div class="profile-container">
      <!-- Profile Navigation -->
      <div class="profile-nav">
        <button class="btn-primary" @click="navigateToHome" style="margin-top: 1em; margin-bottom: 1em;">
          Home
        </button>
        <a
          v-for="section in sections"
          :key="section.id"
          :class="[
            'nav-item',
            { active: activeSection === section.id }
          ]"
          @click="activeSection = section.id"
          href="#"
        >
          {{ section.name }}
        </a>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loader"></div>
        <p>Loading profile data...</p>
      </div>

      <!-- Error State -->
      <!-- <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchUserData" class="btn-primary">
          Try Again
        </button>
      </div> -->

      <!-- Profile Forms -->
      <div class="profile-form">
        <!-- Personal Information Section -->
        <PersonalInfoForm
          v-if="activeSection === 'personal'"
          :initial-data="userData.personal"
          :readonly="!isEditing"
          @submit="savePersonalInfo"
        >
          <template #buttons>
            <div class="button-group">
              <button 
                v-if="!isEditing" 
                type="button" 
                class="btn-primary" 
                @click="startEditing"
              >
                Edit Profile
              </button>
              <template v-else>
                <div class="button-group1">
                  <button 
                    type="button" 
                    class="btn-secondary" 
                    @click="cancelEditing"
                  >
                    Cancel
                  </button>
                  <button type="submit" class="btn-primary">
                    Save Changes
                  </button>
                </div>
              </template>
            </div>
          </template>
        </PersonalInfoForm>

        <!-- Health Metrics Section -->
        <HealthMetricsForm
          v-if="activeSection === 'metrics'"
          :initial-data="userData.metrics"
          :readonly="!isEditing"
          @submit="saveHealthMetrics"
        >
          <template #buttons>
            <div class="button-group">
              <button 
                v-if="!isEditing" 
                type="button" 
                class="btn-primary" 
                @click="startEditing"
              >
                Edit Metrics
              </button>
              <template v-else>
                <div class="button-group1">
                  <button 
                    type="button" 
                    class="btn-secondary" 
                    @click="cancelEditing"
                  >
                    Cancel
                  </button>
                  <button type="submit" class="btn-primary">
                    Save Changes
                  </button>
                </div>
              </template>
            </div>
          </template>
        </HealthMetricsForm>

        <!-- Medical Information Section -->
        <MedicalInfoForm
          v-if="activeSection === 'medical'"
          :initial-data="userData.medical"
          :readonly="!isEditing"
          @submit="saveMedicalInfo"
        >
          <template #buttons>
            <div class="button-group">
              <button 
                v-if="!isEditing" 
                type="button" 
                class="btn-primary" 
                @click="startEditing"
              >
                Edit Medical Info
              </button>
              <template v-else>
                <div class="button-group1">
                  <button 
                    type="button" 
                    class="btn-secondary" 
                    @click="cancelEditing"
                  >
                    Cancel
                  </button>
                  <button type="submit" class="btn-primary">
                    Save Changes
                  </button>
                </div>
              </template>
            </div>
          </template>
        </MedicalInfoForm>

        <!-- Account Settings Section -->
        <AccountSettingForm
          v-if="activeSection === 'account'"
          :initial-data="userData.account"
          @update-password="handleUpdatePassword"
          @delete-account="handleDeleteAccount"
        >
          <template #buttons>
            <div v-if="accountError" class="error-message">
              {{ accountError }}
            </div>
          </template>
        </AccountSettingForm>
      </div>

      <!-- Success Message Toast -->
      <div 
        v-if="showSuccessMessage" 
        class="success-toast"
        @click="showSuccessMessage = false"
      >
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import PersonalInfoForm from '@/components/profile/PersonalInfoForm.vue'
import HealthMetricsForm from '@/components/profile/HealthMetricsForm.vue'
import MedicalInfoForm from '@/components/profile/MedicalInfoForm.vue'
import AccountSettingForm from '@/components/profile/AccountSettingForm.vue'
import { userService } from '@/services/user'
import { healthService } from '@/services/health'
import { medicalService } from '@/services/medical'

export default {
  name: 'ProfileView',
  components: {
    PersonalInfoForm,
    HealthMetricsForm,
    MedicalInfoForm,
    AccountSettingForm
  },

  setup() {
    const router = useRouter()
    const activeSection = ref('personal')
    const isEditing = ref(false)
    const isLoading = ref(true)
    const error = ref(null)
    const accountError = ref(null)
    const showSuccessMessage = ref(false)
    const successMessage = ref('')
    
    const sections = [
      { id: 'personal', name: 'Personal Information' },
      { id: 'metrics', name: 'Health Metrics' },
      { id: 'medical', name: 'Medical History & Lifestyle' },
      { id: 'account', name: 'Account Settings' }
    ]

    const userData = ref({
      personal: {
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        country: '',
        address: '',
        phoneNumber: ''
      },
      metrics: {
        height: '',
        weight: '',
        bmi: '',
        bloodPressure: '',
        heartRate: '',
        max_heart_rate: '',
        skin_thickness: '',
        glucose: '',
        cholesterol: ''
      },
      medical: {
        conditions: '',
        medications: '',
        allergies: '',
        pregnancy: '', 
        bloodType: '',
        hypertension: false,
        chest_pain_type: '',
        smoking: false,
        alcoholConsumption: false,
        exerciseFrequency: ''
      },
      account: {
        email: ''
      }
    })

    const showSuccess = (message) => {
      successMessage.value = message
      showSuccessMessage.value = true
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 3000)
    }

    const fetchUserData = async () => {
      isLoading.value = true
      error.value = null
      try {
        const userId = localStorage.getItem('userId')
        console.log('Fetching data for userId:', userId)

        const [userResponse, healthResponse, medicalResponse] = await Promise.all([
          userService.getUserProfile(userId),
          healthService.getHealthMetrics(userId),
          medicalService.getMedicalInfo(userId)
        ])

        // Update personal info
        userData.value.personal = {
          firstName: userResponse.data.first_name || '',
          lastName: userResponse.data.last_name || '',
          dob: userResponse.data.dob ? new Date(userResponse.data.dob).toISOString().split('T')[0] : '',
          gender: userResponse.data.gender || '',
          country: userResponse.data.country || '',
          address: userResponse.data.address || '',
          phoneNumber: userResponse.data.phone_number || ''
        }

        // Update account info
        userData.value.account = {
          email: userResponse.data.email || ''
        }

        console.log('Health Response:', healthResponse);  // Debug log

        // Update health metrics
        userData.value.metrics = {
          height: healthResponse.data.height || '',
          weight: healthResponse.data.weight || '',
          bmi: healthResponse.data.bmi || '',
          blood_pressure: healthResponse.data.blood_pressure || '',
          heart_rate: healthResponse.data.heart_rate || '',
          max_heart_rate: healthResponse.data.max_heart_rate || '',
          skin_thickness: healthResponse.data.skin_thickness || '',
          glucose: healthResponse.data.glucose || '',
          cholesterol: healthResponse.data.cholesterol || ''
        };

        console.log('Processed metrics:', userData.value.metrics);  // Debug log

        // Update medical info
        const medicalData = medicalResponse.data.medical || {};
        const lifestyleData = medicalResponse.data.lifestyle || {};

        userData.value.medical = {
          conditions: medicalData.conditions || '',
          medications: medicalData.medications || '',
          allergies: medicalData.allergies || '',
          pregnancy: medicalData.pregnancy || '', 
          bloodType: medicalData.blood_type || '',
          hypertension: medicalData.hypertension || false, 
          chest_pain_type: medicalData.chest_pain_type || '',
          smoking: lifestyleData.smoking || false,
          alcoholConsumption: lifestyleData.alcohol_consumption || false,
          exerciseFrequency: lifestyleData.exercise_frequency || ''
        };
        } catch (err) {
        console.error('Error fetching user data:', err)
        error.value = 'Failed to load profile data. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    const startEditing = () => {
      isEditing.value = true
    }

    const cancelEditing = () => {
      isEditing.value = false
      fetchUserData()
    }

    const navigateToHome = () => {
      router.push('/home')
    }

    const savePersonalInfo = async (data) => {
      try {
        const userId = localStorage.getItem('userId')
        await userService.updateUserProfile(userId, {
          first_name: data.firstName,
          last_name: data.lastName,
          dob: data.dob,
          age: data.age,
          gender: data.gender,
          country: data.country,
          address: data.address,
          phone_number: data.phoneNumber
        })
        
        isEditing.value = false
        showSuccess('Personal information updated successfully')
        await fetchUserData()
      } catch (err) {
        error.value = 'Failed to update personal information'
        console.error('Error saving personal info:', err)
      }
    }

    const saveHealthMetrics = async (data) => {
      try {
          const userId = localStorage.getItem('userId');
          const response = await healthService.updateHealthMetrics(userId, {
              height: data.height || null,
              weight: data.weight || null,
              bmi: data.bmi || null,
              blood_pressure: data.blood_pressure || null,
              heart_rate: data.heart_rate || null,
              max_heart_rate: data.max_heart_rate || null,
              skin_thickness: data.skin_thickness || null,
              glucose: data.glucose || null,
              cholesterol: data.cholesterol || null
          });
          
          // Update local data with response
          if (response.data) {
              userData.value.metrics = response.data.data;
          }
          
          isEditing.value = false;
          showSuccess('Health metrics updated successfully');
          await fetchUserData();
      } catch (err) {
          error.value = 'Failed to update health metrics';
          console.error('Error saving health metrics:', err);
      }
    };

    const saveMedicalInfo = async (data) => {
      try {
        const userId = localStorage.getItem('userId');
        console.log('Submitting medical data:', data); // Debug log

        const formattedData = {
          medical: {
            conditions: data.conditions || null,
            medications: data.medications || null,
            allergies: data.allergies || null,
            bloodType: data.bloodType || null,
            hypertension: data.hypertension === true,
            chest_pain_type: data.chest_pain_type || null,
            pregnancy: data.pregnancy || null
          },
          lifestyle: {
            smoking: data.smoking === true,
            alcoholConsumption: data.alcoholConsumption === true,
            exerciseFrequency: data.exerciseFrequency || 'none'
          }
        };

        console.log('Formatted data to send:', formattedData); // Debug log

        const response = await medicalService.updateMedicalInfo(userId, formattedData);
        console.log('Server response:', response); // Debug log
        

        isEditing.value = false;
        showSuccess('Medical information updated successfully');
        await fetchUserData();
      } catch (err) {
        error.value = 'Failed to update medical information';
        console.error('Error saving medical info:', err);
      }
    };

    const handleUpdatePassword = async (passwordData) => {
      try {
        accountError.value = null
        const userId = localStorage.getItem('userId')
        console.log('Updating password:', { userId })
        
        const response = await userService.updatePassword(userId, {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })

        showSuccess('Password updated successfully')
      } catch (err) {
        console.error('Password update error:', err.response?.data || err)
        accountError.value = err.response?.data?.error || 'Failed to update password'
        throw err
      }
    }

  const handleDeleteAccount = async (password) => {
    try {
        accountError.value = null;
        const userId = localStorage.getItem('userId');
        
        await userService.deleteAccount(userId, password);
        
        // Clear user data and redirect only after successful deletion
        localStorage.clear();
        router.push('/');
    } catch (err) {
        console.error('Error deleting account:', err);
        accountError.value = err.response?.data?.error || 'Failed to delete account';
        return
        // throw err;
    }
  }

    // Watch for section changes
    watch(activeSection, () => {
      isEditing.value = false
      error.value = null
      accountError.value = null
    })

    // Fetch data when component mounts
    onMounted(fetchUserData)

    return {
      activeSection,
      isEditing,
      isLoading,
      error,
      accountError,
      sections,
      userData,
      showSuccessMessage,
      successMessage,
      startEditing,
      cancelEditing,
      savePersonalInfo,
      saveHealthMetrics,
      saveMedicalInfo,
      handleUpdatePassword,
      handleDeleteAccount,
      fetchUserData,
      navigateToHome
    }
  }
}
</script>


<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #666;
  gap: 1rem;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2B82E3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.button-group1 {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.button-group1 button {
  width: 48%;
  padding: 1rem;
  border-radius: 12px;
}

.button-group1 button:hover, .button-group button:hover {
  background-color: #F0F2F5;
  color: black;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

</style>