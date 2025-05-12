<template>

  <h2 class="text-center pt-4 font-medium" style="padding-top: 1rem;">Health Metrics History</h2>
  <div class="health-history">
    <div class="history-header">
      <div class="period-selector">
        <button class="btn-primary" @click="navigateToHome" style=" margin-bottom: 1em; ;">
          Go back Home
        </button>
        <button 
          v-for="option in periodOptions" 
          :key="option.value"
          :class="['period-btn', { active: selectedPeriod === option.value }]"
          @click="changePeriod(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="header-content">
        <div v-if="isLoading" class="loading-state">
          Loading history data...
        </div>
        <div v-else>
          <div class="charts-container">
            <!-- Detailed History Table (Top) -->
            <div class="history-table full-width">
              <h3>Detailed History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight (kg)</th>
                    <th>BMI</th>
                    <th>Blood Pressure</th>
                    <th>Heart Rate (bpm)</th>
                    <th>Max Heart Rate (bpm)</th>
                    <th>Skin Thickness (mm)</th>
                    <th>Glucose Level (mg/dL)</th>
                    <th>Cholesterol Level (mg/dL)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in historyData" :key="entry.id">
                    <td>{{ formatDate(entry.recorded_at) }}</td>
                    <td>{{ entry.weight }}</td>
                    <td>{{ entry.bmi }}</td>
                    <td>{{ entry.blood_pressure }}</td>
                    <td>{{ entry.heart_rate }}</td>
                    <td>{{ entry.max_heart_rate }}</td>
                    <td>{{ entry.skin_thickness }}</td>
                    <td>{{ entry.glucose }}</td>
                    <td>{{ entry.cholesterol }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Charts Grid -->
            <div class="charts-grid">
              <!-- Weight Chart -->
              <div class="chart-section">
                <h3>Weight History</h3>
                <Line
                  v-if="weightChartData.datasets[0].data.length > 0"
                  :data="weightChartData"
                  :options="chartOptions"
                />
                <div v-else class="no-data">No weight data available</div>
              </div>

              <!-- BMI Chart -->
              <div class="chart-section">
                <h3>BMI History</h3>
                <Line
                  v-if="bmiChartData.datasets[0].data.length > 0"
                  :data="bmiChartData"
                  :options="chartOptions"
                />
                <div v-else class="no-data">No BMI data available</div>
              </div>

              <!-- Blood Pressure Chart -->
              <div class="chart-section">
                <h3>Blood Pressure History</h3>
                <Line
                  v-if="bloodPressureChartData.datasets[0].data.length > 0"
                  :data="bloodPressureChartData"
                  :options="chartOptions"
                />
                <div v-else class="no-data">No blood pressure data available</div>
              </div>

              <!-- Heart Rate Chart -->
              <div class="chart-section">
                <h3>Heart Rate History</h3>
                <Line
                  v-if="heartRateChartData.datasets[0].data.length > 0"
                  :data="heartRateChartData"
                  :options="chartOptions"
                />
                <div v-else class="no-data">No heart rate data available</div>
              </div>

              <!-- Max Heart Rate Chart -->
              <div class="chart-section">
                <h3>Maximum Heart Rate History</h3>
                <Line
                  v-if="maxHeartRateChartData.datasets[0].data.length > 0"
                  :data="maxHeartRateChartData"
                  :options="chartOptions"
                />
                <div v-else class="no-data">No max heart rate data available</div>
              </div>

              <!-- Skin Thickness Chart -->
              <div class="chart-section">
                <h3>Skin Thickness History</h3>
                <Line
                  v-if="skinThicknessChartData.datasets[0].data.length > 0"
                  :data="skinThicknessChartData"
                  :options="chartOptions"
                />
                <div v-else class="no-data">No skin thickness data available</div>
              </div>

              <!-- Glucose Chart -->
              <div class="chart-section">
                <h3>Glucose Level History</h3>
                <Line
                  v-if="glucoseChartData.datasets[0].data.length > 0"
                  :data="glucoseChartData"
                  :options="chartOptions"
                />
                <div v-else class="no-data">No glucose data available</div>
              </div>

              <!-- Cholesterol Chart -->
              <div class="chart-section">
                <h3>Cholesterol Level History</h3>
                <Line
                  v-if="cholesterolChartData.datasets[0].data.length > 0"
                  :data="cholesterolChartData"
                  :options="chartOptions"
                />
                <div v-else class="no-data">No cholesterol data available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { healthHistoryService } from '@/services/healthHistory'
import { useRouter } from 'vue-router'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default {
  name: 'HealthHistory',
  components: {
    Line
  },
  setup() {
    const historyData = ref([])
    const selectedPeriod = ref('month')
    const isLoading = ref(true)
    const router = useRouter()

    const periodOptions = [
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
      { label: 'Year', value: 'year' },
      { label: 'All Time', value: 'all' }
    ]

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }

    const fetchHistory = async () => {
      isLoading.value = true
      try {
        const userId = localStorage.getItem('userId')
        console.log('Fetching history for userId:', userId);
        const response = await healthHistoryService.getHistory(userId, selectedPeriod.value)
        console.log('Raw history data:', response.data);
        historyData.value = response.data
        console.log('Processed chart data:', historyData.value);
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        isLoading.value = false
      }
    }

    const navigateToHome = () => {
      router.push('/home')
    }

    const changePeriod = (period) => {
      selectedPeriod.value = period
      fetchHistory()
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    // Chart data computations for all metrics
    const createChartData = (label, dataKey, color) => computed(() => ({
      labels: historyData.value.map(entry => formatDate(entry.recorded_at)),
      datasets: [{
        label: label,
        data: historyData.value.map(entry => entry[dataKey]),
        borderColor: color,
        backgroundColor: color.replace('1)', '0.1)'),
        tension: 0.4,
        fill: true
      }]
    }))

    const weightChartData = createChartData('Weight (kg)', 'weight', '#2B82E3')
    const bmiChartData = createChartData('BMI', 'bmi', '#10B981')
    const bloodPressureChartData = createChartData('Blood Pressure', 'blood_pressure', '#9333EA')
    const heartRateChartData = createChartData('Heart Rate (bpm)', 'heart_rate', '#EF4444')
    const maxHeartRateChartData = createChartData('Max Heart Rate (bpm)', 'max_heart_rate', '#F97316')
    const skinThicknessChartData = createChartData('Skin Thickness (mm)', 'skin_thickness', '#14B8A6')
    const glucoseChartData = createChartData('Glucose Level (mg/dL)', 'glucose', '#8B5CF6')
    const cholesterolChartData = createChartData('Cholesterol Level (mg/dL)', 'cholesterol', '#3A9DFE')

    onMounted(fetchHistory)

    return {
      historyData,
      selectedPeriod,
      periodOptions,
      isLoading,
      changePeriod,
      formatDate,
      chartOptions,
      weightChartData,
      bmiChartData,
      bloodPressureChartData,
      heartRateChartData,
      maxHeartRateChartData,
      skinThicknessChartData,
      glucoseChartData,
      cholesterolChartData,
      navigateToHome
    }
  }
}
</script>

<style scoped>
.health-history {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  display: flex;
}

.history-header {
  display: flex;
  width: 100%;
}

.period-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-right: 2rem;
}

.header-content {
  flex: 1;
}

.period-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #000;
  cursor: pointer;
  transition: all 0.2s;
}

.period-btn:hover {
  background: #f3f4f6;
}

.period-btn.active {
  background: #2B82E3;
  color: white;
  border-color: #2B82E3;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.full-width {
  width: 100%;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.chart-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  height: 300px;
}

.chart-section h3 {
  font-size: 1.25rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1rem;
}

.history-table {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
}

.history-table h3 {
  font-size: 1.25rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  font-weight: 500;
  color: #666;
  background: #f9fafb;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  background: #f9fafb;
  border-radius: 12px;
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .period-selector {
    width: 100%;
    justify-content: center;
    flex-direction: row;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

label {
  color: black !important;
}
</style>