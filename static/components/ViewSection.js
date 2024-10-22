import Book from "./Book.js";
import BookDetailsModal from "./BookDetailsModal.js";

export default ({
    data: () => ({
        view_section: {books:[]}
    }),
    methods: {
        getSectionDetails() {
            fetch('/api/section/' + this.$route.params.id, {
               headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(res => res.json()).then((data) => {
                this.view_section = data
            })
        },
        showBookDetail(book) {
            book.section = this.view_section
            this.$refs.bookModal.viewModal(book)
        }
    },
    created() {
        this.getSectionDetails()
    },
    components: {Book, BookDetailsModal},
    template: `
        <div class="px-3 pb-5">
            <div class="clearfix mt-3">
                <div class="float-start">
                    <h3>Section : {{view_section.section_name}}</h3>                              
                </div>
                <div class="float-end">
                    <p class="my-0">Description : {{view_section.section_description}}</p>                          
                    <p>Date Created : {{view_section.date_created}}</p>   
                </div>
            </div>
            <h5 class="mb-0">Books Under this Section: </h5>
            <hr>
            <div v-if="view_section.books.length == 0" class="card text-danger border-danger mt-2">
                <div class="card-body">
                    <h5>No Books found in this section</h5>
                </div>
            </div>
            <ul v-else class="list-group">
                <li v-for="(book, i) in view_section.books" :key="i" class="list-group-item d-flex justify-content-between align-items-center">
                    <span>{{ book.title }}</span>
                    <button class="btn btn-primary" @click="showBookDetail(book)">View Details</button>
                </li>
            </ul>
            <BookDetailsModal ref="bookModal"/>
        </div>
    `
})
