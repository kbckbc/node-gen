<template>
<div class="detail">
  <article>
    <header>
      <a @click="$router.go(-1)"><i class="material-icons float_left cursor_pointer font_size_50">arrow_back</i></a>
      <h2>Favorite items</h2>
    </header>
    <h3 v-if="favoriteList.length === 0">No favorite items :(</h3>
    <ul v-else>
      <li v-for="item in this.favoriteList" :key="item._id">
        <a @click="selectItemDetail(item.item_id)"><img :src="$hostname + item.itemInfo[0].imageNames[0]" class="tv cursor_pointer" alt="item image"></a>
        <code>{{ $func.formatStatus(item.itemInfo[0].status) }}</code>
        <sub><i class="material-icons font_size_20 color_red">favorite</i></sub>{{ item.itemInfo[0].favorite }}
        [$ {{ item.itemInfo[0].price }}] {{ item.itemInfo[0].title }},
        <b>Where :</b> {{ item.itemInfo[0].location }} at {{ item.itemInfo[0].mySchool }}
      </li>
    </ul>
  </article>
</div>
</template>
<script>
import axios from 'axios'

export default {
  data () {
    return {
      favoriteList: []
    }
  },
  beforeMount () {
    // block not logged in user
    this.$func.checkLogin(this.$store).then(res => {
      console.log('UserInfo', 'beforeMount', 'checkLogin', JSON.stringify(res.data))
      if (res.data.ret === 0) {
        this.$router.push('/login')
      } else {
        this.selectFavoriteList()
      }
    })
  },
  methods: {
    selectFavoriteList () {
      axios.post('/item/selectFavorite', { username: this.$store.state.user.username }).then(res => {
        // if itemdetails is not there, the item has been deleted.
        // do not push those item in the list
        this.favoriteList = res.data.items
        // for (const item of res.data.items) {
        //   this.favoriteList.push(item)
        // }
        console.log('selectFavoriteList', JSON.stringify(this.favoriteList))
      })
    },
    selectItemDetail (id) {
      console.log('id', id)
      this.$router.push({ name: 'thingDetail', params: { id: id } })
    }
  }
}
</script>

<style scoped>
img {
  max-width: 100px;
  margin-right: 20px;
}
</style>
