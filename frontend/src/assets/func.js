import axios from 'axios'

export const func = {
  loginWithPassword: (store, username, password) => {
    // console.log('')
    return axios.post('/auth/login', { username: username, password: password }).then(res => {
      console.log('func.js', 'loginWithPassword', JSON.stringify(res.data))
      if (res.data.ret === 1) {
        store.state.user = res.data.user
      } else {
        store.state.user = {}
      }
      return res
    })
  },
  checkLogin: (store) => {
    return axios.post('/auth/loginCheck', {}).then(res => {
      console.log('func.js', 'checkLogin', JSON.stringify(res.data))
      if (res.data.ret === 1) {
        store.state.user = res.data.user
      } else {
        store.state.user = {}
      }
      return res
    })
  },
  logout: (store) => {
    return axios.post('/auth/logout', {}).then(res => {
      console.log('func.js', 'logout', JSON.stringify(res.data))
      if (res.data.ret === 1) {
        console.log('logout succ')
        store.state.user = {}
      }
      return res
    })
  },
  formatDateTime: (date) => {
    if (date) {
    //   return new Date(date).toISOString().substr(0, 10)
      return (new Date()).toISOString().slice(0, 16).replace(/-/g, '/').replace('T', ' ')
    }
  },
  formatDate: (date) => {
    if (date) {
    //   return new Date(date).toISOString().substr(0, 10)
      return (new Date()).toISOString().slice(0, 10).replace(/-/g, '/').replace('T', ' ')
    }
  },
  formatStatus: (status) => {
    let ret = 'Available'
    if (status === '1') {
      ret = 'During trade'
    } else if (status === '2') {
      ret = 'Sold'
    }
    return ret
  },
  removeArrayDup (arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index)
  },
  getArrayAvg (arr) {
    const total = arr.reduce((a, b) => a + b, 0)
    return Math.floor(total / arr.length * 100) / 100
  },
  limitCnt: 5,
  schoolList: {
    MO: [
      'A.T. Still University',
      'Avila University',
      'Baptist Bible College',
      'Calvary University',
      'Central Christian College of the Bible',
      'Central Methodist University',
      'College of the Ozarks',
      'Columbia College',
      'Cottey College',
      'Cox College',
      'Culver-Stockton College',
      'Drury University',
      'Evangel University',
      'Fontbonne University',
      'Goldfarb School of Nursing at Barnes-Jewish College',
      'Hannibal-LaGrange University',
      'Harris-Stowe State University',
      'Kansas City Art Institute',
      'Kansas City University',
      'Lincoln University, Missouri',
      'Lindenwood University',
      'Logan University',
      'Maryville University',
      'Missouri Baptist University',
      'Missouri Southern State University',
      'Missouri State University',
      'Missouri University of Science and Technology',
      'Missouri Valley College',
      'Missouri Western State University',
      'Northwest Missouri State University',
      'Ozark Christian College',
      'Park University',
      'Research College of Nursing',
      'Rockhurst University',
      'Saint Louis University',
      'Southeast Missouri State University',
      'Southwest Baptist University',
      'St. Louis Christian College',
      'Stephens College',
      'Truman State University',
      'University of Central Missouri',
      'University of Health Sciences and Pharmacy in St. Louis',
      'University of Missouri',
      'University of Missouri-Kansas City',
      'University of Missouri-St. Louis',
      'Washington University in St. Louis',
      'Webster University',
      'Westminster College, Missouri',
      'William Jewell College',
      'William Woods University'
    ]
  }
}
