<template>
  <div class="min-vh-screen bg-dark text-light font-sans py-4">
    <BlogHome />
  </div>
</template>

<script setup>
import BlogHome from './pages/BlogHome.vue'
</script>

<style>
/* Clean typography adjustments to make reading long texts highly accessible */
body {
  background-color: #12141c !important;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
.font-serif-read {
  font-family: 'Georgia', serif;
  line-height: 1.8;
}
</style>
