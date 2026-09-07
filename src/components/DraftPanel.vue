<script setup>
import { ref } from 'vue'
import { apiRequest } from '../utils/api'

const emit = defineEmits(['postCreated'])

const isDraftingOpen = ref(false)
const newTitle = ref('')
const newContent = ref('')
const isPublishing = ref(false)
const createFeedback = ref('')

const handlePublishDraft = async () => {
  if (!newTitle.value.trim() || !newContent.value.trim()) return
  isPublishing.value = true
  createFeedback.value = ''

  try {
    const freshPost = await apiRequest('/posts/addPost', { 
      method: 'POST', 
      body: JSON.stringify({ title: newTitle.value, content: newContent.value }) 
    })
    emit('postCreated', freshPost)
    newTitle.value = ''
    newContent.value = ''
    isDraftingOpen.value = false
  } catch (err) {
    createFeedback.value = err.message || 'Failed to archive publication.'
  } finally {
    isPublishing.value = false
  }
}
</script>

<template>
  <section class="w-full">
    <!-- WRITING CANVAS TRIGGER LINK BAR BUTTON -->
    <button 
      @click="isDraftingOpen = !isDraftingOpen" 
      class="w-full py-3.5 px-5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-xl font-mono text-xs uppercase tracking-wider font-bold text-left flex justify-between items-center transition-all duration-300 outline-none focus:outline-none"
    >
      <span class="text-amber-500 flex items-center gap-2">
        <i class="bi bi-pencil-square text-sm"></i> 
        {{ isDraftingOpen ? 'Close Writing Canvas' : 'Draft Fresh Insight' }}
      </span>
      <i :class="['bi text-slate-500 transition-transform duration-200 text-xs', isDraftingOpen ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
    </button>
    
    <!-- EXPANDABLE WRITING SURFACE CANVAS -->
    <div v-if="isDraftingOpen" class="pro-card mt-4 border border-slate-800 bg-slate-900/30 shadow-xl transition-all duration-300 animate-slide-down">
      <form @submit.prevent="handlePublishDraft" class="space-y-5">
        
        <!-- ERROR STATE STICKER BLOCK -->
        <div v-if="createFeedback" class="bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-mono p-3 rounded-xl flex items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill text-rose-500"></i>
          <span>{{ createFeedback }}</span>
        </div>
        
        <!-- INPUT GRID CHUNK TITLE -->
        <div>
          <label class="block font-mono text-slate-400 uppercase text-[11px] tracking-wider mb-1.5">Manuscript Title</label>
          <input 
            v-model="newTitle" 
            type="text" 
            class="pro-input" 
            placeholder="Title your insight log..." 
            required 
          />
        </div>
        
        <!-- BODY CONTENT TEXTAREA FIELD CHUNK -->
        <div>
          <label class="block font-mono text-slate-400 uppercase text-[11px] tracking-wider mb-1.5">Manuscript Body Content</label>
          <textarea 
            v-model="newContent" 
            rows="6" 
            class="pro-input font-theme-serif" 
            placeholder="Compose data lines cleanly here..." 
            required
          ></textarea>
        </div>
        
        <!-- SUBMISSION CTA STRIP LINE -->
        <div class="flex justify-end pt-2">
          <button 
            type="submit" 
            :disabled="isPublishing" 
            class="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-mono text-xs uppercase font-bold tracking-wider rounded-xl transition-all shadow-md shadow-amber-600/5 flex items-center gap-2"
          >
            <div v-if="isPublishing" class="animate-spin rounded-full h-3 w-3 border-2 border-slate-950 border-t-transparent"></div>
            <span>{{ isPublishing ? 'Publishing...' : 'Publish to Feed' }}</span>
          </button>
        </div>

      </form>
    </div>
  </section>
</template>

<style scoped>
.animate-slide-down {
  animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
