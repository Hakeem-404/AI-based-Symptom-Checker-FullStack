// src/components/profile/HealthMetricsForm.vue
<template>
  <form @submit.prevent="$emit('submit', metrics)" class="metrics-form">
    <h2 style="text-align: center; font-weight: bold; font-size: 2em; margin-bottom: 1em;">Health Metrics Information</h2>
    <div class="form-group inline">
      <label>Height (cm)</label>
      <input 
        v-model.number="metrics.height" 
        type="number" 
        :readonly="readonly"
        @input="calculateBMI"
        class="input-field"
        placeholder="Your height in cm"
        min="50"
        max="250"
      >
    </div>

    <div class="form-group inline">
      <label>Weight (kg)</label>
      <input 
        v-model.number="metrics.weight" 
        type="number" 
        :readonly="readonly"
        @input="calculateBMI"
        class="input-field"
        placeholder="Your weight in kg"
        min="20"
        max="300"
      >
    </div>

    <div class="form-group inline">
      <label>BMI</label>
      <input 
        :value="bmi"
        type="text" 
        readonly
        class="input-field"
      >
    </div>

    <div class="form-group inline">
      <label>Blood Pressure (mmHg)</label>
      <input 
        v-model="metrics.blood_pressure" 
        type="text" 
        :readonly="readonly"
        placeholder="e.g. 120/80"
        class="input-field"
      >
    </div>

    <div class="form-group inline">
      <label>Heart Rate (bpm)</label>
      <input 
        v-model.number="metrics.heart_rate" 
        type="number" 
        :readonly="readonly"
        class="input-field"
        placeholder="Your heart rate in bpm"
        min="30"
        max="200"
      >
    </div>

    <div class="form-group inline">
      <label>Maximum Heart Rate (bpm)</label>
      <input 
        v-model.number="metrics.max_heart_rate"
        type="number"
        :readonly="readonly"
        class="input-field"
        placeholder="Your maximum heart rate in bpm"
        min="60"
        max="220"
      >
    </div>

    <div class="form-group inline">
      <label>Skin Thickness (mm)</label>
      <input 
        v-model.number="metrics.skin_thickness"
        type="number"
        :readonly="readonly"
        step="0.1"
        class="input-field"
        placeholder="Your skin thickness in mm"
      >
    </div>

    <div class="form-group inline">
      <label>Glucose Level (mg/dL)</label>
      <input 
        v-model.number="metrics.glucose"
        type="number"
        :readonly="readonly"
        class="input-field"
        placeholder="Your glucose level"
      >
    </div>

    <div class="form-group inline">
      <label>Cholesterol Level (mg/dL)</label>
      <input 
        v-model.number="metrics.cholesterol"
        type="number"
        :readonly="readonly"
        class="input-field"
        placeholder="Your cholesterol level"
      >
    </div>

    <slot name="buttons"></slot>
  </form>
</template>

<script>
export default {
  name: 'HealthMetricsForm',
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
      metrics: {
        height: '',
        weight: '',
        bmi: '',
        blood_pressure: '',
        heart_rate: '',
        max_heart_rate: '',
        skin_thickness: '',
        glucose: '',
        cholesterol: ''
      }
    }
  },
  computed: {
    bmi() {
      if (!this.metrics.height || !this.metrics.weight) return '';
      const heightInMeters = this.metrics.height / 100;
      const calculatedBMI = (this.metrics.weight / (heightInMeters * heightInMeters)).toFixed(1);
      this.metrics.bmi = calculatedBMI;
      return calculatedBMI;
    }
  },
  methods: {
    calculateBMI() {
      // This method exists to maintain the @input binding
      // The actual calculation is done in the computed property
    }
  },
  watch: {
    initialData: {
      handler(newData) {
        console.log('Initial metrics data received:', newData);
        this.metrics = { ...newData };
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    if (this.initialData) {
      this.metrics = { ...this.initialData };
    }
  },
  emits: ['submit']
}
</script>

<style scoped>
input[readonly] {
  cursor: not-allowed;
}
</style>