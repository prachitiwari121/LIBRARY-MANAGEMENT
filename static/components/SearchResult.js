import BookDetailsModal from "./BookDetailsModal.js";

export default ({
    data: () => ({
        searchResult: {}
    }),
    methods: {
        search() {
            fetch('/api/search', {
                method: 'POST',
                body: JSON.stringify({'search': this.$route.query.search_value}),
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json'
                }
            }).then((res) => res.json()).then((data) => {
                this.searchResult = data
            })
        },
        showBookDetail(book) {
            this.$refs.bookModal.viewModal(book)
        }
    },
    watch: {
        '$route.params': {
            handler(newParams, oldParams) {
                this.search()
            }
        }
    },
    created() {
        this.search()
    },
    components: {BookDetailsModal},

    template: `
        <div class="search pt-2 pb-5 container">
            <h4 class="text-dark mb-4"><center>Results in Books:<center></h4>
            <div class="row">
                <div class="col-md-4" v-for="(book, i) in searchResult.books" :key="i">
                    <div class="card mb-4 shadow-sm">
                        <div class="card-body bg-warning text-dark">
                            <h5 class="card-title">{{ book.title }}</h5>
                            <p class="card-text">{{ book.author }}</p>
                            <button class="btn btn-success" @click="showBookDetail(book)">View Book</button>
                        </div>
                    </div>
                </div>
            </div>
            <h4 class="text-dark mb-4"><center>Results in Sections:<center></h4>
            <div class="row">
                <div class="col-md-4" v-for="(section, i) in searchResult.sections" :key="i">
                    <div class="card mb-4 shadow-sm">
                        <div class="card-body bg-light text-dark">
                            <h5 class="card-title">{{ section.section_name }}</h5>
                            <p class="card-text">{{ section.section_description }}</p>
                            <button class="btn btn-info">
                                <router-link class="text-white" :to="'/section/' + section.section_id">View Section</router-link>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <BookDetailsModal ref="bookModal"/>
        </div>
    `,
    style: `
        .search h4 {
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
        }
        .card {
            border-radius: 10px;
            overflow: hidden;
        }
        .card-title {
            font-size: 1.25rem;
            font-weight: bold;
        }
        .card-text {
            font-size: 1rem;
        }
        .btn {
            margin-top: 10px;
        }
        .btn-info {
            background-color: #ffc107;
            border-color: #ffc107;
        }
        .btn-success {
            background-color: #28a745;
            border-color: #28a745;
        }
        .btn-warning {
            background-color: #ffc107;
            border-color: #ffc107;
        }
        .shadow-sm {
            box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075);
        }
    `
});
