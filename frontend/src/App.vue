<template>
  <article class="article_nav">
  <h2 class="article_header">a</h2>
  <nav>
    <ul>
      <li><router-link to="/"><img src='./assets/logo.png' alt="Bear market logo" class="logo"></router-link></li>
    </ul>
    <ul v-if="$store.state.user.username === undefined">
      <li><router-link to="/things">Items</router-link></li>
      <li><router-link to="/login">Login</router-link></li>
      <li><router-link to="/signup">Signup</router-link></li>
    </ul>
    <ul v-else>
      <li><router-link to="/things">Items</router-link></li>
      <li><router-link to="/mypage">Hello, {{$store.state.user.username}}</router-link></li>
      <li><router-link to="/favorite">Favorite</router-link></li>
      <li><a href="#" @click="$router.push({ name: 'rating', params: { username: $store.state.user.username} })">My score</a></li>
      <!-- <li><a href="#" @click="$router.push({ name: 'myitems', params: { username: $store.state.user.username} })">My Items</a></li> -->
      <li><a href="#" @click="logout()">Logout</a></li>
    </ul>
  </nav>
  </article>
    <router-view/>
</template>

<script>
export default {
  beforeMount () {
    this.$func.checkLogin(this.$store).then(res => {
      if (this.$store.state.user.username === undefined) {
        this.$router.push('/')
      }
    })
  },
  methods: {
    logout () {
      this.$func.logout(this.$store).then(res => {
        this.$router.push('/')
      })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.article_nav {
  padding: 0px;
  margin: 10px 0px 10px 0px;
}

nav {
  padding: 10px 30px 10px 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.logo {
  width:50px;
  margin-right:10px;
  margin-left:20px;
}

.article_header {
  display: none;
}
</style>
