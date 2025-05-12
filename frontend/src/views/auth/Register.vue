// src/views/auth/Register.vue
<template>
  <div v-if="!registered">
    <h2 class="text-center pt-4 font-medium">Create Account</h2>
    <div class="auth-page">
      <div class="auth-content">
        <div class="auth-container">
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                v-model="form.email" 
                required 
                class="input-field"
              >
              <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input 
                type="password" 
                v-model="form.password" 
                required 
                class="input-field"
              >
              <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                v-model="form.confirmPassword" 
                required 
                class="input-field"
              >
              <span class="error-message" v-if="errors.confirmPassword">
                {{ errors.confirmPassword }}
              </span>
            </div>
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Creating account...' : 'Continue' }}
            </button>
            <div v-if="error" class="error-alert">
              {{ error }}
            </div>
          </form>
        </div>
        <div class="auth-alternative">
          <p>Already have an account?</p>
          <router-link to="/login" class="login-btn1">Log in</router-link>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="registered" class="confirmation">
    <section class="section">
      <div class="container">
        <div class="card-box">
          <h2>Account registration has been successful, {{ form.email }}</h2>
          <p class="py-4">Thank you for joining us. Please login to continue or complete your profile now</p>
          <p class="py-4">Note: To get the best experiences on this platform, please input/answer all required fields/questions.</p>
 
          <div class="button-group">
            <button class="login-btn" @click="$router.push('/login')">Login</button>
          </div>
        </div>
      </div>
    </section>
  </div>
  
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth'
import PersonalInfoForm from '@/components/register/PersonalInfoForm.vue'

export default {
  name: 'RegisterView',
  components: {
    PersonalInfoForm,
  },
  setup() {
    const router = useRouter()
    const isLoading = ref(false)
    const error = ref(null)
    const registered = ref(false)
    
    const form = reactive({
      email: '',
      password: '',
      confirmPassword: ''
    })
    
    const errors = reactive({
      email: '',
      password: '',
      confirmPassword: ''
    })

    const validateForm = () => {
      let isValid = true
      errors.email = ''
      errors.password = ''
      errors.confirmPassword = ''

      if (!form.email) {
        errors.email = 'Email is required'
        isValid = false
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = 'Please enter a valid email'
        isValid = false
      }

      if (!form.password) {
        errors.password = 'Password is required'
        isValid = false
      } else if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
        isValid = false
      }

      if (!form.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
        isValid = false
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
        isValid = false
      }

      return isValid
    }

    const handleRegister = async () => {
      if (!validateForm()) return

      isLoading.value = true
      error.value = null

      try {
        const response = await authService.register(form.email, form.password)
        registered.value = true
      } catch (err) {
        error.value = err.response?.data?.error || 'Registration failed. Please try again.'
      } finally {
        isLoading.value = false
      }
    
    }

    const handlePersonalInfoSubmit = async () =>{
      return
    }

    return {
      form,
      errors,
      error,
      isLoading,
      registered,
      handleRegister,
      handlePersonalInfoSubmit,
    }
  }
}
</script>

<style scoped>
.confirmation {
  margin: 0 auto;
  align-items: center;
}
</style>