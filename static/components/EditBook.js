export default ({
    data: () => ({
        edit_book: {
            title: '',
            content: '',
            author: '',
            image: '',
            section_id: '',

        },
        sections: [],
        loading: false
    }),
    methods: {
        getAllSections() {
            fetch('/api/section', {
                method: 'GET',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
            }).then(res => res.json()).then((data) => {
                this.sections = data
            })
        },
        getBookDetails() {
            fetch('/api/book/' + this.$route.params.id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(async (res) => {
                if (res.ok) {
                    this.edit_book = await res.json()
                }
            })
        },
        attachImage() {
            this.book.image = this.$refs.bookImage.files[0];
        },
        editBook() {
            this.loading = true;

            const formData = new FormData();
            formData.append("image", this.$refs.bookImage.files[0]);
            formData.append('title', this.edit_book.title);
            formData.append('author', this.edit_book.author);
            formData.append('content', this.edit_book.content);
            formData.append('section', this.edit_book.section_id);

            fetch('/api/book/' + this.$route.params.id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'PUT',
                body: formData
            }).then(async (res) => {
                if (res.ok) {
                    this.getBookDetails()
                    alert("Updated Book Information Successfully")
                    this.edit_book = {
                        title: '',
                        content: '',
                        author: '',
                        image: '',
                        section_id: '',
                    }
                }
            }).finally(() => {
                this.loading = false;
            })
        },
    },
    created() {
        this.getBookDetails()
        this.getAllSections()
    },
    template: `
    <div class="container py-5">
        <h4 style="color: #3498db; text-align: center; margin-bottom: 20px;">Edit Book Info</h4>
        <div class="row">
            <div class="col-lg-6 mb-3">
                <div class="form-group">
                    <label class="form-label" style="color: #2ecc71;">Book Title</label>
                    <input type="text" v-model="edit_book.title" class="form-control" style="border-radius: 10px; border: 2px solid #2ecc71;">
                </div>
            </div>
            <div class="col-lg-6 mb-3">
                <div class="form-group">
                    <label class="form-label" style="color: #2ecc71;">Book Author</label>
                    <input type="text" v-model="edit_book.author" class="form-control" style="border-radius: 10px; border: 2px solid #2ecc71;">
                </div>
            </div>
            <div class="col-lg-6 mb-3">
                <div class="form-group">
                    <label class="form-label" style="color: #e74c3c;">Book Cover</label>
                    <input type="file" ref="bookImage" class="form-control" style="border-radius: 10px; border: 2px solid #e74c3c;">
                </div>
            </div>
            <div class="col-lg-6 mb-3">
                <div class="form-group">
                    <label class="form-label" style="color: #e74c3c;">Section</label>
                    <select v-model="edit_book.section_id" class="form-select" style="border-radius: 10px; border: 2px solid #e74c3c;">
                        <option v-for="(section, i) in sections" :key="i" :value="section.section_id">{{ section.section_name }}</option>
                    </select>
                </div>
            </div>

            <div class="col-lg-6 mb-3">
                <div class="form-group">
                    <label class="form-label" style="color: #9b59b6;">Book Description</label>
                    <textarea class="form-control" rows="10" maxlength="7000" v-model="edit_book.content" style="border-radius: 10px; border: 2px solid #9b59b6;"></textarea>
                </div>
            </div>
        </div>
        <div class="text-end mt-3">
            <button class="btn btn-primary" @click="editBook" :disabled="loading" style="border-radius: 20px; background-color: #2980b9; border-color: #2980b9; padding: 10px 20px;">
                <span v-if="loading">Saving...</span>
                <span v-else>Save</span>
            </button>
        </div>
    </div>
    `
})
