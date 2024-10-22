export default ({
    data: () => ({
        bootstrap_modal: {},
        bookInfo: {
            section: '',
            requests: [],
            pdf: '', // Holds the PDF file path
            num_of_book_pending_for_me: 0, // Ensure this is initialized
            is_pending_for_me: false, // Track if the book is pending approval for the user
            is_approved_for_me: false, // Track if the book is approved for the user
            title: '',
            author: '',
            content: '',
            image: '',
            book_id: null
        },
    }),
    methods: {
        markAsFavorite(book_id) {
            fetch('/api/book/mark_as_fav/' + book_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(async (res) => {
                this.getBookDetails(book_id);
            })
        },
        viewModal(book) {
            this.bookInfo = book;
            this.getBookDetails(book.book_id);
            this.bootstrap_modal.show();
        },
        async getBookDetails(book_id) {
            const res = await fetch('/api/book/' + book_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            });
            if (res.ok) {
                this.bookInfo = await res.json();
                console.log("Book Info: ", this.bookInfo); // Debug line
            }
        },
        approveBook(request_id) {
            fetch('/api/approve-request/' + request_id, {
                method: "POST",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
            .then((res) => {
                if (res.ok) {
                    this.getBookDetails(this.bookInfo.book_id);
                }
            })
        },
        revokeBook(request_id) {
            fetch('/api/revoke-request/' + request_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
            .then((res) => {
                if (res.ok) {
                    this.getBookDetails(this.bookInfo.book_id);
                }
            })
        },
        requestBookForReading(book_id) {
            // Fetch the latest book details to ensure the number is up to date
            this.getBookDetails(book_id).then(() => {
                const pendingBooks = parseInt(this.bookInfo.num_of_book_pending_for_me);
                console.log("Pending Books: ", pendingBooks); // Debug line

                if (pendingBooks >= 5) {
                    alert("⚠️ You have reached the maximum number of 5 book requests. Please return a book or wait until one is approved before requesting another.");
                    return;
                }
                
                fetch(`/api/request-book/${book_id}`, {
                    method: 'POST',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                }).then(async (res) => {
                    if (res.ok) {
                        this.getBookDetails(book_id);
                    }
                });
            });
        },
        rejectBook(request_id) {
            fetch('/api/reject-request/' + request_id, {
                method: "POST",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
            .then((res) => {
                if (res.ok) {
                    this.getBookDetails(request_id);
                }
            })
        }
    },
    mounted() {
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('viewBookDetailsModal'), { backdrop: 'static', keyboard: false });
    },
    computed: {
        role() {
            return localStorage.getItem('role');
        },
        imagePath() {
            if (this.bookInfo.hasOwnProperty('image')) {
                if (this.bookInfo.image == "") {
                    return "static/img/wall-paint.jpg";
                } else {
                    return "static/uploaded/" + this.bookInfo.image;
                }
            } else {
                return '';
            }
        },
        pdfPath() {
            if (this.bookInfo.pdf) {
                return "static/uploaded/" + this.bookInfo.pdf; // Adjust this path as needed
            } else {
                return '';
            }
        }
    },
    template: `
        <!-- Modal -->
        <div>
            <div class="modal fade" id="viewBookDetailsModal" tabindex="-1" aria-labelledby="viewBookDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content">
                        <div class="modal-header bg-gradient bg-purple text-white">
                            <h5 class="modal-title" id="viewBookDetailsModalLabel">📚 Book Details</h5>
                            <button type="button" class="btn-close text-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center bg-light">
                            <h2 class="text-secondary">📖 Title: <span class="text-primary">{{ bookInfo.title }}</span></h2>
                            <img :alt="bookInfo.title" :src="imagePath" class="img-fluid rounded shadow mb-4" style="max-width: 20%; height: 300px;"/>
                            <h3 class='authorr'>📝 Author: <span class="author">{{ bookInfo.author }}</span></h3>
                            <div class="fs-regular">
                                <p class="mb-0 mt-4 fw-bold text-uppercase text-dark">📝 Description</p>
                                <span>{{ bookInfo.content }}</span>
                            </div>

                            <template v-if="role != 'libr'">
                                <!-- Display alternate message if book limit exceeded -->
                                <template v-if="parseInt(bookInfo.num_of_book_pending_for_me) >= 5">
                                    <div class="alert alert-danger mt-3">
                                        ⚠️ You have reached the maximum number of 5 book requests. Please return a book or wait until one is approved before requesting another.
                                    </div>
                                </template>
                                
                                <!-- Button indicating approval pending -->
                                <button v-if="bookInfo.is_pending_for_me && parseInt(bookInfo.num_of_book_pending_for_me) < 5" 
                                        type="button" 
                                        class="btn btn-warning text-white" 
                                        disabled>
                                    ⏳ Approval Pending For this Book
                                </button>
                                
                                <!-- Request book button if allowed -->
                                <button v-if="!bookInfo.is_pending_for_me && !bookInfo.is_approved_for_me && parseInt(bookInfo.num_of_book_pending_for_me) < 5" 
                                        type="button" 
                                        class="btn btn-primary" 
                                        @click="requestBookForReading(bookInfo.book_id)">
                                    📚 Request This Book
                                </button>
                            </template>
                        </div>
                        <center>
                        <div class="modal-footer bg-purple text-white">
                            <center>
                                <!-- The footer is used only if needed -->
                            </center>
                        </div>
                        </center>
                    </div>
                </div>
            </div>
        </div>
    `,
})
