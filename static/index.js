import router from './router.js'
import NavBar from './components/NavBar.js'



new Vue({
  el: '#app',
  template: `
    <div class="black">
      <div class="card-body">
        <NavBar :key='has_changed'/>
        <router-view class=""/>
      </div>
    </div>
`,
  router,
  components: {
    NavBar,
  },
  data: {
    has_changed: true,
  },
  watch: {
    $route(to, from) {
      this.has_changed = !this.has_changed
    },
  },
})