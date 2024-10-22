
export default ({
    props: {
        book: {
            type: Object,
            default() {
                return { section: '', book_id: '', image: '', title: '', author: '' };
            }
        },
        role: {
            type: String,
            default: ''
        },
        bookInfo: {
            type: Object,
            default() {
                return { num_of_book_pending_for_me: '0', is_pending_for_me: false, is_approved_for_me: false, book_id: '' };
            }
        }
    },
    methods: {
        showDetail(book) {
            this.$emit('showDetail', book);
        },
        requestBookForReading(book_id) {
            // Fetch the latest book details to ensure the number is up to date
            this.getBookDetails(book_id).then(() => {
                if (parseInt(this.bookInfo.num_of_book_pending_for_me) >= 5) {
                    alert("You have reached the maximum number of 5 book requests. Please return a book or wait until one is approved before requesting another.");
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
        async getBookDetails(book_id) {
            const res = await fetch('/api/book/' + book_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            });
            if (res.ok) {
                this.bookInfo = await res.json();
            }
        },
    },
    computed: {
        imagePath() {
            if (this.book.image) {
                return {
                    height: '220px',
                    width: '150px',
                    background: `url('static/uploaded/${this.book.image}') center/cover no-repeat`
                };
            } else {
                return {
                    height: '220px',
                    width: '150px',
                    background: `url('static/img/wall-paint.jpg') center/cover no-repeat`
                };
            }
        }
    },
    template: `
    <div>
        <div class="text-center justify-content-centre pt-3 pb-3 px-2 border border-2 border-secondary">
            <div class="mx-auto border border-2 border-secondary" :style='imagePath'></div>
            <h6 class="mt-2 mb-0 fs-regular fw-bold" style="white-space: break-spaces; min-height: 40px">{{book.title}}</h6>
            <p class="text-muted  mb-0">{{book.author}}</p>
            <button class="btn btn-sm btn-warning mt-2" @click="showDetail(book)">View Details</button>

            <!-- Hide all the book request related buttons and alerts for librarians -->
            <template v-if="role !== 'libr'">
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
                        class="btn btn-sm btn-warning mt-2" 
                        @click="requestBookForReading(book.book_id)">
                    📚 Request This Book
                </button>
            </template>
        </div>
    </div>
    `
});
