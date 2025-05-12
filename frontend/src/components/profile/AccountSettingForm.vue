// src/components/profile/AccountSettingsForm.vue
<template>
  <h2 style="text-align:center; font-weight: bold; font-size: 2em; margin-bottom: 1em; padding-right: 8em;">Account Settings</h2>
  <form @submit.prevent="handleSubmit" class="account-form">
    <!-- Email Field -->
    <div class="form-group inline">
      <label>Email</label>
      <input 
        v-model="account.email" 
        type="email" 
        :readonly="true"
        class="input-field"
      >
    </div>
    
    <!-- Password Change Section -->
    <div v-if="isChangingPassword" class="password-section">
      <div class="form-group inline">
        <label>Current Password</label>
        <input 
          v-model="account.currentPassword" 
          type="password" 
          class="input-field"
          :class="{ 'error': errors.currentPassword }"
        >
        <span class="error-message" v-if="errors.currentPassword">
          {{ errors.currentPassword }}
        </span>
      </div>
      
      <div class="form-group inline">
        <label>New Password</label>
        <input 
          v-model="account.newPassword" 
          type="password" 
          class="input-field"
          :class="{ 'error': errors.newPassword }"
        >
        <span class="error-message" v-if="errors.newPassword">
          {{ errors.newPassword }}
        </span>
      </div>
      
      <div class="form-group inline">
        <label>Confirm New Password</label>
        <input 
          v-model="account.confirmPassword" 
          type="password" 
          class="input-field"
          :class="{ 'error': errors.confirmPassword }"
        >
        <span class="error-message" v-if="errors.confirmPassword">
          {{ errors.confirmPassword }}
        </span>
      </div>

      <!-- Password Change Action Buttons -->
      <div class="button-group1">
        <button 
          type="button" 
          class="btn-secondary" 
          @click="cancelPasswordChange"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn-primary"
        >
          Save New Password
        </button>
      </div>
    </div>

    <!-- Main Action Buttons -->
    <div class="button-section" v-if="!isChangingPassword">
      <button 
        type="button" 
        class="btn-secondary" 
        @click="startPasswordChange"
      >
        Change Password
      </button>
      
      <button 
        type="button" 
        class="btn-danger" 
        @click="confirmDeleteAccount"
      >
        Delete Account
      </button>
    </div>

    <slot name="buttons"></slot>
  </form>

  <!-- Delete Account Modal -->
  <div v-if="showDeleteModal" class="modal">
    <div class="modal-content">
      <h3>Confirm Account Deletion</h3>
      <p>This action cannot be undone. Please enter your password to confirm.</p>
      
      <div class="form-group">
        <input 
          v-model="deleteConfirmPassword" 
          type="password" 
          placeholder="Enter your password"
          class="input-field"
        >
        <div class="error-message" v-if="deletePasswordError">
          {{ deletePasswordError }}
        </div>
      </div>

      <div class="modal-actions">
        <button @click="cancelDelete" class="btn-secondary">Cancel</button>
        <button @click="handleDelete" class="btn-danger">Delete Account</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AccountSettingsForm',
  
  emits: ['update-password', 'delete-account'],
  
  props: {
    initialData: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props, { emit }) {
    const router = useRouter()
    const isChangingPassword = ref(false)
    const showDeleteModal = ref(false)
    const deleteConfirmPassword = ref('')
    const deletePasswordError = ref('')

    const account = reactive({
      email: props.initialData.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const errors = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const validatePasswordChange = () => {
      let isValid = true
      errors.currentPassword = ''
      errors.newPassword = ''
      errors.confirmPassword = ''

      if (!account.currentPassword) {
        errors.currentPassword = 'Current password is required'
        isValid = false
      }

      if (!account.newPassword) {
        errors.newPassword = 'New password is required'
        isValid = false
      } else if (account.newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters'
        isValid = false
      }

      if (!account.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password'
        isValid = false
      } else if (account.newPassword !== account.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
        isValid = false
      }

      return isValid
    }

    const startPasswordChange = () => {
      isChangingPassword.value = true
      resetPasswordFields()
    }

    const handleSubmit = async (event) => {
      if (isChangingPassword.value) {
        if (!validatePasswordChange()) return

        try {
          await emit('update-password', {
            currentPassword: account.currentPassword,
            newPassword: account.newPassword
          })
          isChangingPassword.value = false
          resetPasswordFields()
        } catch (error) {
          console.error('Password update error:', error)
          errors.currentPassword = 'Failed to update password'
        }
      }
    }

    const cancelPasswordChange = () => {
      isChangingPassword.value = false
      resetPasswordFields()
    }

    const resetPasswordFields = () => {
      account.currentPassword = ''
      account.newPassword = ''
      account.confirmPassword = ''
      errors.currentPassword = ''
      errors.newPassword = ''
      errors.confirmPassword = ''
    }

    const confirmDeleteAccount = () => {
      showDeleteModal.value = true
    }

    const handleDelete = async () => {
      deletePasswordError.value = ''
      if (!deleteConfirmPassword.value) {
        deletePasswordError.value = 'Please enter your password to confirm account deletion.'
        return
      }
      
      try {
        await emit('delete-account', deleteConfirmPassword.value)
        showDeleteModal.value = false
      } catch (error) {
        deletePasswordError.value = error.message || 'Failed to delete account'
      }
    }

    const cancelDelete = () => {
      showDeleteModal.value = false
      deleteConfirmPassword.value = ''
    }

    return {
      account,
      errors,
      isChangingPassword,
      showDeleteModal,
      deleteConfirmPassword,
      handleSubmit,
      startPasswordChange,
      cancelPasswordChange,
      confirmDeleteAccount,
      handleDelete,
      cancelDelete,
      deletePasswordError
    }
  }
}
</script>

<style scoped>
.modal-actions, .button-group1, .button-section {
  display: flex;
  justify-content: space-between;
  margin-top: 1em;
  gap: 1em;
}
</style>