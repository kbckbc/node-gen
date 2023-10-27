<template>
  <div class="signup">
    <article>
      <header>
        <h2>Sign up for the best items!</h2>
      </header>
      <form @submit.prevent="signup" method="POST">
        <div class="grid">
          <div>
            <label for="username">Username
              <input type="text" v-model="username" id="username" pattern='^[\w]+$' placeholder="User name. Only use a-z A-Z 0-9 and underline." required autofocus>
            </label>
          </div>
          <div>
            <label for="email">Email
              <input type="email" v-model="email" id="email" pattern='^\S+@\S+\.\S+$' placeholder="Email address" required>
            </label>
          </div>
        </div>
        <div class="grid">
          <div>
            <label for="password">Password
              <input type="password" v-model="password" id="password" pattern='^[\S]+$' placeholder="Password" required>
            </label>
          </div>
          <div>
            <label for="password2">Password Confirm
              <input type="password" v-model="password2" id="password2" pattern='^[\S]+$' placeholder="Password Confirm" required>
            </label>
          </div>
        </div>
        <div>
          <label for="email">Which school is easier to deal with?(You can change it later)
            <select v-model="mySchool">
              <option v-for="name in $func.schoolList['MO']" :key="name" >{{ name }}</option>
            </select>
          </label>
        </div>
        <br>
        <input type="submit" value="Sign up">
      </form>
    </article>
  </div>
</template>
<script>
import axios from 'axios'

export default {
  data () {
    return {
      username: '',
      password: '',
      password2: '',
      email: '',
      mySchool: ''
    }
  },
  methods: {
    // chooseSchool (event) {
    //   this.mySchool = event.target.value
    // },
    // removeSchool (name) {
    //   this.mySchool = ''
    // },
    signup () {
      if (this.password !== this.password2) {
        alert('Password does not match!')
        return
      }
      if (this.mySchool === '') {
        alert('Please choose a school!')
        return
      }
      const arg = {
        username: this.username,
        password: this.password,
        email: this.email,
        mySchool: this.mySchool
      }
      console.log('signup', arg)
      axios.post('/user/signup', arg).then(res => {
        if (res.data.ret === 1) {
          console.log('signup - succ')
          alert('Sign up Success! Plz login!')
          this.$router.push('/login')
        } else {
          // alert error msg
          alert(res.data.msg)
        }
      })
    }
  }
}
</script>
