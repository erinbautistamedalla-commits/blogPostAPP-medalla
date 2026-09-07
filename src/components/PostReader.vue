<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { apiRequest } from '../utils/api'

const props = defineProps({
  postId: { type: String, required: true }
})
const emit = defineEmits(['closeReader', 'postDeleted', 'postUpdated'])

const { currentUserId, isAdmin, isAuthenticated } = useAuth()

const post = ref(null)
const commentText = ref('')
const isReaderLoading = ref(true)
const isSubmittingComment = ref(false)

const isInlineEditing = ref(false)
const editTitle = ref('')
const editContent = ref('')
const isSavingEdit = ref(false)
const editFeedback = ref('')

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const fetchPostDetails = async () => {
  try {
    const data = await apiRequest(`/posts/getPost/${props.postId}`)
    post.value = data
    editTitle.value = data.title
    editContent.value = data.content
  } catch {
    emit('closeReader')
  } finally {
    isReaderLoading.value = false
  }
}

const handleUpdatePost = async () => {
  if (!editTitle.value.trim() || !editContent.value.trim()) return
  isSavingEdit.value = true
  try {
    const data = await apiRequest(`/posts/updatePost/${post.value._id}`, { 
      method: 'PATCH', 
      body: JSON.stringify({ title: editTitle.value, content: editContent.value }) 
    })
    post.value.title = data.updatedPost.title
    post.value.content = data.updatedPost.content
    emit('postUpdated', data.updatedPost)
    isInlineEditing.value = false
  } catch (err) {
    editFeedback.value = err.message
  } finally {
    isSavingEdit.value = false
  }
}

const handleSendComment = async () => {
  if (!commentText.value.trim()) return
  isSubmittingComment.value = true
  try {
    const data = await apiRequest(`/posts/addComment/${post.value._id}`, { 
      method: 'POST', 
      body: JSON.stringify({ text: commentText.value }) 
    })
    post.value.comments = data.post.comments
    emit('postUpdated', data.post)
    commentText.value = ''
  } catch (err) {
    console.error(err)
  } finally {
    isSubmittingComment.value = false
  }
}

const handleDeletePost = async () => {
  if (!confirm("Permanently delete this post?")) return
  try {
    await apiRequest(`/posts/deletePost/${post.value._id}`, { method: 'DELETE' })
    emit('postDeleted', post.value._id)
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => fetchPostDetails())
</script>

<template>
  <div class="fixed inset-0 z-[100] bg-[#030712]/98 backdrop-blur-md overflow-y-auto w-screen h-screen px-4 py-12 animate-modal-fade">
    <div class="max-w-3xl mx-auto">
      
      <!-- DISMISS BUTTON COMPONENT -->
      <button @click="emit('closeReader')" class="group text-slate-500 hover:text-slate-300 font-mono text-xs uppercase tracking-wider bg-transparent border-0 mb-6 flex items-center gap-1.5 transition-colors outline-none focus:outline-none">
        <i class="bi bi-chevron-left transition-transform group-hover:-translate-x-1"></i> Back to main index
      </button>

      <!-- LOADER CORE COMPONENT -->
      <div v-if="isReaderLoading" class="text-center py-16 text-slate-500 text-xs font-mono flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-5 w-5 border-2 border-amber-500 border-t-transparent"></div>
        <div>Synchronizing record data blocks...</div>
      </div>

      <!-- MASTER DETAILS DOCUMENT CARD -->
      <div v-else-if="post" class="pro-card border border-slate-800/80 bg-slate-900/20 shadow-2xl p-6 md:p-10">
        
        <!-- EDIT COMPOSITION INTERACTIVE SURFACE CONTAINER -->
        <form v-if="isInlineEditing" @submit.prevent="handleUpdatePost" class="space-y-4">
          <h5 class="font-mono text-amber-500 text-xs uppercase font-bold tracking-wider mb-2">Modify Manuscript Content</h5>
          <div v-if="editFeedback" class="bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-mono p-2.5 rounded-lg">{{ editFeedback }}</div>
          <div>
            <label class="block font-mono text-slate-400 uppercase text-[11px] tracking-wider mb-1.5">Title</label>
            <input v-model="editTitle" type="text" class="pro-input" required />
          </div>
          <div>
            <label class="block font-mono text-slate-400 uppercase text-[11px] tracking-wider mb-1.5">Content Body</label>
            <textarea v-model="editContent" rows="10" class="pro-input font-theme-serif" required></textarea>
          </div>
          <div class="flex gap-2.5 pt-2">
            <button type="submit" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-mono uppercase font-bold rounded-lg transition-all">{{ isSavingEdit ? 'Saving...' : 'Save Changes' }}</button>
            <button type="button" @click="isInlineEditing = false" class="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-300 text-xs font-mono uppercase rounded-lg transition-all">Cancel</button>
          </div>
        </form>

        <!-- STATIC READ TEXT INTERFACE DISPLAY PANEL -->
        <div v-else>
          <header class="text-center mb-8 pb-5 border-b border-slate-800/60">
            <h2 class="text-white font-bold text-2xl md:text-3xl tracking-tight mb-3">{{ post.title }}</h2>
            <div class="text-slate-500 font-mono text-xs uppercase tracking-wide">
              By <span class="text-amber-500">@{{ post.author?.username || 'scribe' }}</span> • Inscribed {{ formatDate(post.dateAdded) }}
            </div>
          </header>
          <div class="text-slate-300 font-theme-serif leading-relaxed text-base md:text-lg mb-8 whitespace-pre-line">
            {{ post.content }}
          </div>
        </div>

        <!-- PERMISSION CONTROLS PANEL FOOTER METRICS -->
        <div v-if="!isInlineEditing && (post.author?._id === currentUserId || post.author === currentUserId || isAdmin)" class="bg-slate-950/60 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between gap-4 mb-8">
          <span class="font-mono text-slate-500 text-[11px] uppercase tracking-wider font-bold">Manuscript Privileges</span>
          <div class="flex gap-2">
            <button @click="isInlineEditing = true" class="px-3 py-1.5 border border-amber-500/40 hover:bg-amber-500/10 text-amber-400 text-xs font-mono uppercase rounded-lg transition-all">Edit</button>
            <button v-if="isAdmin" @click="handleDeletePost" class="px-3 py-1.5 border border-rose-500/40 hover:bg-rose-500/10 text-rose-400 text-xs font-mono uppercase rounded-lg transition-all">Delete</button>
          </div>
        </div>

        <!-- DISCUSSION GROUP FEED LIST -->
        <section class="pt-6 border-t border-slate-800/60">
          <h6 class="font-mono text-amber-500 text-xs uppercase font-bold tracking-wider mb-6 flex items-center gap-2">
            <i class="bi bi-chat-square-text text-sm"></i> Discussion ({{ post.comments?.length || 0 }} Echoes)
          </h6>

          <!-- DYNAMIC REPLY FORMS TRACK CONTROLLER -->
          <div v-if="isAuthenticated" class="mb-6">
            <form @submit.prevent="handleSendComment" class="flex gap-3">
              <input 
                v-model="commentText" 
                type="text" 
                placeholder="Record an echo response..." 
                class="pro-input py-2" 
                required 
              />
              <button type="submit" :disabled="isSubmittingComment" class="px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs uppercase font-bold tracking-wider rounded-xl transition-all whitespace-nowrap">
                {{ isSubmittingComment ? 'Sending...' : 'Reply' }}
              </button>
            </form>
          </div>
          <div v-else class="bg-slate-950/40 border border-slate-800/30 text-slate-500 font-mono text-xs p-4 rounded-xl mb-6 flex items-center gap-2">
            <i class="bi bi-lock-fill text-amber-500"></i> 
            <span>Sign in at the directory dashboard index above to post comments.</span>
          </div>

          <!-- REPLIES LOOP INNER BLOCK -->
          <div v-if="post.comments?.length > 0" class="space-y-4">
            <div v-for="comment in post.comments" :key="comment._id" class="p-4 bg-slate-950/20 border border-slate-800/40 rounded-xl">
              <div class="flex items-center justify-between gap-4 mb-2 font-mono text-[11px]">
                <span class="text-amber-500 font-bold">@{{ comment.author?.username || 'anonymous' }}</span>
                <span class="text-slate-500">{{ formatDate(comment.dateAdded) }}</span>
              </div>
              <p class="text-slate-300 text-sm leading-relaxed mb-0 font-theme-serif">{{ comment.text }}</p>
            </div>
          </div>
          <div v-else class="text-center py-6 text-slate-600 font-mono text-xs italic">
            No replies are logged onto this entry.
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-modal-fade {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
