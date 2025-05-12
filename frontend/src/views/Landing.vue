// src/views/Landing.vue
<template>
  <div class="landing">
    <main>
      <section class="hero">
        <img src="../assets/logo.png" alt="Health app illustration" class="hero-image">
        <h1>Empower your health with personalised insights and recommendations</h1>
      </section>

      <section class="features">
        <h2>How A.I.H.S helps you stay healthy</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <span class="icon">⚕️</span>
            <h3>Personalised insights</h3>
            <p>Understand your health risks and the actions you can take to reduce them</p>
          </div>
          <div class="feature-card">
            <span class="icon">📊</span>
            <h3>Track your health</h3>
            <p>Monitor your health and detect early signs of health issues</p>
          </div>
          <div class="feature-card">
            <span class="icon">🎯</span>
            <h3>Symptom checker</h3>
            <p>Find out the possible causes of your symptoms</p>
          </div>
        </div>
      </section>

      <section class="privacy-notice">
        <p style="text-align: center;">We take your privacy seriously. Read our <router-link to="/privacy" class="text-gray">Privacy Policy</router-link>.</p>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'LandingView'
}
</script>