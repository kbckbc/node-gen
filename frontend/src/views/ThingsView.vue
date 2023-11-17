<template>
<div class="things">
  <article>
    <header>
      <span v-if="$store.state.user.username !== undefined"><a @click="$router.push('/write')"><i class="material-icons float_right cursor_pointer font_size_50" >add_circle</i></a></span>
      <div v-if="$route.params.username === undefined">
        <h2>Item List</h2>
        <h5 v-if="$store.state.user.username !== undefined">at {{ $store.state.user.myschool }}</h5>
      </div>
      <h2 v-else>My item List</h2>
    </header>
    <h2 v-if="data.items.length === 0">No items on the list :(</h2>
    <div v-else v-for="item in data.items" :key="item._id" class="grid margin_bottom_20">
      <div>
        <div>
          <code>{{ $func.formatStatus(item.status) }}</code>
          <sub><i class="material-icons font_size_20 color_red">favorite</i></sub>{{ item.favorite }}
        </div>
        <br>
        <a @click="selectItemDetail(item._id)"><img :src="$hostname + item.image_names[0]" class="tv cursor_pointer" alt="Item image"></a>
      </div>
      <div>
        <div>
          <mark><b>[$ {{ item.price }}] {{ item.title }}</b></mark>
        </div>
        <div><b>User : </b><a @click="routeUserReview(item.username)" class="cursor_pointer"><sub><i class="material-icons font_size_30">person_outline</i></sub>{{ item.username }}</a></div>
        <div><b>Where : </b>{{ item.location }} at {{ item.myschool }}</div>
        <div><b>Post Date : </b>{{ $func.formatDate(item.date) }}</div>
        <!-- <div><b>Description : </b>{{ item.description }}</div> -->
      </div>
    </div>
    <footer>
      <span v-if="touchEnd === 1">The end</span>
      <a v-else @click="selectItemList()">Load more</a>
    </footer>
  </article>
</div>
</template>
<script>
import axios from 'axios'
import { reactive } from 'vue'

export default {
  created () {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        // react to route changes...
        this.selectItemList()
      }
    )
  },
  data () {
    const data = reactive({
      items: []
    })
    return {
      data,
      touchEnd: 0,
      startFrom: 0,
      limitCnt: this.$func.limitCnt
    }
  },
  beforeMount () {
    this.$func.checkLogin(this.$store)
    this.selectItemList()
  },
  methods: {
    routeUserReview (username) {
      // do a deep copy before move on
      this.$store.state.itemList = JSON.parse(JSON.stringify(this.data.items))
      this.$store.state.touchEnd = this.touchEnd
      this.$store.state.startFrom = this.startFrom

      // go to a user review page
      this.$router.push({ name: 'rating', params: { username: username } })
    },
    selectItemList () {
      if (this.$store.state.itemList.length !== 0) {
        this.data.items = JSON.parse(JSON.stringify(this.$store.state.itemList))
        this.touchEnd = this.$store.state.touchEnd
        this.startFrom = this.$store.state.startFrom

        this.$store.state.itemList = []
        this.$store.state.touchEnd = 0
        this.$store.state.startFrom = 0
      } else {
        const condition = {
          username: this.$route.params.username,
          startFrom: this.startFrom,
          limitCnt: this.limitCnt
        }
        axios.post('/item/list', condition).then(res => {
          console.log('ThingsView', '/item/list', JSON.stringify(res.data))
          if (res.data.items.length === 0) {
            this.touchEnd = 1
          } else {
            this.data.items = this.data.items.concat(res.data.items)
            this.startFrom += this.limitCnt
          }
          console.log('selectItemList end', this.startFrom)
        })
      }
    },
    selectItemDetail (id) {
      // do a deep copy before move on
      this.$store.state.itemList = JSON.parse(JSON.stringify(this.data.items))
      this.$store.state.touchEnd = this.touchEnd
      this.$store.state.startFrom = this.startFrom

      // go to a detail page
      this.$router.push({ name: 'thingDetail', params: { id: id } })
    }
  }
}
</script>

<style scoped>
img {
  width: 100%;
  height: auto;
  max-width: 80vw;
}
</style>
