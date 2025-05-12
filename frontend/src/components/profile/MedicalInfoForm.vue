// src/components/profile/MedicalInfoForm.vue
<template>
  <form @submit.prevent="$emit('submit', medicalInfo)" class="medical-form">
    <h2 style="text-align: center; font-weight: bold; font-size: 2em; margin-bottom: 1em;">Medical & Lifestyle Information</h2>
    <div class="form-group inline">
      <label>Existing medical conditions</label>
      <textarea
        v-model="medicalInfo.conditions"
        rows="3"
        :readonly="readonly"
        class="input-field"
        placeholder="List any existing medical conditions"
      ></textarea>
    </div>

    <div class="form-group inline">
      <label>Current medications</label>
      <textarea
        v-model="medicalInfo.medications"
        rows="3"
        :readonly="readonly"
        class="input-field"
        placeholder="List current medications"
      ></textarea>
    </div>

    <div class="form-group inline">
      <label>Allergies</label>
      <textarea
        v-model="medicalInfo.allergies"
        rows="3"
        :readonly="readonly"
        class="input-field"
        placeholder="List any allergies"
      ></textarea>
    </div>

    <div class="form-group inline">
      <label>Pregnancy</label>
      <input
        v-if="readonly"
        v-model="medicalInfo.pregnancy"
        readonly
        class="input-field"
      >
      <input
        v-else
        type="number" 
        v-model="medicalInfo.pregnancy" 
        placeholder="Number of times pregnant"
        class="input-field"
        min="0"
        max="10"
      >
    </div>

    <div class="form-group inline">
      <label>Blood Type</label>
      <input
        v-if="readonly"
        v-model="medicalInfo.bloodType"
        readonly
        class="input-field"
      >
      <select
        v-else
        v-model="medicalInfo.bloodType"
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
      <label>Previosly had hypertension?</label>
      <input
        v-if="readonly"
        :value="medicalInfo.hypertension ? 'Yes' : 'No'"
        readonly
        class="input-field"
      >
      <select
        v-else
        v-model="medicalInfo.hypertension"
        class="input-field"
      >
        <option :value="false">No</option>
        <option :value="true">Yes</option>
      </select>
    </div>

    <div class="form-group inline">
      <label>Chest Pain Type</label>
      <input
        v-if="readonly"
        v-model="medicalInfo.chest_pain_type"
        readonly
        class="input-field"
      >
      <select
        v-else
        v-model="medicalInfo.chest_pain_type"
        class="input-field"
      >
        <option value="">Select type</option>
        <option value="asymptomatic">Asymptomatic/None</option>
        <option value="typical angina">Typical Angina</option>
        <option value="atypical angina">Atypical Angina</option>
        <option value="non-anginal">Non-anginal Pain</option>
      </select>
    </div>

    <div class="form-group inline">
      <label>Do you smoke?</label>
      <input
        v-if="readonly"
        :value="medicalInfo.smoking ? 'Yes' : 'No'"
        readonly
        class="input-field"
      >
      <select
        v-else
        v-model="medicalInfo.smoking"
        class="input-field"
      >
        <option :value="false">No</option>
        <option :value="true">Yes</option>
      </select>
    </div>

    <div class="form-group inline">
      <label>Do you consume alcohol?</label>
      <input
        v-if="readonly"
        :value="medicalInfo.alcoholConsumption ? 'Yes' : 'No'"
        readonly
        class="input-field"
      >
      <select
        v-else
        v-model="medicalInfo.alcoholConsumption"
        class="input-field"
      >
        <option :value="false">No</option>
        <option :value="true">Yes</option>
      </select>
    </div>

    <div class="form-group inline">
      <label>Exercise frequency</label>
      <input
        v-if="readonly"
        v-model="medicalInfo.exerciseFrequency"
        readonly
        class="input-field"
      >
      <select
        v-else
        v-model="medicalInfo.exerciseFrequency"
        class="input-field"
      >
        <option value="">Select frequency</option>
        <option value="none">None</option>
        <option value="light">Light (1-2 days/week)</option>
        <option value="moderate">Moderate (3-4 days/week)</option>
        <option value="regular">Regular (5+ days/week)</option>
      </select>
    </div>

    <slot name="buttons"></slot>
  </form>
</template>

<script>
export default {
  name: 'MedicalInfoForm',
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
      medicalInfo: {
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
      }
    }
  },
  watch: {
    initialData: {
      handler(newData) {
        console.log('Initial medical data received:', newData);
        // Ensure boolean values are properly set
        this.medicalInfo = {
          ...newData,
          hypertension: Boolean(newData.hypertension),
          smoking: Boolean(newData.smoking),
          alcoholConsumption: Boolean(newData.alcoholConsumption)
        };
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    if (this.initialData) {
      // Initialize with proper boolean conversion
      this.medicalInfo = {
        ...this.initialData,
        hypertension: Boolean(this.initialData.hypertension),
        smoking: Boolean(this.initialData.smoking),
        alcoholConsumption: Boolean(this.initialData.alcoholConsumption)
      };
    }
  },
  emits: ['submit']
}
</script>

<style scoped>
.form-group.inline label {
  width: 25rem;
}

input[readonly],
textarea[readonly] {
  cursor: not-allowed;
}
</style>