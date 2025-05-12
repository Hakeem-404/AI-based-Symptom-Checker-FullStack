// src/components/register/MedicalInfoForm.vue
<template>
  <form @submit.prevent="handleSubmit" class="medical-form">
    <h2 class="form-title" style="text-align: center;">Medical & Lifestyle Information</h2>
    
    <div class="section-header" style="font-weight: bold; font-size: 2em; margin-bottom: 1em;">Medical History</div>
    
    <div class="form-group inline">
      <label for="conditions">Medical Conditions</label>
      <textarea 
        id="conditions"
        v-model="form.conditions" 
        class="input-field"
        rows="3"
        placeholder="List any existing medical conditions"
      ></textarea>
    </div>
    
    <div class="form-group inline">
      <label for="medications">Current Medications</label>
      <textarea 
        id="medications"
        v-model="form.medications" 
        class="input-field"
        rows="3"
        placeholder="List current medications"
      ></textarea>
    </div>
    
    <div class="form-group inline">
      <label for="allergies">Allergies</label>
      <textarea 
        id="allergies"
        v-model="form.allergies" 
        class="input-field"
        rows="3"
        placeholder="List any allergies"
      ></textarea>
    </div>
    
    <div class="form-group inline">
      <label for="pregnancy">Pregnancy</label>
      <input
        id="pregnancy" 
        type="number" 
        v-model="form.pregnancy" 
        placeholder="Number of times pregnant"
        class="input-field"
        min="0"
        max="10"
      >
    </div>
    
    <div class="form-group inline">
      <label for="bloodType">Blood Type</label>
      <select
        id="bloodType"
        v-model="form.bloodType"
        class="input-field"
      >
        <option value="">Select blood type</option>
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
      </select>
    </div>
    
    <div class="form-group inline">
      <label for="hypertension">Previous Hypertension</label>
      <select
        id="hypertension"
        v-model="form.hypertension"
        class="input-field"
      >
        <option value="">Select option</option>
        <option :value="false">No</option>
        <option :value="true">Yes</option>
      </select>
    </div>
    
    <div class="form-group inline">
      <label for="chest_pain_type">Chest Pain Type</label>
      <select
        id="chest_pain_type"
        v-model="form.chest_pain_type"
        class="input-field"
      >
        <option value="">Select type</option>
        <option value="asymptomatic">Asymptomatic/None</option>
        <option value="typical angina">Typical Angina</option>
        <option value="atypical angina">Atypical Angina</option>
        <option value="non-anginal">Non-anginal Pain</option>
      </select>
    </div>
    
    <div class="section-header" style="font-weight: bold; font-size: 2em; margin-bottom: 1em;">Lifestyle Factors</div>
    
    <div class="form-group inline">
      <label for="smoking">Do you smoke?</label>
      <select
        id="smoking"
        v-model="form.smoking"
        class="input-field"
      >
        <option value="">Select option</option>
        <option :value="false">No</option>
        <option :value="true">Yes</option>
      </select>
    </div>
    
    <div class="form-group inline">
      <label for="alcoholConsumption">Alcohol Consumption</label>
      <select
        id="alcoholConsumption"
        v-model="form.alcoholConsumption"
        class="input-field"
      >
        <option value="">Select option</option>
        <option :value="false">No</option>
        <option :value="true">Yes</option>
      </select>
    </div>
    
    <div class="form-group inline">
      <label for="exerciseFrequency">Exercise Frequency</label>
      <select
        id="exerciseFrequency"
        v-model="form.exerciseFrequency"
        class="input-field"
      >
        <option value="">Select frequency</option>
        <option value="none">None</option>
        <option value="light">Light (1-2 days/week)</option>
        <option value="moderate">Moderate (3-4 days/week)</option>
        <option value="regular">Regular (5+ days/week)</option>
      </select>
    </div>
    
    <slot name="buttons">
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('back')">Back</button>
        <button type="submit" class="btn-primary">Complete Registration</button>
      </div>
    </slot>
  </form>
</template>

<script>
import { reactive } from 'vue'

export default {
  name: 'MedicalInfoForm',
  props: {
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['submit', 'back'],
  
  setup(props, { emit }) {
    const form = reactive({
      conditions: props.initialData?.conditions || '',
      medications: props.initialData?.medications || '',
      allergies: props.initialData?.allergies || '',
      pregnancy: props.initialData?.pregnancy || '',
      bloodType: props.initialData?.bloodType || '',
      hypertension: props.initialData?.hypertension === true,
      chest_pain_type: props.initialData?.chest_pain_type || 'asymptomatic',
      smoking: props.initialData?.smoking === true,
      alcoholConsumption: props.initialData?.alcoholConsumption === true,
      exerciseFrequency: props.initialData?.exerciseFrequency || ''
    })
    
    const handleSubmit = () => {
      emit('submit', { ...form })
    }
    
    return {
      form,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group.inline label {
  width: 25rem;
}


</style>