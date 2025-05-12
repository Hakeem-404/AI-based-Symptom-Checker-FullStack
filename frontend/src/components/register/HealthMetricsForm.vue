// src/components/register/HealthMetricsForm.vue
<template>
  <form @submit.prevent="handleSubmit" class="metrics-form">
    <h2 class="form-title" style="text-align: center;">Health Metrics</h2>
    
    <div class="form-group inline">
      <label for="height">Height (cm)</label>
      <input 
        id="height"
        type="number" 
        v-model.number="form.height" 
        @input="calculateBMI"
        class="input-field"
        placeholder="Your height in cm"
        min="50"
        max="250"
      >
    </div>
    
    <div class="form-group inline">
      <label for="weight">Weight (kg)</label>
      <input 
        id="weight"
        type="number" 
        v-model.number="form.weight" 
        @input="calculateBMI"
        class="input-field"
        placeholder="Your weight in kg"
        min="20"
        max="300"
      >
    </div>
    
    <div class="form-group inline">
      <label for="bmi">BMI</label>
      <input 
        id="bmi"
        :value="bmi"
        type="text" 
        readonly
        class="input-field read-only"
      >
      <!-- <div class="bmi-category" v-if="bmiCategory">
        {{ bmiCategory }}
      </div> -->
    </div>
    
    <div class="form-group inline">
      <label for="blood_pressure">Blood Pressure (mmHg)</label>
      <input 
        id="blood_pressure"
        v-model="form.blood_pressure" 
        type="text" 
        placeholder="e.g. 120/80"
        class="input-field"
      >
    </div>
    
    <div class="form-group inline">
      <label for="heart_rate">Heart Rate (bpm)</label>
      <input 
        id="heart_rate"
        v-model.number="form.heart_rate" 
        type="number" 
        class="input-field"
        placeholder="Your resting heart rate"
        min="30"
        max="200"
      >
    </div>
    
    <div class="form-group inline">
      <label for="max_heart_rate">Max Heart Rate (bpm)</label>
      <input 
        id="max_heart_rate"
        v-model.number="form.max_heart_rate"
        type="number"
        class="input-field"
        placeholder="Your maximum heart rate"
        min="60"
        max="220"
      >
    </div>
    
    <div class="form-group inline">
      <label for="skin_thickness">Skin Thickness (mm)</label>
      <input 
        id="skin_thickness"
        v-model.number="form.skin_thickness"
        type="number"
        step="0.1"
        class="input-field"
        placeholder="Triceps skin fold thickness"
      >
    </div>
    
    <div class="form-group inline">
      <label for="glucose">Glucose Level (mg/dL)</label>
      <input 
        id="glucose"
        v-model.number="form.glucose"
        type="number"
        class="input-field"
        placeholder="Your glucose level in mg/dL"
      >
    </div>
    
    <div class="form-group inline">
      <label for="cholesterol">Cholesterol Level (mg/dL)</label>
      <input 
        id="cholesterol"
        v-model.number="form.cholesterol"
        type="number"
        class="input-field"
        placeholder="Your cholesterol level"
      >
    </div>
    
    <slot name="buttons">
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('back')">Back</button>
        <button type="submit" class="btn-primary">Next</button>
      </div>
    </slot>
  </form>
</template>

<script>
import { reactive, computed } from 'vue'

export default {
  name: 'HealthMetricsForm',
  props: {
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['submit', 'back'],
  
  setup(props, { emit }) {
    const form = reactive({
      height: props.initialData?.height || '',
      weight: props.initialData?.weight || '',
      bmi: props.initialData?.bmi || '',
      blood_pressure: props.initialData?.blood_pressure || '',
      heart_rate: props.initialData?.heart_rate || '',
      max_heart_rate: props.initialData?.max_heart_rate || '',
      skin_thickness: props.initialData?.skin_thickness || '',
      glucose: props.initialData?.glucose || '',
      cholesterol: props.initialData?.cholesterol || ''
    })
    
    const bmi = computed(() => {
      if (!form.height || !form.weight) return '';
      const heightInMeters = form.height / 100;
      const calculatedBMI = (form.weight / (heightInMeters * heightInMeters)).toFixed(1);
      form.bmi = calculatedBMI;
      return calculatedBMI;
    })
    
    // const bmiCategory = computed(() => {
    //   const bmiValue = parseFloat(bmi.value);
    //   if (!bmiValue) return '';
      
    //   if (bmiValue < 18.5) return 'Underweight';
    //   if (bmiValue < 25) return 'Normal weight';
    //   if (bmiValue < 30) return 'Overweight';
    //   return 'Obese';
    // })
    
    const calculateBMI = () => {
    }
    
    const handleSubmit = () => {
      // Log the form data to verify it's being processed
      console.log('Submitting health metrics form:', form);
      
      // Convert empty values to null to avoid issues with the backend
      const formattedData = {
        height: form.height || null,
        weight: form.weight || null,
        bmi: form.bmi || null,
        blood_pressure: form.blood_pressure || null,
        heart_rate: form.heart_rate || null,
        max_heart_rate: form.max_heart_rate || null,
        skin_thickness: form.skin_thickness || null,
        glucose: form.glucose || null,
        cholesterol: form.cholesterol || null
      };
      
      // Emit the submit event with the formatted data
      emit('submit', formattedData);
    }
    
    return {
      form,
      bmi,
      // bmiCategory,
      calculateBMI,
      handleSubmit
    }
  }
}
</script>