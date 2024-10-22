export default ({
  data: () => ({
      searchValue: ''
  }),
  methods: {
      search() {
          if (this.$route.name !== "SearchResult") {
              this.$router.push({name: 'SearchResult', query: {search_value: this.searchValue}})
          } else {
              const x = this.searchValue
              this.$router.replace({query: {search_value: x}})
          }
      },
      logOutUser(){
          let x  = confirm("Are you sure to log out from the app ?")
          if(!x){
              return
          }
          localStorage.removeItem('auth-token')
          localStorage.removeItem('role')
          this.$router.push({name:"Login"})
      }
  },
  created() {
      this.searchValue = this.$route.query.search_value
  },
  computed:{
      role(){
          return localStorage.getItem('role')
      },
      isLoggedIn(){
          return localStorage.getItem('auth-token')
      }
  },
  template: `
<div>
<nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom border-bottom-2">
  <div class="container-fluid">
    <a class="navbar-brand" href="#"><h2 class="text-dark">DIGITAL LIBRARY</h2></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <template v-if="!isLoggedIn">
          <li class="nav-item">
            <router-link to="/login" tag="a" class="nav-link text-dark">
              <i class="fas fa-user"></i> User Login
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/lib-login" tag="a" class="nav-link text-dark">
              <i class="fas fa-user-shield"></i> Librarian Login
            </router-link>
          </li>
        </template>
        <template v-if="isLoggedIn">
          <li class="nav-item" v-if="role=='member'">
            <router-link to="/" tag="a" class="nav-link text-dark">
              <i class="fas fa-home"></i> Main Page
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/books" tag="a" class="nav-link text-dark">
              <i class="fas fa-book"></i> Books Available
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/sections" tag="a" class="nav-link text-dark">
              <i class="fas fa-layer-group"></i> Sections
            </router-link>
          </li>
          <li class="nav-item" v-if="role=='libr'">
            <router-link to="/requests" tag="a" class="nav-link text-dark">
              <i class="fas fa-envelope"></i> Book Requests
            </router-link>
          </li>
          <li class="nav-item" v-if="role=='member'">
            <router-link to="/my-requests" tag="a" class="nav-link text-dark">
              <i class="fas fa-book-reader"></i> My Books
            </router-link>
          </li>
          <li class="nav-item" v-if="role=='libr'">
            <router-link to="/admin-stat" tag="a" class="nav-link text-dark">
              <i class="fas fa-chart-bar"></i> Admin Stats
            </router-link>
          </li>
          <li class="nav-item dropdown" v-if="role=='libr'">
            <a class="nav-link dropdown-toggle text-dark" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-user-circle"></i> ADMIN
            </a>
            <ul class="dropdown-menu dropdown-menu-light" aria-labelledby="userDropdown">
              <li><a class="dropdown-item" href="#" @click="logOutUser">Log Out</a></li>
            </ul>
          </li>
                    <li class="nav-item dropdown" v-if="role=='member'">
            <a class="nav-link dropdown-toggle text-dark" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-user-circle"></i> USER
            </a>
            <ul class="dropdown-menu dropdown-menu-light" aria-labelledby="userDropdown">
              <li><a class="dropdown-item" href="#" @click="logOutUser">Log Out</a></li>
            </ul>
          </li>
        </template>
      </ul>
      <form class="d-flex" role="search" v-if="isLoggedIn">
        <input class="form-control me-2" type="search" placeholder="Search" v-model="searchValue" aria-label="Search">
        <button type="button" class="btn btn-outline-dark" @click="search">Search</button>
      </form>
    </div>
  </div>
</nav>
</div>`,
  style: `
<style>
body {
  font-family: 'Roboto', sans-serif;
}

.navbar {
  background-color: #ffffff;
  border-bottom: 2px solid #454d55;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.navbar-brand h2 {
  color: #000000;
  font-weight: bold;
  animation: fadeIn 2s;
}

.navbar-nav .nav-link {
  color: #000000 !important;
  font-size: 1.1rem;
  transition: color 0.3s;
}

.navbar-nav .nav-link:hover {
  color: #6c757d !important;
}

.navbar-nav .nav-item .btn {
  margin-top: 0.5rem;
  transition: background-color 0.3s, color 0.3s;
}

.navbar-nav .nav-item .btn:hover {
  background-color: #6c757d;
  color: #ffffff;
}

.form-control {
  border-radius: 0.25rem;
  transition: box-shadow 0.3s;
}

.form-control:focus {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.btn-outline-dark {
  border-color: #000000;
  color: #000000;
  transition: background-color 0.3s, color 0.3s;
}

.btn-outline-dark:hover {
  background-color: #000000;
  color: #ffffff;
}

.navbar-toggler-icon {
  color: #000000;
}

.navbar-nav .dropdown-menu {
  background-color: #ffffff;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.navbar-nav .dropdown-menu .dropdown-item:hover {
  background-color: #e9ecef;
}

.fas {
  margin-right: 8px;
}

@keyframes fadeIn {
  from {
      opacity: 0;
  }
  to {
      opacity: 1;
  }
}
</style>`
})
