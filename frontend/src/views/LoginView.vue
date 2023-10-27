<template>
  <div class="login">
    <article>
      <header>
        <h2>Login and find the best items!</h2>
      </header>
      <form @submit.prevent="login()" method="POST">
        <label for="username">Username
          <input type="text" v-model="username" id="username" pattern='^[\w]+$' placeholder="User name. Only use a-z A-Z 0-9 and underline." required autofocus >
        </label>
        <label for="password">Password
          <input type="password" v-model="password" id="password" pattern='^[\S]+$' placeholder="Password." required>
        </label>
        <br>
        <input type="submit" value="Login">
      </form>
    </article>
  </div>
</template>
<script>
export default {
  data () {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    login () {
      this.$func.loginWithPassword(this.$store, this.username, this.password).then(res => {
        console.log('LoginView', JSON.stringify(res.data))
        if (res.data.ret === 1) {
          this.$router.push('/things')
        } else {
          alert(res.data.msg)
        }
        this.username = ''
        this.password = ''
      })
    }
  }
}
</script>
