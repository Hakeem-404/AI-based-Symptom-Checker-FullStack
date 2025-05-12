<template>
  <h2 class="text-center pt-4 font-medium">Forgotten Password?</h2>
  <div class="auth-page">
    <div class="auth-content">
      <div class="auth-container">
        <form @submit.prevent="handlePasswordReset">
          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="form.email" 
              required 
              placeholder="Enter your email"
            >
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              v-model="form.password" 
              required 
              placeholder="Enter new password"
              minlength="6"
            >
          </div>
          <button 
            type="submit" 
            class="submit-btn" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Changing Password...' : 'Change Password' }}
          </button>
          
          <!-- Error message display -->
          <p v-if="errorMessage" class="text-red-500 mt-2">
            {{ errorMessage }}
          </p>
        </form>
      </div>
      <div class="auth-alternative">
        <p>Remember your password?</p>
        <router-link to="/login" class="login-btn1">Log in</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { authService } from '@/services/auth';

export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      isLoading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handlePasswordReset() {
      // Reset previous error
      this.errorMessage = '';
      this.isLoading = true;

      try {
        // Call the forgot password service
        const response = await authService.forgotPassword(
          this.form.email, 
          this.form.password
        );

        // Show success message and redirect
        this.$router.push('/login');
        // Optionally, you could use a toast or alert to show success
        alert('Password reset successful. Please log in.');
      } catch (error) {
        // Handle error
        this.errorMessage = error.response?.data?.error || 'Password reset failed';
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>