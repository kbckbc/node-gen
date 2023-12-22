<template>
<div class="detail">
  <article>
    <header>
      <a @click="$router.go(-1)"><i class="material-icons float_left cursor_pointer font_size_50">arrow_back</i></a>
      <span v-if="$store.state.user.username !== undefined && itemDetail.username !== $store.state.user.username">
        <a v-if="toggleFavorite === 1" @click="toggleFavoriteItem(itemDetail.rid)"><i class="material-icons float_right cursor_pointer font_size_50">bookmark</i></a>
        <a v-else @click="toggleFavoriteItem(itemDetail.rid)"><i class="material-icons float_right cursor_pointer font_size_50">bookmark_border</i></a>
      </span>
      <span v-if="itemDetail.username === $store.state.user.username">
        <a @click="deleteItem(itemDetail.rid)"><i class="material-icons float_right cursor_pointer font_size_50">delete</i></a>
        <a @click="editItem(itemDetail.rid)"><i class="material-icons float_right cursor_pointer font_size_50">mode_edit</i></a>
      </span>
      <h2>Item Detail</h2>
    </header>
    <img v-for="(name, i) in itemDetail.image_names" :src="$hostname + name" :key="i" class="tv" alt="item image"/>
    <footer>
      <div>
        <code>{{ $func.formatStatus(itemDetail.status) }}</code>
        <sub><i class="material-icons font_size_20 color_red">favorite</i></sub>{{ itemDetail.favorite }}
      </div>
      <div><b>Title : </b>{{ itemDetail.title }}</div>
      <div><b>Price : </b>$ {{ itemDetail.price }}</div>
      <div><b>User : </b><a @click="routeUserReview(itemDetail.username)" class="cursor_pointer"><sub><i class="material-icons font_size_30">person_outline</i></sub>{{ itemDetail.username }}</a></div>
      <div><b>Where : </b>{{ itemDetail.location }} at {{ itemDetail.myschool }}</div>
      <div><b>Post Date : </b>{{ $func.formatDate(itemDetail.date) }}</div>
      <div><b>Description : </b>{{ itemDetail.description }}</div>
    </footer>
  </article>
  <article>
    <header><h3>Comments</h3></header>
    <h4 v-if="commentList.length === 0">No comments yet!</h4>
    <p v-else>
      <ul>
      <li v-for="comment of commentList" :key="comment.rid">
        <sub><i class="material-icons font_size_30">person_outline</i></sub>{{ comment.username }}
        {{ $func.formatDate(comment.date) }},
        {{ comment.comment }}
        <a v-if="$store.state.user.username == comment.username" @click="deleteComment(comment.rid)"><sub><i class="material-icons cursor_pointer font_size_30">delete</i></sub></a>
      </li>
      </ul>
    </p>
    <footer v-if="$store.state.user.username === undefined">
      <b>Signup to contact to the seller!</b>
    </footer>
    <footer v-else-if="itemDetail.status === '2'">
      <b>Can't leave a msg on a sold item!</b>
    </footer>
    <footer v-else-if="$store.state.user.username !== undefined">
      <form @submit.prevent="insertComment" method="POST">
        <div class="grid">
          <div><input type="text" v-model="comment" pattern="^[ ,'()!_~.?\w]+$" required></div>
          <div><input type="submit" value="Add comment"></div>
        </div>
      </form>
    </footer>
  </article>
</div>
</template>
<script>
import axios from 'axios'

export default {
  beforeMount () {
    console.log('Params: ', this.$route.params)
    this.selectItemDetail()
    this.selectFavoriteYn()
    this.selectCommentList()
  },
  data () {
    return {
      itemDetail: {},
      commentList: [],
      comment: '',
      toggleFavorite: 0
    }
  },
  methods: {
    routeUserReview (username) {
      console.log('routeUserReview', username)
      this.$router.push({ name: 'rating', params: { username: username } })
    },
    selectItemDetail () {
      axios.post('/item/detail', { rid: this.$route.params.rid }).then(res => {
        console.log('ThingsDetailView', '/item/detail', JSON.stringify(res.data))
        this.itemDetail = res.data.detail
      })
    },
    selectFavoriteYn () {
      axios.post('/item/selectFavoriteYn', { rid: this.$route.params.rid }).then(res => {
        console.log('ThingsDetailView', '/item/selectFavoriteYn', JSON.stringify(res.data))
        // this.itemDetail = res.data.detail
        this.toggleFavorite = res.data.ret
      })
    },
    selectCommentList () {
      axios.post('/item/commentList', { rid: this.$route.params.rid }).then(res => {
        console.log('ThingsDetailView', '/item/commentList', JSON.stringify(res.data))
        this.commentList = res.data.commentList
      })
    },
    insertComment () {
      const data = {
        csrf: this.$store.state.user.csrf,
        item_rid: this.$route.params.rid,
        comment: this.comment,
        status: this.itemDetail.status
      }
      console.log('ThingsDetailView', 'const data', JSON.stringify(data))

      axios.post('/item/insertComment', data).then(res => {
        console.log('ThingsDetailView', '/item/insertComment', JSON.stringify(res.data))

        if (res.data.ret === 1) {
          console.log('this.comment', this.comment)
          // this.commentList.push({ comment: this.comment, username: this.$store.state.user.username })
          this.comment = ''
          this.selectCommentList()
        } else {
          this.comment = ''
          alert(res.data.msg)
        }
      })
    },
    deleteComment (rid) {
      console.log('deleteComment', rid)
      axios.post('/item/deleteComment', { csrf: this.$store.state.user.csrf, rid: rid }).then(res => {
        console.log('ThingsDetailView', '/item/deleteComment', JSON.stringify(res.data))
        if (res.data.ret === 1) {
          this.selectCommentList()
        }
      })
    },
    editItem (rid) {
      this.$store.state.user.param_rid = rid
      this.$router.push('/write')
    },
    deleteItem (rid) {
      console.log('deleteItem', rid)
      axios.post('/item/delete', { csrf: this.$store.state.user.csrf, rid: rid }).then(res => {
        console.log('ThingsView', '/item/delete', JSON.stringify(res.data))
        if (res.data.ret === 1) {
          // this.this.selectItemList()
          this.$store.state.itemList = []
          this.$store.state.touchEnd = 0
          this.$store.state.startFrom = 0

          this.$router.push('/things')
        }
      })
    },
    toggleFavoriteItem (rid) {
      if (this.toggleFavorite === 1) {
        this.deleteFavoriteItem(rid)
      } else {
        this.addFavoriteItem(rid)
      }

      this.$store.state.itemList = []
      this.$store.state.touchEnd = 0
      this.$store.state.startFrom = 0
    },
    addFavoriteItem (rid) {
      console.log('addFavoriteItem', rid)
      axios.post('/item/addFavorite', { csrf: this.$store.state.user.csrf, rid: rid }).then(res => {
        console.log('ThingsView', 'addFavoriteItem', JSON.stringify(res.data))
        if (res.data.ret === 0) {
          alert(res.data.msg)
        } else {
          this.toggleFavorite = 1
        }
      })
    },
    deleteFavoriteItem (rid) {
      console.log('deleteFavoriteItem', rid)
      axios.post('/item/deleteFavorite', { csrf: this.$store.state.user.csrf, rid: rid }).then(res => {
        console.log('ThingsView', 'deleteFavorite', JSON.stringify(res.data))
        if (res.data.ret === 0) {
          alert(res.data.msg)
        } else {
          this.toggleFavorite = 0
        }
      })
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
