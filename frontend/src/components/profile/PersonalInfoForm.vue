// src/components/profile/PersonalInfoForm.vue
<template>
  <form @submit.prevent="$emit('submit', personalInfo)" class="personal-form">
    <h2 style="text-align: center; font-weight: bold; font-size: 2em; margin-bottom: 1em;">Personal Information</h2>
    <div class="form-group inline">
      <label>First name</label>
      <input 
        v-model="personalInfo.firstName" 
        :readonly="readonly"
        class="input-field"
      >
    </div>

    <div class="form-group inline">
      <label>Last name</label>
      <input 
        v-model="personalInfo.lastName" 
        :readonly="readonly"
        class="input-field"
      >
    </div>

    <div class="form-group inline">
      <label>Date of Birth</label>
      <input 
        type="date" 
        v-model="personalInfo.dob" 
        :readonly="readonly"
        @change="calculateAge"
        class="input-field"
      >
    </div>

    <div class="form-group inline">
      <label>Age</label>
      <input 
        v-model="personalInfo.age"
        type="number"
        readonly
        class="input-field read-only"
      >
    </div>

    <div class="form-group inline">
      <label>Gender</label>
      <input 
        v-if="readonly"
        v-model="personalInfo.gender" 
        readonly
        class="input-field"
      >
      <select 
        v-else
        v-model="personalInfo.gender" 
        class="input-field"
      >
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>

      </select>
    </div>

    <div class="form-group inline">
      <label>Country</label>
      <input 
        v-model="personalInfo.country" 
        :readonly="readonly"
        class="input-field"
      >
    </div>

    <div class="form-group inline">
      <label>Address</label>
      <textarea 
        v-model="personalInfo.address" 
        rows="3" 
        :readonly="readonly"
        class="input-field"
      ></textarea>
    </div>

    <div class="form-group inline">
      <label>Phone Number</label>
      <input 
        v-model="personalInfo.phoneNumber" 
        :readonly="readonly"
        class="input-field"
      >
    </div>

    <slot name="buttons"></slot>
  </form>
</template>

<script>
export default {
  name: 'PersonalInfoForm',
  props: {
    initialData: {
      type: Object,
      default: () => ({})
    },
    readonly: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      personalInfo: {
        firstName: '',
        lastName: '',
        dob: '',
        age: '',
        gender: '',
        country: '',
        address: '',
        phoneNumber: ''
      }
    }
  },
  methods: {
    calculateAge() {
      if (this.personalInfo.dob) {
        const birthDate = new Date(this.personalInfo.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        this.personalInfo.age = age;
      } else {
        this.personalInfo.age = '';
      }
    }
  },
  watch: {
    initialData: {
      handler(newData) {
        this.personalInfo = { ...newData };
        this.calculateAge();
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    if (this.initialData) {
      this.personalInfo = { ...this.initialData };
      this.calculateAge();
    }
  },
  emits: ['submit']
}
</script>

<style scoped>
input[readonly],
textarea[readonly] {
  cursor: not-allowed;
}
</style>