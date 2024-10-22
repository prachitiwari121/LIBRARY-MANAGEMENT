export default({
    data:()=>({
       user :{
           email:'',
           password:''
       },
        error:''
    }),
    methods:{
        async login(){
            fetch('/user-login',
                {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(this.user)
                    }
                )
                .then(async (res) => {
                    const data = await res.json();
                    if (res.ok) {
                        localStorage.setItem('auth-token', data.token)
                        localStorage.setItem('role', data.role)
                        this.$router.push({path: '/'})
                    } else {
                        this.error = data.message
                    }
                });
        }
    },
    template:`
    <div class="d-flex justify-content-center align-items-center vh-100" style="background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);">
        <div class="card shadow-lg" style="width: 28rem;">
            <div class="card-body">
                <h3 class="card-title text-center mb-4" style="color: #ff5e62;">Login</h3>
                <div v-if="error" class="alert alert-danger">
                    {{error}}
                </div>
                <div class="form-group mb-3">
                    <label for="email" class="form-label" style="color: #ff5e62;">Email</label>
                    <input type="email" v-model="user.email" class="form-control" id="email" placeholder="Enter your email"/>
                </div>
                <div class="form-group mb-4">
                    <label for="password" class="form-label" style="color: #ff5e62;">Password</label>
                    <input type="password" v-model="user.password" class="form-control" id="password" placeholder="Enter your password"/>
                </div>
                <div class="d-grid">
                    <button class="btn btn-primary btn-block" @click="login" style="background: #ff5e62; border: none;">
                        LOGIN
                    </button>
                </div>
                <p class="mb-0 mt-2 text-center" style="color: #ff5e62;">Don't have an account yet?</p>
                <router-link to="/register" class="d-block text-center" style="color: #ff5e62;">Register</router-link>
            </div>
        </div>
    </div>
    `
})
