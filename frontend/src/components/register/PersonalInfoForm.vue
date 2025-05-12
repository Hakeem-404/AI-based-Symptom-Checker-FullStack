// src/components/register/PersonalInfoForm.vue
<template>
  <form @submit.prevent="handleSubmit" class="personal-form">
    <h2 class="form-title" style="text-align: center;">Personal Information</h2>
    
    <div class="form-group inline">
      <label for="firstName">First Name*</label>
      <input 
        id="firstName"
        type="text" 
        v-model="form.firstName" 
        required
        class="input-field"
        placeholder="Your first name"
      >
      <span class="error-message" v-if="errors.firstName">{{ errors.firstName }}</span>
    </div>
    
    <div class="form-group inline">
      <label for="lastName">Last Name*</label>
      <input 
        id="lastName"
        type="text" 
        v-model="form.lastName" 
        required
        class="input-field"
        placeholder="Your last name"
      >
      <span class="error-message" v-if="errors.lastName">{{ errors.lastName }}</span>
    </div>
    
    <div class="form-group inline">
      <label for="dob">Date of Birth</label>
      <input 
        id="dob"
        type="date" 
        v-model="form.dob"
        @change="calculateAge"
        class="input-field"
      >
    </div>
    
    <div class="form-group inline">
      <label for="age">Age</label>
      <input 
        id="age"
        type="number" 
        v-model="form.age" 
        readonly
        class="input-field read-only"
      >
    </div>
    
    <div class="form-group inline">
      <label for="gender">Gender</label>
      <select 
        id="gender"
        v-model="form.gender" 
        class="input-field"
      >
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>

      </select>
    </div>
    
    <div class="form-group inline">
      <label for="phone">Phone Number</label>
      <input 
        id="phone"
        type="tel" 
        v-model="form.phone"
        class="input-field"
        placeholder="Your phone number"
      >
    </div>
    
    <div class="form-group inline">
      <label for="country">Country</label>
      <input 
        id="country"
        type="text" 
        v-model="form.country"
        class="input-field"
        placeholder="Your country"
      >
    </div>
    
    <div class="form-group inline">
      <label for="address">Address</label>
      <textarea 
        id="address"
        v-model="form.address"
        class="input-field"
        rows="3"
        placeholder="Your address"
      ></textarea>
    </div>
    
    <slot name="buttons">
      <div class="form-actions">
        <button type="submit" class="btn-primary">Next</button>
      </div>
    </slot>
  </form>
</template>

<script>
import { reactive, computed } from 'vue'

export default {
  name: 'PersonalInfoForm',
  props: {
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['submit'],
  
  setup(props, { emit }) {
    const form = reactive({
      firstName: props.initialData?.firstName || '',
      lastName: props.initialData?.lastName || '',
      dob: props.initialData?.dob || '',
      age: props.initialData?.age || '',
      gender: props.initialData?.gender || '',
      phone: props.initialData?.phone || '',
      country: props.initialData?.country || '',
      address: props.initialData?.address || ''
    })
    
    const errors = reactive({
      firstName: '',
      lastName: ''
    })
    
    const calculateAge = () => {
      if (form.dob) {
        const birthDate = new Date(form.dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        
        form.age = age
      } else {
        form.age = ''
      }
    }
    
    const validateForm = () => {
      let isValid = true
      errors.firstName = ''
      errors.lastName = ''
      
      if (!form.firstName.trim()) {
        errors.firstName = 'First name is required'
        isValid = false
      }
      
      if (!form.lastName.trim()) {
        errors.lastName = 'Last name is required'
        isValid = false
      }
      
      return isValid
    }
    
    const handleSubmit = () => {
      if (validateForm()) {
        emit('submit', { ...form })
      }
    }
    
    // Calculate age on initial load if DOB is provided
    if (form.dob) {
      calculateAge()
    }
    
    return {
      form,
      errors,
      calculateAge,
      handleSubmit
    }
  }
}
</script>