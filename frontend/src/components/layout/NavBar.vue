//src/components/layout/Navbar.vue
<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css">
  <nav class="navbar">
    <router-link to="/" class="logo" @click="handleLogoClick">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_1_4385)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M4.02663 8L1.33333 6.41597L3.31846 2.91739L6.01333 4.4987L6.01487 1.33333H9.98513L9.98667 4.4987L12.6815 2.91739L14.6667 6.41597L11.9733 8L14.6667 9.58403L12.6815 13.0826L9.98667 11.5013L9.98513 14.6667H6.01487L6.01333 11.5013L3.31846 13.0826L1.33333 9.58403L4.02663 8Z" fill="#121417"/>
        </g>
        <defs>
          <clipPath id="clip0_1_4385">
            <rect width="16" height="16" fill="white"/>
          </clipPath>
        </defs>
      </svg>
      A.I.H.S
    </router-link>
    <div v-if="isLoggedIn">
      <div class="nav-links" v-if="isSymptomsCheckerPage">
      <router-link to="/symptoms" style="width: 171px; display: inline-block; text-align: center; background: #e4e5e6;" > Symptoms Checker</router-link>
      <router-link to="/symptoms/history" style="width: 250px; display: inline-block; text-align: center; ">Symptom Assessment History</router-link>
      <router-link to="/profile">Profile<i class="user circle outline icon" style="padding-left: 10px;"></i></router-link>
      <button @click="logout" class="logout-btn" style="width: 81px; display: inline-block; text-align: center; ">Log out</button>
      </div>
      <div class="nav-links" v-else-if="isSymptomHistoryPage">
      <router-link to="/symptoms" style="width: 171px; display: inline-block; text-align: center;" > Symptoms Checker</router-link>
      <router-link to="/symptoms/history" style="width: 250px; display: inline-block; text-align: center; background: #e4e5e6;"> Symptom Assessment History</router-link>
      <router-link to="/profile">Profile<i class="user circle outline icon" style="padding-left: 10px;"></i></router-link>
      <button @click="logout" class="logout-btn" style="width: 81px; display: inline-block; text-align: center; ">Log out</button>
      </div>
      <div class="nav-links" v-else-if="isProfilePage">
      <router-link to="/symptoms" style="width: 171px; display: inline-block; text-align: center;" > Symptoms Checker</router-link>
      <router-link to="/symptoms/history" style="width: 250px; display: inline-block; text-align: center;">Symptom Assessment History</router-link>
      <router-link to="/profile" style="background: #e4e5e6;">Profile<i class="user circle outline icon" style="padding-left: 10px;"></i></router-link>
      <button @click="logout" class="logout-btn" style="width: 81px; display: inline-block; text-align: center;">Log out</button>
      </div>
      <div class="nav-links" v-else>
      <router-link to="/symptoms" style="width: 171px; display: inline-block; text-align: center; " > Symptoms Checker</router-link>
      <router-link to="/symptoms/history" style="width: 250px; display: inline-block; text-align: center; ">Symptom Assessment History</router-link>
      <router-link to="/profile">Profile<i class="user circle outline icon" style="padding-left: 10px;"></i></router-link>
      <button @click="logout" class="logout-btn" style="width: 81px; display: inline-block; text-align: center; ">Log out</button>
      </div>
    </div>
    <div class="nav-links" v-else>
      <router-link to="">How it works</router-link>
      <router-link to="">About us</router-link>
      <router-link to="/login" class="login-btn">Log in</router-link>
      <router-link to="/register" class="signup-btn">Sign up</router-link>
    </div>
  </nav>

  <div v-if="showLogoutConfirmation" class="logout-confirmation-overlay">
    <div class="logout-confirmation-dialog">
      <h3>Confirm Logout</h3>
      <p>Are you sure you want to log out?</p>
      <div class="confirmation-buttons">
        <button @click="cancelLogout" class="login-btn">Cancel</button>
        <button @click="confirmLogout" class="logout-btn">Logout</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Navbar',
  props: {
    isLoggedIn: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const router = useRouter()
    const showLogoutConfirmation = ref(false)

    const handleLogoClick = () => {
      if (props.isLoggedIn) {
        router.push('/home')
      } else {
        router.push('/')
      }
    }

    return {
      handleLogoClick,
      showLogoutConfirmation
    }
  },
  emits: ['logout'],
  methods: {
    logout() {
      this.showLogoutConfirmation = true
    },
    confirmLogout() {
      this.showLogoutConfirmation = false
      this.$emit('logout')
    },
    cancelLogout() {
      this.showLogoutConfirmation = false
    }
  },
  computed: {
    isSymptomsCheckerPage() {
      return this.$route.path === '/symptoms'
    },
    isSymptomHistoryPage() {
      return this.$route.path === '/symptoms/history'
    },
    isProfilePage() {
      return this.$route.path === '/profile'
    }
  }
}
</script>

<style scoped>
.logout-confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.logout-confirmation-dialog {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
}

.logout-confirmation-dialog h3 {
  margin-top: 0;
  font-size: 1.25rem;
}

.confirmation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.confirmation-buttons button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  width: auto;
}

</style>