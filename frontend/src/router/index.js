import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/mypage',
    name: 'mypage',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "mypage" */ '../views/UserInfo.vue')
  },
  {
    path: '/rating/:username',
    name: 'rating',
    component: () => import(/* webpackChunkName: "rating" */ '../views/UserReview.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '../views/LoginView.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import(/* webpackChunkName: "signup" */ '../views/SignupView.vue')
  },
  {
    path: '/write',
    name: 'write',
    component: () => import(/* webpackChunkName: "write" */ '../views/WriteView.vue')
  },
  {
    path: '/things',
    name: 'things',
    component: () => import(/* webpackChunkName: "things" */ '../views/ThingsView.vue')
  },
  {
    path: '/myitems/:username',
    name: 'myitems',
    component: () => import(/* webpackChunkName: "myitems" */ '../views/ThingsView.vue')
  },
  {
    path: '/thingDetail/:rid',
    name: 'thingDetail',
    component: () => import(/* webpackChunkName: "thingDetail" */ '../views/ThingDetailView.vue')
  },
  {
    path: '/favorite',
    name: 'favorite',
    component: () => import(/* webpackChunkName: "favorite" */ '../views/FavoriteView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/'),
  routes
})

export default router
