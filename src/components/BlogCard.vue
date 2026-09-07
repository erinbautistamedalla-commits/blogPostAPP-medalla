<script setup>
defineProps({
  post: { type: Object, required: true }
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <!-- Clean list card interface module utilizing your explicit .pro-card layer layout tokens -->
  <div class="pro-card w-full hover:border-amber-500/30 hover:shadow-amber-500/[0.02] transition-all duration-300 group flex flex-col justify-between">
    <div>
      <!-- System Metadata Tracking Row -->
      <div class="flex flex-wrap items-center gap-2 text-slate-500 font-mono text-[11px] uppercase tracking-wide mb-3">
        <span class="bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
          Manuscript
        </span>
        <span>•</span>
        <span>{{ formatDate(post.dateAdded) }}</span>
        <span>•</span>
        <span class="text-slate-400">By @{{ post.author?.username || 'unknown' }}</span>
      </div>

      <!-- Content Post Entry Heading -->
      <h4 class="text-white font-bold text-lg mb-2 group-hover:text-amber-400 transition-colors duration-200">
        {{ post.title }}
      </h4>

      <!-- Excerpt Body Snippet Section -->
      <p class="text-slate-400 text-sm font-theme-serif line-clamp-2 mb-6 leading-relaxed">
        {{ post.content }}
      </p>
    </div>

    <!-- Interface Interactive Action Strip Bar Footer Line -->
    <div class="flex items-center justify-between pt-4 border-t border-slate-800/60 mt-auto">
      <span class="text-amber-500 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 group-hover:text-amber-400 transition-colors">
        Read Full Text <i class="bi bi-arrow-right transition-transform group-hover:translate-x-1"></i>
      </span>
      <span class="text-slate-500 font-mono text-xs flex items-center gap-1.5">
        <i class="bi bi-chat-left-text text-amber-500/60"></i> {{ post.comments?.length || 0 }} Echoes
      </span>
    </div>
  </div>
</template>
