export default ({
    data: () => ({
        bookInfo: {
            feedbacks: []
        },
        isPlaying: false,
        bootstrap_modal: {},
        allowedToRead: false,
    }),
    computed: {
        role() {
            return localStorage.getItem('role');
        },
    },
    methods: {
        returnBook(book_id) {
            fetch('/api/return-request/' + book_id, {
                method: 'POST',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then((res) => {
                if (res.ok) {
                    this.getBooksDetails();
                }
            });
        },
        getBooksDetails() {
            this.allowedToRead = false;
            fetch("/api/book/" + this.$route.params.id, {
                method: "GET",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then((res) => res.json()).then((res) => {
                this.bookInfo = res;
                if (this.bookInfo.is_approved_for_me) {
                    this.allowedToRead = true;
                }
            });
        },
        playPause() {
            var msg = new SpeechSynthesisUtterance();
            msg.text = this.bookInfo.content;
            window.speechSynthesis.speak(msg);
        },
        deleteBook() {
            let x = confirm("This will delete all related data from the server. Are you sure?");
            if (!x) {
                return;
            }
            fetch("/api/book/" + this.bookInfo.book_id, {
                method: "DELETE",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                }
            }).then((res) => {
                if (res.ok) {
                    alert("Deleted Book Successfully");
                    this.$router.push({ name: "Login" });
                }
            });
        }
    },
    mounted() {
        this.getBooksDetails();
    },
    template: `   
        <div class="card shadow-lg p-3 mb-5 bg-white rounded">
            <div class="card-body">
                <div class="clearfix mb-3">
                    <div class="float-start">
                        <h1 class="display-4 text-center" style="color: #ff6347;">Title: {{bookInfo.title}}</h1> 

                <div class="clearfix mb-3">
                    <template v-if="role=='member'">
                        <button class="btn btn-danger btn-sm float-start" v-if="bookInfo.is_approved_for_me" @click="returnBook(bookInfo.request_id)">Return Book</button>
                    </template>
                    <template v-else>
                        <router-link :to="'/edit-book/'+bookInfo.book_id" class="float-start">
                            <button class="btn btn-primary btn-sm">Edit</button>
                        </router-link>
                        <button class="btn btn-danger btn-sm float-start ms-2" @click="deleteBook()">Delete The Book</button>
                    </template>
                </div>
                <h5 class="mb-3" style="color: #ff6347;">Content:</h5>
                <hr>
                <p class="fs-regular text-break fw-light bg-light p-3 rounded" v-if="allowedToRead||role=='libr'">{{bookInfo.content}}</p>         
                <div class="alert alert-danger" v-else>
                    You don't have access to read this book.
                </div>
                <hr>
                <div class="row">
                    <div class="col-lg-4 mb-3" v-for="(feedback, i) in bookInfo.feedbacks" :key="i">
                        <div class="card h-100" style="border-color: #ff6347;">
                            <div class="card-header text-white" style="background-color: #ff6347;">{{feedback.user.name}}</div>
                            <div class="card-body">{{feedback.feedback}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal -->

          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
              </div>
            </div>
          </div>
        </div>
    </div>
    `
});
