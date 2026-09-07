<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { apiRequest } from '../utils/api'

const emit = defineEmits(['authSuccess'])
const { login } = useAuth()

const isLoginView = ref(true)
const authUsername = ref('')
const authEmail = ref('')
const authPassword = ref('')
const authFeedback = ref('')
const isAuthError = ref(false)
const isAuthLoading = ref(false)

const handleAuthSubmit = async () => {
  authFeedback.value = ''
  isAuthError.value = false
  isAuthLoading.value = true
  
  const endpoint = isLoginView.value ? '/users/login' : '/users/register'
  
  const payload = isLoginView.value 
    ? { identifier: authUsername.value, password: authPassword.value }
    : { username: authUsername.value, email: authEmail.value, password: authPassword.value }

  try {
    const data = await apiRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) })
    
    if (isLoginView.value) {
      login(data.access) 
      emit('authSuccess')
    } else {
      isLoginView.value = true
      authFeedback.value = 'Account created successfully. Please sign in below.'
      authUsername.value = ''
      authEmail.value = ''
      authPassword.value = ''
    }
  } catch (err) {
    isAuthError.value = true
    authFeedback.value = err.message.includes('Failed to fetch') 
      ? 'Connecting to server... Our free hosting instance on Render takes about 60 seconds to spin up from sleep. Please wait a brief moment and try again.' 
      : err.message
  } finally {
    isAuthLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col justify-between min-h-[310px]">
    
    <!-- AUTH TAB NAVIGATION -->
    <div class="flex border-b border-slate-800 mb-6 pb-1">
      <button 
        type="button" 
        @click="isLoginView = true; authFeedback = '';" 
        :class="['px-4 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-all relative outline-none focus:outline-none', isLoginView ? 'text-amber-500 after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[2px] after:bg-amber-500' : 'text-slate-500 hover:text-slate-400']"
      >
        Sign In
      </button>
      <button 
        type="button" 
        @click="isLoginView = false; authFeedback = '';" 
        :class="['px-4 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-all relative outline-none focus:outline-none', !isLoginView ? 'text-amber-500 after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[2px] after:bg-amber-500' : 'text-slate-500 hover:text-slate-400']"
      >
        Register
      </button>
    </div>

    <!-- FORM CONTROLS -->
    <form @submit.prevent="handleAuthSubmit" class="flex-grow space-y-4">
      
      <!-- SIGN IN DYNAMIC FIELD -->
      <div v-if="isLoginView" class="transition-opacity duration-200">
        <label class="block font-mono text-slate-400 uppercase text-[11px] tracking-wider mb-1.5">Username or Email</label>
        <input 
          v-model="authUsername" 
          type="text" 
          placeholder="Enter credential name..." 
          class="pro-input" 
          required 
        />
      </div>

      <!-- REGISTER DYNAMIC FIELDS -->
      <div v-else class="space-y-4 transition-opacity duration-200">
        <div>
          <label class="block font-mono text-slate-400 uppercase text-[11px] tracking-wider mb-1.5">Select Username</label>
          <input 
            v-model="authUsername" 
            type="text" 
            placeholder="e.g., alex_scribe" 
            class="pro-input" 
            required 
          />
        </div>
        <div>
          <label class="block font-mono text-slate-400 uppercase text-[11px] tracking-wider mb-1.5">Email Address</label>
          <input 
            v-model="authEmail" 
            type="email" 
            placeholder="name@example.com" 
            class="pro-input" 
            required 
          />
        </div>
      </div>

      <!-- SHARED PASSWORD FIELD -->
      <div>
        <label class="block font-mono text-slate-400 uppercase text-[11px] tracking-wider mb-1.5">Password</label>
        <input 
          v-model="authPassword" 
          type="password" 
          placeholder="••••••••" 
          class="pro-input" 
          required 
        />
      </div>

      <!-- SUBMIT BUTTON -->
      <button 
        type="submit" 
        :disabled="isAuthLoading" 
        class="pro-btn-primary flex items-center justify-center gap-2 mt-6"
      >
        <div v-if="isAuthLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" role="status"></div>
        <span>{{ isAuthLoading ? 'Spinning up server...' : (isLoginView ? 'Access Feed' : 'Build Account') }}</span>
      </button>
    </form>

    <!-- SERVER INTERACTION FEEDBACK STICKER -->
    <div v-if="authFeedback" :class="['mt-4 p-3 rounded-xl border text-xs font-mono transition-all', isAuthError ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400']">
      <div class="flex items-start gap-2.5 leading-relaxed">
        <i class="bi bi-info-circle-fill text-amber-500 flex-shrink-0 mt-0.5"></i>
        <span>{{ authFeedback }}</span>
      </div>
    </div>
  </div>
</template>
