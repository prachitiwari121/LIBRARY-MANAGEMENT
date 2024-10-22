import Book from './Book.js';
import BookDetailsModal from "./BookDetailsModal.js";

export default ({
    data: () => ({
        showModal: false,
        bookList: [],
        sections:[]
    }),
    methods: {
        getAllBooks() {
            fetch('/api/book', {
                method: 'GET',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then(res => res.json()).then((data) => {
                this.bookList = data;
            });
        },
        showBookDetail(book) {
            this.$refs.bookModal.viewModal(book);
        }
    },
    created() {
        this.getAllBooks();
    },
    template: `
    <div >
        <ul class="list-group mt-3">
            <li class="list-group-item" v-for="i in Math.ceil(bookList.length / 2)" :key="i">
                <div class="d-flex justify-content-between">
                    <div class="col-lg-6" v-if="bookList[(i - 1) * 2]">
                        <Book 
                            @showDetail="showBookDetail"
                            :book="bookList[(i - 1) * 2]"
                        />
                    </div>
                    <div class="col-lg-6" v-if="bookList[(i - 1) * 2 + 1]">
                        <Book 
                            @showDetail="showBookDetail"
                            :book="bookList[(i - 1) * 2 + 1]"
                        />
                    </div>
                </div>
            </li>   
        </ul>

        <BookDetailsModal ref="bookModal"/>
    </div>
    
    `,
    components: {Book, BookDetailsModal}
});
