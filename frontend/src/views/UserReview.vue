<template>
<article>
    <header>
      <a @click="$router.go(-1)"><i class="material-icons float_left cursor_pointer font_size_50">arrow_back</i></a>
      <h2>{{sellerUsername}}'s reviews from buyers</h2>
    </header>
    <h4 v-if="reviewList.length === 0">No reviews yet!</h4>
    <div v-else>
      <h4>Overall score<i class="material-icons color_orange">star</i>{{ avg_score }} out of 5</h4>
      <ul>
          <li v-for="review of reviewList" :key="review.rid">
          <sub><i class="material-icons font_size_30">person_outline</i></sub>{{ review.buyer_username }}
          <i class="material-icons color_orange">star</i>{{ review.score }},
          {{ $func.formatDate(review.date) }},
          {{ review.comment }}
          <a v-if="$store.state.user.username === review.buyer_username" @click="deleteUserReview(review.rid)"><sub><i class="material-icons cursor_pointer">delete</i></sub></a>
          </li>
      </ul>
    </div>
    <!-- Login first to leave a comment -->
    <footer v-if="$store.state.user.username === undefined">
      <b>Singup to leave a comment to the seller</b>
    </footer>
    <!-- Cannot write about myself -->
    <footer v-else-if="$store.state.user.username !== sellerUsername">
        <form @submit.prevent="insertUserReview" method="POST">
        <div class="grid">
          <div>
            <label>Trade History
              <select v-model="tradeItemId" required>
                <option v-for="(item, i) in tradeItemList" :key="i" :value="item.rid">
                  $ {{ item.price}}, {{ item.title }}
                </option>
              </select>
            </label>
          </div>
          <div>
            <label>How many points?
              <select v-model="score">
                <option value=1>1</option>
                <option value=2>2</option>
                <option value=3>3</option>
                <option value=4>4</option>
                <option value=5>5</option>
              </select>
            </label>
          </div>
        </div>
        <div>
          <label>Your comment
            <input type="text" v-model="comment" pattern="^[ ,'()!_~.?\w]+$" required>
          </label>
        </div>
        <input type="submit" value="Leave a review">
      </form>
    </footer>
</article>
</template>

<script>
import axios from 'axios'

export default {
  created () {
    if (this.$route.params.username === undefined) {
      this.sellerUsername = this.$store.state.user.username
    } else {
      this.sellerUsername = this.$route.params.username
    }
  },
  data () {
    return {
      sellerUsername: '',
      reviewList: [],
      comment: '',
      tradeItemId: '',
      tradeItemList: [],
      score: 1,
      avg_score: 1
    }
  },
  beforeMount () {
    this.selectUserReviewList()
    // when not logged in, no need to call this func
    if (this.$store.state.user.username !== undefined) {
      this.selectTradeItemList()
    }
  },
  methods: {
    selectUserReviewList () {
      // const condition = {
      //   username: (this.sellerUsername !== '') ? this.sellerUsername : this.$store.state.user.username
      // }
      const condition = {
        username: this.sellerUsername
      }
      const scores = []
      axios.post('/review/reviewList', condition).then(res => {
        console.log('UserReview', '/review/reviewList', JSON.stringify(res.data))
        this.reviewList = res.data.reviewList
        for (const review of this.reviewList) {
          scores.push(review.score)
        }
        this.avg_score = this.$func.getArrayAvg(scores)
      })
    },
    selectTradeItemList () {
      // select item lists which I bought
      const condition = {
        seller_username: this.sellerUsername
      }

      axios.post('/review/tradeItemList', condition).then(res => {
        console.log('UserReview', '/review/tradeItemList', JSON.stringify(res.data))
        this.tradeItemList = res.data.tradeItemList
        console.log('tradeItemList', this.tradeItemList)
      })
    },
    insertUserReview () {
      const data = {
        csrf: this.$store.state.user.csrf,
        username: this.sellerUsername,
        item_rid: this.tradeItemId,
        score: this.score,
        comment: this.comment
      }
      axios.post('/review/insertUserReview', data).then(res => {
        console.log('UserReview', '/review/insertUserReview', JSON.stringify(res.data))

        if (res.data.ret === 1) {
          console.log('this.comment', this.comment)
          this.comment = ''
          this.selectUserReviewList()
        } else {
          this.comment = ''
          alert(res.data.msg)
        }
      })
    },
    deleteUserReview (rid) {
      const data = {
        csrf: this.$store.state.user.csrf,
        rid: rid
      }
      console.log('deleteUserReview', data)
      axios.post('/review/deleteUserReview', data).then(res => {
        console.log('UserReview', '/review/deleteUserReview', JSON.stringify(res.data))
        if (res.data.ret === 1) {
          this.selectUserReviewList()
        }
      })
    }
  }
}
</script>
