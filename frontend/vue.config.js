module.exports = {
  publicPath: process.env.PUBLIC_URL || "/", // <-- this is correct now (and default)
  devServer: {
    proxy: {
      "/auth": {
        target: process.env.VUE_APP_ROOT_API
      },
      "/user": {
        target: process.env.VUE_APP_ROOT_API
      },
      "/item": {
        target: process.env.VUE_APP_ROOT_API
      },
      "/review": {
        target: process.env.VUE_APP_ROOT_API
      }
    } 
  }
}
