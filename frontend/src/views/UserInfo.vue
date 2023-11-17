<template>
<div class="userinfo">
  <article>
    <header>
      <a @click="$router.go(-1)"><i class="material-icons float_left cursor_pointer font_size_50">arrow_back</i></a>
      <h2>My page</h2>
    </header>
    <label for="username">Username
      <input type="text" v-model="username" id="username" disabled>
    </label>
    <div class="grid">
      <div>
        <label for="email">Email
          <input type="email" v-model="email" id="email" disabled>
        </label>
      </div>
      <div>
        <label for="joindate">Join date
          <input type="text" v-model="joindate" id="joindate" disabled>
        </label>
      </div>
    </div>
    <br>
    <form @submit.prevent="passwordChange" method="POST">
      <div class="grid">
        <div>
          <input type="password" v-model="password" id="password" pattern='^[\S]+$' placeholder="Password" required autofocus>
        </div>
        <div>
          <input type="password" v-model="password2" id="password2" pattern='^[\S]+$' placeholder="Password Confirm" required>
        </div>
        <div>
          <input type="submit" value="Update Password">
        </div>
      </div>
    </form>
    <form @submit.prevent="schoolChange" method="POST">
      <div class="grid">
        <div>
          <select v-model="myschool">
            <option v-for="name in $func.schoolList['MO']" :key="name" >{{ name }}</option>
          </select>
        </div>
        <div>
          <input type="submit" value="Update School List">
        </div>
      </div>
    </form>
  </article>
</div>
</template>
<script>
import axios from 'axios'

export default {
  data () {
    return {
      username: this.$store.state.user.username,
      email: this.$store.state.user.email,
      joindate: this.$func.formatDateTime(this.$store.state.user.joindate),
      myschool: this.$store.state.user.myschool,
      password: '',
      password2: ''
    }
  },
  beforeMount () {
    // block not logged in user
    this.$func.checkLogin(this.$store).then(res => {
      console.log('UserInfo', 'beforeMount', 'checkLogin', JSON.stringify(res.data))
      if (res.data.ret === 0) {
        this.$router.push('/login')
      }
    })
  },
  methods: {
    passwordChange () {
      if (this.password !== this.password2) {
        alert('Password does not match!')
        return
      }
      const arg = {
        csrf: this.$store.state.user.csrf,
        username: this.username,
        password: this.password
      }
      axios.post('/user/passwordChange', arg).then(res => {
        this.msg = res.data.username
        if (res.data.ret === 1) {
          alert('Password has been changed!')
          this.password = ''
          this.password2 = ''
        } else {
          // alert error msg
          alert(res.data.msg)
        }
      })
    },
    chooseSchool (event) {
      this.myschool = event.target.value
    },
    removeSchool (name) {
      this.myschool = ''
    },
    schoolChange () {
      if (this.myschool === '') {
        alert('Please choose a school!')
        return
      }
      const arg = {
        csrf: this.$store.state.user.csrf,
        myschool: this.myschool
      }
      axios.post('/user/schoolChange', arg).then(res => {
        if (res.data.ret === 1) {
          alert(res.data.msg)
          this.$store.state.user.myschool = this.myschool
        } else {
          // alert error msg
          alert(res.data.msg)
        }
      })
    }
  }
}
</script>
