//src/views/SymptomHistory.vue
<template>
  <div class="symptom-history-page">
    <h1 class="page-title">Symptom Analysis History</h1>
    <p class="page-subtitle">Review your previous symptom checks and health assessments</p>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loader"></div>
      <p>Loading your symptom history...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="historyItems.length === 0" class="empty-state">
      <div class="empty-illustration">
        <i class="fas fa-clipboard-list fa-4x"></i>
      </div>
      <h3>No Analysis History Yet</h3>
      <p>You haven't checked any symptoms yet. Use the symptom checker to get health insights.</p>
      <router-link to="/symptoms" class="btn-primary">Go to Symptom Checker</router-link>
    </div>
    
    <!-- History List -->
    <div v-else class="history-list">
      <div 
        v-for="item in historyItems" 
        :key="item.id" 
        class="history-item"
      >
        <div 
          class="history-item-header"
          @click="toggleExpanded(item.id)"
        >
          <div class="history-date">
            {{ formatDate(item.created_at) }}
          </div>
          <div class="history-symptoms">
            <span 
              v-for="(symptomId, index) in parseSymptoms(item.symptoms)" 
              :key="symptomId"
              class="symptom-tag"
            >
              {{ getSymptomName(symptomId) }}{{ index < parseSymptoms(item.symptoms).length - 1 ? ',' : '' }}
            </span>
          </div>
          <div class="history-triage" :class="getTriageColorClass(parseTriage(item.triage).overall.level)">
            {{ parseTriage(item.triage).overall.level }}
          </div>
          <i 
            :class="['expand-icon fas', expandedItems.includes(item.id) ? 'fa-chevron-up' : 'fa-chevron-down']"
          ></i>
        </div>
        
        <!-- Expanded Item Content -->
        <div v-if="expandedItems.includes(item.id)" class="history-item-details">
          <!-- Condition Tabs -->
          <div class="condition-tabs">
            <button 
              v-for="condition in ['diabetes', 'heart', 'stroke']"
              :key="condition"
              :class="['tab-button', { active: getActiveTab(item.id) === condition }]" 
              @click="setActiveTab(item.id, condition)"
            >
              {{ formatConditionName(condition) }}
            </button>
          </div>
          
          <!-- Condition Content -->
          <div class="analysis-details">
            <!-- Risk Level -->
            <div class="risk-level-section">
              <div class="risk-level-display">
                <h4>Risk Assessment</h4>
                <div class="risk-level">
                  <span :class="['risk-badge', getRiskBadgeClass(parseResults(item.results)[getActiveTab(item.id)].level)]">
                    {{ parseResults(item.results)[getActiveTab(item.id)].level }} Risk
                  </span>
                  <div class="risk-percentage">
                    {{ (parseResults(item.results)[getActiveTab(item.id)].risk * 100).toFixed(0) }}%
                  </div>
                </div>
              </div>
              <div :class="['condition-triage', getTriageColorClass(parseTriage(item.triage)[getActiveTab(item.id)].level)]">
                <div class="triage-label">Triage</div>
                <div class="triage-value">{{ parseTriage(item.triage)[getActiveTab(item.id)].level }}</div>
                <div class="triage-detail">{{ parseTriage(item.triage)[getActiveTab(item.id)].urgency }}</div>
              </div>
            </div>
            
            <!-- Feature Importance Chart -->
            <div class="feature-importance-section">
              <h4>Factors Influencing Prediction</h4>
              <div class="feature-chart">
                <h5 v-if="hasHealthMetrics(parseFeatureImportance(item.feature_importance)[getActiveTab(item.id)])">
                  Health Metrics (40% Contribution)
                </h5>
                <div 
                  v-for="(feature, index) in getNonSymptomFeatures(parseFeatureImportance(item.feature_importance)[getActiveTab(item.id)])" 
                  :key="`metric-${index}`" 
                  class="feature-bar-container"
                >
                  <div class="feature-name">{{ feature.feature }}</div>
                  <div class="feature-bar-wrapper">
                    <div 
                      class="feature-bar health-metric-bar" 
                      :style="{ width: `${feature.importance * 100}%` }"
                    ></div>
                  </div>
                  <div class="feature-value">{{ (feature.importance * 100).toFixed(0) }}%</div>
                </div>

                <h5 v-if="hasSymptoms(parseFeatureImportance(item.feature_importance)[getActiveTab(item.id)])">
                  Reported Symptoms (60% Contribution)
                </h5>
                <div 
                  v-for="(feature, index) in getSymptomFeatures(parseFeatureImportance(item.feature_importance)[getActiveTab(item.id)])" 
                  :key="`symptom-${index}`" 
                  class="feature-bar-container symptom-feature"
                >
                  <div class="feature-name">{{ feature.feature.replace('Symptom: ', '') }}</div>
                  <div class="feature-bar-wrapper">
                    <div 
                      class="feature-bar symptom-bar" 
                      :style="{ width: `${feature.importance * 100}%` }"
                    ></div>
                  </div>
                  <div class="feature-value">{{ (feature.importance * 100).toFixed(0) }}%</div>
                </div>
              </div>
            </div>
            
            <!-- Risk Factors -->
            <div class="risk-factors-section">
              <h4>Risk Factors</h4>
              <div class="risk-factors-list">
                <div 
                  v-for="(factor, index) in parseRiskFactors(item.risk_factors)[getActiveTab(item.id)]" 
                  :key="index"
                  class="risk-factor-item"
                >
                  <div class="risk-factor-name">{{ factor.factor }}</div>
                  <div class="risk-factor-value">{{ factor.value }}</div>
                  <div :class="['risk-factor-contribution', `contribution-${factor.contribution.toLowerCase()}`]">
                    {{ factor.contribution }}
                  </div>
                  <div class="risk-factor-description">{{ factor.description }}</div>
                </div>
                
                <div v-if="parseRiskFactors(item.risk_factors)[getActiveTab(item.id)].length === 0" class="no-risk-factors">
                  No significant risk factors identified for {{ formatConditionName(getActiveTab(item.id)) }}.
                </div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="recommendations-section">
              <h4>Recommendations</h4>
              <ul class="recommendations-list">
                <li 
                  v-for="(recommendation, index) in parseRecommendations(item.recommendations)[getActiveTab(item.id)]" 
                  :key="index"
                >
                  {{ recommendation }}
                </li>
                <li 
                  v-if="parseRecommendations(item.recommendations)[getActiveTab(item.id)].length === 0"
                >
                  No specific recommendations for {{ formatConditionName(getActiveTab(item.id)) }} at this time.
                </li>
              </ul>
            </div>
            
            <!-- General Recommendations -->
            <div class="general-recommendations">
              <h4>General Recommendations</h4>
              <ul>
                <li 
                  v-for="(recommendation, index) in parseRecommendations(item.recommendations).general" 
                  :key="index"
                >
                  {{ recommendation }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pagination (for future implementation) -->
    <div v-if="historyItems.length > 0" class="pagination">
      <button 
        class="pagination-button"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i> Previous
      </button>
      <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
      <button 
        class="pagination-button"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        Next <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { symptomsService } from '@/services/symptoms';

export default {
  name: 'SymptomHistoryView',
  data() {
    return {
      isLoading: true,
      historyItems: [],
      expandedItems: [],
      activeTabsMap: {}, // Map item IDs to active tabs
      currentPage: 1,
      itemsPerPage: 5,
      symptomNames: {
        1: 'Headache',
        2: 'Shortness of breath',
        3: 'Fatigue',
        4: 'Vomiting',
        5: 'Chest pain',
        6: 'Sweating',
        7: 'Weight loss',
        8: 'Insomnia',
        9: 'Hallucinations',
        10: 'Blurred vision',
        11: 'Frequent urination',
        12: 'Weakness on one side of body'
      }
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.historyItems.length / this.itemsPerPage);
    },
    paginatedHistoryItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.historyItems.slice(start, end);
    }
  },
  methods: {
    async fetchHistory() {
      this.isLoading = true;
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          this.$router.push('/login');
          return;
        }
        
        const response = await symptomsService.getSymptomHistory(userId);
        this.historyItems = response.data;
        
        // Initialize active tab for each item to 'diabetes'
        this.historyItems.forEach(item => {
          this.activeTabsMap[item.id] = 'diabetes';
        });
      } catch (error) {
        console.error('Error fetching symptom history:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    getSymptomName(id) {
      return this.symptomNames[id] || `Symptom ${id}`;
    },
    
    toggleExpanded(id) {
      const index = this.expandedItems.indexOf(id);
      if (index > -1) {
        this.expandedItems.splice(index, 1);
      } else {
        this.expandedItems.push(id);
      }
    },
    
    setActiveTab(itemId, tab) {
      this.activeTabsMap[itemId] = tab;
    },
    
    getActiveTab(itemId) {
      return this.activeTabsMap[itemId] || 'diabetes';
    },
    
    formatConditionName(condition) {
      switch(condition) {
        case 'diabetes': return 'Diabetes';
        case 'heart': return 'Heart Disease';
        case 'stroke': return 'Stroke';
        default: return condition.charAt(0).toUpperCase() + condition.slice(1);
      }
    },
    
    parseSymptoms(symptomsJson) {
      try {
        return JSON.parse(symptomsJson);
      } catch (e) {
        console.error("Error parsing symptoms JSON:", e);
        return [];
      }
    },
    
    parseResults(resultsJson) {
      try {
        return JSON.parse(resultsJson);
      } catch (e) {
        console.error("Error parsing results JSON:", e);
        return {
          diabetes: { risk: 0, level: 'Unknown' },
          heart: { risk: 0, level: 'Unknown' },
          stroke: { risk: 0, level: 'Unknown' }
        };
      }
    },
    
    parseTriage(triageJson) {
      try {
        return JSON.parse(triageJson);
      } catch (e) {
        console.error("Error parsing triage JSON:", e);
        return {
          overall: { level: 'Unknown', urgency: '' },
          diabetes: { level: 'Unknown', urgency: '' },
          heart: { level: 'Unknown', urgency: '' },
          stroke: { level: 'Unknown', urgency: '' }
        };
      }
    },
    
    parseFeatureImportance(featureImportanceJson) {
      try {
        return JSON.parse(featureImportanceJson);
      } catch (e) {
        console.error("Error parsing feature importance JSON:", e);
        return {
          diabetes: [],
          heart: [],
          stroke: []
        };
      }
    },
    
    parseRiskFactors(riskFactorsJson) {
      try {
        return JSON.parse(riskFactorsJson);
      } catch (e) {
        console.error("Error parsing risk factors JSON:", e);
        return {
          diabetes: [],
          heart: [],
          stroke: []
        };
      }
    },
    
    parseRecommendations(recommendationsJson) {
      try {
        return JSON.parse(recommendationsJson);
      } catch (e) {
        console.error("Error parsing recommendations JSON:", e);
        return {
          general: [],
          diabetes: [],
          heart: [],
          stroke: []
        };
      }
    },
    
    hasHealthMetrics(features) {
      return features && features.some(feature => !feature.isSymptom);
    },
    
    hasSymptoms(features) {
      return features && features.some(feature => feature.isSymptom);
    },
    
    getNonSymptomFeatures(features) {
      return features ? features.filter(feature => !feature.isSymptom) : [];
    },
    
    getSymptomFeatures(features) {
      return features ? features.filter(feature => feature.isSymptom) : [];
    },
    
    getTriageColorClass(triageLevel) {
      switch(triageLevel) {
        case 'Emergency': return 'triage-emergency';
        case 'Urgent': return 'triage-urgent';
        case 'Routine': return 'triage-routine';
        case 'Self-care': return 'triage-selfcare';
        default: return '';
      }
    },
    
    getRiskBadgeClass(riskLevel) {
      switch(riskLevel) {
        case 'Low': return 'risk-low';
        case 'Moderate': return 'risk-moderate';
        case 'High': return 'risk-high';
        case 'Very High': return 'risk-very-high';
        default: return '';
      }
    },
    
    changePage(page) {
      this.currentPage = page;
      // Reset expanded items when changing page
      this.expandedItems = [];
    }
  },
  mounted() {
    this.fetchHistory();
  }
}
</script>

<style scoped>
.symptom-history-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
}

.page-subtitle {
  text-align: center;
  color: #64748b;
  margin-bottom: 2rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #2B82E3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-illustration {
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.75rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.btn-primary {
  display: inline-block;
  background: #2B82E3;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-item-header {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.history-item-header:hover {
  background: #f8fafc;
}

.history-date {
  flex: 0 0 200px;
  font-weight: 500;
  color: #334155;
}

.history-symptoms {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-right: 1rem;
}

.symptom-tag {
  color: #475569;
  font-size: 0.875rem;
}

.history-triage {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-right: 1rem;
}

.triage-emergency {
  background: #fee2e2;
  color: #b91c1c;
}

.triage-urgent {
  background: #fff7ed;
  color: #c2410c;
}

.triage-routine {
  background: #ecfdf5;
  color: #047857;
}

.triage-selfcare {
  background: #f0f9ff;
  color: #0369a1;
}

.expand-icon {
  transition: transform 0.2s;
}

.history-item-details {
  padding: 0 1.25rem 1.25rem;
  border-top: 1px solid #e2e8f0;
}

.condition-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-button:hover {
  color: #334155;
}

.tab-button.active {
  color: #2B82E3;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #2B82E3;
}

.risk-level-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.risk-level-display {
  flex: 1;
}

.risk-level-display h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.risk-level {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.risk-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.risk-low {
  background: #dcfce7;
  color: #166534;
}

.risk-moderate {
  background: #fef9c3;
  color: #854d0e;
}

.risk-high {
  background: #fee2e2;
  color: #b91c1c;
}

.risk-very-high {
  background: #f87171;
  color: #7f1d1d;
}

.risk-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.condition-triage {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  min-width: 150px;
}

.triage-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.triage-value {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.triage-detail {
  font-size: 0.75rem;
}

.feature-importance-section,
.risk-factors-section,
.recommendations-section,
.general-recommendations {
  margin-bottom: 2rem;
}

.feature-importance-section h4,
.risk-factors-section h4,
.recommendations-section h4,
.general-recommendations h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.feature-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-chart h5 {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.75rem 0 0.25rem;
  font-weight: 600;
}

.feature-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feature-name {
  width: 150px;
  font-size: 0.875rem;
  color: #334155;
}

.feature-bar-wrapper {
  flex: 1;
  height: 10px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.feature-bar {
  height: 100%;
  border-radius: 9999px;
}

.health-metric-bar {
  background: linear-gradient(to right, #3b82f6, #2B82E3);
}

.symptom-bar {
  background: linear-gradient(to right, #f97316, #ea580c);
}

.symptom-feature .feature-name {
  color: #9a3412;
  font-style: italic;
}

.feature-value {
  width: 40px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
  text-align: right;
}

.risk-factors-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.risk-factor-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.risk-factor-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.risk-factor-value {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.risk-factor-contribution {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.contribution-high {
  background: #fee2e2;
  color: #b91c1c;
}

.contribution-moderate {
  background: #fef9c3;
  color: #854d0e;
}

.contribution-low {
  background: #dcfce7;
  color: #166534;
}

.risk-factor-description {
  font-size: 0.875rem;
  color: #334155;
}

.no-risk-factors {
  grid-column: 1 / -1;
  text-align: center;
  padding: 1.5rem;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
}

.recommendations-list,
.general-recommendations ul {
  list-style-type: none;
  padding: 0;
}

.recommendations-list li,
.general-recommendations li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  padding-left: 1.5rem;
}

.recommendations-list li:before,
.general-recommendations li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2B82E3;
  font-weight: bold;
}

.general-recommendations {
  background: #f0f9ff;
  border-radius: 8px;
  padding: 1.5rem;
}

.general-recommendations h4 {
  color: #0369a1;
  border-bottom-color: #bae6fd;
}

.general-recommendations li {
  border-bottom-color: #bae6fd;
}

.general-recommendations li:before {
  color: #0369a1;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
}

.pagination-button {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #e2e8f0;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  color: #64748b;
}

@media (max-width: 768px) {
  .history-item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .history-date,
  .history-symptoms {
    flex: 0 0 auto;
    width: 100%;
  }
  
  .expand-icon {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
  }
  
  .risk-level-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .condition-triage {
    width: 100%;
  }
  
  .risk-factors-list {
    grid-template-columns: 1fr;
  }
  
  .feature-bar-container {
    flex-wrap: wrap;
  }
  
  .feature-name {
    width: 100%;
    margin-bottom: 0.25rem;
  }
}

@media (max-width: 480px) {
  .symptom-history-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .condition-tabs {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 1 0 33%;
    padding: 0.75rem 0.5rem;
    text-align: center;
  }
}
</style>