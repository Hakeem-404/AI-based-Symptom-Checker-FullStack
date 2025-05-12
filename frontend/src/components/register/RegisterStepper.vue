// src/components/register/RegisterStepper.vue
<template>
  <div class="stepper">
    <div class="stepper-header">
      <div 
        v-for="step in steps" 
        :key="step.id"
        :class="['step', { 'active': currentStep >= step.id }]"
      >
        <div class="step-number">{{ step.id }}</div>
        <div class="step-label">{{ step.label }}</div>
      </div>
    </div>
    <div class="stepper-content">
      <component 
        :is="currentComponent" 
        @next="handleNext"
        @back="handleBack"
      />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { registrationStore } from '@/store/registration'
import PersonalInfoForm from './PersonalInfoForm.vue'
import HealthMetricsForm from './HealthMetricsForm.vue'
import MedicalInfoForm from './MedicalInfoForm.vue'

export default {
  name: 'RegisterStepper',
  setup() {
    const steps = [
      { id: 1, label: 'Personal Information', component: PersonalInfoForm },
      { id: 2, label: 'Health Metrics', component: HealthMetricsForm },
      { id: 3, label: 'Medical History', component: MedicalInfoForm }
    ]

    const currentStep = computed(() => registrationStore.currentStep)
    const currentComponent = computed(() => 
      steps.find(s => s.id === currentStep.value)?.component
    )

    const handleNext = async (data) => {
      if (currentStep.value === 1) registrationStore.setPersonalInfo(data)
      else if (currentStep.value === 2) registrationStore.setHealthMetrics(data)
      else if (currentStep.value === 3) {
        registrationStore.setMedicalInfo(data)
        await registrationStore.submitAllData()
        // Navigate to home or success page
      }
    }

    const handleBack = () => {
      if (currentStep.value > 1) {
        registrationStore.currentStep--
      }
    }

    return {
      steps,
      currentStep,
      currentComponent,
      handleNext,
      handleBack
    }
  }
}
</script>

<style scoped>
.stepper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.stepper-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #2B82E3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step.active .step-number {
  background: #1d4ed8;
}
</style>