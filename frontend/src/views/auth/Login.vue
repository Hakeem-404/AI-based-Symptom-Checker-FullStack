// src/views/auth/Login.vue
<template>
  <h2 class="text-center pt-4 font-medium">Welcome Back</h2>
  <div class="auth-page">
    <div class="auth-content">
      <div class="auth-container">
        <form @submit.prevent="handleLogin">
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
          <div class="forgot-password">
            <router-link to="/forgotpassword">Forgot password?</router-link>
          </div>
          <button 
            type="submit" 
            class="submit-btn" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Log in' }}
          </button>
          <div v-if="error" class="error-alert">
            {{ error }}
          </div>
        </form>
      </div>
      <div class="auth-alternative">
        <p>Don't have an account?</p>
        <router-link to="/register" class="signup-btn1">Sign up</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { authService } from '@/services/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const isLoading = ref(false)
    const error = ref(null)
    const form = reactive({
      email: '',
      password: ''
    })
    const errors = reactive({
      email: '',
      password: ''
    })

    const validateForm = () => {
      let isValid = true
      errors.email = ''
      errors.password = ''

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

      return isValid
    }

    const handleLogin = async () => {
  try {
    const response = await authService.login(form.email, form.password);
    router.push('/home');
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed';
  }
}

    return {
      form,
      errors,
      error,
      isLoading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.auth-page {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: var(--shadow-md);
  background: #E5E5E5;
}

.auth-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auth-container {
  padding: 2rem;
  width: 60%;
}

.auth-alternative {
  width: 35%;
  padding-left: 2rem;
  border-left: 1px solid grey;
  text-align: center;
}

.signup-btn1 {
  color: black;
  text-decoration: none;
  padding: 0.5rem 1rem;
  width: 20rem; 
  display: inline-block; 
  text-align: center;
  font-weight: 500;
  background: #F0F2F5;
  border-radius: 12px;
  margin-top: 6rem;
}

.signup-btn1:hover {
  background: #2B82E3;
  color: white !important;
}

.submit-btn {
  background: #2B82E3;
  color: white;
  padding: 0.5rem 1rem;
  width: 40rem; 
  display: inline-block; 
  text-align: center;
  font-weight: 500;
  border-radius: 12px;
  margin-top: 1rem;
}

.submit-btn:hover {
  background: #F0F2F5;
  color: black !important;
  border-radius: 12px;
}

.input-field {
  border-radius: 12px;
  width: 40rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-alert {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
}
</style>