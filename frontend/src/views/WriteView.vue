<template>
<div class="write">
  <article>
    <header>
      <a @click="cancelItem()"><i class="material-icons float_left cursor_pointer font_size_50">arrow_back</i></a>
      <h2 v-if="this.param_id !== ''">Edit item</h2>
      <h2 v-else>Write item</h2>
    </header>
    <form @submit.prevent="insertItem" method="POST">
      <div class="grid">
        <div>
          <label>Trade status
            <select v-model="status" :disabled="this.param_id === ''">
              <option value="0" >Available</option>
              <option value="1" >During trade</option>
              <option value="2" >Sold</option>
            </select>
          </label>
        </div>
        <div v-if="status === '2'">
          <label><b>Who did you sell it to?</b>
            <select v-model="buyer_username" :disabled="this.param_id === ''">
              <option v-for="(username, i) in commentUserList" :key="i" :value="username">
                {{ username }}
              </option>
            </select>
          </label>
        </div>
      </div>
      <div class="grid">
        <div>
          <label>Title
            <input type="text" v-model="title" pattern="^[ ,'()!_~.?\w]+$" placeholder="An appealing title" required>
          </label>
        </div>
        <div>
          <label>Price
            <input type="number" v-model="price" required>
          </label>
        </div>
      </div>
      <div class="grid">
        <div>
          <label>School
            <input v-model="mySchool" disabled>
          </label>
        </div>
        <div>
          <label>Location
            <input type="text" v-model="location" pattern="^[ ,'()!_~.?\w]+$" placeholder="Where do you want to trade?" required>
          </label>
        </div>
      </div>
      <label>Description
        <input maxlength="500" v-model="description" pattern="^[ ,'()!_~.?\w]+$" placeholder="Write simple but important issues" required>
      </label>
      <div>
        <label>Item Images
          <input ref="fileupload" type="file"  @change="selectedImage($event)" accept="image/*" multiple>
        </label>
        <div class="grid">
          <div v-for="(name, i) in imageNames" :key="i">
            <div><a @click="deleteImage(name)"><i class="material-icons">delete</i>Delete</a></div>
            <div>
              <img :src="$hostname + name" class="tv" alt="item image">
            </div>
          </div>
        </div>
      </div>
      <br><br>
      <div class="grid">
        <div><input type="submit" value="Done"></div>
      </div>
    </form>
  </article>
</div>
</template>
<script>
import axios from 'axios'

export default {
  beforeMount () {
    // check whether this page is called from edit page or not
    console.log('WriteView', 'beforeMount', this.$store.state.user.param_id)
    if (this.$store.state.user.param_id !== undefined) { // if if's editing mode
      this.param_id = this.$store.state.user.param_id
      this.$store.state.user.param_id = ''

      this.selectItemDetail()
      this.selectCommentList()
    }
  },
  data () {
    return {
      username: this.$store.state.user.username,
      title: '',
      status: '0',
      price: 0,
      mySchool: this.$store.state.user.mySchool,
      location: '',
      description: '',
      imageNames: [],
      images: [],
      param_id: '',
      commentUserList: [],
      buyer_username: ''
    }
  },
  methods: {
    selectItemDetail () {
      axios.post('/item/detail', { id: this.param_id }).then(res => {
        console.log('WriteView', '/item/detail', JSON.stringify(res.data))
        this.title = res.data.detail.title
        this.status = res.data.detail.status
        this.price = res.data.detail.price
        this.location = res.data.detail.location
        this.description = res.data.detail.description
        this.imageNames = res.data.detail.imageNames
        this.buyer_username = res.data.detail.buyer_username
      })
    },
    selectCommentList () {
      axios.post('/item/commentList', { id: this.param_id }).then(res => {
        console.log('WriteView', '/item/commentList', JSON.stringify(res.data))
        for (const comment of res.data.commentList) {
          this.commentUserList.push(comment.username)
        }
        // remove dupicate username
        this.commentUserList = this.$func.removeArrayDup(this.commentUserList)
        // remove writer
        this.commentUserList = this.commentUserList.filter(username => username !== this.$store.state.user.username)
        console.log('selectCommentList', this.commentUserList)
      })
    },
    async selectedImage (event) {
      console.log('asfasdlfdsk', event.target.files[0])
      console.log('asfasdlfdsk', event.target.files.length)

      for (let i = 0; i < event.target.files.length; i++) {
        console.log('size', event.target.files[i].size)
        if (event.target.files[i].size > 2000000) {
          this.$refs.fileupload.value = null
          alert('Image size limit is 2 Mb. Please choose other one.')
          return
        };
      }
      try {
        let fileUploadMsg = ''
        for (let i = 0; i < event.target.files.length; i++) {
          console.log('length', this.imageNames.length)
          if (this.imageNames.length > 2) {
            this.$refs.fileupload.value = null
            alert('Up to 3 image files can be uploaded.')
            break
          } else {
            const formData = new FormData()
            formData.append('image', event.target.files[i])
            const res = await axios.post('/item/insertImage',
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              }
            )

            // if file upload fails, then return
            if (res.data.ret === 1) {
              this.imageNames.push(res.data.filename)
            } else {
              fileUploadMsg = res.data.msg
            }
          }
        }

        // if file upload fail, then back to the list
        if (fileUploadMsg !== '') {
          alert(fileUploadMsg)
          this.$router.push('/things')
        } else {
          this.$refs.fileupload.value = null
        }
      } catch (err) {
        console.log('File upload err', err)
      }
    },
    insertItem () {
      console.log('WriteView.vue', 'insertItem', this.images)
      if (this.imageNames.length === 0) {
        alert('Upload up to 3 images of your item')
        return
      }

      const arg = {
        csrf: this.$store.state.user.csrf,
        title: this.title,
        status: this.status,
        price: this.price,
        mySchool: this.mySchool,
        location: this.location,
        description: this.description,
        imageNames: this.imageNames
      }

      // if this page is doing edit
      if (this.param_id !== '') {
        // check whether the buyer is set or not
        if (this.status === '2' && this.buyer_username === '') {
          alert('Please set a buyer!')
          return
        }

        // when editing, id is needed
        arg.id = this.param_id
        console.log('buyer_username', this.buyer_username)
        arg.buyer_username = this.buyer_username
        axios.post('/item/update', arg).then(res => {
          console.log('WriteView', '/item/update', JSON.stringify(res.data))
          if (res.data.ret === 1) {
            // alert('insert item succ ! Plz login!')
            this.$router.push('/things')
          } else {
            // alert error msg
            alert(res.data.msg)
          }
        })
      } else { // else this page is writing a new item
        axios.post('/item/insert', arg).then(res => {
          console.log('WriteView', '/item/insert', JSON.stringify(res.data))
          if (res.data.ret === 1) {
            // alert('insert item succ ! Plz login!')
            this.$router.push('/things')
          } else {
            // alert error msg
            alert(res.data.msg)
          }
        })
      }

      this.$store.state.itemList = []
      this.$store.state.touchEnd = 0
      this.$store.state.startFrom = 0
    },
    deleteImage (name) {
      console.log('deleteImage', name)
      axios.post('/item/deleteImage', { imageNames: [name] }).then(res => {
        console.log('cancelItem', '/item/deleteImage', JSON.stringify(res.data))
        if (res.data.ret === 1) {
          // this.$router.push('/things')
          const index = this.imageNames.indexOf(name)
          if (index > -1) {
            this.imageNames.splice(index, 1)
          }
        } else {
          // alert error msg
          alert(res.data.msg)
        }
      })
    },
    cancelItem () {
      console.log('cancelItem', JSON.stringify(this.imageNames))
      // if the page is doing writing
      // then delete uploaded image and go back
      if (this.param_id === '' && this.imageNames.length !== 0) {
        axios.post('/item/deleteImage', { imageNames: this.imageNames }).then(res => {
          console.log('cancelItem', '/item/deleteImage', JSON.stringify(res.data))
          if (res.data.ret === 1) {
            this.$router.go(-1)
          } else {
            // alert error msg
            alert(res.data.msg)
          }
        })
      } else {
        // if the page is doing editing, then just go back 1 page
        this.$router.go(-1)
      }
    }
  }
}
</script>
<style scoped>
img {
  max-width: 300px
}
</style>
