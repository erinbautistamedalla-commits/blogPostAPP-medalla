<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { apiRequest } from '../utils/api'
import BlogCard from '../components/BlogCard.vue'
import AuthForm from '../components/AuthForm.vue'
import DraftPanel from '../components/DraftPanel.vue'
import PostReader from '../components/PostReader.vue'

const { isAuthenticated, logout, isAdmin } = useAuth()

const posts = ref([])
const searchQuery = ref('')
const isFeedLoading = ref(true)
const selectedPostId = ref(null)

const fetchPosts = async () => {
  isFeedLoading.value = true
  try {
    const data = await apiRequest('/posts/getPosts')
    posts.value = data.Posts || []
  } catch (err) {
    console.error("API error:", err)
  } finally {
    isFeedLoading.value = false
  }
}

const appendPost = (freshPost) => posts.value.unshift(freshPost)
const syncPost = (updatedPost) => {
  const idx = posts.value.findIndex(p => p._id === updatedPost._id)
  if (idx !== -1) posts.value[idx] = updatedPost
}
const dropPost = (postId) => {
  posts.value = posts.value.filter(p => p._id !== postId)
  selectedPostId.value = null
}

const filteredPosts = computed(() => {
  return posts.value.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    p.content?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(() => { 
  fetchPosts() 
})
</script>

<template>
  <div class="min-h-screen bg-[#030712] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
    <!-- GLOBAL NAVIGATION BAR -->
    <nav class="sticky top-0 z-50 border-b border-slate-800 bg-[#030712]/80 backdrop-blur-md py-4">
      <div class="max-w-4xl mx-auto px-4 flex items-center justify-between">
        <button @click="selectedPostId = null" class="border-0 bg-transparent text-amber-500 font-mono font-bold uppercase tracking-wider text-sm flex items-center gap-2">
          <i class="bi bi-journal-text text-base"></i> The Scribe's Grove
        </button>
        <div class="flex items-center gap-4">
          <span v-if="isAuthenticated && isAdmin" class="px-2 py-0.5 rounded border border-amber-500/30 text-amber-400 text-xs font-mono uppercase">ADMIN</span>
          <button v-if="isAuthenticated" @click="logout(); posts = []; selectedPostId = null" class="px-3 py-1 text-xs border border-rose-500/40 hover:bg-rose-500/10 text-rose-400 font-mono uppercase tracking-wider rounded-lg transition-all">Sign Out</button>
          <span v-else class="font-mono text-slate-500 text-xs uppercase tracking-wide flex items-center gap-1.5"><i class="bi bi-eye"></i> Guest View</span>
        </div>
      </div>
    </nav>

    <!-- INTRODUCTORY HERO BANNER -->
    <section class="border-b border-slate-900 py-16 text-center relative overflow-hidden bg-gradient-to-b from-slate-950/40 to-transparent">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-36 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="max-w-2xl mx-auto px-4 relative z-1 flex flex-col items-center">
        <span class="inline-block bg-amber-500/10 text-amber-400 font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20 mb-4">Open Knowledge Ledger</span>
        <h1 class="font-theme-header text-3xl md:text-4xl text-white font-bold uppercase mb-4 tracking-tight">Where Ideas Find Form</h1>
        <p class="text-slate-400 text-sm max-w-xl leading-relaxed">
          Welcome to <strong class="text-slate-200 font-mono">The Scribe's Grove - Open Knowledge Ledger</strong>. Explore deep-dives, inspiring chronicles, and surreal concepts by our amazing authors.
        </p>
      </div>
    </section>

    <!-- MAIN CONTAINER BODY -->
    <main class="max-w-3xl mx-auto px-4 py-12">
      
      <!-- AUTHENTICATION CARD SYSTEM (Side-by-Side Flex Split) -->
      <div v-if="!isAuthenticated" class="pro-card mb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div class="md:border-r md:border-slate-800 md:pr-8">
            <h5 class="font-theme-header text-lg text-white font-bold mb-3 uppercase">Claim Your Parchment</h5>
            <p class="text-slate-400 text-sm leading-relaxed mb-0">Join the collective ecosystem to dispatch magical diaries, sync mystical manuscripts, and log adventurer milestones directly into an open feed.</p>
          </div>
          <div>
            <AuthForm @authSuccess="fetchPosts" />
          </div>
        </div>
      </div>

      <!-- WRITING SUITE DRAFT PANEL -->
      <DraftPanel v-if="isAuthenticated" @postCreated="appendPost" class="mb-12" />

      <!-- FEED DIRECTORY ACTIONS HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-8">
        <div class="flex items-center gap-2">
          <span class="font-mono text-slate-400 text-xs uppercase tracking-widest font-bold">Chronicle Index Directory</span>
          <span class="bg-slate-900 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-800 font-mono">{{ posts.length }}</span>
        </div>
        <div class="relative w-full sm:w-60">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none"><i class="bi bi-search text-xs"></i></span>
          <input v-model="searchQuery" type="text" placeholder="Filter manuscripts..." class="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
        </div>
      </div>

      <!-- FEED LOADING ANIMATOR -->
      <div v-if="isFeedLoading" class="text-center py-16 text-slate-500 text-xs font-mono flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-5 w-5 border-2 border-amber-500 border-t-transparent"></div>
        <div>Synchronizing datastore stream sets...</div>
      </div>
      
      <!-- CARD ARRAY CONTAINER -->
      <div v-else-if="filteredPosts.length > 0" class="flex flex-column gap-6">
        <BlogCard 
          v-for="post in filteredPosts" 
          :key="post._id" 
          :post="post" 
          @click="selectedPostId = post._id" 
          class="cursor-pointer group" 
        />
      </div>
      
      <!-- EMPTY DIRECTORY SCREEN NOTIFICATION -->
      <div v-else class="text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-500 font-mono text-xs italic">
        No publications matching your criteria were found.
      </div>
    </main>

    <!-- FIXED FLOATING VIEW OVERLAY PORTAL -->
    <PostReader 
      v-if="selectedPostId" 
      :postId="selectedPostId" 
      @closeReader="selectedPostId = null" 
      @postUpdated="syncPost" 
      @postDeleted="dropPost" 
    />
  </div>
</template>
