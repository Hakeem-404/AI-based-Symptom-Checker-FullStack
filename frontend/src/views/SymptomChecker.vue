//src/views/SymptomChecker.vue
<template>
  <div class="symptoms-checker-page">
   
    <div v-if="!isanalysing && !analysisResults" class="symptom-selection-container">
       <!-- Step 1: Symptom Selection (Only shown when not analysing or showing results) -->
      <h1 class="page-title">Symptom Checker</h1>
      <p class="page-subtitle">Select the symptoms you're experiencing for personalised Symptom Assessment</p>
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="handleSearchInput"
          placeholder="Search for symptoms"
          class="search-input"
        >
        <div v-if="showDropdown" class="symptom-dropdown">
          <div 
            v-for="symptom in filteredSymptoms"
            :key="symptom.id"
            :class="['symptom-item', { selected: isSelected(symptom.id) }]"
            @click="toggleSymptom(symptom.id)"
          >
            {{ symptom.name }}
          </div>
        </div>
      </div>

      <div class="selected-symptoms">
        <div 
          v-for="symptom in selectedSymptomsList"
          :key="symptom.id"
          class="selected-symptom-tag"
        >
          {{ symptom.name }}
          <span 
            class="remove-tag"
            @click="toggleSymptom(symptom.id)"
          >×</span>
        </div>
      </div>

      <button 
        class="btn-primary mt-4"
        @click="analyseSymptoms"
        :disabled="!hasSelectedSymptoms || isanalysing"
      >
        <span v-if="isanalysing">analysing...</span>
        <span v-else>Analyse Symptoms</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isanalysing" class="analysis-loading">
      <div class="loader"></div>
      <p>analysing your symptoms and health data...</p>
    </div>

    <!-- Analysis Results -->
    <div v-if="analysisResults" class="analysis-results">
      <h1 class="page-title">Symptom Assessment</h1>
      <p class="page-subtitle">Personalised Health Assessment</p>
      <!-- Overall Triage Alert -->
      <div :class="['triage-alert', getTriageColorClass(analysisResults.triage.overall.level)]">
        <h3 class="triage-title">Overall Assessment: {{ analysisResults.triage.overall.level }}</h3>
        <p class="triage-message">{{ analysisResults.triage.overall.urgency }}</p>
      </div>

      <!-- Condition Tabs -->
      <div class="condition-tabs">
        <button 
          :class="['tab-button', { active: activeTab === 'diabetes' }]" 
          @click="activeTab = 'diabetes'"
        >
          Diabetes
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'heart' }]" 
          @click="activeTab = 'heart'"
        >
          Heart Disease
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'stroke' }]" 
          @click="activeTab = 'stroke'"
        >
          Stroke
        </button>
      </div>

      <!-- Condition Content -->
      <div class="condition-content">
        <!-- Diabetes Tab Content -->
        <div v-if="activeTab === 'diabetes'" class="condition-panel">
          <div class="condition-header">
            <div class="condition-summary">
              <h3>Diabetes Risk Assessment</h3>
              <div class="risk-level-display">
                <span :class="['risk-badge', getRiskBadgeClass(analysisResults.conditionRisks.diabetes.level)]">
                  {{ analysisResults.conditionRisks.diabetes.level }} Risk
                </span>
                <div class="risk-percentage">{{ (analysisResults.conditionRisks.diabetes.risk * 100).toFixed(0) }}%</div>
              </div>
            </div>
            <div :class="['condition-triage', getTriageColorClass(analysisResults.triage.diabetes.level)]">
              <div class="triage-label">Triage</div>
              <div class="triage-value">{{ analysisResults.triage.diabetes.level }}</div>
              <div class="triage-detail">{{ analysisResults.triage.diabetes.urgency }}</div>
            </div>
          </div>

          <!-- Risk Factors -->
          <div class="risk-factors-section">
            <h4>Risk Factors</h4>
            <div class="risk-factors-list">
              <div 
                v-for="(factor, index) in analysisResults.riskFactors.diabetes" 
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
              
              <div v-if="analysisResults.riskFactors.diabetes.length === 0" class="no-risk-factors">
                No significant risk factors identified for diabetes.
              </div>
            </div>
          </div>

          <!-- Feature Importance Chart -->
          <div class="feature-importance-section">
            <h4>Factors Influencing Prediction</h4>
            <div class="feature-chart">
              <h5 v-if="hasHealthMetrics(analysisResults.featureImportance[activeTab])">Health Metrics (40% Contribution)</h5>
              <div 
                v-for="(feature, index) in getNonSymptomFeatures(analysisResults.featureImportance[activeTab])" 
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

              <h5 v-if="hasSymptoms(analysisResults.featureImportance[activeTab])">Reported Symptoms (60% Contribution)</h5>
              <div 
                v-for="(feature, index) in getSymptomFeatures(analysisResults.featureImportance[activeTab])" 
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

          <!-- Recommendations -->
          <div class="recommendations-section">
            <h4>Recommendations</h4>
            <ul class="recommendations-list">
              <li v-for="(recommendation, index) in analysisResults.recommendations.diabetes" :key="index">
                {{ recommendation }}
              </li>
              <li v-if="analysisResults.recommendations.diabetes.length === 0">
                No specific recommendations for diabetes at this time.
              </li>
            </ul>
          </div>
        </div>

        <!-- Heart Disease Tab Content -->
        <div v-if="activeTab === 'heart'" class="condition-panel">
          <div class="condition-header">
            <div class="condition-summary">
              <h3>Heart Disease Risk Assessment</h3>
              <div class="risk-level-display">
                <span :class="['risk-badge', getRiskBadgeClass(analysisResults.conditionRisks.heart.level)]">
                  {{ analysisResults.conditionRisks.heart.level }} Risk
                </span>
                <div class="risk-percentage">{{ (analysisResults.conditionRisks.heart.risk * 100).toFixed(0) }}%</div>
              </div>
            </div>
            <div :class="['condition-triage', getTriageColorClass(analysisResults.triage.heart.level)]">
              <div class="triage-label">Triage</div>
              <div class="triage-value">{{ analysisResults.triage.heart.level }}</div>
              <div class="triage-detail">{{ analysisResults.triage.heart.urgency }}</div>
            </div>
          </div>

          <!-- Risk Factors -->
          <div class="risk-factors-section">
            <h4>Risk Factors</h4>
            <div class="risk-factors-list">
              <div 
                v-for="(factor, index) in analysisResults.riskFactors.heart" 
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
              
              <div v-if="analysisResults.riskFactors.heart.length === 0" class="no-risk-factors">
                No significant risk factors identified for heart disease.
              </div>
            </div>
          </div>

          <!-- Feature Importance Chart -->
          <div class="feature-importance-section">
            <h4>Factors Influencing Prediction</h4>
            <div class="feature-chart">
              <h5 v-if="hasHealthMetrics(analysisResults.featureImportance[activeTab])">Health Metrics (40% Contribution)</h5>
              <div 
                v-for="(feature, index) in getNonSymptomFeatures(analysisResults.featureImportance[activeTab])" 
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

              <h5 v-if="hasSymptoms(analysisResults.featureImportance[activeTab])">Reported Symptoms (60% Contribution)</h5>
              <div 
                v-for="(feature, index) in getSymptomFeatures(analysisResults.featureImportance[activeTab])" 
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

          <!-- Recommendations -->
          <div class="recommendations-section">
            <h4>Recommendations</h4>
            <ul class="recommendations-list">
              <li v-for="(recommendation, index) in analysisResults.recommendations.heart" :key="index">
                {{ recommendation }}
              </li>
              <li v-if="analysisResults.recommendations.heart.length === 0">
                No specific recommendations for heart disease at this time.
              </li>
            </ul>
          </div>
        </div>

        <!-- Stroke Tab Content -->
        <div v-if="activeTab === 'stroke'" class="condition-panel">
          <div class="condition-header">
            <div class="condition-summary">
              <h3>Stroke Risk Assessment</h3>
              <div class="risk-level-display">
                <span :class="['risk-badge', getRiskBadgeClass(analysisResults.conditionRisks.stroke.level)]">
                  {{ analysisResults.conditionRisks.stroke.level }} Risk
                </span>
                <div class="risk-percentage">{{ (analysisResults.conditionRisks.stroke.risk * 100).toFixed(0) }}%</div>
              </div>
            </div>
            <div :class="['condition-triage', getTriageColorClass(analysisResults.triage.stroke.level)]">
              <div class="triage-label">Triage</div>
              <div class="triage-value">{{ analysisResults.triage.stroke.level }}</div>
              <div class="triage-detail">{{ analysisResults.triage.stroke.urgency }}</div>
            </div>
          </div>

          <!-- Risk Factors -->
          <div class="risk-factors-section">
            <h4>Risk Factors</h4>
            <div class="risk-factors-list">
              <div 
                v-for="(factor, index) in analysisResults.riskFactors.stroke" 
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
              
              <div v-if="analysisResults.riskFactors.stroke.length === 0" class="no-risk-factors">
                No significant risk factors identified for stroke.
              </div>
            </div>
          </div>

          <!-- Feature Importance Chart -->
          <div class="feature-importance-section">
            <h4>Factors Influencing Prediction</h4>
            <div class="feature-chart">
              <h5 v-if="hasHealthMetrics(analysisResults.featureImportance[activeTab])">Health Metrics (40% Contribution)</h5>
              <div 
                v-for="(feature, index) in getNonSymptomFeatures(analysisResults.featureImportance[activeTab])" 
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

              <h5 v-if="hasSymptoms(analysisResults.featureImportance[activeTab])">Reported Symptoms (60% Contribution)</h5>
              <div 
                v-for="(feature, index) in getSymptomFeatures(analysisResults.featureImportance[activeTab])" 
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

          <!-- Recommendations -->
          <div class="recommendations-section">
            <h4>Recommendations</h4>
            <ul class="recommendations-list">
              <li v-for="(recommendation, index) in analysisResults.recommendations.stroke" :key="index">
                {{ recommendation }}
              </li>
              <li v-if="analysisResults.recommendations.stroke.length === 0">
                No specific recommendations for stroke at this time.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- General Recommendations -->
      <div class="general-recommendations">
        <h3>General Recommendations</h3>
        <ul>
          <li v-for="(recommendation, index) in analysisResults.recommendations.general" :key="index">
            {{ recommendation }}
          </li>
        </ul>
      </div>

      <!-- Disclaimer -->
      <div class="medical-disclaimer">
        <p><strong>Disclaimer:</strong> This symptom checker provides general health information and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for medical concerns.</p>
      </div>

      <!-- Actions -->
      <div class="action-buttons">
        <button class="btn-secondary" @click="resetAnalysis">Check New Symptoms</button>
        <button class="btn-primary" @click="saveResults">Save Results</button>
      </div>
    </div>

    <!-- Missing Data Alert -->
    <div v-if="showMissingDataAlert" class="missing-data-alert">
      <div class="alert-content">
        <h3>Missing Health Data</h3>
        <p>To provide accurate health insights, we need more information about your health metrics and medical history.</p>
        <div class="alert-actions">
          <button @click="closeMissingDataAlert" class="btn-secondary">Dismiss</button>
          <router-link to="/profile" class="btn-primary">Complete Profile</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { symptomsService } from '@/services/symptoms';

export default {
  name: 'SymptomCheckerView',
  data() {
    return {
      searchQuery: '',
      symptoms: [],
      selectedSymptoms: [],
      showDropdown: false,
      isanalysing: false,
      analysisResults: null,
      showMissingDataAlert: false,
      isSaved: false,
      activeTab: 'diabetes' // Default active tab
    }
  },
  computed: {
    filteredSymptoms() {
      if (!this.searchQuery) return this.symptoms;
      const query = this.searchQuery.toLowerCase();
      return this.symptoms.filter(s => 
        s.name.toLowerCase().includes(query)
      );
    },
    selectedSymptomsList() {
      return this.symptoms.filter(s => 
        this.selectedSymptoms.includes(s.id)
      );
    },
    hasSelectedSymptoms() {
      return this.selectedSymptoms.length > 0;
    }
  },
  methods: {
    handleSearchInput() {
      this.showDropdown = this.searchQuery.length > 0;
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
    toggleSymptom(id) {
      const index = this.selectedSymptoms.indexOf(id);
      if (index > -1) {
        this.selectedSymptoms.splice(index, 1);
      } else {
        this.selectedSymptoms.push(id);
      }
    },
    isSelected(id) {
      return this.selectedSymptoms.includes(id);
    },
    async analyseSymptoms() {
      if (!this.hasSelectedSymptoms) return;
      
      this.isanalysing = true;
      this.analysisResults = null;
      
      try {
        const userId = localStorage.getItem('userId');
        const response = await symptomsService.analyseSymptoms(userId, this.selectedSymptoms);
        
        this.analysisResults = response.data;
        this.isSaved = false;
        
        // Set active tab to the condition with highest risk
        this.setActiveTabToHighestRisk();
        
      } catch (error) {
        console.error('Error analysing symptoms:', error);
        
        // Check if the error is due to missing health data
        if (error.response?.data?.missingData) {
          this.showMissingDataAlert = true;
        }
        
      } finally {
        this.isanalysing = false;
      }
    },
    setActiveTabToHighestRisk() {
      if (!this.analysisResults) return;
      
      let highestRisk = 0;
      let highestRiskCondition = 'diabetes';
      
      ['diabetes', 'heart', 'stroke'].forEach(condition => {
        const riskValue = parseFloat(this.analysisResults.conditionRisks[condition].risk);
        if (riskValue > highestRisk) {
          highestRisk = riskValue;
          highestRiskCondition = condition;
        }
      });
      
      this.activeTab = highestRiskCondition;
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
    getTriageColorClass(triageLevel) {
      switch(triageLevel) {
        case 'Emergency': return 'triage-emergency';
        case 'Urgent': return 'triage-urgent';
        case 'Routine': return 'triage-routine';
        case 'Self-care': return 'triage-selfcare';
        default: return '';
      }
    },
    resetAnalysis() {
      this.analysisResults = null;
      this.selectedSymptoms = [];
      this.searchQuery = '';
      this.isSaved = false;
    },
    async saveResults() {
      if (this.isSaved || !this.analysisResults) return;
      
      // Note: Saving is handled automatically by the backend in our implementation
      this.isSaved = true;
      
      // Show confirmation 
      alert('Your symptom analysis has been saved successfully.');
    },
    closeMissingDataAlert() {
      this.showMissingDataAlert = false;
    },
    async fetchSymptoms() {
      try {
        // In a real implementation, you would fetch the symptom list from an API endpoint
        // For this prototype, we'll use a hardcoded list based on the mapping
        const symptomsArray = [];
        
        for (let i = 1; i <= 45; i++) {
          symptomsArray.push({
            id: i,
            name: this.getSymptomName(i)
          });
        }
        
        this.symptoms = symptomsArray;
        
      } catch (error) {
        console.error('Error fetching symptoms:', error);
      }
    },
    getSymptomName(id) {
      // This is a simplified mapping based on our symptoms_mapping.json
      const symptomNames = {
        1: "Confusion/Hallucination",
        2: "Blurred vision",
        3: "Shortness of breath",
        4: "Chest pain",
        5: "Excessive hunger",
        6: "Fatigue",
        7: "Headache",
        8: "Increased appetite",
        9: "Lethargy",
        10: "Obesity",
        11: "Frequent urination",
        12: "Insomnia/Restlessness",
        13: "Sweating",
        14: "Vomiting",
        15: "Weakness on one side of body",
        16: "Weight loss",
      };
      
      return symptomNames[id] || `Symptom ${id}`;
    }
  },
  mounted() {
    this.fetchSymptoms();
  }
}
</script>

<style scoped>
.symptoms-checker-page {
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

.symptom-selection-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.symptom-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.symptom-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.symptom-item:hover {
  background: #f1f5f9;
}

.symptom-item.selected {
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 500;
}

.selected-symptoms {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.selected-symptom-tag {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-tag {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0369a1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.remove-tag:hover {
  background: #075985;
}

.btn-primary {
  background: #2B82E3;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.analysis-loading {
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

.analysis-results {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.triage-alert {
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.triage-emergency {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.triage-urgent {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #c2410c;
}

.triage-routine {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #047857;
}

.triage-selfcare {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0369a1;
}

.triage-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
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

.condition-panel {
  margin-bottom: 2rem;
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.condition-summary h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.risk-level-display {
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
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.triage-detail {
  font-size: 0.75rem;
}

.risk-factors-section,
.feature-importance-section,
.recommendations-section {
  margin-bottom: 2rem;
}

.risk-factors-section h4,
.feature-importance-section h4,
.recommendations-section h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.risk-factors-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  padding: 2rem;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
}

.feature-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  height: 12px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.feature-bar {
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #2B82E3);
  border-radius: 9999px;
}

.feature-value {
  width: 40px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
  text-align: right;
}

.recommendations-list {
  list-style-type: none;
  padding: 0;
}

.recommendations-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  padding-left: 1.5rem;
}

.recommendations-list li:before {
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
  margin-bottom: 2rem;
}

.general-recommendations h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 1rem;
}

.general-recommendations ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.general-recommendations li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #bae6fd;
  position: relative;
  padding-left: 1.5rem;
}

.general-recommendations li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: #0369a1;
  font-weight: bold;
}

.medical-disclaimer {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.missing-data-alert {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.alert-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  text-align: center;
}

.alert-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
}

.alert-content p {
  margin-bottom: 1.5rem;
  color: #475569;
}

.alert-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .condition-header {
    flex-direction: column;
    gap: 1rem;
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
  
  .action-buttons {
    flex-direction: column;
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

@media (max-width: 480px) {
  .symptoms-checker-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .risk-percentage {
    font-size: 1.25rem;
  }
  
  .triage-title {
    font-size: 1.25rem;
  }
  
  .condition-triage {
    min-width: auto;
    width: 100%;
  }
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

.feature-chart h5 {
  font-size: 0.875rem;
  color: #64748b;
  margin: 1rem 0 0.5rem;
  font-weight: 600;
}
</style>