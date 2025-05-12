// src/App.vue
<template>
  <div id="app">
    <Navbar 
      :is-logged-in="isLoggedIn"
      @logout="handleLogout"
    />
    <router-view></router-view>
    <Footer 
      :hide-links="shouldHideFooterLinks"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from './components/layout/NavBar.vue'
import Footer from './components/layout/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  setup() {
    const router = useRouter()
    const isLoggedIn = ref(false)

    const shouldHideFooterLinks = computed(() => {
      const hideOnRoutes = [
        '/login', 
        '/register', 
        '/forgotpassword', 
        '/personalinfo'
      ]
      return hideOnRoutes.includes(window.location.pathname)
    })

    const handleLogout = () => {
      isLoggedIn.value = false
      localStorage.removeItem('userId')
      localStorage.removeItem('user')
      router.push('/')
    }

    const checkAuth = () => {
      const user = localStorage.getItem('user');
      isLoggedIn.value = !!user;
    }

    onMounted(() => {
      checkAuth();
      // Add watcher for route changes
      router.beforeEach((to, from, next) => {
        checkAuth();
        next();
      });
    });

    return {
      isLoggedIn,
      shouldHideFooterLinks,
      handleLogout
    }
  }
}
</script>


<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.router-view-container {
  flex: 1;
}
</style>