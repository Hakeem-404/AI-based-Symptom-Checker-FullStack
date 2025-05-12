// src/components/layout/Footer.vue
<template>
  <footer>
    <div class="footer-links" v-if="!hideLinks">
      <router-link to="/terms">Terms of Service</router-link>
      <router-link to="/privacy">Privacy Policy</router-link>
      <router-link to="/disclaimer">Medical Disclaimer</router-link>
    </div>
    <div class="social-links" v-if="!hideLinks">
      <a href="" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
      <a href="" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
      <a href="" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  props: {
    hideLinks: {
      type: Boolean,
      default: false
    }
  }
}
</script>