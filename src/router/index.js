import { createRouter, createWebHistory } from 'vue-router'
import BlogHome from '../pages/BlogHome.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: BlogHome
  },
  // Catch-all route fallback: redirects any random paths safely back to the home screen
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
