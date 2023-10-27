<template>
<div class="hello">
  <article>
    <header>
      <h5>Are you on a tight budget? Are textbooks expensive? Are course materials expensive?</h5>
    </header>
    <h3>All of these are possible</h3>
    <ul>
      <li>No usage fee</li>
      <li>Buying and selling goods at your school</li>
      <li>Registering items of interest as favorites</li>
      <li>Safe transaction by looking at transaction reviews</li>
    </ul>
    <footer>
      <img src='../assets/logo2.jpg' alt="Bear market logo">
    </footer>
    <!-- {{ $store.state }} -->
  </article>
</div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 20px 0px 20px 0px;
}
ul {
  text-align: center;
}
</style>
